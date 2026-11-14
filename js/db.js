/**
 * DíaSano - Database Manager (IndexedDB con fallback a LocalStorage)
 * Gestión de almacenamiento 100% privado, local y persistente.
 * Compatible con file:/// y protocolos web.
 */

const DB_NAME = 'DiaSanoDB';
const DB_VERSION = 1;

class DiaSanoDatabase {
  constructor() {
    this.db = null;
    this.useLocalStorage = false;
    this._initPromise = this.init();
  }

  async init() {
    if (typeof indexedDB === 'undefined') {
      console.warn('IndexedDB no disponible, usando fallback LocalStorage.');
      this.useLocalStorage = true;
      return null;
    }

    return new Promise((resolve) => {
      try {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
          const db = event.target.result;

          if (!db.objectStoreNames.contains('recipes')) {
            const recipeStore = db.createObjectStore('recipes', { keyPath: 'id' });
            recipeStore.createIndex('category', 'category', { unique: false });
            recipeStore.createIndex('costLevel', 'costLevel', { unique: false });
          }

          if (!db.objectStoreNames.contains('favorites')) {
            const favStore = db.createObjectStore('favorites', { keyPath: 'id' });
            favStore.createIndex('type', 'type', { unique: false });
            favStore.createIndex('createdAt', 'createdAt', { unique: false });
          }

          if (!db.objectStoreNames.contains('history')) {
            const histStore = db.createObjectStore('history', { keyPath: 'id' });
            histStore.createIndex('recipeId', 'recipeId', { unique: false });
            histStore.createIndex('timestamp', 'timestamp', { unique: false });
          }

          if (!db.objectStoreNames.contains('mealPlan')) {
            const planStore = db.createObjectStore('mealPlan', { keyPath: 'id' });
            planStore.createIndex('date', 'date', { unique: false });
            planStore.createIndex('category', 'category', { unique: false });
          }

          if (!db.objectStoreNames.contains('foodLog')) {
            const logStore = db.createObjectStore('foodLog', { keyPath: 'id' });
            logStore.createIndex('date', 'date', { unique: false });
          }

          if (!db.objectStoreNames.contains('pantry')) {
            const pantryStore = db.createObjectStore('pantry', { keyPath: 'id' });
            pantryStore.createIndex('name', 'name', { unique: false });
            pantryStore.createIndex('expireDate', 'expireDate', { unique: false });
          }

          if (!db.objectStoreNames.contains('shoppingList')) {
            const shopStore = db.createObjectStore('shoppingList', { keyPath: 'id' });
            shopStore.createIndex('completed', 'completed', { unique: false });
          }

          if (!db.objectStoreNames.contains('wellness')) {
            const wellStore = db.createObjectStore('wellness', { keyPath: 'id' });
            wellStore.createIndex('type', 'type', { unique: false });
            wellStore.createIndex('date', 'date', { unique: false });
          }

          if (!db.objectStoreNames.contains('emotionalSpace')) {
            const emoStore = db.createObjectStore('emotionalSpace', { keyPath: 'id' });
            emoStore.createIndex('date', 'date', { unique: false });
          }

          if (!db.objectStoreNames.contains('settings')) {
            db.createObjectStore('settings', { keyPath: 'key' });
          }
        };

        request.onsuccess = async (event) => {
          this.db = event.target.result;
          await this.seedInitialRecipes();
          resolve(this.db);
        };

        request.onerror = (event) => {
          console.warn('Error abriendo IndexedDB, activando fallback LocalStorage:', event?.target?.error);
          this.useLocalStorage = true;
          resolve(null);
        };
      } catch (e) {
        console.warn('Excepción al iniciar IndexedDB:', e);
        this.useLocalStorage = true;
        resolve(null);
      }
    });
  }

  async ensureReady() {
    if (!this.db && !this.useLocalStorage) {
      await this._initPromise;
    }
    return this.db;
  }

  getInitialRecipes() {
    return window.INITIAL_RECIPES || [];
  }

  async seedInitialRecipes() {
    if (this.useLocalStorage) return;
    try {
      const count = await this.countItems('recipes');
      const initial = this.getInitialRecipes();
      if (count === 0 && initial.length > 0) {
        const tx = this.db.transaction('recipes', 'readwrite');
        const store = tx.objectStore('recipes');
        for (const recipe of initial) {
          store.put(recipe);
        }
      }
    } catch (e) {
      console.warn('Error durante el seed de recetas:', e);
    }
  }

  async countItems(storeName) {
    if (this.useLocalStorage) return 0;
    const db = await this.ensureReady();
    if (!db) return 0;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const req = store.count();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(0);
      } catch (e) {
        resolve(0);
      }
    });
  }

  // ==================== RECETAS ====================
  async getAllRecipes() {
    if (this.useLocalStorage) {
      const initial = this.getInitialRecipes();
      const custom = JSON.parse(localStorage.getItem('diasano_custom_recipes') || '[]');
      return [...initial, ...custom];
    }
    const db = await this.ensureReady();
    if (!db) return this.getInitialRecipes();
    return new Promise((resolve) => {
      try {
        const tx = db.transaction('recipes', 'readonly');
        const store = tx.objectStore('recipes');
        const req = store.getAll();
        req.onsuccess = () => {
          const res = req.result;
          resolve(res && res.length > 0 ? res : this.getInitialRecipes());
        };
        req.onerror = () => resolve(this.getInitialRecipes());
      } catch (e) {
        resolve(this.getInitialRecipes());
      }
    });
  }

  async saveCustomRecipe(recipe) {
    if (!recipe.id) {
      recipe.id = 'custom_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    }
    recipe.isCustom = true;
    recipe.updatedAt = Date.now();

    if (this.useLocalStorage) {
      let custom = JSON.parse(localStorage.getItem('diasano_custom_recipes') || '[]');
      const idx = custom.findIndex(r => r.id === recipe.id);
      if (idx !== -1) {
        custom[idx] = recipe;
      } else {
        custom.push(recipe);
      }
      localStorage.setItem('diasano_custom_recipes', JSON.stringify(custom));
      return recipe;
    }

    const db = await this.ensureReady();
    if (!db) return recipe;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction('recipes', 'readwrite');
        const store = tx.objectStore('recipes');
        const req = store.put(recipe);
        req.onsuccess = () => resolve(recipe);
        req.onerror = () => resolve(recipe);
      } catch (e) {
        resolve(recipe);
      }
    });
  }

  async deleteCustomRecipe(id) {
    if (this.useLocalStorage) {
      let custom = JSON.parse(localStorage.getItem('diasano_custom_recipes') || '[]');
      custom = custom.filter(r => r.id !== id);
      localStorage.setItem('diasano_custom_recipes', JSON.stringify(custom));
      return true;
    }

    const db = await this.ensureReady();
    if (!db) return true;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction('recipes', 'readwrite');
        const store = tx.objectStore('recipes');
        const req = store.delete(id);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      } catch (e) {
        resolve(false);
      }
    });
  }

  async getRecipeById(id) {
    const list = await this.getAllRecipes();
    return list.find(r => r.id === id) || null;
  }

  // ==================== FAVORITOS ====================
  async toggleFavorite(recipeOrCustom) {
    const isFav = await this.isFavorite(recipeOrCustom.id);
    if (this.useLocalStorage) {
      const favs = JSON.parse(localStorage.getItem('diasano_favorites') || '[]');
      if (isFav) {
        const updated = favs.filter(f => f.id !== recipeOrCustom.id);
        localStorage.setItem('diasano_favorites', JSON.stringify(updated));
        return { isFavorite: false };
      } else {
        const favItem = {
          id: recipeOrCustom.id,
          name: recipeOrCustom.name,
          category: recipeOrCustom.category,
          image: recipeOrCustom.image || '',
          timePrep: recipeOrCustom.timePrep || 0,
          timeCook: recipeOrCustom.timeCook || 0,
          difficulty: recipeOrCustom.difficulty || 'Fácil',
          estimatedCarbs: recipeOrCustom.estimatedCarbsPerServing || recipeOrCustom.estimatedCarbs || 0,
          notes: recipeOrCustom.notes || '',
          customIngredients: recipeOrCustom.customIngredients || '',
          type: recipeOrCustom.type || 'recipe',
          createdAt: Date.now()
        };
        favs.push(favItem);
        localStorage.setItem('diasano_favorites', JSON.stringify(favs));
        return { isFavorite: true, item: favItem };
      }
    }

    const db = await this.ensureReady();
    if (!db) return { isFavorite: false };
    return new Promise((resolve, reject) => {
      try {
        const tx = db.transaction('favorites', 'readwrite');
        const store = tx.objectStore('favorites');

        if (isFav) {
          const req = store.delete(recipeOrCustom.id);
          req.onsuccess = () => resolve({ isFavorite: false });
          req.onerror = () => reject(req.error);
        } else {
          const favItem = {
            id: recipeOrCustom.id,
            name: recipeOrCustom.name,
            category: recipeOrCustom.category,
            image: recipeOrCustom.image || '',
            timePrep: recipeOrCustom.timePrep || 0,
            timeCook: recipeOrCustom.timeCook || 0,
            difficulty: recipeOrCustom.difficulty || 'Fácil',
            estimatedCarbs: recipeOrCustom.estimatedCarbsPerServing || recipeOrCustom.estimatedCarbs || 0,
            notes: recipeOrCustom.notes || '',
            customIngredients: recipeOrCustom.customIngredients || '',
            type: recipeOrCustom.type || 'recipe',
            createdAt: Date.now()
          };
          const req = store.put(favItem);
          req.onsuccess = () => resolve({ isFavorite: true, item: favItem });
          req.onerror = () => reject(req.error);
        }
      } catch (e) {
        resolve({ isFavorite: false });
      }
    });
  }

  async isFavorite(id) {
    if (this.useLocalStorage) {
      const favs = JSON.parse(localStorage.getItem('diasano_favorites') || '[]');
      return favs.some(f => f.id === id);
    }
    const db = await this.ensureReady();
    if (!db) return false;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction('favorites', 'readonly');
        const store = tx.objectStore('favorites');
        const req = store.get(id);
        req.onsuccess = () => resolve(!!req.result);
        req.onerror = () => resolve(false);
      } catch (e) {
        resolve(false);
      }
    });
  }

  async getAllFavorites() {
    if (this.useLocalStorage) {
      const favs = JSON.parse(localStorage.getItem('diasano_favorites') || '[]');
      favs.sort((a, b) => b.createdAt - a.createdAt);
      return favs;
    }
    const db = await this.ensureReady();
    if (!db) return [];
    return new Promise((resolve) => {
      try {
        const tx = db.transaction('favorites', 'readonly');
        const store = tx.objectStore('favorites');
        const req = store.getAll();
        req.onsuccess = () => {
          const items = req.result || [];
          items.sort((a, b) => b.createdAt - a.createdAt);
          resolve(items);
        };
        req.onerror = () => resolve([]);
      } catch (e) {
        resolve([]);
      }
    });
  }

  // ==================== HISTORIAL DE RECETAS ====================
  async recordRecipeHistory(recipe) {
    const entry = {
      id: `hist_${recipe.id}`,
      recipeId: recipe.id,
      name: recipe.name,
      category: recipe.category,
      image: recipe.image,
      timePrep: recipe.timePrep,
      timeCook: recipe.timeCook,
      estimatedCarbs: recipe.estimatedCarbsPerServing,
      timestamp: Date.now()
    };

    if (this.useLocalStorage) {
      let hist = JSON.parse(localStorage.getItem('diasano_history') || '[]');
      hist = hist.filter(h => h.recipeId !== recipe.id);
      hist.unshift(entry);
      localStorage.setItem('diasano_history', JSON.stringify(hist.slice(0, 50)));
      return entry;
    }

    const db = await this.ensureReady();
    if (!db) return entry;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction('history', 'readwrite');
        const store = tx.objectStore('history');
        const req = store.put(entry);
        req.onsuccess = () => resolve(entry);
        req.onerror = () => resolve(entry);
      } catch (e) {
        resolve(entry);
      }
    });
  }

  async getRecentHistory(limit = 30) {
    if (this.useLocalStorage) {
      const hist = JSON.parse(localStorage.getItem('diasano_history') || '[]');
      return hist.slice(0, limit);
    }
    const db = await this.ensureReady();
    if (!db) return [];
    return new Promise((resolve) => {
      try {
        const tx = db.transaction('history', 'readonly');
        const store = tx.objectStore('history');
        const req = store.getAll();
        req.onsuccess = () => {
          const list = req.result || [];
          list.sort((a, b) => b.timestamp - a.timestamp);
          resolve(list.slice(0, limit));
        };
        req.onerror = () => resolve([]);
      } catch (e) {
        resolve([]);
      }
    });
  }

  async clearHistory() {
    if (this.useLocalStorage) {
      localStorage.removeItem('diasano_history');
      return;
    }
    const db = await this.ensureReady();
    if (!db) return;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction('history', 'readwrite');
        const store = tx.objectStore('history');
        const req = store.clear();
        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
      } catch (e) {
        resolve();
      }
    });
  }

  // ==================== PLANIFICADOR Y CALENDARIO ====================
  async addMealPlan(item) {
    // item: { id, date: 'YYYY-MM-DD', mealType: 'almuerzo', recipeId, name, servings, estimatedCarbs, image }
    if (!item.id) item.id = 'plan_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    item.createdAt = Date.now();

    if (this.useLocalStorage) {
      const plans = JSON.parse(localStorage.getItem('diasano_mealplan') || '[]');
      plans.push(item);
      localStorage.setItem('diasano_mealplan', JSON.stringify(plans));
      return item;
    }

    const db = await this.ensureReady();
    if (!db) return item;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction('mealPlan', 'readwrite');
        const store = tx.objectStore('mealPlan');
        const req = store.put(item);
        req.onsuccess = () => resolve(item);
        req.onerror = () => resolve(item);
      } catch (e) {
        resolve(item);
      }
    });
  }

  async getMealPlanByDate(dateStr) {
    if (this.useLocalStorage) {
      const plans = JSON.parse(localStorage.getItem('diasano_mealplan') || '[]');
      return plans.filter(p => p.date === dateStr);
    }
    const db = await this.ensureReady();
    if (!db) return [];
    return new Promise((resolve) => {
      try {
        const tx = db.transaction('mealPlan', 'readonly');
        const store = tx.objectStore('mealPlan');
        const index = store.index('date');
        const req = index.getAll(dateStr);
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      } catch (e) {
        resolve([]);
      }
    });
  }

  async getAllMealPlans() {
    if (this.useLocalStorage) {
      return JSON.parse(localStorage.getItem('diasano_mealplan') || '[]');
    }
    const db = await this.ensureReady();
    if (!db) return [];
    return new Promise((resolve) => {
      try {
        const tx = db.transaction('mealPlan', 'readonly');
        const store = tx.objectStore('mealPlan');
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      } catch (e) {
        resolve([]);
      }
    });
  }

  async deleteMealPlan(id) {
    if (this.useLocalStorage) {
      const plans = JSON.parse(localStorage.getItem('diasano_mealplan') || '[]');
      const filtered = plans.filter(p => p.id !== id);
      localStorage.setItem('diasano_mealplan', JSON.stringify(filtered));
      return true;
    }
    const db = await this.ensureReady();
    if (!db) return true;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction('mealPlan', 'readwrite');
        const store = tx.objectStore('mealPlan');
        const req = store.delete(id);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      } catch (e) {
        resolve(false);
      }
    });
  }

  // ==================== DIARIO ALIMENTARIO (CONSUMIDO) ====================
  // Estrictamente diferenciado de lo planificado.
  async addFoodLog(entry) {
    // entry: { id, date: 'YYYY-MM-DD', time: 'HH:MM', mealType, name, portion, estimatedCarbs, note, fromPlanId }
    if (!entry.id) entry.id = 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    entry.timestamp = Date.now();

    if (this.useLocalStorage) {
      const logs = JSON.parse(localStorage.getItem('diasano_foodlog') || '[]');
      logs.push(entry);
      localStorage.setItem('diasano_foodlog', JSON.stringify(logs));
      return entry;
    }

    const db = await this.ensureReady();
    if (!db) return entry;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction('foodLog', 'readwrite');
        const store = tx.objectStore('foodLog');
        const req = store.put(entry);
        req.onsuccess = () => resolve(entry);
        req.onerror = () => resolve(entry);
      } catch (e) {
        resolve(entry);
      }
    });
  }

  async getFoodLogByDate(dateStr) {
    if (this.useLocalStorage) {
      const logs = JSON.parse(localStorage.getItem('diasano_foodlog') || '[]');
      return logs.filter(l => l.date === dateStr);
    }
    const db = await this.ensureReady();
    if (!db) return [];
    return new Promise((resolve) => {
      try {
        const tx = db.transaction('foodLog', 'readonly');
        const store = tx.objectStore('foodLog');
        const index = store.index('date');
        const req = index.getAll(dateStr);
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      } catch (e) {
        resolve([]);
      }
    });
  }

  async getAllFoodLogs() {
    if (this.useLocalStorage) {
      return JSON.parse(localStorage.getItem('diasano_foodlog') || '[]');
    }
    const db = await this.ensureReady();
    if (!db) return [];
    return new Promise((resolve) => {
      try {
        const tx = db.transaction('foodLog', 'readonly');
        const store = tx.objectStore('foodLog');
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      } catch (e) {
        resolve([]);
      }
    });
  }

  async deleteFoodLog(id) {
    if (this.useLocalStorage) {
      const logs = JSON.parse(localStorage.getItem('diasano_foodlog') || '[]');
      const filtered = logs.filter(l => l.id !== id);
      localStorage.setItem('diasano_foodlog', JSON.stringify(filtered));
      return true;
    }
    const db = await this.ensureReady();
    if (!db) return true;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction('foodLog', 'readwrite');
        const store = tx.objectStore('foodLog');
        const req = store.delete(id);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      } catch (e) {
        resolve(false);
      }
    });
  }

  // ==================== LISTA DE COMPRAS ====================
  async getShoppingList() {
    if (this.useLocalStorage) {
      return JSON.parse(localStorage.getItem('diasano_shopping') || '[]');
    }
    const db = await this.ensureReady();
    if (!db) return [];
    return new Promise((resolve) => {
      try {
        const tx = db.transaction('shoppingList', 'readonly');
        const store = tx.objectStore('shoppingList');
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      } catch (e) {
        resolve([]);
      }
    });
  }

  async addShoppingItem(item) {
    // item: { id, name, amount, unit, category: 'Verdulería'|'Carnicería'|'Almacén'|'Lácteos'|'Otros', completed: false, source: 'manual'|'plan' }
    if (!item.id) item.id = 'shop_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    if (item.completed === undefined) item.completed = false;
    item.updatedAt = Date.now();

    if (this.useLocalStorage) {
      const list = JSON.parse(localStorage.getItem('diasano_shopping') || '[]');
      list.push(item);
      localStorage.setItem('diasano_shopping', JSON.stringify(list));
      return item;
    }

    const db = await this.ensureReady();
    if (!db) return item;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction('shoppingList', 'readwrite');
        const store = tx.objectStore('shoppingList');
        const req = store.put(item);
        req.onsuccess = () => resolve(item);
        req.onerror = () => resolve(item);
      } catch (e) {
        resolve(item);
      }
    });
  }

  async toggleShoppingItem(id) {
    if (this.useLocalStorage) {
      const list = JSON.parse(localStorage.getItem('diasano_shopping') || '[]');
      const item = list.find(i => i.id === id);
      if (item) {
        item.completed = !item.completed;
        localStorage.setItem('diasano_shopping', JSON.stringify(list));
        return item;
      }
      return null;
    }

    const db = await this.ensureReady();
    if (!db) return null;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction('shoppingList', 'readwrite');
        const store = tx.objectStore('shoppingList');
        const req = store.get(id);
        req.onsuccess = () => {
          const item = req.result;
          if (item) {
            item.completed = !item.completed;
            store.put(item);
            resolve(item);
          } else {
            resolve(null);
          }
        };
        req.onerror = () => resolve(null);
      } catch (e) {
        resolve(null);
      }
    });
  }

  async deleteShoppingItem(id) {
    if (this.useLocalStorage) {
      const list = JSON.parse(localStorage.getItem('diasano_shopping') || '[]');
      const filtered = list.filter(i => i.id !== id);
      localStorage.setItem('diasano_shopping', JSON.stringify(filtered));
      return true;
    }
    const db = await this.ensureReady();
    if (!db) return true;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction('shoppingList', 'readwrite');
        const store = tx.objectStore('shoppingList');
        const req = store.delete(id);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      } catch (e) {
        resolve(false);
      }
    });
  }

  async clearCompletedShoppingItems() {
    if (this.useLocalStorage) {
      const list = JSON.parse(localStorage.getItem('diasano_shopping') || '[]');
      const remaining = list.filter(i => !i.completed);
      localStorage.setItem('diasano_shopping', JSON.stringify(remaining));
      return true;
    }
    const db = await this.ensureReady();
    if (!db) return true;
    const all = await this.getShoppingList();
    const toDelete = all.filter(i => i.completed).map(i => i.id);
    return new Promise((resolve) => {
      try {
        const tx = db.transaction('shoppingList', 'readwrite');
        const store = tx.objectStore('shoppingList');
        for (const id of toDelete) {
          store.delete(id);
        }
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      } catch (e) {
        resolve(false);
      }
    });
  }

  // ==================== MI DESPENSA Y HELADERA ====================
  async getPantryItems() {
    if (this.useLocalStorage) {
      return JSON.parse(localStorage.getItem('diasano_pantry') || '[]');
    }
    const db = await this.ensureReady();
    if (!db) return [];
    return new Promise((resolve) => {
      try {
        const tx = db.transaction('pantry', 'readonly');
        const store = tx.objectStore('pantry');
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      } catch (e) {
        resolve([]);
      }
    });
  }

  async addPantryItem(item) {
    // item: { id, name, amount, unit, location: 'heladera'|'alacena'|'freezer', expireDate: 'YYYY-MM-DD'|null, isRunningOut: boolean }
    if (!item.id) item.id = 'pantry_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    item.createdAt = Date.now();

    if (this.useLocalStorage) {
      const list = JSON.parse(localStorage.getItem('diasano_pantry') || '[]');
      list.push(item);
      localStorage.setItem('diasano_pantry', JSON.stringify(list));
      return item;
    }

    const db = await this.ensureReady();
    if (!db) return item;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction('pantry', 'readwrite');
        const store = tx.objectStore('pantry');
        const req = store.put(item);
        req.onsuccess = () => resolve(item);
        req.onerror = () => resolve(item);
      } catch (e) {
        resolve(item);
      }
    });
  }

  async updatePantryItem(id, updates) {
    if (this.useLocalStorage) {
      const list = JSON.parse(localStorage.getItem('diasano_pantry') || '[]');
      const idx = list.findIndex(i => i.id === id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...updates, updatedAt: Date.now() };
        localStorage.setItem('diasano_pantry', JSON.stringify(list));
        return list[idx];
      }
      return null;
    }

    const db = await this.ensureReady();
    if (!db) return null;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction('pantry', 'readwrite');
        const store = tx.objectStore('pantry');
        const req = store.get(id);
        req.onsuccess = () => {
          const item = req.result;
          if (item) {
            const updated = { ...item, ...updates, updatedAt: Date.now() };
            store.put(updated);
            resolve(updated);
          } else {
            resolve(null);
          }
        };
        req.onerror = () => resolve(null);
      } catch (e) {
        resolve(null);
      }
    });
  }

  async deletePantryItem(id) {
    if (this.useLocalStorage) {
      const list = JSON.parse(localStorage.getItem('diasano_pantry') || '[]');
      const filtered = list.filter(i => i.id !== id);
      localStorage.setItem('diasano_pantry', JSON.stringify(filtered));
      return true;
    }
    const db = await this.ensureReady();
    if (!db) return true;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction('pantry', 'readwrite');
        const store = tx.objectStore('pantry');
        const req = store.delete(id);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      } catch (e) {
        resolve(false);
      }
    });
  }

  // ==================== SEGUIMIENTO DE BIENESTAR (GLUCOSA Y ACTIVIDAD) ====================
  async getWellnessRecords(filter = {}) {
    if (this.useLocalStorage) {
      let list = JSON.parse(localStorage.getItem('diasano_wellness') || '[]');
      if (filter.type) list = list.filter(r => r.type === filter.type);
      if (filter.startDate) list = list.filter(r => r.date >= filter.startDate);
      if (filter.endDate) list = list.filter(r => r.date <= filter.endDate);
      list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      return list;
    }
    const db = await this.ensureReady();
    if (!db) return [];
    return new Promise((resolve) => {
      try {
        const tx = db.transaction('wellness', 'readonly');
        const store = tx.objectStore('wellness');
        const req = store.getAll();
        req.onsuccess = () => {
          let list = req.result || [];
          if (filter.type) list = list.filter(r => r.type === filter.type);
          if (filter.startDate) list = list.filter(r => r.date >= filter.startDate);
          if (filter.endDate) list = list.filter(r => r.date <= filter.endDate);
          list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
          resolve(list);
        };
        req.onerror = () => resolve([]);
      } catch (e) {
        resolve([]);
      }
    });
  }

  async addWellnessRecord(record) {
    if (!record.id) record.id = 'well_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    if (!record.timestamp) record.timestamp = Date.now();
    if (!record.date) record.date = new Date().toISOString().split('T')[0];

    if (this.useLocalStorage) {
      const list = JSON.parse(localStorage.getItem('diasano_wellness') || '[]');
      list.push(record);
      localStorage.setItem('diasano_wellness', JSON.stringify(list));
      return record;
    }
    const db = await this.ensureReady();
    if (!db) return record;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction('wellness', 'readwrite');
        const store = tx.objectStore('wellness');
        const req = store.put(record);
        req.onsuccess = () => resolve(record);
        req.onerror = () => resolve(record);
      } catch (e) {
        resolve(record);
      }
    });
  }

  async updateWellnessRecord(id, updates) {
    if (this.useLocalStorage) {
      const list = JSON.parse(localStorage.getItem('diasano_wellness') || '[]');
      const idx = list.findIndex(r => r.id === id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...updates, updatedAt: Date.now() };
        localStorage.setItem('diasano_wellness', JSON.stringify(list));
        return list[idx];
      }
      return null;
    }
    const db = await this.ensureReady();
    if (!db) return null;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction('wellness', 'readwrite');
        const store = tx.objectStore('wellness');
        const req = store.get(id);
        req.onsuccess = () => {
          const item = req.result;
          if (item) {
            const updated = { ...item, ...updates, updatedAt: Date.now() };
            store.put(updated);
            resolve(updated);
          } else {
            resolve(null);
          }
        };
        req.onerror = () => resolve(null);
      } catch (e) {
        resolve(null);
      }
    });
  }

  async deleteWellnessRecord(id) {
    if (this.useLocalStorage) {
      const list = JSON.parse(localStorage.getItem('diasano_wellness') || '[]');
      const filtered = list.filter(r => r.id !== id);
      localStorage.setItem('diasano_wellness', JSON.stringify(filtered));
      return true;
    }
    const db = await this.ensureReady();
    if (!db) return true;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction('wellness', 'readwrite');
        const store = tx.objectStore('wellness');
        const req = store.delete(id);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      } catch (e) {
        resolve(false);
      }
    });
  }

  // ==================== "MI ESPACIO" (EMOCIONAL Y PRIVADO) ====================
  async getEmotionalRecords() {
    if (this.useLocalStorage) {
      let list = JSON.parse(localStorage.getItem('diasano_emotional') || '[]');
      list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      return list;
    }
    const db = await this.ensureReady();
    if (!db) return [];
    return new Promise((resolve) => {
      try {
        const tx = db.transaction('emotionalSpace', 'readonly');
        const store = tx.objectStore('emotionalSpace');
        const req = store.getAll();
        req.onsuccess = () => {
          let list = req.result || [];
          list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
          resolve(list);
        };
        req.onerror = () => resolve([]);
      } catch (e) {
        resolve([]);
      }
    });
  }

  async addEmotionalRecord(record) {
    if (!record.id) record.id = 'emo_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    if (!record.timestamp) record.timestamp = Date.now();
    if (!record.date) record.date = new Date().toISOString().split('T')[0];

    if (this.useLocalStorage) {
      const list = JSON.parse(localStorage.getItem('diasano_emotional') || '[]');
      list.push(record);
      localStorage.setItem('diasano_emotional', JSON.stringify(list));
      return record;
    }
    const db = await this.ensureReady();
    if (!db) return record;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction('emotionalSpace', 'readwrite');
        const store = tx.objectStore('emotionalSpace');
        const req = store.put(record);
        req.onsuccess = () => resolve(record);
        req.onerror = () => resolve(record);
      } catch (e) {
        resolve(record);
      }
    });
  }

  async deleteEmotionalRecord(id) {
    if (this.useLocalStorage) {
      const list = JSON.parse(localStorage.getItem('diasano_emotional') || '[]');
      const filtered = list.filter(r => r.id !== id);
      localStorage.setItem('diasano_emotional', JSON.stringify(filtered));
      return true;
    }
    const db = await this.ensureReady();
    if (!db) return true;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction('emotionalSpace', 'readwrite');
        const store = tx.objectStore('emotionalSpace');
        const req = store.delete(id);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      } catch (e) {
        resolve(false);
      }
    });
  }

  // ==================== CONFIGURACIÓN Y PREFERENCIAS ====================
  async getSetting(key, defaultValue = null) {
    if (this.useLocalStorage) {
      const val = localStorage.getItem('diasano_setting_' + key);
      return val !== null ? JSON.parse(val) : defaultValue;
    }
    const db = await this.ensureReady();
    if (!db) return defaultValue;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction('settings', 'readonly');
        const store = tx.objectStore('settings');
        const req = store.get(key);
        req.onsuccess = () => {
          if (req.result && req.result.value !== undefined) {
            resolve(req.result.value);
          } else {
            resolve(defaultValue);
          }
        };
        req.onerror = () => resolve(defaultValue);
      } catch (e) {
        resolve(defaultValue);
      }
    });
  }

  async setSetting(key, value) {
    if (this.useLocalStorage) {
      localStorage.setItem('diasano_setting_' + key, JSON.stringify(value));
      return value;
    }
    const db = await this.ensureReady();
    if (!db) return value;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction('settings', 'readwrite');
        const store = tx.objectStore('settings');
        const req = store.put({ key, value, updatedAt: Date.now() });
        req.onsuccess = () => resolve(value);
        req.onerror = () => resolve(value);
      } catch (e) {
        resolve(value);
      }
    });
  }

  // ==================== EXPORTACIÓN, IMPORTACIÓN Y BORRADO ====================
  async exportAllData() {
    const allRecipes = await this.getAllRecipes();
    const customRecipes = allRecipes.filter(r => r.isCustom);
    const favorites = await this.getAllFavorites();
    const history = await this.getRecentHistory(500);
    const mealPlan = await this.getAllMealPlans();
    const foodLog = await this.getAllFoodLogs();
    const pantry = await this.getPantryItems();
    const shoppingList = await this.getShoppingList();
    const wellness = await this.getWellnessRecords();
    const emotional = await this.getEmotionalRecords();
    const glucoseSettings = await this.getSetting('glucose_ranges', { fastingMin: 70, fastingMax: 130, postMax: 180 });
    const weatherCity = await this.getSetting('weather_city', 'Buenos Aires');

    return {
      app: 'DíaSano',
      version: '3.1',
      exportedAt: new Date().toISOString(),
      settings: {
        glucose_ranges: glucoseSettings,
        weather_city: weatherCity
      },
      data: {
        customRecipes,
        favorites,
        history,
        mealPlan,
        foodLog,
        pantry,
        shoppingList,
        wellness,
        emotional
      }
    };
  }

  async importAllData(backup) {
    if (!backup || !backup.data) {
      throw new Error('Archivo de respaldo no compatible con DíaSano.');
    }
    const d = backup.data;

    if (Array.isArray(d.customRecipes)) {
      for (const recipe of d.customRecipes) await this.saveCustomRecipe(recipe);
    }
    if (Array.isArray(d.favorites)) {
      for (const item of d.favorites) {
        if (item && item.id && !(await this.isFavorite(item.id))) {
          await this.toggleFavorite(item);
        }
      }
    }
    if (Array.isArray(d.mealPlan)) {
      for (const item of d.mealPlan) await this.addMealPlan(item);
    }
    if (Array.isArray(d.foodLog)) {
      for (const item of d.foodLog) await this.addFoodLog(item);
    }
    if (Array.isArray(d.pantry)) {
      for (const item of d.pantry) await this.addPantryItem(item);
    }
    if (Array.isArray(d.shoppingList)) {
      for (const item of d.shoppingList) await this.addShoppingItem(item);
    }
    if (Array.isArray(d.wellness)) {
      for (const item of d.wellness) await this.addWellnessRecord(item);
    }
    if (Array.isArray(d.emotional)) {
      for (const item of d.emotional) await this.addEmotionalRecord(item);
    }
    if (backup.settings) {
      if (backup.settings.glucose_ranges) {
        await this.setSetting('glucose_ranges', backup.settings.glucose_ranges);
      }
      if (backup.settings.weather_city) {
        await this.setSetting('weather_city', backup.settings.weather_city);
      }
    }
    return true;
  }

  async clearAllUserData() {
    if (this.useLocalStorage) {
      const keys = [
        'diasano_custom_recipes',
        'diasano_favorites',
        'diasano_history',
        'diasano_mealplan',
        'diasano_foodlog',
        'diasano_pantry',
        'diasano_shopping',
        'diasano_wellness',
        'diasano_emotional',
        'diasano_setting_glucose_ranges',
        'diasano_setting_weather_city',
        'diasano_setting_reminders',
        'diasano_setting_habits',
        'diasano_setting_weekly_budget'
      ];
      keys.forEach(k => localStorage.removeItem(k));
      return true;
    }
    const db = await this.ensureReady();
    if (!db) return true;
    const stores = ['favorites', 'history', 'mealPlan', 'foodLog', 'pantry', 'shoppingList', 'wellness', 'emotionalSpace', 'settings'];
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(stores, 'readwrite');
        stores.forEach(s => {
          if (db.objectStoreNames.contains(s)) {
            tx.objectStore(s).clear();
          }
        });
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      } catch (e) {
        resolve(false);
      }
    });
  }
}

// Instancia global
window.DiaSanoDB = DiaSanoDatabase;
window.db = new DiaSanoDatabase();
