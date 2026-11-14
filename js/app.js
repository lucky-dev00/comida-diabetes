/**
 * DíaSano - Controlador Principal de la Aplicación
 * Filosofía: "La aplicación decide con vos, no por vos"
 */

// Delegación segura a la base de datos local
const db = {
  isFavorite: (...args) => window.db.isFavorite(...args),
  getAllFavorites: (...args) => window.db.getAllFavorites(...args),
  getRecipeById: (...args) => window.db.getRecipeById(...args),
  recordRecipeHistory: (...args) => window.db.recordRecipeHistory(...args),
  toggleFavorite: (...args) => window.db.toggleFavorite(...args),
  getRecentHistory: (...args) => window.db.getRecentHistory(...args),
  clearHistory: (...args) => window.db.clearHistory(...args),
  ensureReady: (...args) => window.db.ensureReady(...args),
  getAllRecipes: (...args) => window.db.getAllRecipes(...args),
  addMealPlan: (...args) => window.db.addMealPlan(...args),
  getMealPlanByDate: (...args) => window.db.getMealPlanByDate(...args),
  getAllMealPlans: (...args) => window.db.getAllMealPlans(...args),
  deleteMealPlan: (...args) => window.db.deleteMealPlan(...args),
  addFoodLog: (...args) => window.db.addFoodLog(...args),
  getFoodLogByDate: (...args) => window.db.getFoodLogByDate(...args),
  getAllFoodLogs: (...args) => window.db.getAllFoodLogs(...args),
  deleteFoodLog: (...args) => window.db.deleteFoodLog(...args),
  getShoppingList: (...args) => window.db.getShoppingList(...args),
  addShoppingItem: (...args) => window.db.addShoppingItem(...args),
  toggleShoppingItem: (...args) => window.db.toggleShoppingItem(...args),
  deleteShoppingItem: (...args) => window.db.deleteShoppingItem(...args),
  clearCompletedShoppingItems: (...args) => window.db.clearCompletedShoppingItems(...args),
  getPantryItems: (...args) => window.db.getPantryItems(...args),
  addPantryItem: (...args) => window.db.addPantryItem(...args),
  updatePantryItem: (...args) => window.db.updatePantryItem(...args),
  deletePantryItem: (...args) => window.db.deletePantryItem(...args),
  getWellnessRecords: (...args) => window.db.getWellnessRecords(...args),
  addWellnessRecord: (...args) => window.db.addWellnessRecord(...args),
  updateWellnessRecord: (...args) => window.db.updateWellnessRecord(...args),
  deleteWellnessRecord: (...args) => window.db.deleteWellnessRecord(...args),
  getEmotionalRecords: (...args) => window.db.getEmotionalRecords(...args),
  addEmotionalRecord: (...args) => window.db.addEmotionalRecord(...args),
  deleteEmotionalRecord: (...args) => window.db.deleteEmotionalRecord(...args),
  getSetting: (...args) => window.db.getSetting(...args),
  setSetting: (...args) => window.db.setSetting(...args),
  saveCustomRecipe: (...args) => window.db.saveCustomRecipe(...args),
  deleteCustomRecipe: (...args) => window.db.deleteCustomRecipe(...args),
  exportAllData: (...args) => window.db.exportAllData(...args),
  importAllData: (...args) => window.db.importAllData(...args),
  clearAllUserData: (...args) => window.db.clearAllUserData(...args)
};

class DiaSanoApp {
  constructor() {
    this.allRecipes = [];
    this.currentProposal = null;
    this.proposalFilter = 'todas';
    this.activeView = 'home';
    this.libraryCategory = 'all';
    this.activeTags = new Set();
    
    // Modal de receta y sustituciones dinámicas
    this.activeRecipe = null;
    this.modalServings = 2;
    this.missingIngredientIndices = new Set();
    this.appliedSubstitutions = {};

    // Calendario y Planificador
    this.calendarDate = new Date();
    this.calendarMode = 'week'; // 'week' | 'month'

    // Diario alimentario
    this.diaryDate = this.formatDateISO(new Date());
    this.diaryQuickMeal = 'almuerzo';

    // Despensa y Herramientas Cotidianas (Etapa 3)
    this.pantryFilter = 'all';
    this.solveParams = { time: 10, cook: 'low', ingredients: new Set(['huevos', 'arroz']) };
    this.lazyCurrentTab = '5';

    // Bienestar & Salud (Etapa 4)
    this.wellnessSubtab = 'glucose'; // 'glucose' | 'activity' | 'emotional'
    this.selectedMood = { key: 'calma', emoji: '😌', label: 'En calma' };
    this.weatherData = null;
    this.weatherCity = 'Buenos Aires';
    this.glucoseSettings = { fastingMin: 70, fastingMax: 130, postMax: 180 };
    this.defaultHabits = [
      { id: 'habit_walk', name: 'Caminar al menos 20 minutos', icon: '🚶', done: false },
      { id: 'habit_water', name: 'Tomar 8 vasos de agua fresca', icon: '💧', done: false },
      { id: 'habit_cook', name: 'Preparar una comida casera', icon: '🥗', done: false },
      { id: 'habit_stretch', name: 'Pausa activa o estiramiento de 5 min', icon: '🧘', done: false }
    ];
    this.habits = [];

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  async init() {
    this.initTheme();
    try {
      if (window.db) {
        await window.db.ensureReady();
        this.allRecipes = await window.db.getAllRecipes();
      }
      if (!this.allRecipes || this.allRecipes.length === 0) {
        this.allRecipes = window.INITIAL_RECIPES || [];
      }
      this.updateRecipeCountBadge();
      await this.pickProposal();
      this.renderLibraryGrid();

      // Inicializar fecha de diario en el input
      const diaryPicker = document.getElementById('diary-date-picker');
      if (diaryPicker) diaryPicker.value = this.diaryDate;

      // Inicializar Bienestar, Ajustes y Clima (Open-Meteo)
      await this.initWellnessAndSettings();
      this.initWeather();
      this.initPWA();
    } catch (err) {
      console.error('Error inicializando DíaSano:', err);
      this.allRecipes = window.INITIAL_RECIPES || [];
      await this.pickProposal();
      this.renderLibraryGrid();
      this.initPWA();
    }
  }

  // ==================== INSTALACIÓN PWA (SECCIONES 2 Y 24) ====================
  initPWA() {
    this.deferredPwaPrompt = null;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPwaPrompt = e;
      const btn = document.getElementById('pwa-install-btn');
      if (btn) btn.classList.remove('hidden');
    });

    window.addEventListener('appinstalled', () => {
      this.deferredPwaPrompt = null;
      const btn = document.getElementById('pwa-install-btn');
      if (btn) btn.classList.add('hidden');
      this.showToast('¡DíaSano instalada con éxito en tu dispositivo!');
    });
  }

  async triggerPWAInstall() {
    if (this.deferredPwaPrompt) {
      this.deferredPwaPrompt.prompt();
      const choice = await this.deferredPwaPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        this.showToast('Instalando DíaSano...');
      }
      this.deferredPwaPrompt = null;
      const btn = document.getElementById('pwa-install-btn');
      if (btn) btn.classList.add('hidden');
    } else {
      alert('Para instalar DíaSano en tu dispositivo, abrí el menú de tu navegador (los tres puntos o el botón de compartir) y elegí "Instalar aplicación" o "Agregar a la pantalla principal". Funciona 100% offline.');
    }
  }

  formatDateISO(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // ==================== TEMA (CLARO / OSCURO) ====================
  initTheme() {
    const savedTheme = localStorage.getItem('diasano_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add('dark');
      this.updateThemeIcons(true);
    } else {
      document.documentElement.classList.remove('dark');
      this.updateThemeIcons(false);
    }
  }

  toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('diasano_theme', isDark ? 'dark' : 'light');
    this.updateThemeIcons(isDark);
  }

  updateThemeIcons(isDark) {
    const sunIcon = document.getElementById('theme-icon-sun');
    const moonIcon = document.getElementById('theme-icon-moon');
    if (sunIcon && moonIcon) {
      if (isDark) {
        sunIcon.classList.remove('hidden');
        moonIcon.classList.add('hidden');
      } else {
        sunIcon.classList.add('hidden');
        moonIcon.classList.remove('hidden');
      }
    }
  }

  // ==================== NAVEGACIÓN ====================
  navigate(viewName) {
    this.activeView = viewName;
    const views = ['home', 'calendar', 'diary', 'pantry', 'shopping', 'recipes', 'favorites', 'history', 'wellness', 'settings'];
    
    views.forEach(v => {
      const el = document.getElementById(`view-${v}`);
      if (el) {
        if (v === viewName) {
          el.classList.remove('hidden');
        } else {
          el.classList.add('hidden');
        }
      }

      // Actualizar botón de navegación escritorio
      const desktopBtn = document.getElementById(`nav-btn-${v}`);
      if (desktopBtn) {
        if (v === viewName) {
          desktopBtn.className = 'nav-desktop-btn px-2.5 py-1.5 rounded-xl text-xs lg:text-sm font-semibold transition-all text-brand-700 bg-brand-50 dark:bg-brand-900/40 dark:text-brand-300 whitespace-nowrap';
        } else {
          desktopBtn.className = 'nav-desktop-btn px-2.5 py-1.5 rounded-xl text-xs lg:text-sm font-medium transition-all text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 whitespace-nowrap';
        }
      }

      // Actualizar botón de navegación móvil
      const mobileBtn = document.getElementById(`mobile-nav-${v}`);
      if (mobileBtn) {
        if (v === viewName) {
          mobileBtn.className = 'flex flex-col items-center gap-0.5 text-brand-600 dark:text-brand-400 py-1 px-1.5';
        } else {
          mobileBtn.className = 'flex flex-col items-center gap-0.5 text-stone-500 dark:text-stone-400 py-1 px-1.5';
        }
      }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (viewName === 'calendar') {
      this.renderCalendar();
    } else if (viewName === 'diary') {
      this.renderDiaryView();
    } else if (viewName === 'pantry') {
      this.renderPantryView();
    } else if (viewName === 'shopping') {
      this.renderShoppingView();
    } else if (viewName === 'favorites') {
      this.loadFavoritesView();
    } else if (viewName === 'history') {
      this.loadHistoryView();
    } else if (viewName === 'recipes') {
      this.renderLibraryGrid();
    } else if (viewName === 'wellness') {
      this.renderWellnessView();
    } else if (viewName === 'settings') {
      this.renderSettingsView();
    }
  }

  // ==================== PROPUESTA DEL DÍA ("¿QUÉ COMEMOS HOY?") ====================
  setProposalFilter(category) {
    this.proposalFilter = category;
    
    document.querySelectorAll('.proposal-chip').forEach(chip => {
      if (chip.getAttribute('data-category') === category) {
        chip.className = 'proposal-chip px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap bg-brand-600 text-white shadow-sm';
      } else {
        chip.className = 'proposal-chip px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300 hover:bg-stone-200';
      }
    });

    this.pickProposal();
  }

  async pickProposal() {
    if (!this.allRecipes || this.allRecipes.length === 0) return;

    let pool = [...this.allRecipes];

    if (this.proposalFilter === 'rapidas') {
      pool = pool.filter(r => (r.timePrep + r.timeCook) <= 15 || (r.tags && r.tags.includes('rapida')));
    } else if (this.proposalFilter !== 'todas') {
      pool = pool.filter(r => r.category === this.proposalFilter);
    }

    if (pool.length === 0) pool = this.allRecipes;

    if (pool.length > 1 && this.currentProposal) {
      pool = pool.filter(r => r.id !== this.currentProposal.id);
    }

    const randomIndex = Math.floor(Math.random() * pool.length);
    this.currentProposal = pool[randomIndex];
    await this.renderProposalCard(this.currentProposal);
  }

  async renderProposalCard(recipe) {
    const container = document.getElementById('proposal-container');
    if (!container || !recipe) return;

    const isFav = await db.isFavorite(recipe.id);
    const totalTime = recipe.timePrep + recipe.timeCook;

    container.innerHTML = `
      <div class="flex flex-col md:flex-row">
        <div class="relative md:w-5/12 h-56 md:h-auto overflow-hidden bg-stone-200 dark:bg-stone-700">
          <img 
            src="${recipe.image}" 
            alt="${recipe.name}" 
            class="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            loading="lazy"
          >
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:hidden"></div>
          <span class="absolute top-3 left-3 text-xs font-bold uppercase tracking-wider px-3 py-1 bg-white/90 dark:bg-stone-900/90 text-brand-700 dark:text-brand-300 rounded-xl backdrop-blur-sm">
            ${this.getCategoryLabel(recipe.category)}
          </span>
        </div>

        <div class="p-5 sm:p-7 md:w-7/12 flex flex-col justify-between space-y-4">
          <div class="space-y-3">
            <div class="flex items-center gap-2 flex-wrap text-xs">
              <span class="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-medium">
                ⏱️ ${totalTime} min total
              </span>
              <span class="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 font-medium">
                ${recipe.difficulty}
              </span>
              <span class="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-medium">
                ~${recipe.estimatedCarbsPerServing}g carbohidratos est.
              </span>
            </div>

            <h2 class="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white leading-snug">
              ${recipe.name}
            </h2>

            <p class="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
              ${this.getProposalTeaser(recipe)}
            </p>
          </div>

          <div class="pt-2 border-t border-stone-100 dark:border-stone-700/80 flex flex-wrap items-center gap-2 sm:gap-3">
            
            <button 
              onclick="app.openRecipeModal('${recipe.id}')" 
              class="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-brand-600/20 transition-all flex items-center justify-center gap-2"
            >
              <span>👁️ Ver receta</span>
            </button>

            <button 
              onclick="app.pickProposal()" 
              class="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs sm:text-sm font-medium transition-all flex items-center justify-center gap-1.5"
              title="Mostrar otra opción sin juzgar"
            >
              <span>🔄 Dame otra idea</span>
            </button>

            <button 
              onclick="app.toggleFavoriteProposal('${recipe.id}')" 
              id="proposal-fav-btn"
              class="p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 transition-colors"
              title="${isFav ? 'Quitar de favoritos' : 'Guardar en favoritos'}"
            >
              <span class="text-base">${isFav ? '❤️' : '🤍'}</span>
            </button>

            <button 
              onclick="app.openPlanModal(null, '${recipe.category}', '${recipe.id}')"
              class="p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 transition-colors flex items-center gap-1 text-xs font-medium"
              title="Agregar al calendario"
            >
              <span>📅</span>
              <span class="hidden sm:inline">Planificar</span>
            </button>

          </div>
        </div>
      </div>
    `;
  }

  getProposalTeaser(recipe) {
    const mainIngredients = recipe.ingredients.slice(0, 3).map(i => i.name).join(', ');
    return `Preparación con ingredientes cotidianos: ${mainIngredients}. Ideal si buscás algo ${recipe.costLevel.toLowerCase()} y sin complicaciones.`;
  }

  getCategoryLabel(cat) {
    const map = {
      almuerzo: 'Almuerzo',
      cena: 'Cena',
      desayuno: 'Desayuno',
      merienda: 'Merienda',
      snack: 'Snack'
    };
    return map[cat] || cat;
  }

  // ==================== CALENDARIO Y MENÚ SEMANAL ====================
  setCalendarMode(mode) {
    this.calendarMode = mode;
    const btnWeek = document.getElementById('btn-cal-week');
    const btnMonth = document.getElementById('btn-cal-month');
    const contWeek = document.getElementById('calendar-week-container');
    const contMonth = document.getElementById('calendar-month-container');

    if (mode === 'week') {
      btnWeek.className = 'px-3 py-1.5 rounded-lg bg-white dark:bg-stone-700 text-brand-700 dark:text-brand-300 shadow-sm transition-all';
      btnMonth.className = 'px-3 py-1.5 rounded-lg text-stone-600 dark:text-stone-400 hover:text-stone-900 transition-all';
      contWeek.classList.remove('hidden');
      contMonth.classList.add('hidden');
    } else {
      btnMonth.className = 'px-3 py-1.5 rounded-lg bg-white dark:bg-stone-700 text-brand-700 dark:text-brand-300 shadow-sm transition-all';
      btnWeek.className = 'px-3 py-1.5 rounded-lg text-stone-600 dark:text-stone-400 hover:text-stone-900 transition-all';
      contMonth.classList.remove('hidden');
      contWeek.classList.add('hidden');
    }
    this.renderCalendar();
  }

  calendarGoToday() {
    this.calendarDate = new Date();
    this.renderCalendar();
  }

  navigateCalendarPeriod(offset) {
    if (this.calendarMode === 'week') {
      this.calendarDate.setDate(this.calendarDate.getDate() + (offset * 7));
    } else {
      this.calendarDate.setMonth(this.calendarDate.getMonth() + offset);
    }
    this.renderCalendar();
  }

  getWeekDays(baseDate) {
    const current = new Date(baseDate);
    const day = current.getDay();
    // Ajustar a Lunes como primer día de la semana
    const diff = current.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(current.setDate(diff));

    const week = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      week.push(d);
    }
    return week;
  }

  async renderCalendar() {
    const periodLabel = document.getElementById('calendar-period-label');
    const periodSublabel = document.getElementById('calendar-period-sublabel');

    if (this.calendarMode === 'week') {
      const weekDays = this.getWeekDays(this.calendarDate);
      const startStr = weekDays[0].toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
      const endStr = weekDays[6].toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });
      if (periodLabel) periodLabel.textContent = `Semana: ${startStr} — ${endStr}`;
      if (periodSublabel) periodSublabel.textContent = 'Menú semanal con tus comidas planificadas';

      await this.renderWeekView(weekDays);
    } else {
      const monthStr = this.calendarDate.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
      if (periodLabel) periodLabel.textContent = monthStr.charAt(0).toUpperCase() + monthStr.slice(1);
      if (periodSublabel) periodSublabel.textContent = 'Vista mensual con actividades registradas';

      await this.renderMonthView();
    }
  }

  async renderWeekView(weekDays) {
    const container = document.getElementById('calendar-week-container');
    if (!container) return;

    const allPlans = await db.getAllMealPlans();
    const allLogs = await db.getAllFoodLogs();
    const todayISO = this.formatDateISO(new Date());

    const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const mealTurns = [
      { id: 'desayuno', label: 'Desayuno', icon: '🌅' },
      { id: 'almuerzo', label: 'Almuerzo', icon: '☀️' },
      { id: 'merienda', label: 'Merienda', icon: '☕' },
      { id: 'cena', label: 'Cena', icon: '🌙' },
      { id: 'snack', label: 'Snack', icon: '🍎' }
    ];

    container.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-7 gap-3">
        ${weekDays.map((d, index) => {
          const dateISO = this.formatDateISO(d);
          const isToday = dateISO === todayISO;
          const dayPlans = allPlans.filter(p => p.date === dateISO);
          const dayLogs = allLogs.filter(l => l.date === dateISO);

          return `
            <div class="bg-white dark:bg-stone-800 rounded-2xl border ${isToday ? 'border-brand-500 shadow-md ring-1 ring-brand-500/20' : 'border-stone-200 dark:border-stone-700/80'} p-3 flex flex-col justify-between">
              
              <!-- Encabezado del día -->
              <div class="pb-2 border-b border-stone-100 dark:border-stone-700/60 flex items-center justify-between">
                <div>
                  <span class="text-xs font-bold ${isToday ? 'text-brand-600 dark:text-brand-400' : 'text-stone-700 dark:text-stone-200'}">
                    ${dayNames[index]}
                  </span>
                  <span class="text-[11px] text-stone-400 block">
                    ${d.getDate()} ${d.toLocaleDateString('es-AR', { month: 'short' })}
                  </span>
                </div>
                ${isToday ? '<span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-brand-600 text-white">HOY</span>' : ''}
              </div>

              <!-- Lista de comidas por turno -->
              <div class="space-y-2 py-2 flex-1">
                ${mealTurns.map(turn => {
                  const planned = dayPlans.find(p => p.mealType === turn.id);
                  const isConsumed = planned ? dayLogs.some(l => l.fromPlanId === planned.id || (l.date === dateISO && l.mealType === turn.id && l.name === planned.name)) : false;

                  if (planned) {
                    return `
                      <div class="p-2 rounded-xl ${isConsumed ? 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40' : 'bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-700'} space-y-1.5 transition-all">
                        <div class="flex items-center justify-between">
                          <span class="text-[10px] font-semibold text-stone-400 flex items-center gap-1">
                            <span>${turn.icon}</span> <span>${turn.label}</span>
                          </span>
                          <div class="flex items-center gap-1">
                            <button onclick="app.openMoveMealPlanModal('${planned.id}')" class="text-stone-400 hover:text-brand-600 text-[11px]" title="Mover a otra fecha">📅</button>
                            <button onclick="app.deleteMealPlan('${planned.id}')" class="text-stone-300 hover:text-red-500 text-xs" title="Quitar">✕</button>
                          </div>
                        </div>

                        <div class="font-bold text-stone-900 dark:text-white text-xs leading-tight line-clamp-2 cursor-pointer hover:text-brand-600" onclick="app.inspectOrOpenRecipe('${planned.recipeId || ''}')">
                          ${planned.name}
                        </div>

                        ${planned.estimatedCarbs ? `<span class="text-[10px] text-brand-600 dark:text-brand-400 font-medium block">~${planned.estimatedCarbs}g carbos</span>` : ''}

                        <!-- Diferenciar lo planificado de lo consumido con confirmación explícita -->
                        <div class="pt-1">
                          ${isConsumed ? `
                            <span class="inline-flex items-center gap-1 text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold">
                              <span>✓</span> <span>Consumida</span>
                            </span>
                          ` : `
                            <button onclick="app.confirmPlanConsumed('${planned.id}')" class="w-full py-1 rounded-lg bg-stone-200 dark:bg-stone-700 hover:bg-brand-600 hover:text-white text-stone-700 dark:text-stone-200 text-[10px] font-semibold transition-colors flex items-center justify-center gap-1" title="Registrar que comiste esto en tu diario">
                              <span>✓ Ya la comí</span>
                            </button>
                          `}
                        </div>
                      </div>
                    `;
                  } else {
                    return `
                      <div class="flex items-center justify-between py-1 border-b border-stone-50 dark:border-stone-800 text-[11px]">
                        <span class="text-stone-400 flex items-center gap-1">
                          <span>${turn.icon}</span> <span>${turn.label}</span>
                        </span>
                        <button onclick="app.openPlanModal('${dateISO}', '${turn.id}')" class="text-stone-400 hover:text-brand-600 text-[10px] font-bold px-1.5 py-0.5 rounded hover:bg-stone-100 dark:hover:bg-stone-700">
                          + Planear
                        </button>
                      </div>
                    `;
                  }
                }).join('')}
              </div>

            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  async renderMonthView() {
    const container = document.getElementById('calendar-month-container');
    if (!container) return;

    const allPlans = await db.getAllMealPlans();
    const allLogs = await db.getAllFoodLogs();
    const todayISO = this.formatDateISO(new Date());

    const year = this.calendarDate.getFullYear();
    const month = this.calendarDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const adjustedFirstDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
    const totalDays = new Date(year, month + 1, 0).getDate();

    let gridHtml = '';
    const dayLabels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

    // Encabezados de días
    gridHtml += '<div class="grid grid-cols-7 gap-1 text-center font-bold text-xs text-stone-400 pb-2">';
    dayLabels.forEach(l => gridHtml += `<div>${l}</div>`);
    gridHtml += '</div>';

    // Días del mes en grilla
    gridHtml += '<div class="grid grid-cols-7 gap-1.5">';
    for (let i = 0; i < adjustedFirstDay; i++) {
      gridHtml += '<div class="h-16 sm:h-20 bg-stone-100/50 dark:bg-stone-800/20 rounded-xl"></div>';
    }

    for (let dayNum = 1; dayNum <= totalDays; dayNum++) {
      const d = new Date(year, month, dayNum);
      const dateISO = this.formatDateISO(d);
      const isToday = dateISO === todayISO;
      const plansCount = allPlans.filter(p => p.date === dateISO).length;
      const logsCount = allLogs.filter(l => l.date === dateISO).length;

      gridHtml += `
        <div onclick="app.selectMonthDate('${dateISO}')" class="h-16 sm:h-20 p-1.5 rounded-xl bg-white dark:bg-stone-800 border ${isToday ? 'border-brand-500 ring-1 ring-brand-500' : 'border-stone-200 dark:border-stone-700'} flex flex-col justify-between cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-750 transition-colors">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold ${isToday ? 'text-brand-600 dark:text-brand-400' : 'text-stone-700 dark:text-stone-300'}">
              ${dayNum}
            </span>
          </div>
          <div class="flex items-center gap-1 flex-wrap">
            ${plansCount > 0 ? `<span class="w-2 h-2 rounded-full bg-brand-500" title="${plansCount} comidas planificadas"></span>` : ''}
            ${logsCount > 0 ? `<span class="w-2 h-2 rounded-full bg-amber-500" title="${logsCount} comidas consumidas registradas"></span>` : ''}
          </div>
        </div>
      `;
    }
    gridHtml += '</div>';

    container.innerHTML = gridHtml;
  }

  selectMonthDate(dateISO) {
    this.calendarDate = new Date(dateISO + 'T12:00:00');
    this.setCalendarMode('week');
  }

  // ==================== MODAL DE PLANIFICAR COMIDA ====================
  openPlanModal(defaultDate = null, defaultMealType = null, defaultRecipeId = null, customName = null, customCarbs = null) {
    const modal = document.getElementById('plan-modal');
    const inputDate = document.getElementById('plan-input-date');
    const selectMeal = document.getElementById('plan-input-mealtype');
    const inputName = document.getElementById('plan-input-name');
    const hiddenRecipeId = document.getElementById('plan-input-recipe-id');

    inputDate.value = defaultDate || this.formatDateISO(new Date());
    selectMeal.value = defaultMealType || 'almuerzo';

    if (defaultRecipeId) {
      const rec = this.allRecipes.find(r => r.id === defaultRecipeId);
      if (rec) {
        inputName.value = rec.name;
        hiddenRecipeId.value = rec.id;
      }
    } else if (customName) {
      inputName.value = customName;
      hiddenRecipeId.value = '';
    } else {
      inputName.value = '';
      hiddenRecipeId.value = '';
    }

    modal.classList.remove('hidden');
  }

  openPlanModalFromCurrentRecipe() {
    if (!this.activeRecipe) return;
    this.closeRecipeModal();
    this.openPlanModal(null, this.activeRecipe.category, this.activeRecipe.id);
  }

  closePlanModal() {
    document.getElementById('plan-modal').classList.add('hidden');
  }

  openRecipeSelectorForPlan() {
    this.closePlanModal();
    this.navigate('recipes');
    this.showToast('Elegí la receta que querés planificar y tocá "Agregar al calendario"');
  }

  async confirmPlanModal() {
    const date = document.getElementById('plan-input-date').value;
    const mealType = document.getElementById('plan-input-mealtype').value;
    const name = document.getElementById('plan-input-name').value.trim();
    const recipeId = document.getElementById('plan-input-recipe-id').value;

    if (!name) {
      alert('Por favor escribí el nombre de la comida o elegí una receta.');
      return;
    }

    let estimatedCarbs = 0;
    let image = '';
    if (recipeId) {
      const rec = this.allRecipes.find(r => r.id === recipeId);
      if (rec) {
        estimatedCarbs = rec.estimatedCarbsPerServing || 0;
        image = rec.image || '';
      }
    }

    await db.addMealPlan({
      date,
      mealType,
      name,
      recipeId: recipeId || null,
      estimatedCarbs,
      image
    });

    this.closePlanModal();
    this.showToast(`¡Comida planificada para el ${date}!`);
    if (this.activeView === 'calendar') {
      this.renderCalendar();
    }
  }

  async deleteMealPlan(id) {
    if (confirm('¿Querés quitar esta comida de tu planificación?')) {
      await db.deleteMealPlan(id);
      this.renderCalendar();
      this.showToast('Comida quitada de la planificación');
    }
  }

  // ==================== MOVER COMIDA EN CALENDARIO (SECCIÓN 8) ====================
  async openMoveMealPlanModal(planId) {
    const plans = await db.getAllMealPlans();
    const plan = plans.find(p => String(p.id) === String(planId));
    if (!plan) return;

    this.activeMovingPlan = plan;
    const modal = document.getElementById('move-meal-modal');
    const inputId = document.getElementById('move-meal-plan-id');
    const nameEl = document.getElementById('move-meal-name');
    const inputDate = document.getElementById('move-meal-new-date');
    const selectTurn = document.getElementById('move-meal-new-turn');

    if (inputId) inputId.value = plan.id;
    if (nameEl) nameEl.textContent = `${plan.name} (${this.getCategoryLabel(plan.mealType)})`;
    if (inputDate) inputDate.value = plan.date;
    if (selectTurn) selectTurn.value = plan.mealType;

    if (modal) modal.classList.remove('hidden');
  }

  closeMoveMealModal() {
    const modal = document.getElementById('move-meal-modal');
    if (modal) modal.classList.add('hidden');
    this.activeMovingPlan = null;
  }

  async confirmMoveMealPlan() {
    const inputId = document.getElementById('move-meal-plan-id')?.value;
    const newDate = document.getElementById('move-meal-new-date')?.value;
    const newTurn = document.getElementById('move-meal-new-turn')?.value;

    if (!inputId || !newDate || !newTurn) {
      alert('Por favor seleccioná una fecha y turno válidos.');
      return;
    }

    const plans = await db.getAllMealPlans();
    const plan = plans.find(p => String(p.id) === String(inputId));
    if (!plan) {
      this.closeMoveMealModal();
      return;
    }

    await db.deleteMealPlan(plan.id);
    await db.addMealPlan({
      ...plan,
      id: plan.id,
      date: newDate,
      mealType: newTurn
    });

    this.closeMoveMealModal();
    this.renderCalendar();
    this.showToast('Comida movida de fecha con éxito');
  }

  // ==================== IMPRESIÓN DEL MENÚ SEMANAL (PARA LA HELADERA) ====================
  async openPrintWeeklyMenuModal() {
    const modal = document.getElementById('modal-print-menu');
    const container = document.getElementById('print-weekly-menu-content');
    if (!modal || !container) return;

    const weekDays = this.getWeekDays(this.calendarDate);
    const startStr = weekDays[0].toLocaleDateString('es-AR', { day: 'numeric', month: 'long' });
    const endStr = weekDays[6].toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });

    const allPlans = await db.getAllMealPlans();
    const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const turns = [
      { id: 'desayuno', label: '🌅 Desayuno' },
      { id: 'almuerzo', label: '☀️ Almuerzo' },
      { id: 'merienda', label: '☕ Merienda' },
      { id: 'cena', label: '🌙 Cena' }
    ];

    const rowsHtml = weekDays.map((d, idx) => {
      const dateISO = this.formatDateISO(d);
      const dayPlans = allPlans.filter(p => p.date === dateISO);

      return `
        <tr class="border-b border-stone-200">
          <td class="p-2.5 font-bold border-r border-stone-300 bg-stone-50/70 align-top">
            <span class="block text-stone-900 text-xs">${dayNames[idx]}</span>
            <span class="block text-[10px] font-normal text-stone-500">${d.getDate()}/${d.getMonth() + 1}</span>
          </td>
          ${turns.map(t => {
            const plan = dayPlans.find(p => p.mealType === t.id);
            if (plan) {
              return `
                <td class="p-2 border-r border-stone-300 align-top bg-white text-xs">
                  <span class="font-bold text-stone-900 block leading-tight">${plan.name}</span>
                  ${plan.estimatedCarbs ? `<span class="text-[10px] text-emerald-700 block mt-0.5">~${plan.estimatedCarbs}g carbos</span>` : ''}
                </td>
              `;
            }
            return `
              <td class="p-2 border-r border-stone-300 align-top bg-white/60 text-stone-300 italic text-[11px]">
                —
              </td>
            `;
          }).join('')}
          <td class="p-2 align-top text-stone-400 text-[10px]">
            <span class="block text-stone-300 italic">..................</span>
          </td>
        </tr>
      `;
    }).join('');

    container.innerHTML = `
      <div class="print-menu-wrapper font-sans text-stone-900 space-y-4">
        <!-- Encabezado Imprimible -->
        <div class="border-b-2 border-emerald-600 pb-3 flex items-center justify-between">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-2xl">🥗</span>
              <h2 class="text-xl font-bold text-stone-900 tracking-tight">DíaSano · Menú Semanal</h2>
            </div>
            <p class="text-xs text-stone-600 mt-0.5">
              Semana del <strong>${startStr}</strong> al <strong>${endStr}</strong> · <em>"La aplicación decide con vos, no por vos"</em>
            </p>
          </div>
          <div class="text-right text-[11px] text-stone-500">
            <span class="block font-bold text-emerald-700">📌 Listo para la heladera</span>
            <span>Impreso el ${new Date().toLocaleDateString('es-AR')}</span>
          </div>
        </div>

        <!-- Tabla de 7 Días -->
        <div class="overflow-x-auto">
          <table class="w-full border-collapse border border-stone-300 text-xs">
            <thead>
              <tr class="bg-emerald-50 text-stone-900 font-bold border-b border-stone-300 text-left">
                <th class="p-2 border-r border-stone-300 w-24">Día</th>
                <th class="p-2 border-r border-stone-300 w-1/4">🌅 Desayuno</th>
                <th class="p-2 border-r border-stone-300 w-1/4">☀️ Almuerzo</th>
                <th class="p-2 border-r border-stone-300 w-1/4">☕ Merienda</th>
                <th class="p-2 border-r border-stone-300 w-1/4">🌙 Cena</th>
                <th class="p-2 w-28">Notas</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </div>

        <!-- Recordatorios amables para la heladera -->
        <div class="pt-3 border-t border-dashed border-stone-200 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px] text-stone-600">
          <div class="flex items-center gap-2 p-2 bg-stone-50 rounded-xl border border-stone-200">
            <span class="text-base">💧</span> <span>Tomar agua fresca a lo largo del día.</span>
          </div>
          <div class="flex items-center gap-2 p-2 bg-stone-50 rounded-xl border border-stone-200">
            <span class="text-base">❄️</span> <span>Descongelar con anticipación en heladera.</span>
          </div>
          <div class="flex items-center gap-2 p-2 bg-stone-50 rounded-xl border border-stone-200">
            <span class="text-base">😌</span> <span>Comer con calma y disfrutar cada momento.</span>
          </div>
        </div>

        <div class="text-center text-[10px] text-stone-400 pt-1">
          DíaSano · Organización alimentaria, bienestar y seguimiento personal · 100% Gratuito y Privado
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  closePrintWeeklyMenuModal() {
    const modal = document.getElementById('modal-print-menu');
    if (modal) modal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  /**
   * Confirma que una comida planificada fue efectivamente consumida.
   * La registra en el Diario Alimentario (foodLog) respetando la distinción.
   */
  async confirmPlanConsumed(planId) {
    const allPlans = await db.getAllMealPlans();
    const plan = allPlans.find(p => p.id === planId);
    if (!plan) return;

    await db.addFoodLog({
      date: plan.date,
      time: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
      mealType: plan.mealType,
      name: plan.name,
      portion: 'Porción normal',
      estimatedCarbs: plan.estimatedCarbs || 0,
      note: 'Registrada desde el planificador semanal',
      fromPlanId: plan.id
    });

    this.showToast(`✓ Registrada como consumida en tu diario`);
    this.renderCalendar();
  }

  inspectOrOpenRecipe(recipeId) {
    if (recipeId) {
      this.openRecipeModal(recipeId);
    }
  }

  // ==================== DIARIO ALIMENTARIO (CONSUMIDO) ====================
  setDiaryQuickMeal(type) {
    this.diaryQuickMeal = type;
    document.querySelectorAll('.diary-meal-btn').forEach(btn => {
      btn.className = 'diary-meal-btn px-3 py-1.5 rounded-xl text-xs font-medium bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300';
    });
    const currentBtn = document.getElementById(`diary-quick-${type}`);
    if (currentBtn) {
      currentBtn.className = 'diary-meal-btn px-3 py-1.5 rounded-xl text-xs font-semibold bg-brand-600 text-white';
    }
  }

  diaryGoToday() {
    this.diaryDate = this.formatDateISO(new Date());
    const picker = document.getElementById('diary-date-picker');
    if (picker) picker.value = this.diaryDate;
    this.renderDiaryView();
  }

  navigateDiaryDay(offset) {
    const parts = this.diaryDate.split('-');
    const cur = new Date(parts[0], parts[1] - 1, parts[2]);
    cur.setDate(cur.getDate() + offset);
    this.diaryDate = this.formatDateISO(cur);
    const picker = document.getElementById('diary-date-picker');
    if (picker) picker.value = this.diaryDate;
    this.renderDiaryView();
  }

  onDiaryDateChange(val) {
    if (val) {
      this.diaryDate = val;
      this.renderDiaryView();
    }
  }

  async saveQuickDiaryEntry() {
    const inputName = document.getElementById('diary-input-name');
    const inputPortion = document.getElementById('diary-input-portion');
    const name = inputName.value.trim();

    if (!name) {
      alert('Escribí qué comiste para registrarlo en tu diario.');
      return;
    }

    // Auto-estimación de carbohidratos si coincide con una receta
    let estimatedCarbs = 0;
    const match = this.allRecipes.find(r => r.name.toLowerCase().includes(name.toLowerCase()));
    if (match) {
      estimatedCarbs = match.estimatedCarbsPerServing || 0;
    }

    await db.addFoodLog({
      date: this.diaryDate,
      time: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
      mealType: this.diaryQuickMeal,
      name: name,
      portion: inputPortion.value,
      estimatedCarbs: estimatedCarbs,
      note: ''
    });

    inputName.value = '';
    this.showToast('✓ Comida guardada en tu diario');
    this.renderDiaryView();
  }

  async renderDiaryView() {
    const container = document.getElementById('diary-entries-container');
    const countVal = document.getElementById('diary-count-val');
    const carbsVal = document.getElementById('diary-carbs-val');
    if (!container) return;

    const entries = await db.getFoodLogByDate(this.diaryDate);

    // Actualizar métricas del resumen
    if (countVal) countVal.textContent = entries.length;
    const totalCarbs = entries.reduce((acc, curr) => acc + (curr.estimatedCarbs || 0), 0);
    if (carbsVal) carbsVal.textContent = `~${totalCarbs} g`;

    if (entries.length === 0) {
      container.innerHTML = `
        <div class="p-8 text-center bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 text-stone-400 space-y-1">
          <p class="text-sm font-semibold text-stone-600 dark:text-stone-300">No hay comidas registradas en esta fecha.</p>
          <p class="text-xs">Podés usar el registro rápido de arriba para anotar en menos de 15 segundos.</p>
        </div>
      `;
      return;
    }

    const mealIcons = {
      desayuno: '🌅',
      almuerzo: '☀️',
      merienda: '☕',
      cena: '🌙',
      snack: '🍎'
    };

    container.innerHTML = entries.map(item => `
      <div class="p-3.5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <span class="text-2xl">${mealIcons[item.mealType] || '🍽️'}</span>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-bold text-stone-900 dark:text-white text-sm">${item.name}</span>
              <span class="text-[10px] text-stone-400 font-mono">${item.time || ''}</span>
            </div>
            <div class="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              <span>${this.getCategoryLabel(item.mealType)}</span>
              <span>•</span>
              <span>${item.portion}</span>
              ${item.estimatedCarbs ? `<span>•</span> <span class="text-brand-600 dark:text-brand-400 font-semibold">~${item.estimatedCarbs}g carbos</span>` : ''}
            </div>
          </div>
        </div>

        <button onclick="app.deleteFoodLog('${item.id}')" class="text-stone-300 hover:text-red-500 p-2 text-sm" title="Eliminar registro">
          ✕
        </button>
      </div>
    `).join('');
  }

  async deleteFoodLog(id) {
    await db.deleteFoodLog(id);
    this.renderDiaryView();
    this.showToast('Registro eliminado del diario');
  }

  // ==================== LISTA DE COMPRAS INTELIGENTE Y MODO AHORRO ====================
  async renderShoppingView() {
    const container = document.getElementById('shopping-grouped-container');
    const progText = document.getElementById('shopping-progress-text');
    const progBar = document.getElementById('shopping-progress-bar');
    if (!container) return;

    const items = await db.getShoppingList();

    const total = items.length;
    const completed = items.filter(i => i.completed).length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

    if (progText) progText.textContent = `${completed} de ${total} productos comprados (${pct}%)`;
    if (progBar) progBar.style.width = `${pct}%`;

    // Costos estimados aproximados en pesos argentinos (sin API de pago)
    const estPrices = {
      'Verdulería': 1600,
      'Carnicería': 4800,
      'Lácteos': 2600,
      'Almacén': 1900,
      'Otros': 1500
    };
    const pendingItems = items.filter(i => !i.completed);
    const estimatedCost = pendingItems.reduce((acc, it) => acc + (estPrices[it.category] || 1800), 0);

    const savedBudget = await db.getSetting('weekly_budget', 25000);
    const budgetInput = document.getElementById('weekly-budget-input');
    if (budgetInput && document.activeElement !== budgetInput) {
      budgetInput.value = savedBudget;
    }

    const costEl = document.getElementById('shopping-estimated-cost');
    if (costEl) costEl.textContent = `$${estimatedCost.toLocaleString('es-AR')}`;

    const statusBadge = document.getElementById('budget-status-badge');
    const statusIcon = document.getElementById('budget-status-icon');
    if (statusBadge && statusIcon) {
      if (estimatedCost <= savedBudget) {
        statusBadge.textContent = 'Dentro del presupuesto';
        statusBadge.className = 'font-bold text-emerald-600 dark:text-emerald-400 text-xs';
        statusIcon.textContent = '🟢';
      } else {
        const diff = estimatedCost - savedBudget;
        statusBadge.textContent = `Supera por $${diff.toLocaleString('es-AR')}`;
        statusBadge.className = 'font-bold text-amber-600 dark:text-amber-400 text-xs';
        statusIcon.textContent = '🟡';
      }
    }

    if (items.length === 0) {
      container.innerHTML = `
        <div class="p-8 text-center bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 text-stone-400 space-y-2">
          <span class="text-3xl block">🛒</span>
          <p class="text-sm font-semibold text-stone-600 dark:text-stone-300">Tu lista de compras está vacía.</p>
          <p class="text-xs">Podés tocar "Actualizar del Menú Semanal" para sumar los ingredientes de tus comidas planificadas, o agregar productos manualmente.</p>
        </div>
      `;
      return;
    }

    const categories = ['Verdulería', 'Carnicería', 'Lácteos', 'Almacén', 'Otros'];
    const categoryIcons = {
      'Verdulería': '🥬',
      'Carnicería': '🥩',
      'Lácteos': '🧀',
      'Almacén': '🌾',
      'Otros': '🛒'
    };

    container.innerHTML = categories.map(cat => {
      const catItems = items.filter(i => (i.category || 'Otros') === cat);
      if (catItems.length === 0) return '';

      return `
        <div class="bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 p-4 space-y-2.5">
          <h3 class="font-bold text-stone-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-stone-100 dark:border-stone-700/60">
            <span>${categoryIcons[cat]}</span> <span>${cat}</span>
            <span class="text-[10px] text-stone-400 font-normal">(${catItems.length})</span>
          </h3>

          <div class="space-y-1.5">
            ${catItems.map(item => `
              <div class="flex items-center justify-between p-2 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-750 transition-colors">
                <div class="flex items-center gap-2.5">
                  <input 
                    type="checkbox" 
                    id="shop-${item.id}" 
                    ${item.completed ? 'checked' : ''} 
                    class="accent-brand-600 w-4 h-4 rounded cursor-pointer"
                    onchange="app.toggleShoppingItem('${item.id}')"
                  >
                  <label for="shop-${item.id}" class="text-xs cursor-pointer ${item.completed ? 'line-through opacity-50 text-stone-400' : 'text-stone-800 dark:text-stone-200'}">
                    <span class="font-semibold">${item.amount || ''} ${item.unit || ''}</span>
                    <span>${item.name}</span>
                    ${item.recipeName ? `<span class="text-[10px] text-stone-400 ml-1">(${item.recipeName})</span>` : ''}
                  </label>
                </div>
                <button onclick="app.deleteShoppingItem('${item.id}')" class="text-stone-300 hover:text-red-500 text-xs px-2" title="Eliminar">
                  ✕
                </button>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }).join('');
  }

  async saveWeeklyBudget(val) {
    const num = Math.max(0, parseInt(val, 10) || 0);
    await db.setSetting('weekly_budget', num);
    this.renderShoppingView();
    this.showToast('Presupuesto semanal actualizado');
  }

  async shareShoppingWhatsApp() {
    const items = await db.getShoppingList();
    const pending = items.filter(i => !i.completed);
    if (pending.length === 0) {
      alert('No tenés productos pendientes para comprar en tu lista.');
      return;
    }

    const categories = ['Verdulería', 'Carnicería', 'Lácteos', 'Almacén', 'Otros'];
    let text = '🛒 *DíaSano - Mi Lista de Compras*\n\n';

    categories.forEach(cat => {
      const catItems = pending.filter(i => (i.category || 'Otros') === cat);
      if (catItems.length > 0) {
        text += `*${cat}:*\n`;
        catItems.forEach(i => {
          text += `• ${i.amount ? i.amount + ' ' : ''}${i.unit ? i.unit + ' ' : ''}${i.name}\n`;
        });
        text += '\n';
      }
    });

    text += '_Organizado con DíaSano · Alimentación y Bienestar_';
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  }

  async copyShoppingList() {
    const items = await db.getShoppingList();
    const pending = items.filter(i => !i.completed);
    if (pending.length === 0) {
      alert('No tenés productos pendientes en tu lista.');
      return;
    }

    const categories = ['Verdulería', 'Carnicería', 'Lácteos', 'Almacén', 'Otros'];
    let text = '🛒 DíaSano - Mi Lista de Compras\n\n';

    categories.forEach(cat => {
      const catItems = pending.filter(i => (i.category || 'Otros') === cat);
      if (catItems.length > 0) {
        text += `[${cat}]\n`;
        catItems.forEach(i => {
          text += `• ${i.amount ? i.amount + ' ' : ''}${i.unit ? i.unit + ' ' : ''}${i.name}\n`;
        });
        text += '\n';
      }
    });

    try {
      await navigator.clipboard.writeText(text);
      this.showToast('¡Lista copiada al portapapeles!');
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      this.showToast('¡Lista copiada al portapapeles!');
    }
  }

  async generateBudgetWeeklyPlan() {
    if (!confirm('¿Querés armar un menú semanal económico para los próximos 7 días con comidas accesibles que reutilizan ingredientes?')) {
      return;
    }

    // Filtrar recetas económicas
    const budgetRecipes = this.allRecipes.filter(r => 
      r.costLevel === 'Económico' || 
      (r.tags && (r.tags.includes('economica') || r.tags.includes('economico') || r.tags.includes('ahorro')))
    );

    const pool = budgetRecipes.length > 0 ? budgetRecipes : this.allRecipes;
    const lunchPool = pool.filter(r => r.category === 'almuerzo');
    const dinnerPool = pool.filter(r => r.category === 'cena');

    const startDate = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const dateISO = this.formatDateISO(d);

      const lunch = lunchPool[i % lunchPool.length] || pool[i % pool.length];
      const dinner = dinnerPool[(i + 2) % dinnerPool.length] || pool[(i + 3) % pool.length];

      if (lunch) {
        await db.addMealPlan({
          date: dateISO,
          mealType: 'almuerzo',
          name: lunch.name,
          recipeId: lunch.id,
          estimatedCarbs: lunch.estimatedCarbsPerServing || 0,
          image: lunch.image || ''
        });
      }

      if (dinner) {
        await db.addMealPlan({
          date: dateISO,
          mealType: 'cena',
          name: dinner.name,
          recipeId: dinner.id,
          estimatedCarbs: dinner.estimatedCarbsPerServing || 0,
          image: dinner.image || ''
        });
      }
    }

    await this.generateShoppingFromWeek();
    this.renderShoppingView();
    this.showToast('¡Menú semanal de bajo costo generado y lista actualizada!');
  }

  async toggleShoppingItem(id) {
    await db.toggleShoppingItem(id);
    this.renderShoppingView();
  }

  async deleteShoppingItem(id) {
    await db.deleteShoppingItem(id);
    this.renderShoppingView();
  }

  async clearCompletedShopping() {
    await db.clearCompletedShoppingItems();
    this.renderShoppingView();
    this.showToast('Comprados eliminados');
  }

  openAddShoppingModal() {
    document.getElementById('shop-input-name').value = '';
    document.getElementById('shop-input-amount').value = '';
    document.getElementById('add-shopping-modal').classList.remove('hidden');
  }

  closeAddShoppingModal() {
    document.getElementById('add-shopping-modal').classList.add('hidden');
  }

  async confirmAddShoppingModal() {
    const name = document.getElementById('shop-input-name').value.trim();
    const amount = document.getElementById('shop-input-amount').value.trim();
    const category = document.getElementById('shop-input-category').value;

    if (!name) {
      alert('Escribí el nombre del producto.');
      return;
    }

    await db.addShoppingItem({
      name,
      amount,
      unit: '',
      category,
      completed: false,
      source: 'manual'
    });

    this.closeAddShoppingModal();
    this.showToast('Producto agregado a la lista');
    if (this.activeView === 'shopping') {
      this.renderShoppingView();
    }
  }

  // ==================== LISTA DE COMPRAS AUTOMÁTICA INTELIGENTE ====================
  isItemInPantry(ingredientName, pantryItems) {
    if (!ingredientName || !pantryItems || pantryItems.length === 0) return false;
    const clean = ingredientName.toLowerCase().trim()
      .replace(/^(un|una|el|la|los|las|de|del)\s+/, '')
      .replace(/(s|es)$/, '');
    
    return pantryItems.some(p => {
      const pClean = (p.name || '').toLowerCase().trim()
        .replace(/^(un|una|el|la|los|las|de|del)\s+/, '')
        .replace(/(s|es)$/, '');
      return pClean.includes(clean) || clean.includes(pClean);
    });
  }

  async generateShoppingFromWeek() {
    await this.autoGenerateShoppingFromWeek(true);
  }

  async autoGenerateShoppingFromWeek(checkPantry = true) {
    const weekDays = this.getWeekDays(this.calendarDate);
    const allPlans = await db.getAllMealPlans();
    const weekPlans = allPlans.filter(p => weekDays.some(d => this.formatDateISO(d) === p.date));

    if (weekPlans.length === 0) {
      alert('No tenés comidas planificadas en esta semana para generar compras. Planificá algunas comidas primero en el calendario o tocá "Quiero gastar lo menos posible esta semana".');
      return;
    }

    const pantryItems = checkPantry ? await db.getPantryItems() : [];
    let addedCount = 0;
    let inPantryCount = 0;

    for (const plan of weekPlans) {
      if (plan.recipeId) {
        const recipe = this.allRecipes.find(r => r.id === plan.recipeId);
        if (recipe && recipe.ingredients) {
          for (const ing of recipe.ingredients) {
            const alreadyInPantry = this.isItemInPantry(ing.name, pantryItems);
            if (alreadyInPantry) {
              inPantryCount++;
              continue; // Ya está disponible en despensa, no genera gasto duplicado
            }

            const category = this.guessIngredientCategory(ing.name);
            await db.addShoppingItem({
              name: ing.name,
              amount: ing.amount,
              unit: ing.unit || '',
              category,
              completed: false,
              source: 'plan',
              recipeName: recipe.name
            });
            addedCount++;
          }
        }
      }
    }

    if (this.activeView !== 'shopping') {
      this.navigate('shopping');
    } else {
      this.renderShoppingView();
    }

    if (inPantryCount > 0) {
      this.showToast(`✓ ${addedCount} ingredientes sumados (${inPantryCount} ya estaban en tu despensa)`);
    } else {
      this.showToast(`✓ Se agregaron ${addedCount} ingredientes a tu lista de compras`);
    }
  }

  async addCurrentRecipeToShoppingList() {
    if (!this.activeRecipe || !this.activeRecipe.ingredients) return;

    const baseServings = this.activeRecipe.defaultServings || 2;
    const ratio = this.modalServings / baseServings;
    const pantryItems = await db.getPantryItems();

    let addedCount = 0;
    let pantryMatchCount = 0;

    for (let idx = 0; idx < this.activeRecipe.ingredients.length; idx++) {
      const ing = this.activeRecipe.ingredients[idx];
      let ingName = ing.name;
      if (this.appliedSubstitutions[idx]) {
        ingName = this.appliedSubstitutions[idx].substitute;
      }

      let scaledAmount = ing.amount;
      if (typeof ing.amount === 'number') {
        const calculated = ing.amount * ratio;
        scaledAmount = calculated < 10 && calculated % 1 !== 0 ? calculated.toFixed(1) : Math.round(calculated);
      }

      const inPantry = this.isItemInPantry(ingName, pantryItems);
      if (inPantry && !this.missingIngredientIndices.has(idx)) {
        pantryMatchCount++;
        continue;
      }

      const category = this.guessIngredientCategory(ingName);
      await db.addShoppingItem({
        name: ingName,
        amount: scaledAmount,
        unit: ing.unit || '',
        category,
        completed: false,
        source: 'receta',
        recipeName: this.activeRecipe.name
      });
      addedCount++;
    }

    if (addedCount === 0 && pantryMatchCount > 0) {
      this.showToast(`¡Ya tenés todos los ingredientes de "${this.activeRecipe.name}" en tu despensa!`);
    } else {
      this.showToast(`✓ ${addedCount} ingredientes de "${this.activeRecipe.name}" añadidos a compras`);
    }
  }

  async addRunningOutPantryToShopping() {
    const pantryItems = await db.getPantryItems();
    const runningOut = pantryItems.filter(i => i.isRunningOut);

    if (runningOut.length === 0) {
      alert('No tenés alimentos marcados como "Está por acabarse" en tu heladera o despensa.\n\nPodés marcar cualquier ingrediente en la sección "Mi Despensa" para reponerlo rápido.');
      return;
    }

    let addedCount = 0;
    for (const item of runningOut) {
      const category = this.guessIngredientCategory(item.name);
      await db.addShoppingItem({
        name: item.name,
        amount: item.amount || '1',
        unit: item.unit || '',
        category,
        completed: false,
        source: 'despensa_reposicion'
      });
      addedCount++;
    }

    this.renderShoppingView();
    this.showToast(`✓ ${addedCount} productos por reponer sumados a compras`);
  }

  openSelectRecipeForShoppingModal() {
    const modal = document.getElementById('select-recipe-shopping-modal');
    if (!modal) return;
    const searchInput = document.getElementById('select-recipe-shopping-search');
    if (searchInput) searchInput.value = '';
    this.filterSelectRecipeShoppingList();
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  closeSelectRecipeShoppingModal() {
    const modal = document.getElementById('select-recipe-shopping-modal');
    if (modal) modal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  filterSelectRecipeShoppingList() {
    const container = document.getElementById('select-recipe-shopping-list');
    const searchVal = (document.getElementById('select-recipe-shopping-search')?.value || '').toLowerCase().trim();
    if (!container) return;

    let recipes = this.allRecipes;
    if (searchVal) {
      recipes = recipes.filter(r => 
        (r.name || '').toLowerCase().includes(searchVal) ||
        (r.ingredients && r.ingredients.some(i => (i.name || '').toLowerCase().includes(searchVal)))
      );
    }

    if (recipes.length === 0) {
      container.innerHTML = '<p class="text-stone-400 text-xs text-center py-4">No se encontraron recetas con ese término.</p>';
      return;
    }

    container.innerHTML = recipes.slice(0, 30).map(r => `
      <div class="p-3 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 flex items-center justify-between gap-3">
        <div class="flex items-center gap-2.5 min-w-0">
          <img src="${r.image}" alt="${r.name}" class="w-10 h-10 rounded-xl object-cover flex-shrink-0 bg-stone-200" loading="lazy">
          <div class="min-w-0">
            <h4 class="font-bold text-stone-900 dark:text-white text-xs truncate">${r.name}</h4>
            <p class="text-[10px] text-stone-500 dark:text-stone-400">${r.ingredients ? r.ingredients.length : 0} ingredientes · ${this.getCategoryLabel(r.category)}</p>
          </div>
        </div>
        <button onclick="app.addSpecificRecipeToShopping('${r.id}')" class="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs flex-shrink-0 shadow-sm transition-colors flex items-center gap-1">
          <span>+</span> <span>Añadir</span>
        </button>
      </div>
    `).join('');
  }

  async addSpecificRecipeToShopping(recipeId) {
    const recipe = this.allRecipes.find(r => r.id === recipeId);
    if (!recipe || !recipe.ingredients) return;

    const pantryItems = await db.getPantryItems();
    let addedCount = 0;
    let inPantryCount = 0;

    for (const ing of recipe.ingredients) {
      const inPantry = this.isItemInPantry(ing.name, pantryItems);
      if (inPantry) {
        inPantryCount++;
        continue;
      }

      const category = this.guessIngredientCategory(ing.name);
      await db.addShoppingItem({
        name: ing.name,
        amount: ing.amount,
        unit: ing.unit || '',
        category,
        completed: false,
        source: 'receta',
        recipeName: recipe.name
      });
      addedCount++;
    }

    this.closeSelectRecipeShoppingModal();
    this.renderShoppingView();
    if (inPantryCount > 0) {
      this.showToast(`✓ ${addedCount} ingredientes de "${recipe.name}" agregados (${inPantryCount} ya en despensa)`);
    } else {
      this.showToast(`✓ ${addedCount} ingredientes de "${recipe.name}" agregados a la lista`);
    }
  }

  guessIngredientCategory(name) {
    const n = name.toLowerCase();
    if (n.includes('papa') || n.includes('cebolla') || n.includes('zapallito') || n.includes('tomate') || n.includes('calabaza') || n.includes('zanahoria') || n.includes('acelga') || n.includes('espinaca') || n.includes('banana') || n.includes('manzana') || n.includes('limón') || n.includes('ajo') || n.includes('perejil') || n.includes('brócoli')) {
      return 'Verdulería';
    }
    if (n.includes('pollo') || n.includes('carne') || n.includes('bife') || n.includes('jamón') || n.includes('paleta') || n.includes('atún')) {
      return 'Carnicería';
    }
    if (n.includes('queso') || n.includes('leche') || n.includes('huevo') || n.includes('ricota') || n.includes('yogur')) {
      return 'Lácteos';
    }
    if (n.includes('fideo') || n.includes('arroz') || n.includes('lenteja') || n.includes('avena') || n.includes('harina') || n.includes('pan') || n.includes('aceite') || n.includes('polenta') || n.includes('puré de tomate')) {
      return 'Almacén';
    }
    return 'Otros';
  }

  // ==================== BIBLIOTECA DE RECETAS ====================
  updateRecipeCountBadge() {
    const badge = document.getElementById('recipe-count-badge');
    if (badge) {
      badge.textContent = `${this.allRecipes.length} recetas disponibles`;
    }
  }

  setLibraryCategory(cat) {
    this.libraryCategory = cat;
    document.querySelectorAll('.cat-filter-btn').forEach(btn => {
      const bCat = btn.getAttribute('data-cat');
      if (bCat === cat) {
        if (cat === 'custom') {
          btn.className = 'cat-filter-btn px-3 py-1.5 rounded-xl font-semibold bg-purple-600 text-white';
        } else {
          btn.className = 'cat-filter-btn px-3 py-1.5 rounded-xl font-semibold bg-brand-600 text-white';
        }
      } else {
        if (bCat === 'custom') {
          btn.className = 'cat-filter-btn px-3 py-1.5 rounded-xl font-medium bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300';
        } else {
          btn.className = 'cat-filter-btn px-3 py-1.5 rounded-xl font-medium bg-stone-100 text-stone-700 dark:bg-stone-700 dark:text-stone-300';
        }
      }
    });
    this.filterRecipes();
  }

  toggleTagFilter(tag) {
    const btn = document.getElementById(`tag-${tag}`);
    if (this.activeTags.has(tag)) {
      this.activeTags.delete(tag);
      if (btn) btn.className = 'px-2.5 py-1 rounded-lg border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-700';
    } else {
      this.activeTags.add(tag);
      if (btn) btn.className = 'px-2.5 py-1 rounded-lg border border-brand-500 bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 font-semibold';
    }
    this.filterRecipes();
  }

  filterRecipes() {
    const searchVal = (document.getElementById('recipe-search-input')?.value || '').toLowerCase().trim();
    
    let filtered = this.allRecipes.filter(r => {
      if (this.libraryCategory !== 'all') {
        if (this.libraryCategory === 'custom') {
          if (!r.isCustom) return false;
        } else if (r.category !== this.libraryCategory) {
          return false;
        }
      }

      for (const tag of this.activeTags) {
        if (!r.tags || !r.tags.includes(tag)) {
          return false;
        }
      }

      if (searchVal) {
        const matchName = (r.name || '').toLowerCase().includes(searchVal);
        const matchIng = r.ingredients && r.ingredients.some(i => (i.name || '').toLowerCase().includes(searchVal));
        if (!matchName && !matchIng) return false;
      }

      return true;
    });

    this.renderRecipeCards(filtered, 'recipes-grid');
  }

  renderLibraryGrid() {
    this.filterRecipes();
  }

  async renderRecipeCards(recipes, targetContainerId) {
    const container = document.getElementById(targetContainerId);
    if (!container) return;

    if (!recipes || recipes.length === 0) {
      container.innerHTML = `
        <div class="col-span-full p-8 text-center bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 text-stone-400">
          <p class="text-base font-semibold text-stone-600 dark:text-stone-300">No encontramos recetas con esos criterios.</p>
          <p class="text-xs mt-1">Probá cambiando los filtros o buscando otro ingrediente.</p>
        </div>
      `;
      return;
    }

    const favs = await db.getAllFavorites();
    const favIds = new Set(favs.map(f => f.id));

    container.innerHTML = recipes.map(r => {
      const isFav = favIds.has(r.id);
      const totalTime = r.timePrep + r.timeCook;
      return `
        <div class="bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700/80 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
          <div>
            <div class="relative h-40 bg-stone-200 dark:bg-stone-700 overflow-hidden cursor-pointer" onclick="app.openRecipeModal('${r.id}')">
              <img src="${r.image}" alt="${r.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy">
              <span class="absolute top-2.5 left-2.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-white/90 dark:bg-stone-900/90 text-brand-700 dark:text-brand-300 rounded-lg">
                ${this.getCategoryLabel(r.category)}
              </span>
              ${r.isCustom ? '<span class="absolute bottom-2.5 left-2.5 text-[9px] font-bold px-2 py-0.5 bg-purple-600 text-white rounded-lg shadow-sm">⭐ Mi Receta</span>' : ''}
              <button 
                onclick="event.stopPropagation(); app.toggleFavoriteCard('${r.id}')"
                class="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 dark:bg-stone-900/90 text-stone-700 dark:text-stone-200 flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
                title="Favorito"
              >
                <span>${isFav ? '❤️' : '🤍'}</span>
              </button>
            </div>

            <div class="p-4 space-y-2 cursor-pointer" onclick="app.openRecipeModal('${r.id}')">
              <div class="flex items-center gap-1.5 flex-wrap text-[11px] text-stone-500 dark:text-stone-400">
                <span>⏱️ ${totalTime}m</span>
                <span>•</span>
                <span>${r.difficulty}</span>
                <span>•</span>
                <span class="text-brand-600 dark:text-brand-400 font-semibold">~${r.estimatedCarbsPerServing}g carbos</span>
              </div>
              <h3 class="font-bold text-stone-900 dark:text-white text-sm leading-snug line-clamp-2">
                ${r.name}
              </h3>
            </div>
          </div>

          <div class="px-4 pb-4 pt-1 flex items-center justify-between border-t border-stone-100 dark:border-stone-700/60 text-xs">
            <span class="text-stone-400">${r.costLevel}</span>
            <div class="flex items-center gap-2">
              <button onclick="app.openPlanModal(null, '${r.category}', '${r.id}')" class="text-stone-500 hover:text-brand-600 text-xs flex items-center gap-1" title="Planificar">
                📅
              </button>
              <button onclick="app.openRecipeModal('${r.id}')" class="text-brand-600 dark:text-brand-400 font-semibold hover:underline">
                Ver receta →
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // ==================== MODAL DE RECETA Y PORCIONES ====================
  async openRecipeModal(recipeId) {
    const recipe = this.allRecipes.find(r => r.id === recipeId) || await db.getRecipeById(recipeId);
    if (!recipe) return;

    this.activeRecipe = recipe;
    this.modalServings = recipe.defaultServings || 2;
    this.missingIngredientIndices.clear();
    this.appliedSubstitutions = {};

    await db.recordRecipeHistory(recipe);

    document.getElementById('modal-image').src = recipe.image;
    document.getElementById('modal-title').textContent = recipe.name;
    document.getElementById('modal-category').textContent = this.getCategoryLabel(recipe.category);
    document.getElementById('modal-time').textContent = `⏱️ ${recipe.timePrep + recipe.timeCook} min total (${recipe.timePrep}m prep / ${recipe.timeCook}m cocción)`;
    document.getElementById('modal-difficulty').textContent = recipe.difficulty;
    document.getElementById('modal-cost').textContent = `💰 ${recipe.costLevel}`;

    this.updateServingsUI();
    this.renderModalIngredientsAndNutrition();
    this.renderModalInstructions();
    this.renderModalSubstitutions();
    await this.updateModalFavoriteButton();

    const customActions = document.getElementById('custom-recipe-modal-actions');
    if (customActions) {
      if (recipe.isCustom) {
        customActions.classList.remove('hidden');
      } else {
        customActions.classList.add('hidden');
      }
    }

    const modal = document.getElementById('recipe-modal');
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  closeRecipeModal() {
    const modal = document.getElementById('recipe-modal');
    modal.classList.add('hidden');
    document.body.style.overflow = '';
    this.activeRecipe = null;
  }

  setModalServings(n) {
    this.modalServings = Number(n);
    const customInput = document.getElementById('custom-servings-input');
    if (customInput) customInput.value = '';
    this.updateServingsUI();
    this.renderModalIngredientsAndNutrition();
  }

  setCustomServings(val) {
    const n = parseInt(val, 10);
    if (n && n > 0 && n <= 50) {
      this.modalServings = n;
      this.updateServingsUI();
      this.renderModalIngredientsAndNutrition();
    }
  }

  updateServingsUI() {
    [1, 2, 4].forEach(s => {
      const btn = document.getElementById(`btn-serv-${s}`);
      if (btn) {
        if (this.modalServings === s) {
          btn.className = 'serv-btn flex-1 py-1.5 rounded-xl text-xs font-semibold bg-brand-600 text-white border border-brand-600';
        } else {
          btn.className = 'serv-btn flex-1 py-1.5 rounded-xl text-xs font-semibold border border-stone-200 dark:border-stone-700 hover:border-brand-500';
        }
      }
    });

    const badge = document.getElementById('modal-servings-badge');
    if (badge) {
      badge.textContent = `para ${this.modalServings} ${this.modalServings === 1 ? 'porción' : 'porciones'}`;
    }
  }

  parseCarbDelta(carbImpactStr) {
    if (!carbImpactStr) return 0;
    const match = carbImpactStr.match(/([+-]\d+)\s*g/i);
    if (match) {
      return parseInt(match[1], 10);
    }
    return 0;
  }

  findSubstitutionForIngredient(ingName, substitutions) {
    if (!substitutions || substitutions.length === 0 || !ingName) return null;
    const clean = str => str.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[(),]/g, ' ')
      .trim();

    const ingClean = clean(ingName);

    for (const sub of substitutions) {
      const subClean = clean(sub.original);
      if (ingClean.includes(subClean) || subClean.includes(ingClean)) {
        return sub;
      }
    }

    const ingWords = ingClean.split(/\s+/).filter(w => w.length >= 4);
    for (const sub of substitutions) {
      const subClean = clean(sub.original);
      const subWords = subClean.split(/\s+/).filter(w => w.length >= 4);
      for (const iw of ingWords) {
        if (subWords.some(sw => sw.includes(iw) || iw.includes(sw))) {
          return sub;
        }
      }
    }

    return null;
  }

  toggleMissingIngredient(idx, isChecked) {
    if (isChecked) {
      this.missingIngredientIndices.add(idx);
    } else {
      this.missingIngredientIndices.delete(idx);
      delete this.appliedSubstitutions[idx];
    }
    this.renderModalIngredientsAndNutrition();
    this.renderModalSubstitutions();
  }

  applyIngredientSubstitution(idx) {
    if (!this.activeRecipe || !this.activeRecipe.ingredients[idx]) return;
    const ing = this.activeRecipe.ingredients[idx];
    const sub = this.findSubstitutionForIngredient(ing.name, this.activeRecipe.substitutions);
    if (!sub) return;

    const delta = this.parseCarbDelta(sub.carbImpact);
    this.appliedSubstitutions[idx] = {
      original: sub.original,
      substitute: sub.substitute,
      note: sub.note,
      carbDelta: delta
    };
    this.missingIngredientIndices.add(idx);

    this.renderModalIngredientsAndNutrition();
    this.renderModalSubstitutions();
    this.showToast(`Sustitución aplicada para ${sub.original}`);
  }

  revertIngredientSubstitution(idx) {
    delete this.appliedSubstitutions[idx];
    this.renderModalIngredientsAndNutrition();
    this.renderModalSubstitutions();
    this.showToast('Reemplazo revertido');
  }

  renderModalIngredientsAndNutrition() {
    if (!this.activeRecipe) return;

    const baseServings = this.activeRecipe.defaultServings || 2;
    const ratio = this.modalServings / baseServings;

    const baseEstimatedCarbs = Math.round(this.activeRecipe.estimatedCarbsPerServing);
    const estimatedCals = Math.round(this.activeRecipe.estimatedCaloriesPerServing);

    // Sumar impacto de sustituciones aplicadas
    let totalCarbDelta = 0;
    for (const k in this.appliedSubstitutions) {
      totalCarbDelta += this.appliedSubstitutions[k].carbDelta || 0;
    }
    const finalCarbs = Math.max(0, baseEstimatedCarbs + totalCarbDelta);

    const carbsValEl = document.getElementById('modal-carbs-val');
    if (totalCarbDelta !== 0) {
      carbsValEl.innerHTML = `${finalCarbs} g <span class="text-[10px] font-normal text-amber-600 dark:text-amber-400 block">(${totalCarbDelta > 0 ? '+' : ''}${totalCarbDelta}g por sustitución)</span>`;
    } else {
      carbsValEl.textContent = `${baseEstimatedCarbs} g`;
    }

    document.getElementById('modal-cals-val').textContent = `${estimatedCals} kcal`;

    const list = document.getElementById('modal-ingredients-list');
    list.innerHTML = this.activeRecipe.ingredients.map((ing, idx) => {
      let scaledAmount = ing.amount;
      if (typeof ing.amount === 'number') {
        const calculated = ing.amount * ratio;
        scaledAmount = calculated < 10 && calculated % 1 !== 0 ? calculated.toFixed(1) : Math.round(calculated);
      }

      const isMissing = this.missingIngredientIndices.has(idx);
      const applied = this.appliedSubstitutions[idx];
      const sub = this.findSubstitutionForIngredient(ing.name, this.activeRecipe.substitutions);

      return `
        <li class="p-3 rounded-2xl border transition-all ${isMissing ? 'bg-amber-50/90 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 shadow-sm' : 'bg-stone-50/60 dark:bg-stone-900/40 border-stone-100 dark:border-stone-700/60'}">
          <div class="flex items-start justify-between gap-2">
            <div class="flex items-start gap-2.5 flex-1 min-w-0">
              <input 
                type="checkbox" 
                id="ing-missing-${idx}" 
                ${isMissing ? 'checked' : ''} 
                class="mt-1 w-4 h-4 accent-amber-600 dark:accent-amber-500 rounded cursor-pointer flex-shrink-0"
                onchange="app.toggleMissingIngredient(${idx}, this.checked)"
              >
              <label for="ing-missing-${idx}" class="cursor-pointer text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-snug">
                <span class="font-bold text-stone-900 dark:text-white">${scaledAmount} ${ing.unit !== 'al gusto' ? ing.unit : ''}</span>
                ${applied ? `
                  <span class="line-through text-stone-400">${ing.name}</span>
                  <span class="font-bold text-emerald-700 dark:text-emerald-300 ml-1">→ ${applied.substitute}</span>
                ` : `
                  <span>${ing.name}</span>
                `}
                ${ing.optional ? '<span class="text-[11px] text-stone-400 italic">(opcional)</span>' : ''}
              </label>
            </div>

            <!-- Indicador de estado -->
            <div class="flex-shrink-0">
              ${isMissing ? `
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 dark:bg-amber-900/80 dark:text-amber-200 flex items-center gap-1">
                  <span>⚠️</span> <span>Me falta</span>
                </span>
              ` : `
                <span class="text-[10px] text-stone-400 font-medium px-2 py-0.5 rounded hover:bg-stone-200 dark:hover:bg-stone-700 cursor-pointer" onclick="document.getElementById('ing-missing-${idx}').click()">
                  ¿Te falta?
                </span>
              `}
            </div>
          </div>

          <!-- Si está marcado que falta y hay sustituto disponible -->
          ${isMissing && sub && !applied ? `
            <div class="mt-2.5 pt-2 border-t border-amber-200/80 dark:border-amber-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div class="text-amber-950 dark:text-amber-200 text-[11px]">
                <span class="font-semibold">💡 Alternativa sugerida:</span> <strong class="text-emerald-700 dark:text-emerald-300">${sub.substitute}</strong>
                ${sub.carbImpact ? `<span class="text-stone-500 text-[10px] block sm:inline ml-1">(${sub.carbImpact})</span>` : ''}
              </div>
              <button onclick="app.applyIngredientSubstitution(${idx})" class="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold shadow-sm transition-all flex items-center justify-center gap-1 self-start sm:self-auto">
                <span>✓ Usar este sustituto</span>
              </button>
            </div>
          ` : ''}

          ${applied ? `
            <div class="mt-2.5 pt-2 border-t border-emerald-200 dark:border-emerald-800 text-[11px] flex items-center justify-between">
              <span class="text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-1">
                <span>✓</span> <span>Sustitución activa: ${applied.substitute}</span>
              </span>
              <button onclick="app.revertIngredientSubstitution(${idx})" class="text-stone-400 hover:text-red-500 underline text-[10px]">
                Deshacer reemplazo
              </button>
            </div>
          ` : ''}
        </li>
      `;
    }).join('');
  }

  renderModalInstructions() {
    if (!this.activeRecipe) return;
    const container = document.getElementById('modal-instructions-list');
    container.innerHTML = this.activeRecipe.instructions.map((step, idx) => `
      <div class="flex items-start gap-3 p-3 rounded-xl bg-stone-50 dark:bg-stone-900/40 border border-stone-100 dark:border-stone-700/60">
        <input type="checkbox" id="step-${idx}" class="step-checkbox mt-1 accent-brand-600 rounded">
        <label for="step-${idx}" class="cursor-pointer text-stone-700 dark:text-stone-300 text-xs sm:text-sm leading-relaxed">
          <span class="font-bold text-brand-600 dark:text-brand-400 block mb-0.5">Paso ${idx + 1}</span>
          ${step}
        </label>
      </div>
    `).join('');
  }

  renderModalSubstitutions() {
    if (!this.activeRecipe) return;
    const card = document.getElementById('modal-substitutions-card');
    const container = document.getElementById('modal-substitutions-list');
    
    if (!card || !container) return;

    const allSubs = this.activeRecipe.substitutions || [];
    if (allSubs.length === 0) {
      card.classList.add('hidden');
      return;
    }

    card.classList.remove('hidden');

    const hasMissing = this.missingIngredientIndices.size > 0;

    if (hasMissing) {
      // Filtrar y destacar sustituciones para los ingredientes marcados
      const missingIndices = Array.from(this.missingIngredientIndices);
      
      const itemsHtml = missingIndices.map(mIdx => {
        const ing = this.activeRecipe.ingredients[mIdx];
        if (!ing) return '';
        const sub = this.findSubstitutionForIngredient(ing.name, allSubs);
        const isApplied = this.appliedSubstitutions[mIdx] !== undefined;

        if (sub) {
          return `
            <div class="p-3 rounded-2xl bg-white dark:bg-stone-850 border ${isApplied ? 'border-emerald-500 shadow-sm' : 'border-amber-200 dark:border-amber-900/60'} text-xs space-y-2">
              <div class="flex items-start justify-between gap-2">
                <div>
                  <div class="font-bold text-stone-900 dark:text-white text-xs sm:text-sm">
                    Para <span class="line-through text-stone-400">${ing.name}</span> → Podés usar <strong class="text-emerald-700 dark:text-emerald-300">${sub.substitute}</strong>
                  </div>
                  <p class="text-stone-600 dark:text-stone-300 mt-0.5 text-[11px] leading-relaxed">${sub.note}</p>
                  ${sub.carbImpact ? `<span class="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 font-mono">Impacto en carbohidratos: ${sub.carbImpact}</span>` : ''}
                </div>

                <div class="flex-shrink-0">
                  ${isApplied ? `
                    <button onclick="app.revertIngredientSubstitution(${mIdx})" class="px-2.5 py-1.5 rounded-xl border border-emerald-500 text-emerald-700 dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-950/40">
                      ✓ Aplicado (Deshacer)
                    </button>
                  ` : `
                    <button onclick="app.applyIngredientSubstitution(${mIdx})" class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1">
                      <span>✓</span> <span>Aplicar reemplazo</span>
                    </button>
                  `}
                </div>
              </div>
            </div>
          `;
        } else {
          return `
            <div class="p-3 rounded-2xl bg-white/90 dark:bg-stone-850 border border-stone-200 dark:border-stone-700 text-xs space-y-1">
              <span class="font-bold text-stone-900 dark:text-white">Para: ${ing.name}</span>
              <p class="text-stone-500 text-[11px]">Podés omitirlo o usar un condimento/ingrediente similar que tengas a mano sin alterar la preparación principal.</p>
            </div>
          `;
        }
      }).join('');

      container.innerHTML = `
        <div class="space-y-2.5">
          <div class="p-2.5 rounded-xl bg-amber-100/80 dark:bg-amber-950/60 text-amber-950 dark:text-amber-200 text-xs font-semibold flex items-center gap-2">
            <span>🎯</span>
            <span>Alternativas para los ingredientes que marcaste que te faltan:</span>
          </div>
          ${itemsHtml}
        </div>
      `;
    } else {
      // Modo informativo: todas las sustituciones disponibles con botón de uso
      container.innerHTML = `
        <div class="space-y-2">
          <p class="text-[11px] text-emerald-800 dark:text-emerald-300 mb-2">
            💡 <strong>Consejo:</strong> Marcá arriba la casilla de cualquier ingrediente que no tengas para ver y aplicar su reemplazo al instante.
          </p>
          ${allSubs.map(sub => {
            const matchingIngIdx = this.activeRecipe.ingredients.findIndex(ing => this.findSubstitutionForIngredient(ing.name, [sub]));
            const isApplied = matchingIngIdx !== -1 && this.appliedSubstitutions[matchingIngIdx] !== undefined;

            return `
              <div class="p-3 rounded-xl bg-white/80 dark:bg-stone-900/60 border ${isApplied ? 'border-emerald-500 shadow-sm' : 'border-emerald-100 dark:border-emerald-900/40'} text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div class="space-y-0.5">
                  <div class="font-medium text-stone-900 dark:text-white">
                    Si te falta <span class="line-through text-stone-400">${sub.original}</span> → Podés usar <strong class="text-emerald-700 dark:text-emerald-300">${sub.substitute}</strong>
                  </div>
                  <p class="text-stone-600 dark:text-stone-400 text-[11px]">${sub.note}</p>
                  ${sub.carbImpact ? `<span class="inline-block text-[10px] px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-mono">Impacto carbohidratos: ${sub.carbImpact}</span>` : ''}
                </div>

                ${matchingIngIdx !== -1 ? `
                  <div class="flex-shrink-0 self-start sm:self-auto">
                    ${isApplied ? `
                      <button onclick="app.revertIngredientSubstitution(${matchingIngIdx})" class="px-2.5 py-1 rounded-lg border border-emerald-500 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold">
                        ✓ Aplicado
                      </button>
                    ` : `
                      <button onclick="app.applyIngredientSubstitution(${matchingIngIdx})" class="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold">
                        Usar sustituto
                      </button>
                    `}
                  </div>
                ` : ''}
              </div>
            `;
          }).join('')}
        </div>
      `;
    }
  }

  async updateModalFavoriteButton() {
    if (!this.activeRecipe) return;
    const isFav = await db.isFavorite(this.activeRecipe.id);
    const icon = document.getElementById('modal-fav-icon');
    const text = document.getElementById('modal-fav-text');
    if (icon && text) {
      icon.textContent = isFav ? '❤️' : '🤍';
      text.textContent = isFav ? 'En tus favoritos' : 'Guardar en favoritos';
    }
  }

  async toggleModalFavorite() {
    if (!this.activeRecipe) return;
    const res = await db.toggleFavorite(this.activeRecipe);
    await this.updateModalFavoriteButton();
    this.showToast(res.isFavorite ? '¡Guardada en favoritos!' : 'Eliminada de favoritos');
    if (this.currentProposal && this.currentProposal.id === this.activeRecipe.id) {
      await this.renderProposalCard(this.currentProposal);
    }
  }

  // ==================== RECETAS CASERAS DEL USUARIO (SECCIÓN 13) ====================
  editCurrentCustomRecipe() {
    if (!this.activeRecipe || !this.activeRecipe.isCustom) return;
    const id = this.activeRecipe.id;
    this.closeRecipeModal();
    this.openCustomRecipeModal(id);
  }

  async deleteCurrentCustomRecipe() {
    if (!this.activeRecipe || !this.activeRecipe.isCustom) return;
    if (confirm(`¿Querés eliminar tu receta casera "${this.activeRecipe.name}"?`)) {
      const id = this.activeRecipe.id;
      await db.deleteCustomRecipe(id);
      this.allRecipes = await db.getAllRecipes();
      this.updateRecipeCountBadge();
      this.closeRecipeModal();
      this.filterRecipes();
      this.showToast('Receta casera eliminada');
    }
  }

  openCustomRecipeModal(recipeId = null) {
    const modal = document.getElementById('custom-recipe-modal');
    if (!modal) return;

    const inputId = document.getElementById('custom-recipe-id');
    const titleEl = document.getElementById('custom-recipe-modal-title');
    const inputName = document.getElementById('custom-recipe-name');
    const selectCat = document.getElementById('custom-recipe-category');
    const selectDiff = document.getElementById('custom-recipe-difficulty');
    const selectCost = document.getElementById('custom-recipe-cost');
    const inputServ = document.getElementById('custom-recipe-servings');
    const inputPrep = document.getElementById('custom-recipe-time-prep');
    const inputCook = document.getElementById('custom-recipe-time-cook');
    const inputCarbs = document.getElementById('custom-recipe-carbs');
    const inputCals = document.getElementById('custom-recipe-cals');
    const inputNotes = document.getElementById('custom-recipe-notes');
    const inputTags = document.getElementById('custom-recipe-tags');
    const ingsList = document.getElementById('custom-recipe-ingredients-list');
    const stepsList = document.getElementById('custom-recipe-steps-list');

    if (ingsList) ingsList.innerHTML = '';
    if (stepsList) stepsList.innerHTML = '';

    if (recipeId) {
      const rec = this.allRecipes.find(r => r.id === recipeId);
      if (!rec) return;

      if (inputId) inputId.value = rec.id;
      if (titleEl) titleEl.innerHTML = '<span>✏️</span> <span>Editar Mi Receta Casera</span>';
      if (inputName) inputName.value = rec.name;
      if (selectCat) selectCat.value = rec.category || 'almuerzo';
      if (selectDiff) selectDiff.value = rec.difficulty || 'Fácil';
      if (selectCost) selectCost.value = rec.costLevel || 'Económico';
      if (inputServ) inputServ.value = rec.defaultServings || 2;
      if (inputPrep) inputPrep.value = rec.timePrep ?? 15;
      if (inputCook) inputCook.value = rec.timeCook ?? 20;
      if (inputCarbs) inputCarbs.value = rec.estimatedCarbsPerServing ?? 30;
      if (inputCals) inputCals.value = rec.estimatedCaloriesPerServing ?? 350;
      if (inputNotes) inputNotes.value = rec.notes || '';
      if (inputTags) inputTags.value = rec.tags ? rec.tags.join(', ') : 'casera';

      if (rec.ingredients && rec.ingredients.length > 0) {
        rec.ingredients.forEach(i => this.addCustomRecipeIngredientRow(i.name, i.amount, i.unit));
      } else {
        this.addCustomRecipeIngredientRow();
      }

      if (rec.instructions && rec.instructions.length > 0) {
        rec.instructions.forEach(step => this.addCustomRecipeStepRow(step));
      } else {
        this.addCustomRecipeStepRow();
      }
    } else {
      if (inputId) inputId.value = '';
      if (titleEl) titleEl.innerHTML = '<span>🍳</span> <span>Crear Mi Propia Receta Casera</span>';
      if (inputName) inputName.value = '';
      if (selectCat) selectCat.value = 'almuerzo';
      if (selectDiff) selectDiff.value = 'Fácil';
      if (selectCost) selectCost.value = 'Económico';
      if (inputServ) inputServ.value = '2';
      if (inputPrep) inputPrep.value = '15';
      if (inputCook) inputCook.value = '20';
      if (inputCarbs) inputCarbs.value = '30';
      if (inputCals) inputCals.value = '350';
      if (inputNotes) inputNotes.value = '';
      if (inputTags) inputTags.value = 'casera, cotidiana';

      this.addCustomRecipeIngredientRow('Ingrediente principal', '1', 'unidad');
      this.addCustomRecipeIngredientRow('', '', '');
      this.addCustomRecipeStepRow('Preparar y cortar los ingredientes...');
      this.addCustomRecipeStepRow('Cocinar a fuego moderado hasta dorar y servir.');
    }

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  closeCustomRecipeModal() {
    const modal = document.getElementById('custom-recipe-modal');
    if (modal) modal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  addCustomRecipeIngredientRow(name = '', amount = '', unit = '') {
    const list = document.getElementById('custom-recipe-ingredients-list');
    if (!list) return;

    const row = document.createElement('div');
    row.className = 'flex items-center gap-1.5 custom-ing-row animate-fade-in';
    row.innerHTML = `
      <input type="text" placeholder="Ingrediente (ej. Huevos)" value="${name}" class="flex-1 px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-xs custom-ing-name">
      <input type="text" placeholder="Cant. (ej. 2)" value="${amount}" class="w-20 px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-xs text-center custom-ing-amount">
      <input type="text" placeholder="Unidad (ej. u)" value="${unit}" class="w-20 px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-xs text-center custom-ing-unit">
      <button type="button" onclick="this.parentElement.remove()" class="text-stone-400 hover:text-red-500 p-1.5 text-xs" title="Eliminar fila">✕</button>
    `;
    list.appendChild(row);
  }

  addCustomRecipeStepRow(text = '') {
    const list = document.getElementById('custom-recipe-steps-list');
    if (!list) return;

    const row = document.createElement('div');
    row.className = 'flex items-start gap-1.5 custom-step-row animate-fade-in';
    row.innerHTML = `
      <span class="text-stone-400 font-bold text-xs pt-2">·</span>
      <textarea rows="2" placeholder="Describí el paso..." class="flex-1 px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-xs custom-step-text resize-none">${text}</textarea>
      <button type="button" onclick="this.parentElement.remove()" class="text-stone-400 hover:text-red-500 p-1.5 text-xs pt-2" title="Eliminar paso">✕</button>
    `;
    list.appendChild(row);
  }

  async saveCustomRecipeSubmit() {
    const id = document.getElementById('custom-recipe-id')?.value;
    const name = document.getElementById('custom-recipe-name')?.value?.trim();
    if (!name) {
      alert('Por favor ingresá el nombre de tu receta.');
      return;
    }

    const category = document.getElementById('custom-recipe-category')?.value || 'almuerzo';
    const difficulty = document.getElementById('custom-recipe-difficulty')?.value || 'Fácil';
    const costLevel = document.getElementById('custom-recipe-cost')?.value || 'Económico';
    const defaultServings = parseInt(document.getElementById('custom-recipe-servings')?.value, 10) || 2;
    const timePrep = parseInt(document.getElementById('custom-recipe-time-prep')?.value, 10) || 15;
    const timeCook = parseInt(document.getElementById('custom-recipe-time-cook')?.value, 10) || 20;
    const estimatedCarbsPerServing = parseInt(document.getElementById('custom-recipe-carbs')?.value, 10) || 30;
    const estimatedCaloriesPerServing = parseInt(document.getElementById('custom-recipe-cals')?.value, 10) || 350;
    const notes = document.getElementById('custom-recipe-notes')?.value?.trim() || '';
    const tagsStr = document.getElementById('custom-recipe-tags')?.value || '';
    const tags = tagsStr.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
    if (!tags.includes('casera')) tags.push('casera');

    // Extraer ingredientes
    const ingRows = document.querySelectorAll('.custom-ing-row');
    const ingredients = [];
    ingRows.forEach(row => {
      const ingName = row.querySelector('.custom-ing-name')?.value?.trim();
      const ingAmount = row.querySelector('.custom-ing-amount')?.value?.trim();
      const ingUnit = row.querySelector('.custom-ing-unit')?.value?.trim();
      if (ingName) {
        ingredients.push({
          name: ingName,
          amount: ingAmount || '1',
          unit: ingUnit || ''
        });
      }
    });

    if (ingredients.length === 0) {
      alert('Por favor ingresá al menos un ingrediente para la receta.');
      return;
    }

    // Extraer pasos
    const stepRows = document.querySelectorAll('.custom-step-row');
    const instructions = [];
    stepRows.forEach(row => {
      const txt = row.querySelector('.custom-step-text')?.value?.trim();
      if (txt) instructions.push(txt);
    });

    if (instructions.length === 0) {
      alert('Por favor describí al menos un paso de preparación.');
      return;
    }

    const recipe = {
      id: id || ('custom_' + Date.now()),
      name,
      category,
      difficulty,
      costLevel,
      defaultServings,
      timePrep,
      timeCook,
      estimatedCarbsPerServing,
      estimatedCaloriesPerServing,
      ingredients,
      instructions,
      notes,
      tags,
      isCustom: true,
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      substitutions: []
    };

    await db.saveCustomRecipe(recipe);
    this.allRecipes = await db.getAllRecipes();
    this.updateRecipeCountBadge();
    this.closeCustomRecipeModal();
    this.filterRecipes();
    this.showToast(id ? '¡Receta actualizada con éxito!' : '¡Nueva receta casera creada!');
  }

  // ==================== FAVORITOS ====================
  async toggleFavoriteProposal(recipeId) {
    const recipe = this.allRecipes.find(r => r.id === recipeId);
    if (!recipe) return;
    const res = await db.toggleFavorite(recipe);
    this.showToast(res.isFavorite ? '¡Guardada en favoritos!' : 'Eliminada de favoritos');
    await this.renderProposalCard(recipe);
  }

  async toggleFavoriteCard(recipeId) {
    const recipe = this.allRecipes.find(r => r.id === recipeId);
    if (!recipe) return;
    const res = await db.toggleFavorite(recipe);
    this.showToast(res.isFavorite ? '¡Guardada en favoritos!' : 'Eliminada de favoritos');
    if (this.activeView === 'favorites') {
      this.loadFavoritesView();
    } else {
      this.filterRecipes();
    }
  }

  async loadFavoritesView() {
    const container = document.getElementById('favorites-container');
    if (!container) return;

    const favs = await db.getAllFavorites();
    if (favs.length === 0) {
      container.innerHTML = `
        <div class="col-span-full p-10 text-center bg-white dark:bg-stone-800 rounded-3xl border border-stone-200 dark:border-stone-700 text-stone-400 space-y-2">
          <span class="text-4xl block">🤍</span>
          <h3 class="font-bold text-stone-700 dark:text-stone-200 text-base">Aún no guardaste recetas o comidas favoritas</h3>
          <p class="text-xs text-stone-500 max-w-sm mx-auto">
            Podés tocar el corazón en cualquier propuesta o receta, o agregar tus platos cotidianos con "+ Agregar Comida Habitual".
          </p>
          <div class="flex items-center justify-center gap-2 pt-2">
            <button onclick="app.navigate('recipes')" class="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold">
              Explorar recetas
            </button>
            <button onclick="app.openAddCustomFavoriteModal()" class="px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs font-semibold hover:bg-stone-100 dark:hover:bg-stone-700">
              + Agregar habitual
            </button>
          </div>
        </div>
      `;
      return;
    }

    const recipeFavs = [];
    const customMealFavs = [];

    favs.forEach(f => {
      if (f.type === 'custom_meal') {
        customMealFavs.push(f);
      } else {
        const full = this.allRecipes.find(r => r.id === f.id) || f;
        recipeFavs.push(full);
      }
    });

    let html = '';

    // Renderizar comidas habituales (Sección 9)
    if (customMealFavs.length > 0) {
      html += `
        <div class="col-span-full">
          <h3 class="font-bold text-stone-800 dark:text-stone-200 text-sm flex items-center gap-1.5 mb-1">
            <span>⭐</span> <span>Comidas Habituales (${customMealFavs.length})</span>
          </h3>
          <p class="text-stone-400 text-xs mb-3">Platos de tu día a día que anotaste para tener a mano sin necesidad de receta completa.</p>
        </div>
      `;

      html += customMealFavs.map(cm => `
        <div class="p-4 rounded-2xl bg-white dark:bg-stone-800 border border-brand-200 dark:border-brand-900/40 shadow-sm flex flex-col justify-between space-y-3">
          <div class="space-y-1.5">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 rounded-lg">
                ${this.getCategoryLabel(cm.category)}
              </span>
              <button onclick="app.removeCustomFavorite('${cm.id}')" class="text-stone-400 hover:text-red-500 text-xs p-1" title="Quitar de favoritos">
                ✕
              </button>
            </div>
            <h4 class="font-bold text-stone-900 dark:text-white text-sm">${cm.name}</h4>
            ${cm.customIngredients ? `<p class="text-xs text-stone-500 dark:text-stone-400 line-clamp-2"><strong>Ingredientes:</strong> ${cm.customIngredients}</p>` : ''}
            ${cm.notes ? `<p class="text-xs text-stone-400 dark:text-stone-500 italic line-clamp-2">${cm.notes}</p>` : ''}
            ${cm.estimatedCarbs ? `<span class="text-[11px] text-brand-600 dark:text-brand-400 font-semibold block">~${cm.estimatedCarbs}g carbos est.</span>` : ''}
          </div>
          <div class="pt-2 border-t border-stone-100 dark:border-stone-700 flex items-center justify-between gap-2">
            <button onclick="app.openPlanModal(null, '${cm.category}', null, '${cm.name}', ${cm.estimatedCarbs || 0})" class="w-full py-2 rounded-xl bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/40 dark:hover:bg-brand-900/50 text-brand-700 dark:text-brand-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors">
              <span>📅</span> <span>Planificar esta semana</span>
            </button>
          </div>
        </div>
      `).join('');
    }

    if (recipeFavs.length > 0) {
      if (customMealFavs.length > 0) {
        html += `
          <div class="col-span-full pt-4">
            <h3 class="font-bold text-stone-800 dark:text-stone-200 text-sm flex items-center gap-1.5 mb-1">
              <span>❤️</span> <span>Recetas Favoritas (${recipeFavs.length})</span>
            </h3>
            <p class="text-stone-400 text-xs mb-3">Recetas completas de la biblioteca y caseras guardadas.</p>
          </div>
        `;
      }
    }

    container.innerHTML = html;

    if (recipeFavs.length > 0) {
      const recipeCardsContainer = document.createElement('div');
      recipeCardsContainer.className = 'col-span-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4';
      recipeCardsContainer.id = 'fav-recipes-subgrid';
      container.appendChild(recipeCardsContainer);
      this.renderRecipeCards(recipeFavs, 'fav-recipes-subgrid');
    }
  }

  async removeCustomFavorite(id) {
    await db.toggleFavorite({ id });
    this.showToast('Comida habitual eliminada de favoritos');
    this.loadFavoritesView();
  }

  openAddCustomFavoriteModal() {
    const modal = document.getElementById('add-custom-favorite-modal');
    if (!modal) return;
    document.getElementById('custom-fav-name').value = '';
    document.getElementById('custom-fav-meal-type').value = 'almuerzo';
    document.getElementById('custom-fav-carbs').value = '';
    document.getElementById('custom-fav-ingredients').value = '';
    document.getElementById('custom-fav-notes').value = '';
    modal.classList.remove('hidden');
  }

  closeAddCustomFavoriteModal() {
    const modal = document.getElementById('add-custom-favorite-modal');
    if (modal) modal.classList.add('hidden');
  }

  async saveCustomFavoriteSubmit() {
    const name = document.getElementById('custom-fav-name')?.value?.trim();
    if (!name) {
      alert('Escribí el nombre de la comida.');
      return;
    }
    const mealType = document.getElementById('custom-fav-meal-type')?.value || 'almuerzo';
    const carbsVal = document.getElementById('custom-fav-carbs')?.value;
    const ingredients = document.getElementById('custom-fav-ingredients')?.value?.trim() || '';
    const notes = document.getElementById('custom-fav-notes')?.value?.trim() || '';

    const favItem = {
      id: 'custom_fav_' + Date.now(),
      name,
      category: mealType,
      type: 'custom_meal',
      estimatedCarbs: carbsVal ? parseInt(carbsVal, 10) : null,
      customIngredients: ingredients,
      notes,
      image: '',
      createdAt: Date.now()
    };

    await db.toggleFavorite(favItem);
    this.closeAddCustomFavoriteModal();
    this.loadFavoritesView();
    this.showToast('¡Comida habitual guardada en favoritos!');
  }

  // ==================== HISTORIAL DE RECETAS ====================
  async loadHistoryView() {
    const container = document.getElementById('history-container');
    if (!container) return;

    const history = await db.getRecentHistory(30);
    if (history.length === 0) {
      container.innerHTML = `
        <div class="p-8 text-center bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 text-stone-400">
          <p class="text-sm font-semibold text-stone-600 dark:text-stone-300">Aún no consultaste recetas en esta sesión.</p>
          <p class="text-xs mt-1">A medida que abras o elijas recetas, aparecerán aquí para que puedas volver a prepararlas.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = history.map(item => {
      const dateStr = new Date(item.timestamp).toLocaleDateString('es-AR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });

      return `
        <div class="p-3.5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-between gap-3 hover:border-brand-500/50 transition-colors">
          <div class="flex items-center gap-3 min-w-0">
            <img src="${item.image}" alt="${item.name}" class="w-12 h-12 rounded-xl object-cover flex-shrink-0 bg-stone-200">
            <div class="min-w-0">
              <h4 class="font-bold text-stone-900 dark:text-white text-xs sm:text-sm truncate">${item.name}</h4>
              <p class="text-[11px] text-stone-400 mt-0.5">Consultada el ${dateStr}</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="app.openPlanModal(null, '${item.category}', '${item.recipeId}')" class="px-2.5 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 text-xs font-semibold" title="Planificar">
              📅
            </button>
            <button onclick="app.openRecipeModal('${item.recipeId}')" class="px-3 py-1.5 rounded-xl border border-brand-500/40 text-brand-600 dark:text-brand-400 text-xs font-semibold hover:bg-brand-50 dark:hover:bg-brand-950/40 transition-colors">
              Volver a ver
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  async clearHistory() {
    if (confirm('¿Querés limpiar el historial de recetas consultadas?')) {
      await db.clearHistory();
      this.loadHistoryView();
      this.showToast('Historial limpiado');
    }
  }

  // ==================== ACCESOS RÁPIDOS COTIDIANOS ====================
  showQuickModal(type) {
    if (type === 'lazy') {
      this.openLazyCookModal();
    } else if (type === 'now') {
      this.openSolveNowModal();
    } else if (type === 'budget') {
      this.openBudgetModal();
    }
  }

  // ==================== RESOLVER UNA COMIDA AHORA (ETAPA 3) ====================
  openSolveNowModal() {
    document.getElementById('solve-result-box').classList.add('hidden');
    document.getElementById('solve-now-modal').classList.remove('hidden');
    this.updateSolveUI();
  }

  closeSolveNowModal() {
    document.getElementById('solve-now-modal').classList.add('hidden');
  }

  setSolveParam(key, val) {
    this.solveParams[key] = val;
    this.updateSolveUI();
  }

  toggleSolveIngredient(ing) {
    if (this.solveParams.ingredients.has(ing)) {
      this.solveParams.ingredients.delete(ing);
    } else {
      this.solveParams.ingredients.add(ing);
    }
    this.updateSolveUI();
  }

  updateSolveUI() {
    // Actualizar botones de tiempo
    document.querySelectorAll('.solve-time-btn').forEach(btn => {
      const val = Number(btn.getAttribute('data-val'));
      if (val === this.solveParams.time) {
        btn.className = 'solve-time-btn p-2 rounded-xl border border-brand-600 bg-brand-600 text-white font-semibold text-center';
      } else {
        btn.className = 'solve-time-btn p-2 rounded-xl border border-stone-200 dark:border-stone-700 font-semibold text-center hover:border-brand-500';
      }
    });

    // Actualizar botones de ganas de cocinar
    document.querySelectorAll('.solve-cook-btn').forEach(btn => {
      const val = btn.getAttribute('data-val');
      if (val === this.solveParams.cook) {
        btn.className = 'solve-cook-btn p-2 rounded-xl border border-brand-600 bg-brand-600 text-white font-semibold text-center';
      } else {
        btn.className = 'solve-cook-btn p-2 rounded-xl border border-stone-200 dark:border-stone-700 text-center hover:border-brand-500';
      }
    });

    // Actualizar chips de ingredientes
    document.querySelectorAll('.solve-ing-chip').forEach(chip => {
      const ing = chip.getAttribute('data-ing');
      if (this.solveParams.ingredients.has(ing)) {
        chip.className = 'solve-ing-chip px-2.5 py-1 rounded-lg border border-brand-500 bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 font-bold';
      } else {
        chip.className = 'solve-ing-chip px-2.5 py-1 rounded-lg border border-stone-200 dark:border-stone-700 font-medium hover:bg-stone-100 dark:hover:bg-stone-750';
      }
    });
  }

  calculateSolveProposal() {
    const { time, cook, ingredients } = this.solveParams;

    // Filtrar recetas que cumplan el tiempo
    let candidates = this.allRecipes.filter(r => (r.timePrep + r.timeCook) <= time + 5);

    if (cook === 'none') {
      candidates = candidates.filter(r => r.tags && (r.tags.includes('sin_cocinar') || r.tags.includes('5_minutos')));
    }

    if (candidates.length === 0) {
      candidates = this.allRecipes.filter(r => (r.timePrep + r.timeCook) <= 15);
    }

    // Puntuar según ingredientes seleccionados
    const ingsArray = Array.from(ingredients);
    let bestMatch = null;
    let highestScore = -1;

    for (const r of candidates) {
      let score = 0;
      for (const userIng of ingsArray) {
        if (r.ingredients.some(i => i.name.toLowerCase().includes(userIng))) {
          score += 2;
        }
      }
      if (score > highestScore) {
        highestScore = score;
        bestMatch = r;
      }
    }

    if (!bestMatch) {
      bestMatch = candidates[Math.floor(Math.random() * candidates.length)] || this.allRecipes[0];
    }

    const resultBox = document.getElementById('solve-result-box');
    resultBox.classList.remove('hidden');

    const totalTime = bestMatch.timePrep + bestMatch.timeCook;
    const ingredientsMentioned = ingsArray.length > 0 ? ingsArray.join(', ') : 'lo que tenés a mano';

    resultBox.innerHTML = `
      <div class="space-y-3">
        <div class="flex items-start justify-between gap-2">
          <div>
            <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-200">
              Propuesta Concreta
            </span>
            <h4 class="font-bold text-stone-900 dark:text-white text-base mt-1">
              ${bestMatch.name}
            </h4>
          </div>
          <span class="text-xs font-semibold px-2 py-1 rounded-lg bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
            ⏱️ ${totalTime} min
          </span>
        </div>

        <p class="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
          Tenés ${time} minutos y contás con <strong>${ingredientsMentioned}</strong>. Esta receta resuelve tu comida de manera deliciosa, realista y sin ensuciar de más.
        </p>

        <div class="flex items-center gap-2 flex-wrap pt-1">
          <button onclick="app.closeSolveNowModal(); app.openRecipeModal('${bestMatch.id}')" class="flex-1 py-2 px-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-sm transition-all text-center">
            👁️ Ver receta completa
          </button>
          <button onclick="app.calculateSolveProposal()" class="py-2 px-3 rounded-xl border border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-200 font-semibold text-xs hover:bg-white dark:hover:bg-stone-700 transition-colors">
            🔄 Proponeme otra
          </button>
          <button onclick="app.closeSolveNowModal(); app.openPlanModal(null, '${bestMatch.category}', '${bestMatch.id}')" class="py-2 px-3 rounded-xl border border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-200 text-xs font-semibold" title="Planificar">
            📅
          </button>
        </div>
      </div>
    `;
  }

  // ==================== NO TENGO GANAS DE COCINAR (ETAPA 3) ====================
  openLazyCookModal() {
    document.getElementById('lazy-cook-modal').classList.remove('hidden');
    this.setLazyTab(this.lazyCurrentTab);
  }

  closeLazyCookModal() {
    document.getElementById('lazy-cook-modal').classList.add('hidden');
  }

  setLazyTab(tab) {
    this.lazyCurrentTab = tab;
    ['5', '10', '15', 'nocook'].forEach(t => {
      const btn = document.getElementById(`lazy-tab-${t}`);
      if (btn) {
        if (t === tab) {
          btn.className = 'lazy-tab-btn px-3 py-1.5 rounded-xl font-semibold bg-brand-600 text-white shadow-sm';
        } else {
          btn.className = 'lazy-tab-btn px-3 py-1.5 rounded-xl font-medium bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300';
        }
      }
    });

    this.renderLazyRecipes();
  }

  renderLazyRecipes() {
    const container = document.getElementById('lazy-recipes-list');
    if (!container) return;

    let filtered = [];
    if (this.lazyCurrentTab === '5') {
      filtered = this.allRecipes.filter(r => (r.timePrep + r.timeCook) <= 5 || (r.tags && r.tags.includes('5_minutos')));
    } else if (this.lazyCurrentTab === '10') {
      filtered = this.allRecipes.filter(r => (r.timePrep + r.timeCook) <= 10);
    } else if (this.lazyCurrentTab === '15') {
      filtered = this.allRecipes.filter(r => (r.timePrep + r.timeCook) <= 15);
    } else if (this.lazyCurrentTab === 'nocook') {
      filtered = this.allRecipes.filter(r => r.timeCook === 0 || (r.tags && r.tags.includes('sin_cocinar')));
    }

    if (filtered.length === 0) {
      filtered = this.allRecipes.filter(r => (r.tags && r.tags.includes('rapida'))).slice(0, 4);
    }

    container.innerHTML = filtered.slice(0, 6).map(r => `
      <div class="p-3 rounded-2xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-700 flex items-center justify-between gap-2.5 hover:border-brand-500/60 transition-colors">
        <div class="flex items-center gap-2.5 min-w-0">
          <img src="${r.image}" alt="${r.name}" class="w-12 h-12 rounded-xl object-cover flex-shrink-0 bg-stone-200">
          <div class="min-w-0">
            <h5 class="font-bold text-stone-900 dark:text-white text-xs truncate leading-snug">${r.name}</h5>
            <span class="text-[11px] text-brand-600 dark:text-brand-400 font-semibold block">⏱️ ${r.timePrep + r.timeCook}m • ~${r.estimatedCarbsPerServing}g carbos</span>
          </div>
        </div>
        <button onclick="app.closeLazyCookModal(); app.openRecipeModal('${r.id}')" class="flex-shrink-0 px-2.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold">
          Ver
        </button>
      </div>
    `).join('');
  }

  // ==================== MODO AHORRO Y SOBRAS (ETAPA 3) ====================
  openBudgetModal() {
    document.getElementById('budget-modal').classList.remove('hidden');
    this.filterByLeftover('arroz');
  }

  closeBudgetModal() {
    document.getElementById('budget-modal').classList.add('hidden');
  }

  async generateSuperSaverMenu() {
    const weekDays = this.getWeekDays(this.calendarDate);
    // 7 recetas ultra económicas que comparten ingredientes básicos (papas, huevos, lentejas, polenta, arroz, fideos)
    const budgetRecipeIds = ['rec-03', 'rec-04', 'rec-09', 'rec-02', 'rec-05', 'rec-08', 'rec-18'];

    for (let i = 0; i < 7; i++) {
      const dateISO = this.formatDateISO(weekDays[i]);
      const recipe = this.allRecipes.find(r => r.id === budgetRecipeIds[i]) || this.allRecipes[i];
      if (recipe) {
        await db.addMealPlan({
          date: dateISO,
          mealType: 'almuerzo',
          name: recipe.name,
          recipeId: recipe.id,
          estimatedCarbs: recipe.estimatedCarbsPerServing || 0,
          image: recipe.image
        });
      }
    }

    this.closeBudgetModal();
    this.navigate('calendar');
    this.showToast('¡Menú de costo mínimo generado con éxito en tu calendario!');
  }

  filterByLeftover(type) {
    document.querySelectorAll('.leftover-chip').forEach(btn => {
      btn.className = 'leftover-chip px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 font-medium hover:border-brand-500';
    });

    const target = event?.target;
    if (target) {
      target.className = 'leftover-chip px-3 py-1.5 rounded-xl border border-brand-500 bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 font-bold';
    }

    const container = document.getElementById('leftover-recipes-results');
    if (!container) return;

    let matching = [];
    if (type === 'pollo') {
      matching = this.allRecipes.filter(r => r.name.toLowerCase().includes('pollo'));
    } else if (type === 'arroz') {
      matching = this.allRecipes.filter(r => r.name.toLowerCase().includes('arroz'));
    } else if (type === 'fideos') {
      matching = this.allRecipes.filter(r => r.name.toLowerCase().includes('fideo'));
    } else if (type === 'papa') {
      matching = this.allRecipes.filter(r => r.name.toLowerCase().includes('papa'));
    } else if (type === 'verduras') {
      matching = this.allRecipes.filter(r => r.name.toLowerCase().includes('zapallito') || r.name.toLowerCase().includes('acelga') || r.name.toLowerCase().includes('calabaza'));
    }

    container.innerHTML = matching.slice(0, 3).map(r => `
      <div class="p-3 rounded-2xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-700 flex items-center justify-between gap-3">
        <div>
          <h5 class="font-bold text-stone-900 dark:text-white text-xs">${r.name}</h5>
          <p class="text-[11px] text-stone-500 mt-0.5">Ideal para reutilizar sin desperdiciar nada.</p>
        </div>
        <button onclick="app.closeBudgetModal(); app.openRecipeModal('${r.id}')" class="px-3 py-1.5 rounded-xl border border-brand-500 text-brand-600 dark:text-brand-400 font-semibold text-xs hover:bg-brand-50">
          Ver receta
        </button>
      </div>
    `).join('');
  }

  // ==================== MI DESPENSA Y HELADERA (ETAPA 3) ====================
  setPantryFilter(loc) {
    this.pantryFilter = loc;
    document.querySelectorAll('.pantry-filter-btn').forEach(btn => {
      if (btn.getAttribute('data-loc') === loc) {
        btn.className = 'pantry-filter-btn px-3 py-1.5 rounded-xl font-semibold bg-brand-600 text-white';
      } else {
        btn.className = 'pantry-filter-btn px-3 py-1.5 rounded-xl font-medium bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300';
      }
    });
    this.renderPantryView();
  }

  async renderPantryView() {
    const grid = document.getElementById('pantry-items-grid');
    const alertBox = document.getElementById('pantry-expiry-alert-box');
    if (!grid) return;

    const items = await db.getPantryItems();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Detección de alimentos próximos a vencer (3 días o menos)
    const expiringItems = items.filter(item => {
      if (!item.expireDate) return false;
      const exp = new Date(item.expireDate + 'T00:00:00');
      const diffDays = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
      return diffDays <= 3;
    });

    if (alertBox) {
      if (expiringItems.length > 0) {
        alertBox.classList.remove('hidden');
        alertBox.innerHTML = `
          <div class="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
            <div class="flex items-center gap-3">
              <span class="text-2xl">⚠️</span>
              <div>
                <h4 class="font-bold text-amber-950 dark:text-amber-200 text-xs sm:text-sm">
                  Tenés ${expiringItems.length} ${expiringItems.length === 1 ? 'alimento próximo' : 'alimentos próximos'} a vencer: ${expiringItems.map(i => i.name).join(', ')}
                </h4>
                <p class="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5">
                  Aprovechalos hoy para reducir el desperdicio de comida y cuidar tu presupuesto.
                </p>
              </div>
            </div>
            <button onclick="app.findRecipesForExpiring()" class="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs whitespace-nowrap shadow-sm self-start sm:self-auto">
              🍳 Ver recetas con esto
            </button>
          </div>
        `;
      } else {
        alertBox.classList.add('hidden');
      }
    }

    // Filtrar items
    let filtered = items;
    if (this.pantryFilter === 'expiring') {
      filtered = expiringItems;
    } else if (this.pantryFilter !== 'all') {
      filtered = items.filter(i => i.location === this.pantryFilter);
    }

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full p-8 text-center bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 text-stone-400 space-y-2">
          <span class="text-3xl block">🧊</span>
          <p class="text-sm font-semibold text-stone-600 dark:text-stone-300">No hay alimentos registrados en esta sección.</p>
          <p class="text-xs">Tocá "+ Agregar alimento" para anotar lo que tenés en tu heladera o alacena sin exigirte registrarlo todo.</p>
        </div>
      `;
      return;
    }

    const locIcons = {
      heladera: '🧊 Heladera',
      alacena: '🥫 Alacena',
      freezer: '❄️ Freezer'
    };

    grid.innerHTML = filtered.map(item => {
      let isExpiringSoon = false;
      let expText = '';
      if (item.expireDate) {
        const exp = new Date(item.expireDate + 'T00:00:00');
        const diffDays = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
        if (diffDays < 0) {
          expText = 'Vencido';
          isExpiringSoon = true;
        } else if (diffDays === 0) {
          expText = 'Vence hoy';
          isExpiringSoon = true;
        } else if (diffDays <= 3) {
          expText = `Vence en ${diffDays} días`;
          isExpiringSoon = true;
        } else {
          expText = `Vence: ${item.expireDate}`;
        }
      }

      return `
        <div class="p-3.5 rounded-2xl bg-white dark:bg-stone-800 border ${isExpiringSoon ? 'border-amber-300 dark:border-amber-800 shadow-sm' : 'border-stone-200 dark:border-stone-700'} flex flex-col justify-between space-y-2.5">
          <div class="flex items-start justify-between gap-2">
            <div>
              <span class="text-[10px] text-stone-400 font-medium block">
                ${locIcons[item.location] || 'Alacena'}
              </span>
              <h4 class="font-bold text-stone-900 dark:text-white text-sm">
                ${item.name}
              </h4>
              <span class="text-xs text-stone-500 font-semibold">${item.amount || ''}</span>
            </div>

            <div class="flex flex-col items-end gap-1">
              ${isExpiringSoon ? `
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/80 dark:text-amber-200">
                  ⚠️ ${expText}
                </span>
              ` : ''}
              ${item.isRunningOut ? `
                <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-900/70 dark:text-red-200">
                  Por acabarse
                </span>
              ` : ''}
            </div>
          </div>

          <div class="pt-2 border-t border-stone-100 dark:border-stone-700/60 flex items-center justify-between text-xs">
            <button onclick="app.markPantryItemUsed('${item.id}')" class="text-brand-600 dark:text-brand-400 font-semibold hover:underline">
              ✓ Usado
            </button>
            <div class="flex items-center gap-1.5">
              <button onclick="app.movePantryToShopping('${item.id}')" class="p-1 rounded-lg text-stone-400 hover:text-stone-700 text-xs" title="Pasar a compras">
                🛒
              </button>
              <button onclick="app.deletePantryItem('${item.id}')" class="p-1 rounded-lg text-stone-400 hover:text-red-500 text-xs" title="Eliminar">
                ✕
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  openAddPantryModal() {
    document.getElementById('pantry-input-name').value = '';
    document.getElementById('pantry-input-amount').value = '';
    document.getElementById('pantry-input-expire').value = '';
    document.getElementById('pantry-input-running-out').checked = false;
    document.getElementById('add-pantry-modal').classList.remove('hidden');
  }

  closeAddPantryModal() {
    document.getElementById('add-pantry-modal').classList.add('hidden');
  }

  quickFillPantry(name, amount, location) {
    document.getElementById('pantry-input-name').value = name;
    document.getElementById('pantry-input-amount').value = amount;
    document.getElementById('pantry-input-location').value = location;
  }

  async confirmAddPantryModal() {
    const name = document.getElementById('pantry-input-name').value.trim();
    const amount = document.getElementById('pantry-input-amount').value.trim();
    const location = document.getElementById('pantry-input-location').value;
    const expireDate = document.getElementById('pantry-input-expire').value || null;
    const isRunningOut = document.getElementById('pantry-input-running-out').checked;

    if (!name) {
      alert('Escribí el nombre del alimento.');
      return;
    }

    await db.addPantryItem({
      name,
      amount,
      location,
      expireDate,
      isRunningOut
    });

    this.closeAddPantryModal();
    this.showToast('Alimento guardado en tu despensa');
    if (this.activeView === 'pantry') {
      this.renderPantryView();
    }
  }

  async markPantryItemUsed(id) {
    await db.deletePantryItem(id);
    this.renderPantryView();
    this.showToast('Alimento marcado como utilizado');
  }

  async deletePantryItem(id) {
    await db.deletePantryItem(id);
    this.renderPantryView();
    this.showToast('Alimento eliminado');
  }

  async movePantryToShopping(id) {
    const items = await db.getPantryItems();
    const item = items.find(i => i.id === id);
    if (!item) return;

    const category = this.guessIngredientCategory(item.name);
    await db.addShoppingItem({
      name: item.name,
      amount: item.amount || '1',
      unit: '',
      category,
      completed: false,
      source: 'pantry'
    });

    this.showToast(`Agregado a la lista de compras: ${item.name}`);
  }

  async syncPantryWithShopping() {
    const pantryItems = await db.getPantryItems();
    const shoppingItems = await db.getShoppingList();

    let discountedCount = 0;
    for (const shopItem of shoppingItems) {
      if (!shopItem.completed) {
        const found = pantryItems.find(p => p.name.toLowerCase().includes(shopItem.name.toLowerCase()) || shopItem.name.toLowerCase().includes(p.name.toLowerCase()));
        if (found && !found.isRunningOut) {
          await db.toggleShoppingItem(shopItem.id);
          discountedCount++;
        }
      }
    }

    if (discountedCount > 0) {
      this.showToast(`Se descontaron ${discountedCount} productos que ya tenés en tu despensa`);
    } else {
      this.showToast('No se encontraron ingredientes duplicados pendientes');
    }
    if (this.activeView === 'shopping') this.renderShoppingView();
  }

  async findRecipesFromPantry() {
    const pantry = await db.getPantryItems();
    if (pantry.length === 0) {
      alert('Registrá primero algunos alimentos en tu despensa (ej: huevos, arroz, fideos, tomate).');
      return;
    }

    const pantryNames = pantry.map(p => p.name.toLowerCase());
    
    // Puntuar recetas
    const scored = this.allRecipes.map(r => {
      let matches = 0;
      r.ingredients.forEach(i => {
        if (pantryNames.some(pn => i.name.toLowerCase().includes(pn) || pn.includes(i.name.toLowerCase()))) {
          matches++;
        }
      });
      return { recipe: r, score: matches };
    });

    scored.sort((a, b) => b.score - a.score);
    const topRecipes = scored.filter(s => s.score > 0).map(s => s.recipe);

    if (topRecipes.length > 0) {
      this.navigate('recipes');
      this.renderRecipeCards(topRecipes, 'recipes-grid');
      this.showToast(`Mostrando ${topRecipes.length} recetas que podés preparar con lo que tenés`);
    } else {
      this.showToast('No encontramos recetas que coincidan exactamente con tus alimentos');
    }
  }

  async findRecipesForExpiring() {
    const pantry = await db.getPantryItems();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiring = pantry.filter(item => {
      if (!item.expireDate) return false;
      const exp = new Date(item.expireDate + 'T00:00:00');
      return Math.ceil((exp - today) / (1000 * 60 * 60 * 24)) <= 3;
    });

    if (expiring.length === 0) return;
    const expiringNames = expiring.map(e => e.name.toLowerCase());

    const top = this.allRecipes.filter(r => {
      return r.ingredients.some(i => expiringNames.some(en => i.name.toLowerCase().includes(en) || en.includes(i.name.toLowerCase())));
    });

    if (top.length > 0) {
      this.navigate('recipes');
      this.renderRecipeCards(top, 'recipes-grid');
      this.showToast(`Mostrando recetas para aprovechar los alimentos por vencer`);
    }
  }

  // =========================================================================
  // ETAPA 4: BIENESTAR, GLUCOSA, ACTIVIDAD, CLIMA (OPEN-METEO) Y EMOCIONES
  // =========================================================================

  async initWellnessAndSettings() {
    try {
      const ranges = await db.getSetting('glucose_ranges', { fastingMin: 70, fastingMax: 130, postMax: 180 });
      if (ranges) this.glucoseSettings = ranges;

      const city = await db.getSetting('weather_city', 'Buenos Aires');
      if (city) {
        this.weatherCity = city;
        const citySel = document.getElementById('settings-weather-city');
        if (citySel) citySel.value = city;
        const modalCitySel = document.getElementById('modal-weather-city-select');
        if (modalCitySel) modalCitySel.value = city;
      }

      const savedHabits = await db.getSetting('habits', null);
      if (savedHabits && Array.isArray(savedHabits)) {
        this.habits = savedHabits;
      } else {
        this.habits = [...this.defaultHabits];
      }

      await this.loadReminderSettings();
      await this.loadModulePreferences();
    } catch (e) {
      console.warn('Error inicializando ajustes de bienestar:', e);
    }
  }

  // ==================== CLIMA Y PROPUESTAS CONTEXTUALES (SECCIÓN 20) ====================
  initWeather() {
    this.fetchWeatherData(this.weatherCity);
  }

  async fetchWeatherData(cityName) {
    const CITIES = {
      'Buenos Aires': { lat: -34.6037, lon: -58.3816 },
      'Córdoba': { lat: -31.4201, lon: -64.1888 },
      'Rosario': { lat: -32.9468, lon: -60.6393 },
      'Mendoza': { lat: -32.8895, lon: -68.8458 },
      'Tucumán': { lat: -26.8241, lon: -65.2226 },
      'Mar del Plata': { lat: -38.0055, lon: -57.5562 },
      'Salta': { lat: -24.7859, lon: -65.4117 },
      'Bariloche': { lat: -41.1335, lon: -71.3103 },
      'Neuquén': { lat: -38.9516, lon: -68.0591 },
      'La Plata': { lat: -34.9215, lon: -57.9545 },
      'Santa Fe': { lat: -31.6333, lon: -60.7000 }
    };

    const coords = CITIES[cityName] || CITIES['Buenos Aires'];
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,weather_code&timezone=auto`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const temp = Math.round(data?.current?.temperature_2m ?? 22);
        this.setWeatherState(cityName, temp);
        return;
      }
    } catch (e) {
      // Si falla o no hay conexión, usamos un valor por defecto amable y realista
    }

    // Fallback silencioso sin bloquear la app
    this.setWeatherState(cityName, 22, true);
  }

  setWeatherState(city, temp, isFallback = false) {
    let statusLabel = 'Templado';
    let icon = '🌤️';
    let suggestionText = 'Clima agradable para cualquier comida casera y reconfortante.';
    let actionBtnText = 'Ver menú sugerido';
    let suggestionType = 'templado';

    if (temp >= 25) {
      statusLabel = 'Caluroso';
      icon = '☀️';
      suggestionText = 'Día cálido: Te recomendamos opciones frescas, livianas y con buena hidratación como ensaladas, tartas o gazpachos.';
      actionBtnText = 'Ver platos frescos';
      suggestionType = 'caluroso';
    } else if (temp <= 16) {
      statusLabel = 'Fresco / Frío';
      icon = '🍲';
      suggestionText = 'Día fresco: Ideal para platos calentitos y nutritivos como guisos, cazuelas, sopas o pastas calientes.';
      actionBtnText = 'Ver platos reconfortantes';
      suggestionType = 'fresco';
    }

    this.weatherData = {
      city,
      temp,
      statusLabel,
      icon,
      suggestionText,
      actionBtnText,
      suggestionType,
      isFallback
    };

    this.updateWeatherUI();
  }

  updateWeatherUI() {
    if (!this.weatherData) return;
    const { city, temp, statusLabel, icon, suggestionText, actionBtnText, isFallback } = this.weatherData;

    const cityLabel = document.getElementById('weather-city-label');
    const tempBadge = document.getElementById('weather-temp-badge');
    const suggText = document.getElementById('weather-suggestion-text');
    const actionBtn = document.getElementById('weather-action-btn');
    const iconBadge = document.getElementById('weather-icon-badge');
    const sourceBadge = document.getElementById('weather-source-badge');

    if (cityLabel) cityLabel.textContent = city;
    if (tempBadge) tempBadge.textContent = `${temp}°C • ${statusLabel}`;
    if (suggText) suggText.textContent = suggestionText;
    if (actionBtn) actionBtn.textContent = actionBtnText;
    if (iconBadge) iconBadge.textContent = icon;
    if (sourceBadge) {
      sourceBadge.textContent = isFallback ? '(Estimación local)' : 'vía Open-Meteo';
    }
  }

  filterByWeatherSuggestion() {
    if (!this.weatherData) return;
    const type = this.weatherData.suggestionType;
    this.navigate('recipes');

    let filtered = [];
    if (type === 'caluroso') {
      filtered = this.allRecipes.filter(r => 
        (r.tags && (r.tags.includes('ensalada') || r.tags.includes('fresca') || r.tags.includes('liviana'))) ||
        r.timeCook === 0
      );
      this.showToast('Mostrando recetas frescas y livianas para días cálidos');
    } else if (type === 'fresco') {
      filtered = this.allRecipes.filter(r => 
        (r.tags && (r.tags.includes('guiso') || r.tags.includes('caliente') || r.tags.includes('sopa') || r.tags.includes('invernal'))) ||
        r.timeCook >= 20
      );
      this.showToast('Mostrando recetas calientes y reconfortantes');
    } else {
      filtered = this.allRecipes.filter(r => r.category === 'almuerzo' || r.category === 'cena');
      this.showToast('Mostrando sugerencias para clima templado');
    }

    if (filtered.length > 0) {
      this.renderRecipeCards(filtered, 'recipes-grid');
    } else {
      this.renderLibraryGrid();
    }
  }

  openWeatherCityModal() {
    const modal = document.getElementById('weather-city-modal');
    if (modal) {
      modal.classList.remove('hidden');
      const sel = document.getElementById('modal-weather-city-select');
      if (sel) sel.value = this.weatherCity;
    }
  }

  closeWeatherCityModal() {
    const modal = document.getElementById('weather-city-modal');
    if (modal) modal.classList.add('hidden');
  }

  async applyCityWeatherSelection() {
    const sel = document.getElementById('modal-weather-city-select');
    if (sel && sel.value) {
      this.weatherCity = sel.value;
      await db.setSetting('weather_city', this.weatherCity);
      const settingsSel = document.getElementById('settings-weather-city');
      if (settingsSel) settingsSel.value = this.weatherCity;
      await this.fetchWeatherData(this.weatherCity);
      this.closeWeatherCityModal();
      this.showToast(`Clima actualizado para ${this.weatherCity}`);
    }
  }

  setManualWeather(type) {
    if (type === 'caluroso') {
      this.setWeatherState(this.weatherCity, 28);
    } else if (type === 'fresco') {
      this.setWeatherState(this.weatherCity, 13);
    } else {
      this.setWeatherState(this.weatherCity, 21);
    }
    this.closeWeatherCityModal();
    this.showToast(`Sensación ajustada a ${type}`);
  }

  async changeWeatherCity(city) {
    this.weatherCity = city;
    await db.setSetting('weather_city', city);
    const modalSel = document.getElementById('modal-weather-city-select');
    if (modalSel) modalSel.value = city;
    await this.fetchWeatherData(city);
    this.showToast(`Ciudad cambiada a ${city}`);
  }

  // ==================== SUB-PESTAÑAS DE BIENESTAR ====================
  setWellnessSubtab(subtab) {
    this.wellnessSubtab = subtab;
    const tabs = ['glucose', 'activity', 'emotional'];

    tabs.forEach(t => {
      const btn = document.getElementById(`wellness-subtab-btn-${t}`);
      const panel = document.getElementById(`wellness-panel-t-${t}`) || document.getElementById(`wellness-panel-${t}`);
      
      if (btn) {
        if (t === subtab) {
          btn.className = 'px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-stone-700 text-brand-700 dark:text-brand-300 shadow-sm transition-all whitespace-nowrap';
        } else {
          btn.className = 'px-3 py-1.5 rounded-xl text-xs font-medium text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white transition-all whitespace-nowrap';
        }
      }

      if (panel) {
        if (t === subtab) {
          panel.classList.remove('hidden');
        } else {
          panel.classList.add('hidden');
        }
      }
    });

    if (subtab === 'glucose') {
      this.renderGlucoseSubpanel();
    } else if (subtab === 'activity') {
      this.renderActivitySubpanel();
    } else if (subtab === 'emotional') {
      this.renderEmotionalSubpanel();
    }
  }

  async renderWellnessView() {
    this.setWellnessSubtab(this.wellnessSubtab);
  }

  // ==================== SUB-PANEL: GLUCOSA (SECCIÓN 16) ====================
  async renderGlucoseSubpanel() {
    const fastingLabel = document.getElementById('label-glucose-fasting');
    const postLabel = document.getElementById('label-glucose-post');
    if (fastingLabel) {
      fastingLabel.textContent = `${this.glucoseSettings.fastingMin} - ${this.glucoseSettings.fastingMax} mg/dL`;
    }
    if (postLabel) {
      postLabel.textContent = `< ${this.glucoseSettings.postMax} mg/dL`;
    }

    const records = await db.getWellnessRecords({ type: 'glucose' });
    const countBadge = document.getElementById('glucose-records-count-badge');
    const percentageLabel = document.getElementById('label-glucose-percentage');
    const countLabel = document.getElementById('label-glucose-count');
    const listContainer = document.getElementById('glucose-records-list');

    if (countBadge) countBadge.textContent = `${records.length} mediciones`;
    if (countLabel) countLabel.textContent = `${records.length} registros`;

    if (records.length === 0) {
      if (percentageLabel) percentageLabel.textContent = '--%';
      if (listContainer) {
        listContainer.innerHTML = `
          <div class="p-8 text-center text-stone-400 bg-stone-50 dark:bg-stone-900/50 rounded-2xl border border-dashed border-stone-200 dark:border-stone-800">
            <span class="text-3xl block mb-2">🩸</span>
            <p class="text-xs font-medium text-stone-600 dark:text-stone-300">Aún no registraste mediciones de glucosa.</p>
            <p class="text-[11px] text-stone-400 mt-0.5">Podés agregar una medición opcional cuando lo desees con el botón "+ Nueva Medición".</p>
          </div>
        `;
      }
      this.renderGlucoseChart([]);
      return;
    }

    // Calcular estadísticas
    const inRangeCount = records.filter(r => r.status === 'en_rango').length;
    const percentage = Math.round((inRangeCount / records.length) * 100);
    if (percentageLabel) percentageLabel.textContent = `${percentage}%`;

    // Renderizar gráfico visual SVG
    this.renderGlucoseChart(records);

    // Renderizar lista de registros
    if (listContainer) {
      const momentLabels = {
        'ayunas': '🌅 En ayunas / Basal',
        'pre_almuerzo': '🍽️ Antes del almuerzo',
        'post_almuerzo': '⏱️ 2h posprandial (después de almuerzo)',
        'pre_cena': '🌙 Antes de la cena',
        'post_cena': '⏱️ 2h posprandial (después de cena)',
        'antes_dormir': '🛌 Antes de acostarse',
        'nocturno': '🌌 Nocturno',
        'otro': '📌 Otro momento'
      };

      listContainer.innerHTML = records.map(r => {
        let badgeClass = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300';
        let badgeText = 'En rango objetivo';
        if (r.status === 'bajo') {
          badgeClass = 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300';
          badgeText = 'Por debajo de tu rango';
        } else if (r.status === 'alto') {
          badgeClass = 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300';
          badgeText = 'Por encima de tu rango';
        }

        return `
          <div class="p-4 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex items-start gap-3">
              <div class="w-12 h-12 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 flex flex-col items-center justify-center flex-shrink-0">
                <span class="text-base font-extrabold text-stone-900 dark:text-white leading-tight">${r.value}</span>
                <span class="text-[9px] text-stone-400 font-medium">mg/dL</span>
              </div>
              <div class="space-y-1">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="text-xs font-bold text-stone-800 dark:text-stone-200">
                    ${momentLabels[r.moment] || r.moment}
                  </span>
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold ${badgeClass}">
                    ${badgeText}
                  </span>
                </div>
                <div class="text-[11px] text-stone-500 dark:text-stone-400 flex items-center gap-2">
                  <span>📅 ${r.date} ${r.time ? '• ' + r.time : ''}</span>
                  ${r.meal ? `<span class="text-stone-700 dark:text-stone-300 font-medium">🍽️ ${r.meal}</span>` : ''}
                </div>
                ${r.notes ? `<p class="text-[11px] text-stone-600 dark:text-stone-400 italic">"${r.notes}"</p>` : ''}
              </div>
            </div>
            <button onclick="app.deleteGlucoseRecord('${r.id}')" title="Eliminar registro" class="self-end sm:self-auto p-1.5 rounded-xl text-stone-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
              🗑️
            </button>
          </div>
        `;
      }).join('');
    }
  }

  renderGlucoseChart(records) {
    const container = document.getElementById('glucose-chart-container');
    if (!container) return;

    if (!records || records.length === 0) {
      container.innerHTML = `<span class="text-xs text-stone-400">Aún no hay mediciones registradas. ¡Sumá la primera!</span>`;
      return;
    }

    // Tomamos las últimas 14 mediciones en orden cronológico
    const sorted = [...records].reverse().slice(-14);
    if (sorted.length < 1) {
      container.innerHTML = `<span class="text-xs text-stone-400">Aún no hay suficientes mediciones.</span>`;
      return;
    }

    const width = 600;
    const height = 180;
    const padTop = 20;
    const padBottom = 30;
    const padLeft = 45;
    const padRight = 25;

    const chartW = width - padLeft - padRight;
    const chartH = height - padTop - padBottom;

    const minY = 40;
    const maxY = 260;

    const getY = (val) => {
      const clamped = Math.max(minY, Math.min(maxY, val));
      return height - padBottom - ((clamped - minY) / (maxY - minY)) * chartH;
    };

    const getX = (idx, total) => {
      if (total <= 1) return padLeft + chartW / 2;
      return padLeft + (idx / (total - 1)) * chartW;
    };

    // Franja objetivo
    const targetYTop = getY(this.glucoseSettings.fastingMax);
    const targetYBottom = getY(this.glucoseSettings.fastingMin);
    const targetBandHeight = Math.max(4, targetYBottom - targetYTop);

    // Puntos de la serie
    const points = sorted.map((r, i) => {
      return {
        x: getX(i, sorted.length),
        y: getY(r.value),
        val: r.value,
        date: r.date,
        moment: r.moment,
        status: r.status
      };
    });

    const pathD = points.length > 1
      ? points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
      : '';

    const circlesSVG = points.map(p => {
      let fillColor = '#10b981'; // verde
      if (p.status === 'bajo') fillColor = '#0284c7'; // azul
      if (p.status === 'alto') fillColor = '#f59e0b'; // naranja
      return `
        <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4" fill="${fillColor}" stroke="#ffffff" stroke-width="2" class="glucose-chart-point">
          <title>${p.val} mg/dL (${p.moment}) - ${p.date}</title>
        </circle>
        <text x="${p.x.toFixed(1)}" y="${(p.y - 8).toFixed(1)}" font-size="9" font-weight="bold" fill="currentColor" text-anchor="middle" class="text-stone-700 dark:text-stone-300">
          ${p.val}
        </text>
      `;
    }).join('');

    const svg = `
      <svg viewBox="0 0 ${width} ${height}" class="w-full h-full select-none">
        <!-- Franja objetivo (Verde suave) -->
        <rect x="${padLeft}" y="${targetYTop}" width="${chartW}" height="${targetBandHeight}" fill="rgba(16, 185, 129, 0.12)" rx="4"/>
        
        <!-- Líneas guía horizontales -->
        <line x1="${padLeft}" y1="${getY(70)}" x2="${width - padRight}" y2="${getY(70)}" stroke="currentColor" stroke-dasharray="3,3" stroke-opacity="0.2"/>
        <text x="${padLeft - 6}" y="${getY(70) + 3}" font-size="9" fill="currentColor" opacity="0.5" text-anchor="end">70</text>

        <line x1="${padLeft}" y1="${getY(130)}" x2="${width - padRight}" y2="${getY(130)}" stroke="currentColor" stroke-dasharray="3,3" stroke-opacity="0.2"/>
        <text x="${padLeft - 6}" y="${getY(130) + 3}" font-size="9" fill="currentColor" opacity="0.5" text-anchor="end">130</text>

        <line x1="${padLeft}" y1="${getY(180)}" x2="${width - padRight}" y2="${getY(180)}" stroke="currentColor" stroke-dasharray="3,3" stroke-opacity="0.2"/>
        <text x="${padLeft - 6}" y="${getY(180) + 3}" font-size="9" fill="currentColor" opacity="0.5" text-anchor="end">180</text>

        <!-- Línea conectora de mediciones -->
        ${pathD ? `<path d="${pathD}" fill="none" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.85"/>` : ''}

        <!-- Puntos y valores -->
        ${circlesSVG}
      </svg>
    `;

    container.innerHTML = svg;
  }

  openGlucoseRecordModal() {
    const modal = document.getElementById('glucose-record-modal');
    if (!modal) return;

    const valInput = document.getElementById('glucose-input-value');
    const dateInput = document.getElementById('glucose-input-date');
    const timeInput = document.getElementById('glucose-input-time');
    const mealInput = document.getElementById('glucose-input-meal');
    const notesInput = document.getElementById('glucose-input-notes');

    if (valInput) valInput.value = '';
    if (dateInput) dateInput.value = this.formatDateISO(new Date());
    if (timeInput) {
      const now = new Date();
      timeInput.value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    }
    if (mealInput) mealInput.value = '';
    if (notesInput) notesInput.value = '';

    modal.classList.remove('hidden');
    if (valInput) valInput.focus();
  }

  closeGlucoseRecordModal() {
    const modal = document.getElementById('glucose-record-modal');
    if (modal) modal.classList.add('hidden');
  }

  async saveGlucoseRecord() {
    const valInput = document.getElementById('glucose-input-value');
    const dateInput = document.getElementById('glucose-input-date');
    const timeInput = document.getElementById('glucose-input-time');
    const momentInput = document.getElementById('glucose-input-moment');
    const mealInput = document.getElementById('glucose-input-meal');
    const notesInput = document.getElementById('glucose-input-notes');

    const value = parseInt(valInput?.value, 10);
    if (!value || isNaN(value) || value <= 0) {
      this.showToast('Por favor, ingresá un valor numérico de glucosa');
      return;
    }

    const moment = momentInput?.value || 'ayunas';
    const date = dateInput?.value || this.formatDateISO(new Date());
    const time = timeInput?.value || '';
    const meal = mealInput?.value?.trim() || '';
    const notes = notesInput?.value?.trim() || '';

    // Evaluar estado según rangos de referencia personales
    let status = 'en_rango';
    if (moment === 'ayunas' || moment === 'pre_almuerzo' || moment === 'pre_cena') {
      if (value < this.glucoseSettings.fastingMin) status = 'bajo';
      else if (value > this.glucoseSettings.fastingMax) status = 'alto';
    } else if (moment === 'post_almuerzo' || moment === 'post_cena') {
      if (value < 70) status = 'bajo';
      else if (value > this.glucoseSettings.postMax) status = 'alto';
    } else {
      if (value < this.glucoseSettings.fastingMin) status = 'bajo';
      else if (value > this.glucoseSettings.postMax) status = 'alto';
    }

    await db.addWellnessRecord({
      type: 'glucose',
      value,
      moment,
      date,
      time,
      meal,
      notes,
      status
    });

    this.closeGlucoseRecordModal();
    this.renderGlucoseSubpanel();
    this.showToast('Medición de glucosa guardada con éxito');
  }

  async deleteGlucoseRecord(id) {
    if (confirm('¿Querés eliminar esta medición de glucosa?')) {
      await db.deleteWellnessRecord(id);
      this.renderGlucoseSubpanel();
      this.showToast('Medición eliminada');
    }
  }

  openGlucoseSettingsModal() {
    const modal = document.getElementById('glucose-settings-modal');
    if (!modal) return;
    const fMin = document.getElementById('range-fasting-min');
    const fMax = document.getElementById('range-fasting-max');
    const pMax = document.getElementById('range-post-max');
    if (fMin) fMin.value = this.glucoseSettings.fastingMin;
    if (fMax) fMax.value = this.glucoseSettings.fastingMax;
    if (pMax) pMax.value = this.glucoseSettings.postMax;
    modal.classList.remove('hidden');
  }

  closeGlucoseSettingsModal() {
    const modal = document.getElementById('glucose-settings-modal');
    if (modal) modal.classList.add('hidden');
  }

  async saveGlucoseSettings() {
    const fMin = parseInt(document.getElementById('range-fasting-min')?.value, 10) || 70;
    const fMax = parseInt(document.getElementById('range-fasting-max')?.value, 10) || 130;
    const pMax = parseInt(document.getElementById('range-post-max')?.value, 10) || 180;

    this.glucoseSettings = { fastingMin: fMin, fastingMax: fMax, postMax: pMax };
    await db.setSetting('glucose_ranges', this.glucoseSettings);
    this.closeGlucoseSettingsModal();
    this.renderGlucoseSubpanel();
    this.showToast('Rangos de referencia actualizados');
  }

  // ==================== SUB-PANEL: ACTIVIDAD & HÁBITOS (SECCIÓN 17) ====================
  async renderActivitySubpanel() {
    const activities = await db.getWellnessRecords({ type: 'activity' });

    // Calcular minutos activos esta semana
    const now = new Date();
    const dayOfWeek = (now.getDay() + 6) % 7;
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfWeekISO = this.formatDateISO(startOfWeek);

    const weekActivities = activities.filter(a => a.date >= startOfWeekISO);
    const totalMinutes = weekActivities.reduce((acc, a) => acc + (parseInt(a.durationMinutes, 10) || 0), 0);
    const uniqueDays = new Set(weekActivities.map(a => a.date)).size;

    const minLabel = document.getElementById('label-activity-minutes');
    const daysLabel = document.getElementById('label-activity-days');
    if (minLabel) minLabel.textContent = totalMinutes;
    if (daysLabel) daysLabel.textContent = uniqueDays;

    // Renderizar metas amables cotidianas
    this.renderHabitGoals();

    // Renderizar lista de actividades registradas
    const listContainer = document.getElementById('activity-records-list');
    if (listContainer) {
      if (activities.length === 0) {
        listContainer.innerHTML = `
          <div class="p-8 text-center text-stone-400 bg-stone-50 dark:bg-stone-900/50 rounded-2xl border border-dashed border-stone-200 dark:border-stone-800">
            <span class="text-3xl block mb-2">🏃</span>
            <p class="text-xs font-medium text-stone-600 dark:text-stone-300">Aún no registraste actividades de movimiento.</p>
            <p class="text-[11px] text-stone-400 mt-0.5">Podés anotar un paseo, bicicleta o baile cuando quieras con "+ Nueva Actividad".</p>
          </div>
        `;
      } else {
        const typeIcons = {
          'caminata': '🚶',
          'bicicleta': '🚲',
          'baile': '💃',
          'yoga': '🧘',
          'tareas_hogar': '🧹',
          'fuerza_gym': '🏋️',
          'natacion': '🏊',
          'deportes': '⚽',
          'otro': '✨'
        };

        listContainer.innerHTML = activities.map(a => `
          <div class="p-4 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-sm flex items-center justify-between gap-3">
            <div class="flex items-center gap-3">
              <span class="text-2xl">${typeIcons[a.activityType] || '🏃'}</span>
              <div>
                <div class="flex items-center gap-2">
                  <span class="text-xs font-bold text-stone-900 dark:text-white capitalize">
                    ${a.activityName || a.activityType}
                  </span>
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                    ${a.durationMinutes} min
                  </span>
                  <span class="text-[11px] text-stone-400">• Intensidad ${a.intensity || 'moderada'}</span>
                </div>
                <div class="text-[11px] text-stone-500 mt-0.5 flex items-center gap-2">
                  <span>📅 ${a.date}</span>
                  ${a.feeling ? `<span>${this.formatFeelingBadge(a.feeling)}</span>` : ''}
                </div>
                ${a.notes ? `<p class="text-[11px] text-stone-600 dark:text-stone-400 italic mt-0.5">"${a.notes}"</p>` : ''}
              </div>
            </div>
            <button onclick="app.deleteActivityRecord('${a.id}')" title="Eliminar actividad" class="p-1.5 rounded-xl text-stone-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
              🗑️
            </button>
          </div>
        `).join('');
      }
    }
  }

  formatFeelingBadge(feeling) {
    if (feeling === 'energia') return '⚡ Con energía';
    if (feeling === 'relajado') return '😌 En calma';
    if (feeling === 'satisfecho') return '😊 Satisfecho/a';
    if (feeling === 'cansado_bien') return '🥱 Cansado/a bien';
    return '';
  }

  renderHabitGoals() {
    const container = document.getElementById('habit-goals-list');
    if (!container) return;

    container.innerHTML = this.habits.map(h => `
      <div onclick="app.toggleHabitGoal('${h.id}')" class="cursor-pointer p-3 rounded-2xl border transition-all flex items-center justify-between gap-2 ${
        h.done
          ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
          : 'bg-stone-50 dark:bg-stone-900/60 border-stone-200 dark:border-stone-700/80 hover:border-brand-300'
      }">
        <div class="flex items-center gap-2.5">
          <span class="text-xl">${h.icon || '🌱'}</span>
          <span class="text-xs font-semibold text-stone-800 dark:text-stone-200 ${h.done ? 'line-through opacity-70' : ''}">
            ${h.name}
          </span>
        </div>
        <div class="w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
          h.done
            ? 'bg-emerald-600 border-emerald-600 text-white'
            : 'border-stone-300 dark:border-stone-600'
        }">
          ${h.done ? '✓' : ''}
        </div>
      </div>
    `).join('');
  }

  async toggleHabitGoal(habitId) {
    const habit = this.habits.find(h => h.id === habitId);
    if (!habit) return;
    habit.done = !habit.done;
    await db.setSetting('habits', this.habits);
    this.renderHabitGoals();
    if (habit.done) {
      this.showToast(`¡Excelente! Cumpliste: ${habit.name}`);
    }
  }

  openActivityRecordModal() {
    const modal = document.getElementById('activity-record-modal');
    if (modal) modal.classList.remove('hidden');
  }

  closeActivityRecordModal() {
    const modal = document.getElementById('activity-record-modal');
    if (modal) modal.classList.add('hidden');
  }

  async saveActivityRecord() {
    const typeSel = document.getElementById('activity-input-type');
    const durInput = document.getElementById('activity-input-duration');
    const intensitySel = document.getElementById('activity-input-intensity');
    const feelingSel = document.getElementById('activity-input-feeling');
    const notesInput = document.getElementById('activity-input-notes');

    const activityType = typeSel?.value || 'caminata';
    const activityName = typeSel?.options[typeSel.selectedIndex]?.text?.split(' ')[1] || activityType;
    const durationMinutes = parseInt(durInput?.value, 10) || 20;
    const intensity = intensitySel?.value || 'moderada';
    const feeling = feelingSel?.value || 'relajado';
    const notes = notesInput?.value?.trim() || '';

    await db.addWellnessRecord({
      type: 'activity',
      activityType,
      activityName,
      durationMinutes,
      intensity,
      feeling,
      notes,
      date: this.formatDateISO(new Date())
    });

    this.closeActivityRecordModal();
    this.renderActivitySubpanel();
    this.showToast('¡Movimiento registrado con éxito!');
  }

  async deleteActivityRecord(id) {
    if (confirm('¿Deseás borrar este registro de actividad?')) {
      await db.deleteWellnessRecord(id);
      this.renderActivitySubpanel();
      this.showToast('Registro eliminado');
    }
  }

  openAddGoalModal() {
    const modal = document.getElementById('goal-modal');
    if (modal) modal.classList.remove('hidden');
  }

  closeAddGoalModal() {
    const modal = document.getElementById('goal-modal');
    if (modal) modal.classList.add('hidden');
  }

  async saveCustomGoal() {
    const nameInput = document.getElementById('goal-input-name');
    const iconInput = document.getElementById('goal-input-icon');
    const name = nameInput?.value?.trim();
    if (!name) return;

    const icon = iconInput?.value?.trim() || '🌱';
    const newGoal = {
      id: 'habit_' + Date.now(),
      name,
      icon,
      done: false
    };

    this.habits.push(newGoal);
    await db.setSetting('habits', this.habits);
    if (nameInput) nameInput.value = '';
    this.closeAddGoalModal();
    this.renderHabitGoals();
    this.showToast('Nueva meta agregada');
  }

  // ==================== SUB-PANEL: MI ESPACIO (EMOCIONAL Y PRIVADO - SECCIÓN 18) ====================
  selectMood(key, emoji, label) {
    this.selectedMood = { key, emoji, label };
    document.querySelectorAll('.mood-btn').forEach(btn => {
      if (btn.getAttribute('data-mood') === key) {
        btn.className = 'mood-btn p-2.5 rounded-2xl border-2 border-purple-500 bg-purple-50 dark:bg-purple-950/40 flex flex-col items-center gap-1 transition-all text-center';
      } else {
        btn.className = 'mood-btn p-2.5 rounded-2xl border border-stone-200 dark:border-stone-700 flex flex-col items-center gap-1 hover:border-purple-300 transition-all text-center';
      }
    });
  }

  async saveEmotionalRecord() {
    const textArea = document.getElementById('emotional-journal-text');
    const text = textArea?.value?.trim() || '';
    const sleepRadios = document.getElementsByName('sleep_factor');
    let sleepFactor = 'bueno';
    for (const r of sleepRadios) {
      if (r.checked) {
        sleepFactor = r.value;
        break;
      }
    }

    if (!this.selectedMood) {
      this.selectedMood = { key: 'calma', emoji: '😌', label: 'En calma' };
    }

    await db.addEmotionalRecord({
      mood: this.selectedMood.key,
      moodEmoji: this.selectedMood.emoji,
      moodLabel: this.selectedMood.label,
      sleepFactor,
      notes: text,
      date: this.formatDateISO(new Date())
    });

    if (textArea) textArea.value = '';
    this.renderEmotionalSubpanel();
    this.showToast('Reflexión guardada en tu espacio privado');
  }

  async renderEmotionalSubpanel() {
    const records = await db.getEmotionalRecords();
    const list = document.getElementById('emotional-records-list');
    if (!list) return;

    if (records.length === 0) {
      list.innerHTML = `
        <div class="p-8 text-center text-stone-400 bg-stone-50 dark:bg-stone-900/50 rounded-2xl border border-dashed border-stone-200 dark:border-stone-800">
          <span class="text-3xl block mb-2">🧘</span>
          <p class="text-xs font-medium text-stone-600 dark:text-stone-300">Tu espacio está listo para cuando quieras escribir.</p>
          <p class="text-[11px] text-stone-400 mt-0.5">Elegí cómo te sentís hoy y anotá una reflexión para vos.</p>
        </div>
      `;
      return;
    }

    const sleepLabels = {
      'bueno': '🛌 Buen descanso',
      'regular': '😴 Sueño regular',
      'poco': '☕ Poco sueño'
    };

    list.innerHTML = records.map(r => `
      <div class="p-4 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-sm flex items-start justify-between gap-3">
        <div class="flex items-start gap-3">
          <span class="text-3xl">${r.moodEmoji || '😌'}</span>
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-stone-900 dark:text-white">${r.moodLabel || 'En calma'}</span>
              <span class="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300">
                ${sleepLabels[r.sleepFactor] || 'Descanso'}
              </span>
              <span class="text-[11px] text-stone-400">📅 ${r.date}</span>
            </div>
            ${r.notes ? `<p class="text-xs text-stone-700 dark:text-stone-300 leading-relaxed mt-1">"${r.notes}"</p>` : ''}
          </div>
        </div>
        <button onclick="app.deleteEmotionalRecord('${r.id}')" title="Eliminar nota" class="p-1 rounded-xl text-stone-300 hover:text-red-500 transition-colors">
          ✕
        </button>
      </div>
    `).join('');
  }

  async deleteEmotionalRecord(id) {
    if (confirm('¿Eliminar esta nota privada?')) {
      await db.deleteEmotionalRecord(id);
      this.renderEmotionalSubpanel();
      this.showToast('Nota eliminada');
    }
  }

  async clearEmotionalRecords() {
    if (confirm('¿Deseás borrar todas tus reflexiones guardadas en este espacio?')) {
      const records = await db.getEmotionalRecords();
      for (const r of records) {
        await db.deleteEmotionalRecord(r.id);
      }
      this.renderEmotionalSubpanel();
      this.showToast('Notas emocionales borradas');
    }
  }

  // =========================================================================
  // ETAPA 5: RESUMEN PARA PROFESIONALES, BACKUP JSON & AJUSTES
  // =========================================================================

  renderSettingsView() {
    // Inicializar selectores con valores guardados
    const citySel = document.getElementById('settings-weather-city');
    if (citySel) citySel.value = this.weatherCity;
  }

  async previewProfessionalReport() {
    const periodSel = document.getElementById('report-period-select');
    const period = periodSel ? periodSel.value : '14';

    const incMeals = document.getElementById('report-include-meals')?.checked ?? true;
    const incGlucose = document.getElementById('report-include-glucose')?.checked ?? true;
    const incActivity = document.getElementById('report-include-activity')?.checked ?? true;
    const incEmotional = document.getElementById('report-include-emotional')?.checked ?? false;

    // Calcular fecha límite
    let startDate = '2000-01-01';
    const now = new Date();
    if (period !== 'all') {
      const days = parseInt(period, 10);
      const limit = new Date(now);
      limit.setDate(now.getDate() - days);
      startDate = this.formatDateISO(limit);
    }
    const todayISO = this.formatDateISO(now);

    // Recolectar datos
    const allFoodLogs = await db.getAllFoodLogs();
    const foodLogs = allFoodLogs.filter(l => l.date >= startDate && l.date <= todayISO);

    const allWellness = await db.getWellnessRecords();
    const glucoseRecords = allWellness.filter(w => w.type === 'glucose' && w.date >= startDate && w.date <= todayISO);
    const activityRecords = allWellness.filter(w => w.type === 'activity' && w.date >= startDate && w.date <= todayISO);

    const allEmotional = await db.getEmotionalRecords();
    const emotionalRecords = allEmotional.filter(e => e.date >= startDate && e.date <= todayISO);

    // Estadísticas de Glucosa
    let glucoseStatsHTML = '';
    if (incGlucose && glucoseRecords.length > 0) {
      const total = glucoseRecords.length;
      const sum = glucoseRecords.reduce((acc, r) => acc + r.value, 0);
      const avg = Math.round(sum / total);
      const min = Math.min(...glucoseRecords.map(r => r.value));
      const max = Math.max(...glucoseRecords.map(r => r.value));
      const inRange = glucoseRecords.filter(r => r.status === 'en_rango').length;
      const inRangePct = Math.round((inRange / total) * 100);

      glucoseStatsHTML = `
        <div class="mb-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs">
          <h4 class="font-bold text-emerald-950 mb-2 text-sm">Resumen Estadístico de Glucosa</h4>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div><span class="text-stone-500">Mediciones:</span> <strong class="text-stone-900">${total}</strong></div>
            <div><span class="text-stone-500">Promedio:</span> <strong class="text-stone-900">${avg} mg/dL</strong></div>
            <div><span class="text-stone-500">Mín / Máx:</span> <strong class="text-stone-900">${min} / ${max} mg/dL</strong></div>
            <div><span class="text-stone-500">En Rango Objetivo:</span> <strong class="text-emerald-700">${inRangePct}% (${inRange}/${total})</strong></div>
          </div>
        </div>
      `;
    }

    // Tabla de Glucosa
    let glucoseTableHTML = '';
    if (incGlucose) {
      glucoseTableHTML = `
        <div class="space-y-2">
          <h4 class="font-bold text-sm text-stone-900 border-b pb-1">Seguimiento de Glucosa</h4>
          ${glucoseStatsHTML}
          ${glucoseRecords.length === 0 ? '<p class="text-xs text-stone-400">Sin registros de glucosa en el período seleccionado.</p>' : `
            <table class="w-full text-xs text-left border-collapse border border-stone-200">
              <thead>
                <tr class="bg-stone-100 text-stone-700">
                  <th class="p-2 border border-stone-200">Fecha y Hora</th>
                  <th class="p-2 border border-stone-200">Momento</th>
                  <th class="p-2 border border-stone-200">Valor</th>
                  <th class="p-2 border border-stone-200">Estado</th>
                  <th class="p-2 border border-stone-200">Comida Vinculada / Notas</th>
                </tr>
              </thead>
              <tbody>
                ${glucoseRecords.map(r => `
                  <tr>
                    <td class="p-2 border border-stone-200">${r.date} ${r.time || ''}</td>
                    <td class="p-2 border border-stone-200">${r.moment}</td>
                    <td class="p-2 border border-stone-200 font-bold">${r.value} mg/dL</td>
                    <td class="p-2 border border-stone-200">${r.status === 'en_rango' ? 'En rango' : (r.status === 'bajo' ? 'Bajo' : 'Alto')}</td>
                    <td class="p-2 border border-stone-200">${r.meal ? '🍽️ ' + r.meal : ''} ${r.notes ? ' • ' + r.notes : ''}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `}
        </div>
      `;
    }

    // Tabla de Comidas
    let mealsTableHTML = '';
    if (incMeals) {
      // Agrupar por fecha
      const grouped = {};
      foodLogs.forEach(l => {
        if (!grouped[l.date]) grouped[l.date] = [];
        grouped[l.date].push(l);
      });

      const dates = Object.keys(grouped).sort().reverse();

      mealsTableHTML = `
        <div class="space-y-2">
          <h4 class="font-bold text-sm text-stone-900 border-b pb-1">Registro de Comidas Consumidas</h4>
          ${dates.length === 0 ? '<p class="text-xs text-stone-400">Sin comidas registradas en el período.</p>' : `
            <table class="w-full text-xs text-left border-collapse border border-stone-200">
              <thead>
                <tr class="bg-stone-100 text-stone-700">
                  <th class="p-2 border border-stone-200">Fecha</th>
                  <th class="p-2 border border-stone-200">Momento</th>
                  <th class="p-2 border border-stone-200">Alimento / Receta</th>
                  <th class="p-2 border border-stone-200">Carbohidratos Est.</th>
                  <th class="p-2 border border-stone-200">Notas</th>
                </tr>
              </thead>
              <tbody>
                ${dates.map(d => grouped[d].map(l => `
                  <tr>
                    <td class="p-2 border border-stone-200">${d}</td>
                    <td class="p-2 border border-stone-200 font-semibold uppercase text-[10px]">${l.mealType || 'Comida'}</td>
                    <td class="p-2 border border-stone-200 font-medium">${l.recipeName || l.customFood || 'Comida'}</td>
                    <td class="p-2 border border-stone-200">${l.carbs ? l.carbs + ' g' : '-'}</td>
                    <td class="p-2 border border-stone-200">${l.notes || '-'}</td>
                  </tr>
                `).join('')).join('')}
              </tbody>
            </table>
          `}
        </div>
      `;
    }

    // Tabla de Actividad Física
    let activityTableHTML = '';
    if (incActivity) {
      const totalMin = activityRecords.reduce((acc, a) => acc + (parseInt(a.durationMinutes, 10) || 0), 0);
      activityTableHTML = `
        <div class="space-y-2">
          <h4 class="font-bold text-sm text-stone-900 border-b pb-1">
            Actividad Física y Hábitos (Total: ${totalMin} min)
          </h4>
          ${activityRecords.length === 0 ? '<p class="text-xs text-stone-400">Sin actividades registradas en el período.</p>' : `
            <table class="w-full text-xs text-left border-collapse border border-stone-200">
              <thead>
                <tr class="bg-stone-100 text-stone-700">
                  <th class="p-2 border border-stone-200">Fecha</th>
                  <th class="p-2 border border-stone-200">Actividad</th>
                  <th class="p-2 border border-stone-200">Duración</th>
                  <th class="p-2 border border-stone-200">Intensidad</th>
                  <th class="p-2 border border-stone-200">Sensación / Notas</th>
                </tr>
              </thead>
              <tbody>
                ${activityRecords.map(a => `
                  <tr>
                    <td class="p-2 border border-stone-200">${a.date}</td>
                    <td class="p-2 border border-stone-200 font-medium">${a.activityName || a.activityType}</td>
                    <td class="p-2 border border-stone-200 font-bold">${a.durationMinutes} min</td>
                    <td class="p-2 border border-stone-200">${a.intensity || 'Moderada'}</td>
                    <td class="p-2 border border-stone-200">${a.feeling || ''} ${a.notes ? '• ' + a.notes : ''}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `}
        </div>
      `;
    }

    // Notas emocionales (si el usuario las pidió)
    let emotionalHTML = '';
    if (incEmotional && emotionalRecords.length > 0) {
      emotionalHTML = `
        <div class="space-y-2">
          <h4 class="font-bold text-sm text-stone-900 border-b pb-1">Reflexiones y Estado Emocional (Opcional)</h4>
          <div class="space-y-1.5 text-xs">
            ${emotionalRecords.map(e => `
              <div class="p-2 bg-stone-50 rounded border border-stone-200">
                <strong>${e.date}:</strong> ${e.moodEmoji || ''} ${e.moodLabel || ''} ${e.notes ? `— "${e.notes}"` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // Ensamblar informe completo
    const reportHTML = `
      <div class="print-header space-y-2 pb-4 border-b-2 border-brand-600">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-xl font-bold text-stone-900">DíaSano • Reporte Personal de Alimentación y Salud</h2>
            <p class="text-xs text-stone-500">Período: ${startDate} al ${todayISO} • Generado el ${new Date().toLocaleDateString('es-AR')}</p>
          </div>
          <div class="text-right text-[10px] text-stone-400">
            <span>Uso personal y para profesionales</span>
          </div>
        </div>
        <p class="text-[11px] text-stone-600 italic">
          Documento orientado a facilitar la consulta con su médico clínico, diabetólogo o nutricionista. Los datos reflejan registros personales del usuario.
        </p>
      </div>

      <div class="space-y-6 pt-4">
        ${mealsTableHTML}
        ${glucoseTableHTML}
        ${activityTableHTML}
        ${emotionalHTML}
      </div>

      <div class="pt-8 border-t border-stone-200 text-center text-[10px] text-stone-400">
        Generado con DíaSano (diasano.app) • Aplicación gratuita y privada de organización alimentaria y bienestar.
      </div>
    `;

    const previewContainer = document.getElementById('report-printable-content');
    if (previewContainer) {
      previewContainer.innerHTML = reportHTML;
    }

    // Guardar texto plano para copiar
    this.latestReportPlainText = this.generatePlainTextReport({
      startDate,
      todayISO,
      foodLogs,
      glucoseRecords,
      activityRecords,
      emotionalRecords,
      incMeals,
      incGlucose,
      incActivity,
      incEmotional
    });

    const modal = document.getElementById('modal-report-preview');
    if (modal) modal.classList.remove('hidden');
  }

  generatePlainTextReport(data) {
    let lines = [];
    lines.push('===========================================================');
    lines.push('DÍASANO • RESUMEN PERSONAL DE ALIMENTACIÓN Y SALUD');
    lines.push(`Período: ${data.startDate} al ${data.todayISO}`);
    lines.push(`Generado: ${new Date().toLocaleString('es-AR')}`);
    lines.push('===========================================================');
    lines.push('');

    if (data.incGlucose && data.glucoseRecords.length > 0) {
      const total = data.glucoseRecords.length;
      const avg = Math.round(data.glucoseRecords.reduce((acc, r) => acc + r.value, 0) / total);
      const inRange = data.glucoseRecords.filter(r => r.status === 'en_rango').length;
      lines.push('[SEGUIMIENTO DE GLUCOSA]');
      lines.push(`- Mediciones: ${total}`);
      lines.push(`- Promedio: ${avg} mg/dL`);
      lines.push(`- Lecturas en rango objetivo: ${Math.round((inRange / total) * 100)}% (${inRange}/${total})`);
      lines.push('');
      data.glucoseRecords.forEach(r => {
        lines.push(`• ${r.date} ${r.time || ''} - ${r.value} mg/dL (${r.moment}) [${r.status}] ${r.meal ? 'Comida: ' + r.meal : ''}`);
      });
      lines.push('');
    }

    if (data.incMeals && data.foodLogs.length > 0) {
      lines.push('[COMIDAS REGISTRADAS]');
      data.foodLogs.forEach(l => {
        lines.push(`• ${l.date} [${l.mealType || 'Comida'}]: ${l.recipeName || l.customFood} (${l.carbs ? l.carbs + 'g carb' : ''})`);
      });
      lines.push('');
    }

    if (data.incActivity && data.activityRecords.length > 0) {
      const totalMin = data.activityRecords.reduce((acc, a) => acc + (parseInt(a.durationMinutes, 10) || 0), 0);
      lines.push(`[ACTIVIDAD FÍSICA - Total: ${totalMin} min]`);
      data.activityRecords.forEach(a => {
        lines.push(`• ${a.date}: ${a.activityName || a.activityType} (${a.durationMinutes} min) - ${a.feeling || ''}`);
      });
      lines.push('');
    }

    lines.push('===========================================================');
    lines.push('DíaSano • La aplicación decide con vos, no por vos.');
    return lines.join('\n');
  }

  copyReportText() {
    if (!this.latestReportPlainText) return;
    navigator.clipboard.writeText(this.latestReportPlainText).then(() => {
      this.showToast('Reporte copiado al portapapeles');
    }).catch(() => {
      this.showToast('No se pudo copiar automáticamente');
    });
  }

  closeReportPreviewModal() {
    const modal = document.getElementById('modal-report-preview');
    if (modal) modal.classList.add('hidden');
  }

  // ==================== COPIA DE SEGURIDAD Y RESTAURACIÓN (JSON) ====================
  async exportBackupJSON() {
    try {
      const backup = await db.exportAllData();
      const jsonStr = JSON.stringify(backup, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const today = this.formatDateISO(new Date());
      const a = document.createElement('a');
      a.href = url;
      a.download = `diasano_respaldo_${today}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      this.showToast('Copia de seguridad descargada correctamente');
    } catch (e) {
      console.error('Error exportando respaldo:', e);
      this.showToast('Error al generar la copia de seguridad');
    }
  }

  async importBackupJSON(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const json = JSON.parse(e.target.result);
          await db.importAllData(json);
          this.showToast('Datos restaurados con éxito');
          setTimeout(() => location.reload(), 1200);
        } catch (err) {
          alert('El archivo no parece ser una copia de seguridad válida de DíaSano.');
        }
      };
      reader.readAsText(file);
    } catch (e) {
      this.showToast('Error al leer el archivo');
    }
  }

  // ==================== RECORDATORIOS Y PREFERENCIAS (SECCIONES 19 Y 23) ====================
  async loadReminderSettings() {
    const rem = await db.getSetting('reminders', { plan: true, planTime: '20:30', water: true, glucose: false });
    const checkPlan = document.getElementById('reminder-check-plan');
    const timePlan = document.getElementById('reminder-time-plan');
    const checkWater = document.getElementById('reminder-check-water');
    const checkGlucose = document.getElementById('reminder-check-glucose');

    if (checkPlan) checkPlan.checked = rem.plan ?? true;
    if (timePlan) timePlan.value = rem.planTime || '20:30';
    if (checkWater) checkWater.checked = rem.water ?? true;
    if (checkGlucose) checkGlucose.checked = rem.glucose ?? false;
  }

  async saveReminderSettings() {
    const checkPlan = document.getElementById('reminder-check-plan')?.checked ?? true;
    const timePlan = document.getElementById('reminder-time-plan')?.value || '20:30';
    const checkWater = document.getElementById('reminder-check-water')?.checked ?? true;
    const checkGlucose = document.getElementById('reminder-check-glucose')?.checked ?? false;

    await db.setSetting('reminders', {
      plan: checkPlan,
      planTime: timePlan,
      water: checkWater,
      glucose: checkGlucose
    });
    this.showToast('Preferencias de recordatorios actualizadas');
  }

  async requestNotificationPermission() {
    if (!('Notification' in window)) {
      alert('Tu navegador no tiene soporte para notificaciones web locales.');
      return;
    }

    try {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        new Notification('DíaSano', {
          body: '¡Notificaciones habilitadas! Te recordaremos tus momentos clave.',
          icon: 'icons/icon.svg'
        });
        this.showToast('Notificaciones habilitadas');
      } else {
        this.showToast('Permiso de notificaciones no otorgado');
      }
    } catch (e) {
      this.showToast('No se pudo solicitar permiso');
    }
  }

  async loadModulePreferences() {
    const prefs = await db.getSetting('module_preferences', { glucose: true, emotional: true });
    const prefGluc = document.getElementById('pref-show-glucose');
    const prefEmo = document.getElementById('pref-show-emotional');

    if (prefGluc) prefGluc.checked = prefs.glucose ?? true;
    if (prefEmo) prefEmo.checked = prefs.emotional ?? true;

    this.applyModuleVisibility(prefs);
  }

  async saveModulePreferences() {
    const prefGluc = document.getElementById('pref-show-glucose')?.checked ?? true;
    const prefEmo = document.getElementById('pref-show-emotional')?.checked ?? true;

    const prefs = { glucose: prefGluc, emotional: prefEmo };
    await db.setSetting('module_preferences', prefs);
    this.applyModuleVisibility(prefs);
    this.showToast('Preferencias guardadas');
  }

  applyModuleVisibility(prefs) {
    const glucoseBtn = document.getElementById('wellness-subtab-btn-glucose');
    const emotionalBtn = document.getElementById('wellness-subtab-btn-emotional');

    if (glucoseBtn) {
      glucoseBtn.style.display = prefs.glucose === false ? 'none' : 'block';
    }
    if (emotionalBtn) {
      emotionalBtn.style.display = prefs.emotional === false ? 'none' : 'block';
    }
  }

  // ==================== ZONA DE PRIVACIDAD: BORRADO TOTAL ====================
  openClearDataModal() {
    const modal = document.getElementById('clear-data-modal');
    const input = document.getElementById('clear-data-confirm-input');
    if (input) input.value = '';
    if (modal) modal.classList.remove('hidden');
  }

  closeClearDataModal() {
    const modal = document.getElementById('clear-data-modal');
    if (modal) modal.classList.add('hidden');
  }

  async executeClearData() {
    const input = document.getElementById('clear-data-confirm-input');
    if (input?.value?.trim() !== 'BORRAR') {
      alert('Debés escribir la palabra BORRAR para confirmar.');
      return;
    }

    await db.clearAllUserData();
    this.closeClearDataModal();
    this.showToast('Todos tus datos locales han sido eliminados');
    setTimeout(() => {
      location.reload();
    }, 1200);
  }

  // ==================== MENÚ "MÁS" PARA MÓVIL ====================
  openMoreMenu() {
    const modal = document.getElementById('more-menu-modal');
    if (modal) modal.classList.remove('hidden');
  }

  closeMoreMenu() {
    const modal = document.getElementById('more-menu-modal');
    if (modal) modal.classList.add('hidden');
  }

  showToast(message) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-message');
    if (!toast || !toastMsg) return;

    toastMsg.textContent = message;
    toast.classList.remove('opacity-0');
    toast.classList.add('opacity-100');

    setTimeout(() => {
      toast.classList.remove('opacity-100');
      toast.classList.add('opacity-0');
    }, 2500);
  }
}

// Instancia global
window.app = new DiaSanoApp();
