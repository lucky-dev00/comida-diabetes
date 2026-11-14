/**
 * DíaSano - Catálogo Inicial de 50 Recetas Cotidianas y Accesibles (Argentina)
 * Diseñado con ingredientes comunes, económicos y preparaciones realistas.
 * Valores nutricionales y carbohidratos expresados como ESTIMACIONES por porción base.
 */

const INITIAL_RECIPES = [
  // ==================== ALMUERZO / CENA ====================
  {
    id: "rec-01",
    name: "Milanesas de pollo al horno con puré de calabaza",
    category: "almuerzo",
    image: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=700&q=80",
    timePrep: 15,
    timeCook: 25,
    defaultServings: 2,
    difficulty: "Fácil",
    costLevel: "Económico",
    estimatedCarbsPerServing: 28,
    estimatedCaloriesPerServing: 380,
    tags: ["economica", "clasica", "con_horno"],
    ingredients: [
      { name: "Pechuga de pollo fileteada", amount: 350, unit: "g" },
      { name: "Huevo", amount: 1, unit: "unidad" },
      { name: "Pan rallado o avena extrafina", amount: 70, unit: "g" },
      { name: "Calabaza (tipo anco o kabutiá)", amount: 500, unit: "g" },
      { name: "Aceite de girasol o maíz", amount: 1, unit: "cda" },
      { name: "Ajo picado, perejil, sal y pimienta", amount: 1, unit: "al gusto" }
    ],
    instructions: [
      "Pelar y cortar la calabaza en cubos. Cocinarla al vapor o hervir en agua con poca sal hasta que esté tierna.",
      "Batir el huevo con el ajo picado, perejil, sal y pimienta en un plato hondo.",
      "Pasar los filetes de pollo por el huevo batido y luego empanar bien con el pan rallado (o avena).",
      "Colocar las milanesas en una asadera apenas aceitada y hornear a 200°C durante 12-15 minutos por lado hasta que estén doradas.",
      "Pisar la calabaza caliente con una pizca de sal, pimienta y 1 cucharada de aceite hasta lograr un puré suave.",
      "Servir la milanesa caliente junto a la porción de puré."
    ],
    substitutions: [
      { original: "Pechuga de pollo", substitute: "Bifes de nalga o bola de lomo / Berenjenas en rodajas", note: "La berenjena es una opción vegetariana económica y baja en carbohidratos.", carbImpact: "Neutro o menor con berenjena" },
      { original: "Pan rallado", substitute: "Avena instantánea procesada o salvado", note: "Aporta mayor fibra y saciedad.", carbImpact: "Similar, pero absorción más lenta" },
      { original: "Calabaza", substitute: "Papas o zanahorias", note: "El puré de papa tiene mayor proporción de carbohidratos que la calabaza.", carbImpact: "+15g carbohidratos con papa" }
    ]
  },
  {
    id: "rec-02",
    name: "Tarta de zapallitos casera",
    category: "cena",
    image: "https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=700&q=80",
    timePrep: 15,
    timeCook: 30,
    defaultServings: 4,
    difficulty: "Fácil",
    costLevel: "Muy económico",
    estimatedCarbsPerServing: 24,
    estimatedCaloriesPerServing: 290,
    tags: ["economica", "vegetariana", "con_horno", "rinde_mucho"],
    ingredients: [
      { name: "Masa para tarta (1 tapa)", amount: 1, unit: "unidad" },
      { name: "Zapallitos verdes redondos", amount: 4, unit: "unidades" },
      { name: "Cebolla mediana", amount: 1, unit: "unidad" },
      { name: "Huevos", amount: 3, unit: "unidades" },
      { name: "Queso cremoso o por salut", amount: 100, unit: "g" },
      { name: "Aceite", amount: 1, unit: "cda" },
      { name: "Orégano, sal y nuez moscada", amount: 1, unit: "al gusto" }
    ],
    instructions: [
      "Lavar y cortar los zapallitos en cubos pequeños, descartando el exceso de semillas si tienen mucha agua.",
      "Picar la cebolla y rehogarla en una sartén con la cucharada de aceite hasta que esté transparente.",
      "Sumar los zapallitos y cocinar a fuego medio durante 8-10 minutos. Escurrir bien el líquido que desprendan.",
      "Batir los 3 huevos en un bol, condimentar con sal, orégano y una pizca de nuez moscada.",
      "Incorporar los vegetales escurridos y el queso en cubitos al batido de huevo.",
      "Forrar una tartera con la masa, verter el relleno y hornear a 180°C durante 25-30 minutos hasta dorar."
    ],
    substitutions: [
      { original: "Zapallitos verdes", substitute: "Zucchinis o acelga cocida bien picada", note: "La acelga aporta hierro y no suelta tanta agua.", carbImpact: "Neutro" },
      { original: "Masa comprada", substitute: "Masa casera de avena y agua / Base sin masa (estilo frittata)", note: "Hacerla sin masa reduce significativamente los carbohidratos.", carbImpact: "-18g carbohidratos sin masa" }
    ]
  },
  {
    id: "rec-03",
    name: "Guiso de lentejas rendidor y reconfortante",
    category: "almuerzo",
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=700&q=80",
    timePrep: 15,
    timeCook: 40,
    defaultServings: 4,
    difficulty: "Fácil",
    costLevel: "Muy económico",
    estimatedCarbsPerServing: 42,
    estimatedCaloriesPerServing: 360,
    tags: ["economica", "sin_horno", "reconfortante", "rinde_mucho"],
    ingredients: [
      { name: "Lentejas secas (o 2 latas remojadas)", amount: 250, unit: "g" },
      { name: "Cebolla", amount: 1, unit: "unidad" },
      { name: "Zanahoria mediana", amount: 1, unit: "unidad" },
      { name: "Papa mediana", amount: 1, unit: "unidad" },
      { name: "Puré de tomate", amount: 250, unit: "g" },
      { name: "Carne picada o cubitos de paleta (opcional)", amount: 150, unit: "g", optional: true },
      { name: "Caldo o agua caliente", amount: 600, unit: "ml" },
      { name: "Pimentón dulce, laurel, sal y pimienta", amount: 1, unit: "al gusto" }
    ],
    instructions: [
      "En una olla con un chorrito de aceite, rehogar la cebolla y la zanahoria picadas junto con la carne (si se usa).",
      "Agregar la papa pelada cortada en cubos de 1.5 cm y mezclar 2 minutos.",
      "Incorporar las lentejas previamente enjuagadas, el puré de tomate y el laurel.",
      "Cubrir con el agua caliente o caldo, sumar el pimentón y llevar a ebullición.",
      "Bajar el fuego a medio-bajo, tapar la olla y cocinar durante 35-40 minutos hasta que las lentejas y papas estén tiernas.",
      "Rectificar la sal, apagar el fuego y dejar reposar 5 minutos antes de servir bien caliente."
    ],
    substitutions: [
      { original: "Carne vacuna", substitute: "Hojas de espinaca o cubos de calabaza", note: "Convierte el guiso en una opción 100% vegetariana y más económica.", carbImpact: "Neutro" },
      { original: "Lentejas secas", substitute: "Lentejas en lata", note: "Ahorra 25 minutos de cocción; agregalas en los últimos 10 minutos.", carbImpact: "Sin cambio" }
    ]
  },
  {
    id: "rec-04",
    name: "Tortilla de papas clásica con cebolla",
    category: "cena",
    image: "https://images.unsplash.com/photo-1628294895950-9805252327bc?auto=format&fit=crop&w=700&q=80",
    timePrep: 15,
    timeCook: 20,
    defaultServings: 3,
    difficulty: "Media",
    costLevel: "Muy económico",
    estimatedCarbsPerServing: 32,
    estimatedCaloriesPerServing: 310,
    tags: ["economica", "sin_horno", "clasica", "vegetariana"],
    ingredients: [
      { name: "Papas medianas", amount: 3, unit: "unidades" },
      { name: "Huevos grandes", amount: 4, unit: "unidades" },
      { name: "Cebolla", amount: 1, unit: "unidad" },
      { name: "Aceite para cocción", amount: 2, unit: "cdas" },
      { name: "Sal y pimienta", amount: 1, unit: "al gusto" }
    ],
    instructions: [
      "Pelar las papas y cortarlas en rodajas finas o dados pequeños. Picar la cebolla en juliana fina.",
      "En una sartén antiadherente con una cucharada de aceite, cocinar las papas y la cebolla tapadas a fuego suave, revolviendo ocasionalmente hasta que estén tiernas (método pochado económico).",
      "Batir los 4 huevos en un bol grande con sal y pimienta.",
      "Sumar las papas y cebolla calientes al huevo batido y dejar reposar 3 minutos para que absorba bien.",
      "Calentar una sartén con media cucharada de aceite, verter la mezcla y cocinar a fuego medio durante 4-5 minutos moviendo los bordes.",
      "Dar vuelta con ayuda de un plato plano y cocinar del otro lado por 3 minutos más según el punto deseado (jugosa o cocida)."
    ],
    substitutions: [
      { original: "Papas", substitute: "Mitad papa y mitad calabaza o zapallito", note: "Baja la carga glucémica y suma vitaminas.", carbImpact: "-10g carbohidratos" },
      { original: "Cebolla", substitute: "Cebolla de verdeo o puerro", note: "Aporta un sabor más suave y fresco.", carbImpact: "Neutro" }
    ]
  },
  {
    id: "rec-05",
    name: "Fideos secos con salsa fileto casera y queso",
    category: "almuerzo",
    image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=700&q=80",
    timePrep: 10,
    timeCook: 15,
    defaultServings: 2,
    difficulty: "Muy fácil",
    costLevel: "Muy económico",
    estimatedCarbsPerServing: 48,
    estimatedCaloriesPerServing: 340,
    tags: ["rapida", "economica", "sin_horno", "vegetariana"],
    ingredients: [
      { name: "Fideos secos (tallarines, tirabuzón o mostachol)", amount: 160, unit: "g" },
      { name: "Tomates maduros o puré de tomate", amount: 300, unit: "g" },
      { name: "Dientes de ajo", amount: 2, unit: "unidades" },
      { name: "Aceite", amount: 1, unit: "cda" },
      { name: "Orégano o albahaca, sal y pizca de azúcar", amount: 1, unit: "al gusto" },
      { name: "Queso rallado", amount: 20, unit: "g" }
    ],
    instructions: [
      "Poner a hervir abundante agua con un puñado de sal gruesa.",
      "En una cacerola pequeña, dorar los ajos picados en una cucharada de aceite sin quemar.",
      "Añadir el tomate triturado o puré, condimentos y cocinar a fuego medio por 10 minutos.",
      "Cocinar los fideos según las instrucciones del paquete hasta que estén 'al dente'.",
      "Colar la pasta reservando dos cucharadas del agua de cocción, mezclar con la salsa caliente.",
      "Servir con una lluvia de queso rallado por encima."
    ],
    substitutions: [
      { original: "Fideos comunes", substitute: "Fideos integrales o fideos de legumbres", note: "Brindan mayor saciedad y menor pico glucémico.", carbImpact: "Carbohidratos complejos de absorción lenta" },
      { original: "Queso rallado duro", substitute: "Cubitos de queso cremoso", note: "Se funde con la pasta caliente y rinde más.", carbImpact: "Neutro" }
    ]
  },
  {
    id: "rec-06",
    name: "Revuelto Gramajo casero y liviano",
    category: "cena",
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=700&q=80",
    timePrep: 10,
    timeCook: 15,
    defaultServings: 2,
    difficulty: "Fácil",
    costLevel: "Económico",
    estimatedCarbsPerServing: 20,
    estimatedCaloriesPerServing: 320,
    tags: ["rapida", "sin_horno", "clasica"],
    ingredients: [
      { name: "Huevos", amount: 3, unit: "unidades" },
      { name: "Papas bastón finas (al horno o sartén)", amount: 150, unit: "g" },
      { name: "Jamón cocido o paleta", amount: 80, unit: "g" },
      { name: "Arvejas (frescas o en lata)", amount: 50, unit: "g" },
      { name: "Cebolla chica picada", amount: 1, unit: "unidad" },
      { name: "Aceite", amount: 1, unit: "cda" },
      { name: "Sal y pimienta", amount: 1, unit: "al gusto" }
    ],
    instructions: [
      "Dorar la cebolla picada fina en una sartén con media cucharada de aceite.",
      "Agregar el jamón cortado en tiritas y saltear 1 minuto.",
      "Incorporar las arvejas y las papas ya cocidas y crocantes.",
      "Batir ligeramente los huevos con sal y pimienta.",
      "Verter los huevos en la sartén a fuego bajo y revolver suavemente con cuchara de madera durante 2-3 minutos para que queden cremosos y no secos.",
      "Servir enseguida mientras el huevo esté jugoso."
    ],
    substitutions: [
      { original: "Papas fritas tradicionales", substitute: "Papas al horno en tiritas con poco aceite", note: "Reduce grasas manteniendo todo el sabor porteño.", carbImpact: "Sin cambio" },
      { original: "Jamón cocido", substitute: "Tiritas de pollo cocido sobrante", note: "Excelente para aprovechar sobras de pollo.", carbImpact: "Neutro" }
    ]
  },
  {
    id: "rec-07",
    name: "Pastel de papa y carne tradicional",
    category: "almuerzo",
    image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=700&q=80",
    timePrep: 20,
    timeCook: 30,
    defaultServings: 4,
    difficulty: "Media",
    costLevel: "Económico",
    estimatedCarbsPerServing: 35,
    estimatedCaloriesPerServing: 420,
    tags: ["clasica", "con_horno", "reconfortante", "rinde_mucho"],
    ingredients: [
      { name: "Carne picada vacuna", amount: 350, unit: "g" },
      { name: "Papas medianas", amount: 4, unit: "unidades" },
      { name: "Cebolla", amount: 1, unit: "unidad" },
      { name: "Huevo duro picado", amount: 1, unit: "unidad" },
      { name: "Leche o agua para el puré", amount: 50, unit: "ml" },
      { name: "Aceite", amount: 1, unit: "cda" },
      { name: "Comino, pimentón dulce, sal y pimienta", amount: 1, unit: "al gusto" }
    ],
    instructions: [
      "Hervir las papas peladas en agua con sal hasta que estén bien tiernas. Pisar con un chorrito de leche y pizca de nuez moscada.",
      "En una sartén, saltear la cebolla picada con el aceite hasta ablandar.",
      "Sumar la carne picada y cocinar desmenuzando con cuchara de madera hasta que cambie de color.",
      "Condimentar con comino, pimentón, sal y pimienta. Fuera del fuego, mezclar el huevo duro picado.",
      "En una fuente para horno, colocar la base de carne y cubrir de manera pareja con el puré de papas.",
      "Marcar la superficie con un tenedor y gratinar en horno fuerte durante 15 minutos hasta dorar."
    ],
    substitutions: [
      { original: "Puré de papas", substitute: "Puré mixto de papa y calabaza", note: "Aporta color, fibra y reduce los carbohidratos totales.", carbImpact: "-12g carbohidratos" },
      { original: "Carne picada", substitute: "Lentejas cocidas con champiñones o soja texturizada", note: "Alternativa vegetal muy económica y rica en fibra.", carbImpact: "Mayor fibra" }
    ]
  },
  {
    id: "rec-08",
    name: "Arroz salteado express con huevo, zanahoria y arvejas",
    category: "cena",
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=700&q=80",
    timePrep: 5,
    timeCook: 10,
    defaultServings: 2,
    difficulty: "Muy fácil",
    costLevel: "Muy económico",
    estimatedCarbsPerServing: 38,
    estimatedCaloriesPerServing: 280,
    tags: ["rapida", "economica", "sin_horno", "aprovecha_sobras"],
    ingredients: [
      { name: "Arroz blanco o integral ya cocido", amount: 200, unit: "g" },
      { name: "Huevos", amount: 2, unit: "unidades" },
      { name: "Zanahoria rallada", amount: 1, unit: "unidad" },
      { name: "Arvejas (en lata o descongeladas)", amount: 50, unit: "g" },
      { name: "Aceite", amount: 1, unit: "cda" },
      { name: "Salsa de soja o sal", amount: 1, unit: "cda" }
    ],
    instructions: [
      "Calentar una sartén amplia con una cucharada de aceite.",
      "Saltear la zanahoria rallada por 2 minutos.",
      "Batir los huevos rápidamente y verterlos en un costado de la sartén, revolviendo hasta que coagulen como revuelto.",
      "Sumar el arroz cocido y las arvejas. Mezclar todo a fuego vivo.",
      "Condimentar con la salsa de soja o una pizca de sal, saltear 2 minutos más y servir caliente."
    ],
    substitutions: [
      { original: "Arroz cocido", substitute: "Fideos sobras cortaditos o quinoa", note: "Ideal para limpiar la heladera con lo que haya quedado.", carbImpact: "Similar" },
      { original: "Zanahoria", substitute: "Zapallito rallado o morrón", note: "Se adapta a cualquier verdura que tengas a mano.", carbImpact: "Neutro" }
    ]
  },
  {
    id: "rec-09",
    name: "Polenta cremosa con tuco rápido y queso",
    category: "cena",
    image: "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=700&q=80",
    timePrep: 5,
    timeCook: 15,
    defaultServings: 2,
    difficulty: "Muy fácil",
    costLevel: "Muy económico",
    estimatedCarbsPerServing: 44,
    estimatedCaloriesPerServing: 330,
    tags: ["rapida", "economica", "sin_horno", "reconfortante"],
    ingredients: [
      { name: "Polenta instantánea", amount: 120, unit: "g" },
      { name: "Agua o leche", amount: 450, unit: "ml" },
      { name: "Puré de tomate", amount: 200, unit: "g" },
      { name: "Cebolla chica picada", amount: 1, unit: "unidad" },
      { name: "Queso fresco o cremoso", amount: 70, unit: "g" },
      { name: "Orégano, sal y pimienta", amount: 1, unit: "al gusto" }
    ],
    instructions: [
      "En una sartén, saltear la cebolla con un chorrito de aceite, agregar el puré de tomate, orégano y cocinar 8 minutos.",
      "En una ollita, calentar el agua con sal hasta que rompa el hervor.",
      "Verter la polenta en forma de lluvia batiendo constantemente con batidor o cuchara para evitar grumos.",
      "Cocinar 1 minuto a fuego suave sin dejar de revolver hasta que espese.",
      "Servir la polenta caliente en platos hondos, colocar cubitos de queso que se fundan y cubrir con la salsa de tomate."
    ],
    substitutions: [
      { original: "Puré de tomate simple", substitute: "Tomate con atún o carne picada", note: "Suma proteínas y saciedad duradera.", carbImpact: "+0g carbohidratos" }
    ]
  },
  {
    id: "rec-10",
    name: "Bifes a la criolla en sartén",
    category: "almuerzo",
    image: "https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=700&q=80",
    timePrep: 10,
    timeCook: 25,
    defaultServings: 2,
    difficulty: "Fácil",
    costLevel: "Medio",
    estimatedCarbsPerServing: 22,
    estimatedCaloriesPerServing: 390,
    tags: ["clasica", "sin_horno"],
    ingredients: [
      { name: "Bifes de paleta, aguja o cuadrada", amount: 300, unit: "g" },
      { name: "Papas medianas", amount: 2, unit: "unidades" },
      { name: "Cebolla grande en aros", amount: 1, unit: "unidad" },
      { name: "Tomate redondo en rodajas", amount: 1, unit: "unidad" },
      { name: "Caldo de verduras o agua", amount: 150, unit: "ml" },
      { name: "Orégano, ají molido y sal", amount: 1, unit: "al gusto" }
    ],
    instructions: [
      "En una sartén amplia o cacerola, colocar una capa de cebolla en aros.",
      "Disponer los bifes por encima y condimentar con sal y orégano.",
      "Cubrir con rodajas finas de papas y rodajas de tomate.",
      "Verter el caldo o agua, tapar bien la olla y cocinar a fuego medio durante 20-25 minutos sin revolver.",
      "Verificar que la papa esté tierna pinchando con un tenedor. Servir con su propio jugo."
    ],
    substitutions: [
      { original: "Carne vacuna", substitute: "Churrascos de pollo o cerdo", note: "Quedan muy tiernos y jugosos con la misma salsa.", carbImpact: "Neutro" }
    ]
  },
  {
    id: "rec-11",
    name: "Canelones rápidos de verdura y ricota",
    category: "cena",
    image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=700&q=80",
    timePrep: 20,
    timeCook: 20,
    defaultServings: 3,
    difficulty: "Media",
    costLevel: "Económico",
    estimatedCarbsPerServing: 30,
    estimatedCaloriesPerServing: 320,
    tags: ["con_horno", "vegetariana", "rinde_mucho"],
    ingredients: [
      { name: "Tapas para empanadas o panqueques finos", amount: 6, unit: "unidades" },
      { name: "Acelga o espinaca cocida y picada", amount: 250, unit: "g" },
      { name: "Ricota magra", amount: 200, unit: "g" },
      { name: "Huevo", amount: 1, unit: "unidad" },
      { name: "Salsa de tomate casera", amount: 250, unit: "g" },
      { name: "Sal, pimienta y nuez moscada", amount: 1, unit: "al gusto" }
    ],
    instructions: [
      "Escurrir perfectamente la acelga cocida para que no quede líquido.",
      "En un bol, mezclar la acelga con la ricota, el huevo, sal, pimienta y nuez moscada.",
      "Si se usan tapas de empanadas, estirarlas apenas con palo de amasar o hervirlas 1 minuto para ablandar.",
      "Colocar 2 cucharadas generosas de relleno en cada tapa y enrollar como canelón.",
      "Acomodar en una asadera aceitada, bañar con la salsa de tomate y hornear a 190°C por 20 minutos."
    ],
    substitutions: [
      { original: "Tapas de empanadas", substitute: "Hojas de acelga blanqueadas enteras (canelón verde)", note: "Opción libre de gluten y muy baja en carbohidratos.", carbImpact: "-20g carbohidratos" }
    ]
  },
  {
    id: "rec-12",
    name: "Ensalada tibia de pollo desmenuzado, calabaza asada y lentejas",
    category: "almuerzo",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=700&q=80",
    timePrep: 10,
    timeCook: 15,
    defaultServings: 2,
    difficulty: "Fácil",
    costLevel: "Económico",
    estimatedCarbsPerServing: 26,
    estimatedCaloriesPerServing: 310,
    tags: ["rapida", "aprovecha_sobras", "nutritiva"],
    ingredients: [
      { name: "Pollo cocido desmenuzado (sobra)", amount: 150, unit: "g" },
      { name: "Calabaza cocida en cubos", amount: 200, unit: "g" },
      { name: "Lentejas cocidas enjuagadas", amount: 100, unit: "g" },
      { name: "Hojas verdes (lechuga, rúcula o espinaca cruda)", amount: 100, unit: "g" },
      { name: "Aceite de oliva o girasol", amount: 1, unit: "cda" },
      { name: "Limón, sal y semillas (opcional)", amount: 1, unit: "al gusto" }
    ],
    instructions: [
      "Calentar apenas el pollo desmenuzado y los cubos de calabaza en una sartén con media cucharada de aceite.",
      "Lavar y secar las hojas verdes, disponiéndolas como base en una ensaladera.",
      "Sumar las lentejas cocidas a temperatura ambiente.",
      "Incorporar la calabaza y el pollo tibios.",
      "Condimentar con jugo de limón fresco, aceite, sal y semillas a gusto."
    ],
    substitutions: [
      { original: "Lentejas", substitute: "Garbanzos o porotos alubia", note: "Aportan textura crocante si se saltean 2 minutos.", carbImpact: "Similar" }
    ]
  },
  {
    id: "rec-13",
    name: "Omelette relleno de queso cremoso y tomate",
    category: "cena",
    image: "https://images.unsplash.com/photo-1510693206972-df098062cb71?auto=format&fit=crop&w=700&q=80",
    timePrep: 5,
    timeCook: 5,
    defaultServings: 1,
    difficulty: "Muy fácil",
    costLevel: "Muy económico",
    estimatedCarbsPerServing: 4,
    estimatedCaloriesPerServing: 240,
    tags: ["rapida", "sin_horno", "muy_baja_carbos", "economica"],
    ingredients: [
      { name: "Huevos", amount: 2, unit: "unidades" },
      { name: "Queso cremoso o cuartirolo", amount: 40, unit: "g" },
      { name: "Tomate en rodajitas finas", amount: 0.5, unit: "unidad" },
      { name: "Aceite o rocío vegetal", amount: 1, unit: "cdita" },
      { name: "Orégano y sal", amount: 1, unit: "al gusto" }
    ],
    instructions: [
      "Batir los huevos con un tenedor y una pizca de sal en una taza o bol.",
      "Calentar una sartén antiadherente con unas gotas de aceite a fuego medio.",
      "Verter el huevo batido cubriendo toda la superficie de la sartén.",
      "Cuando empiece a cuajar la base pero la superficie siga húmeda, colocar el queso y tomate en una mitad.",
      "Espolvorear orégano, doblar la otra mitad por encima y cocinar 1 minuto más hasta derretir el queso."
    ],
    substitutions: [
      { original: "Tomate", substitute: "Hojas de espinaca cruda o jamón", note: "La espinaca se ablanda sola con el calor del queso.", carbImpact: "<2g carbohidratos" }
    ]
  },
  {
    id: "rec-14",
    name: "Arroz con atún, huevo duro y vegetales frescos",
    category: "almuerzo",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=700&q=80",
    timePrep: 10,
    timeCook: 12,
    defaultServings: 2,
    difficulty: "Muy fácil",
    costLevel: "Económico",
    estimatedCarbsPerServing: 35,
    estimatedCaloriesPerServing: 310,
    tags: ["rapida", "fresca", "sin_horno", "ideal_verano"],
    ingredients: [
      { name: "Arroz blanco hervido frío", amount: 150, unit: "g" },
      { name: "Atún al natural (1 lata chica)", amount: 120, unit: "g" },
      { name: "Huevo duro picado", amount: 2, unit: "unidades" },
      { name: "Tomate en cubitos", amount: 1, unit: "unidad" },
      { name: "Aceite y vinagre o limón", amount: 1, unit: "cda" },
      { name: "Sal y orégano", amount: 1, unit: "al gusto" }
    ],
    instructions: [
      "Colocar el arroz frío en un bol amplio.",
      "Desmenuzar el atún escurrido por encima.",
      "Sumar los tomates en cubos y los huevos duros picados.",
      "Condimentar con sal, orégano, aceite y un chorrito de vinagre o limón.",
      "Mezclar bien y llevar a la heladera 10 minutos antes de servir para comer bien fresco."
    ],
    substitutions: [
      { original: "Atún", substitute: "Pollo hervido sobrante o lentejas", note: "Muy versátil según lo que haya en la alacena.", carbImpact: "Neutro" }
    ]
  },
  {
    id: "rec-15",
    name: "Zapallitos rellenos con carne y queso gratinado",
    category: "cena",
    image: "https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=700&q=80",
    timePrep: 15,
    timeCook: 25,
    defaultServings: 2,
    difficulty: "Fácil",
    costLevel: "Económico",
    estimatedCarbsPerServing: 12,
    estimatedCaloriesPerServing: 290,
    tags: ["baja_carbos", "con_horno", "economica"],
    ingredients: [
      { name: "Zapallitos verdes redondos", amount: 4, unit: "unidades" },
      { name: "Carne picada vacuna", amount: 180, unit: "g" },
      { name: "Cebolla chica picada", amount: 1, unit: "unidad" },
      { name: "Queso cremoso para gratinar", amount: 60, unit: "g" },
      { name: "Aceite", amount: 1, unit: "cda" },
      { name: "Sal, pimienta y pimentón", amount: 1, unit: "al gusto" }
    ],
    instructions: [
      "Lavar los zapallitos y hervirlos enteros durante 7 minutos en agua con sal.",
      "Retirar, cortar la tapita superior y ahuecar con cuchara reservando la pulpa picada.",
      "En una sartén, dorar la cebolla, agregar la carne picada y la pulpa de zapallito escurrida.",
      "Cocinar 10 minutos y condimentar con sal, pimienta y pimentón dulce.",
      "Rellenar los zapallitos, coronar con un cubo de queso cremoso y gratinar en horno fuerte 10 minutos."
    ],
    substitutions: [
      { original: "Carne picada", substitute: "Arroz con choclo y queso / Soja texturizada", note: "Rinde mucho más y abarata costos.", carbImpact: "+14g carbohidratos con arroz" }
    ]
  },
  {
    id: "rec-16",
    name: "Supremas de pollo al limón con ensalada mixta",
    category: "almuerzo",
    image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=700&q=80",
    timePrep: 5,
    timeCook: 15,
    defaultServings: 2,
    difficulty: "Muy fácil",
    costLevel: "Económico",
    estimatedCarbsPerServing: 8,
    estimatedCaloriesPerServing: 270,
    tags: ["rapida", "sin_horno", "baja_carbos"],
    ingredients: [
      { name: "Filetes de pechuga de pollo", amount: 300, unit: "g" },
      { name: "Jugo de limón", amount: 1, unit: "unidad" },
      { name: "Diente de ajo picado", amount: 1, unit: "unidad" },
      { name: "Lechuga y tomate para ensalada", amount: 200, unit: "g" },
      { name: "Aceite", amount: 1, unit: "cda" },
      { name: "Orégano, sal y pimienta", amount: 1, unit: "al gusto" }
    ],
    instructions: [
      "Condimentar los filetes de pollo con sal, pimienta, ajo picado y orégano.",
      "Calentar una plancha o sartén con unas gotas de aceite a fuego medio-alto.",
      "Dorar el pollo de ambos lados durante 5 minutos por lado.",
      "Verter el jugo de limón sobre la sartén caliente en los últimos 2 minutos para que forme una salsa dorada y glasee el pollo.",
      "Servir de inmediato acompañado de la ensalada de lechuga y tomate condimentada."
    ],
    substitutions: [
      { original: "Pechuga de pollo", substitute: "Bifecitos de cerdo o pata-muslo deshuesado", note: "El cerdo queda sensacional con limón.", carbImpact: "Neutro" }
    ]
  },
  {
    id: "rec-17",
    name: "Croquetas de arroz y queso al horno",
    category: "cena",
    image: "https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=700&q=80",
    timePrep: 15,
    timeCook: 20,
    defaultServings: 3,
    difficulty: "Fácil",
    costLevel: "Muy económico",
    estimatedCarbsPerServing: 34,
    estimatedCaloriesPerServing: 260,
    tags: ["aprovecha_sobras", "economica", "con_horno"],
    ingredients: [
      { name: "Arroz blanco ya cocido (sobra)", amount: 300, unit: "g" },
      { name: "Huevos", amount: 2, unit: "unidades" },
      { name: "Queso rallado o fresco picado", amount: 60, unit: "g" },
      { name: "Perejil picado y sal", amount: 1, unit: "al gusto" },
      { name: "Pan rallado para rebozar", amount: 40, unit: "g" }
    ],
    instructions: [
      "En un bol, mezclar el arroz cocido con 1 huevo batido, perejil picado y el queso.",
      "Formar bolitas con las manos húmedas colocando un cubito extra de queso en el centro si se desea.",
      "Pasar por el otro huevo batido y apenas por pan rallado.",
      "Disponer en una placa para horno aceitada y hornear a 200°C por 18 minutos hasta que estén doradas y crocantes."
    ],
    substitutions: [
      { original: "Pan rallado", substitute: "Avena arrollada", note: "Crocante rústico con mayor fibra.", carbImpact: "Neutro" }
    ]
  },
  {
    id: "rec-18",
    name: "Sopa crema casera de calabaza y zanahoria",
    category: "cena",
    image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=700&q=80",
    timePrep: 10,
    timeCook: 20,
    defaultServings: 3,
    difficulty: "Muy fácil",
    costLevel: "Muy económico",
    estimatedCarbsPerServing: 18,
    estimatedCaloriesPerServing: 140,
    tags: ["rapida", "sin_horno", "economica", "liviana"],
    ingredients: [
      { name: "Calabaza anco pelada en cubos", amount: 500, unit: "g" },
      { name: "Zanahoria en rodajas", amount: 1, unit: "unidad" },
      { name: "Cebolla chica", amount: 1, unit: "unidad" },
      { name: "Agua o caldo de verduras", amount: 500, unit: "ml" },
      { name: "Cucharada de queso crema o leche", amount: 2, unit: "cdas" },
      { name: "Sal, pimienta y jengibre o nuez moscada", amount: 1, unit: "al gusto" }
    ],
    instructions: [
      "En una cacerola, rehogar la cebolla picada con 1 cucharadita de aceite.",
      "Sumar la calabaza y la zanahoria en cubos.",
      "Cubrir con agua o caldo caliente y cocinar a fuego medio durante 15 minutos hasta que los vegetales estén tiernos.",
      "Procesar con minipimer o licuadora hasta lograr una textura cremosa y sedosa.",
      "Agregar el queso crema, rectificar sal y pimienta y servir bien caliente."
    ],
    substitutions: [
      { original: "Queso crema", substitute: "Queso fresco en cubos / Leche descremada", note: "Muy económico y rico.", carbImpact: "Neutro" }
    ]
  },
  {
    id: "rec-19",
    name: "Bocaditos de acelga al horno",
    category: "almuerzo",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=700&q=80",
    timePrep: 15,
    timeCook: 20,
    defaultServings: 3,
    difficulty: "Fácil",
    costLevel: "Muy económico",
    estimatedCarbsPerServing: 16,
    estimatedCaloriesPerServing: 190,
    tags: ["con_horno", "economica", "vegetariana", "rinde_mucho"],
    ingredients: [
      { name: "Acelga cocida, bien escurrida y picada", amount: 1, unit: "atado" },
      { name: "Huevos", amount: 2, unit: "unidades" },
      { name: "Harina leudante o común con pizca de polvo para hornear", amount: 80, unit: "g" },
      { name: "Queso rallado", amount: 30, unit: "g" },
      { name: "Ajo picado, sal y nuez moscada", amount: 1, unit: "al gusto" }
    ],
    instructions: [
      "Picar bien fina la acelga ya cocida asegurándose de retirar toda el agua sobrante.",
      "En un bol, batir los huevos con el queso rallado, ajo, sal y nuez moscada.",
      "Incorporar la acelga y luego la harina de a poco hasta formar una pasta espesa.",
      "Tomar porciones con una cuchara y disponerlas sobre una asadera aceitada.",
      "Hornear a 200°C durante 18 minutos dándoles vuelta a mitad de cocción hasta dorar."
    ],
    substitutions: [
      { original: "Harina leudante", substitute: "Harina de garbanzo o avena molida", note: "Aporta proteína y es apto para celíacos o personas que cuidan glucosa.", carbImpact: "Menor índice glucémico" }
    ]
  },
  {
    id: "rec-20",
    name: "Fideos tirabuzón salteados con brócoli, ajo y huevo revuelto",
    category: "cena",
    image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=700&q=80",
    timePrep: 10,
    timeCook: 12,
    defaultServings: 2,
    difficulty: "Muy fácil",
    costLevel: "Económico",
    estimatedCarbsPerServing: 42,
    estimatedCaloriesPerServing: 320,
    tags: ["rapida", "sin_horno", "vegetariana"],
    ingredients: [
      { name: "Fideos secos tirabuzón", amount: 140, unit: "g" },
      { name: "Brócoli en arbolitos pequeños", amount: 200, unit: "g" },
      { name: "Dientes de ajo laminados", amount: 2, unit: "unidades" },
      { name: "Huevos", amount: 2, unit: "unidades" },
      { name: "Aceite", amount: 1, unit: "cda" },
      { name: "Sal y pimienta", amount: 1, unit: "al gusto" }
    ],
    instructions: [
      "Hervir los fideos en agua con sal. Durante los últimos 4 minutos de cocción, agregar los arbolitos de brócoli a la misma olla.",
      "Colar los fideos con el brócoli juntos.",
      "En una sartén grande, dorar los ajos laminados con el aceite.",
      "Verter los dos huevos batidos y revolver apenas para hacer un revuelto suave.",
      "Incorporar la pasta y brócoli a la sartén, saltear todo junto 1 minuto y servir."
    ],
    substitutions: [
      { original: "Brócoli", substitute: "Hojas de espinaca o zucchini en cubitos", note: "El zucchini se saltea directamente con el ajo sin hervir.", carbImpact: "Neutro" }
    ]
  },
  {
    id: "rec-21",
    name: "Pata-muslo de pollo al horno con papas y cebolla",
    category: "almuerzo",
    image: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=700&q=80",
    timePrep: 10,
    timeCook: 40,
    defaultServings: 2,
    difficulty: "Fácil",
    costLevel: "Económico",
    estimatedCarbsPerServing: 26,
    estimatedCaloriesPerServing: 410,
    tags: ["con_horno", "clasica", "rinde_mucho"],
    ingredients: [
      { name: "Pata-muslo de pollo", amount: 2, unit: "unidades" },
      { name: "Papas medianas", amount: 2, unit: "unidades" },
      { name: "Cebolla cortada en cuartos", amount: 1, unit: "unidad" },
      { name: "Aceite", amount: 1, unit: "cda" },
      { name: "Orégano, pimentón dulce, sal y jugo de medio limón", amount: 1, unit: "al gusto" }
    ],
    instructions: [
      "Retirar la piel sobrante del pollo y frotar con sal, pimentón y jugo de limón.",
      "Cortar las papas en dados de 2 cm y la cebolla en gajos.",
      "Disponer todo en una asadera grande, rociar con 1 cucharada de aceite y mezclar con las manos para distribuir los condimentos.",
      "Hornear a 200°C durante 40-45 minutos hasta que el pollo esté bien cocido y las papas doradas por fuera y tiernas por dentro."
    ],
    substitutions: [
      { original: "Papas", substitute: "Calabaza o batatas", note: "La calabaza cocina más rápido y reduce los carbohidratos.", carbImpact: "-10g carbohidratos" }
    ]
  },
  {
    id: "rec-22",
    name: "Empanadas de carne cortada a cuchillo (o picada) al horno",
    category: "cena",
    image: "https://images.unsplash.com/photo-1628294895950-9805252327bc?auto=format&fit=crop&w=700&q=80",
    timePrep: 25,
    timeCook: 20,
    defaultServings: 3,
    difficulty: "Media",
    costLevel: "Económico",
    estimatedCarbsPerServing: 36,
    estimatedCaloriesPerServing: 380,
    tags: ["clasica", "con_horno", "rinde_mucho"],
    ingredients: [
      { name: "Tapas de empanadas para horno", amount: 6, unit: "unidades" },
      { name: "Carne picada o bife picado fino", amount: 250, unit: "g" },
      { name: "Cebolla grande picada", amount: 2, unit: "unidades" },
      { name: "Huevo duro picado", amount: 1, unit: "unidad" },
      { name: "Aceite", amount: 1, unit: "cda" },
      { name: "Comino, pimentón, ají molido y sal", amount: 1, unit: "al gusto" }
    ],
    instructions: [
      "En una olla, rehogar la cebolla picada con aceite a fuego suave hasta que esté bien transparente y dulce.",
      "Agregar la carne y cocinar solo hasta que pierda el color rojo, sin sobrecocinar para que quede jugosa.",
      "Condimentar con comino abundante, pimentón y sal. Dejar enfriar el relleno en la heladera.",
      "Mezclar el huevo duro picado con el relleno frío.",
      "Armar las empanadas rellenando el centro y cerrando con repulgue.",
      "Hornear en asadera aceitada a 210°C durante 15-18 minutos hasta que la masa esté dorada."
    ],
    substitutions: [
      { original: "Tapas comunes", substitute: "Tapas integrales o de semillas", note: "Aportan mayor fibra a la masa.", carbImpact: "Similar en gramos, absorción más gradual" }
    ]
  },
  {
    id: "rec-23",
    name: "Arroz con pollo a la cacerola",
    category: "almuerzo",
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=700&q=80",
    timePrep: 15,
    timeCook: 30,
    defaultServings: 3,
    difficulty: "Fácil",
    costLevel: "Económico",
    estimatedCarbsPerServing: 38,
    estimatedCaloriesPerServing: 370,
    tags: ["clasica", "sin_horno", "rinde_mucho"],
    ingredients: [
      { name: "Pollo en presas o cubos", amount: 350, unit: "g" },
      { name: "Arroz grano largo", amount: 150, unit: "g" },
      { name: "Cebolla", amount: 1, unit: "unidad" },
      { name: "Zanahoria picada", amount: 1, unit: "unidad" },
      { name: "Caldo o agua caliente", amount: 450, unit: "ml" },
      { name: "Pimentón dulce, cúrcuma (o condimento para arroz) y sal", amount: 1, unit: "al gusto" }
    ],
    instructions: [
      "En una cacerola, dorar los trozos de pollo con 1 cucharada de aceite. Retirar y reservar.",
      "En la misma olla, saltear la cebolla y la zanahoria.",
      "Incorporar el arroz y tostarlo 1 minuto hasta que esté brillante (nacarar).",
      "Volver a incorporar el pollo, agregar el caldo caliente y condimentar con cúrcuma o pimentón.",
      "Cocinar a fuego bajo tapado durante 18 minutos hasta que el arroz haya absorbido el líquido.",
      "Dejar reposar 3 minutos tapado antes de servir."
    ],
    substitutions: [
      { original: "Arroz blanco", substitute: "Arroz integral", note: "Requiere 15 minutos más de cocción y un poco más de caldo.", carbImpact: "Absorción más lenta" }
    ]
  },
  {
    id: "rec-24",
    name: "Milanesas de berenjena a la napolitana al horno",
    category: "cena",
    image: "https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=700&q=80",
    timePrep: 15,
    timeCook: 25,
    defaultServings: 2,
    difficulty: "Fácil",
    costLevel: "Muy económico",
    estimatedCarbsPerServing: 22,
    estimatedCaloriesPerServing: 260,
    tags: ["vegetariana", "con_horno", "economica"],
    ingredients: [
      { name: "Berenjenas grandes en rodajas de 1 cm", amount: 2, unit: "unidades" },
      { name: "Huevo", amount: 1, unit: "unidad" },
      { name: "Pan rallado o salvado de avena", amount: 60, unit: "g" },
      { name: "Salsa de tomate casera", amount: 4, unit: "cdas" },
      { name: "Queso cremoso o muzarella", amount: 70, unit: "g" },
      { name: "Orégano y sal", amount: 1, unit: "al gusto" }
    ],
    instructions: [
      "Espolvorear las rodajas de berenjena con sal y dejarlas 10 minutos para que suden el amargor; secar con servilleta.",
      "Pasar por huevo batido y empanar con pan rallado o salvado.",
      "Hornear a 200°C en placa aceitada 15 minutos hasta que estén tiernas y doradas.",
      "Colocar 1 cucharada de salsa de tomate sobre cada milanesa, una feta de queso cremoso y espolvorear orégano.",
      "Gratinar 5 minutos más hasta derretir el queso."
    ],
    substitutions: [
      { original: "Pan rallado", substitute: "Harina de almendras o semillas trituradas", note: "Opción keto/muy baja en carbohidratos.", carbImpact: "-12g carbohidratos" }
    ]
  },
  {
    id: "rec-25",
    name: "Sopa casera de fideos munición con verduras y huevo pochado",
    category: "cena",
    image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=700&q=80",
    timePrep: 5,
    timeCook: 15,
    defaultServings: 2,
    difficulty: "Muy fácil",
    costLevel: "Muy económico",
    estimatedCarbsPerServing: 28,
    estimatedCaloriesPerServing: 210,
    tags: ["rapida", "sin_horno", "economica", "reconfortante"],
    ingredients: [
      { name: "Fideos secos tipo munición o letras", amount: 80, unit: "g" },
      { name: "Zanahoria chica rallada", amount: 1, unit: "unidad" },
      { name: "Caldo de verduras o agua con sal", amount: 600, unit: "ml" },
      { name: "Huevos", amount: 2, unit: "unidades" },
      { name: "Queso rallado", amount: 15, unit: "g" },
      { name: "Sal y orégano", amount: 1, unit: "al gusto" }
    ],
    instructions: [
      "Poner a calentar el caldo en una ollita con la zanahoria rallada.",
      "Cuando hierva, incorporar los fideos y cocinar a fuego medio durante 7 minutos.",
      "Bajar el fuego al mínimo, quebrar los 2 huevos directamente sobre el caldo caliente sin romper la yema.",
      "Tapar la olla 3 minutos para que los huevos pochen suavemente en la sopa.",
      "Servir en platos hondos con una cucharada de queso rallado."
    ],
    substitutions: [
      { original: "Fideos munición", substitute: "Arroz o fideos cabello de ángel", note: "Cocinan en 3 a 5 minutos.", carbImpact: "Similar" }
    ]
  },
  {
    id: "rec-26",
    name: "Salteado de carne en tiritas con cebolla y morrón",
    category: "almuerzo",
    image: "https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=700&q=80",
    timePrep: 10,
    timeCook: 10,
    defaultServings: 2,
    difficulty: "Muy fácil",
    costLevel: "Medio",
    estimatedCarbsPerServing: 9,
    estimatedCaloriesPerServing: 280,
    tags: ["rapida", "sin_horno", "baja_carbos"],
    ingredients: [
      { name: "Bife de nalga o cuadril cortado en tiritas", amount: 300, unit: "g" },
      { name: "Cebolla en juliana", amount: 1, unit: "unidad" },
      { name: "Morrón rojo o verde en tiritas", amount: 0.5, unit: "unidad" },
      { name: "Aceite", amount: 1, unit: "cda" },
      { name: "Salsa de soja o sal y pimienta", amount: 1, unit: "al gusto" }
    ],
    instructions: [
      "Calentar muy bien una sartén o wok con la cucharada de aceite.",
      "Saltear la cebolla y el morrón a fuego vivo durante 3 minutos hasta que tomen color pero sigan crujientes.",
      "Sumar las tiritas de carne a fuego fuerte para sellarlas rápidamente sin que pierdan jugo.",
      "Cocinar 3-4 minutos, agregar la salsa de soja o condimentos, saltear 1 minuto más y retirar."
    ],
    substitutions: [
      { original: "Carne vacuna", substitute: "Pollo o dados de tofu", note: "Opción más económica y ligera.", carbImpact: "Neutro" }
    ]
  },
  {
    id: "rec-27",
    name: "Tarta rápida de atún con cebolla y tomate",
    category: "cena",
    image: "https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=700&q=80",
    timePrep: 10,
    timeCook: 25,
    defaultServings: 4,
    difficulty: "Fácil",
    costLevel: "Económico",
    estimatedCarbsPerServing: 23,
    estimatedCaloriesPerServing: 290,
    tags: ["con_horno", "economica", "rinde_mucho"],
    ingredients: [
      { name: "Masa para tarta (1 tapa)", amount: 1, unit: "unidad" },
      { name: "Atún al natural (2 latas chicas)", amount: 240, unit: "g" },
      { name: "Cebolla grande picada", amount: 1, unit: "unidad" },
      { name: "Huevos", amount: 2, unit: "unidades" },
      { name: "Tomate en cubitos", amount: 1, unit: "unidad" },
      { name: "Aceite", amount: 1, unit: "cda" },
      { name: "Orégano, sal y pimienta", amount: 1, unit: "al gusto" }
    ],
    instructions: [
      "Rehogar la cebolla picada en una sartén con el aceite hasta tierna. Dejar entibiar.",
      "En un bol, mezclar el atún escurrido, la cebolla rehogada, el tomate picado y los huevos batidos con orégano y sal.",
      "Disponer la masa en una tartera, verter el relleno de atún de forma pareja.",
      "Cocinar en horno a 190°C durante 25 minutos hasta que el relleno esté firme y los bordes dorados."
    ],
    substitutions: [
      { original: "Atún", substitute: "Caballa en lata o pollo desmenuzado", note: "La caballa suele ser más económica y rica en omega 3.", carbImpact: "Neutro" }
    ]
  },
  {
    id: "rec-28",
    name: "Ensalada completa de lentejas, tomate, huevo duro y zanahoria",
    category: "almuerzo",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=700&q=80",
    timePrep: 10,
    timeCook: 0,
    defaultServings: 2,
    difficulty: "Muy fácil",
    costLevel: "Muy económico",
    estimatedCarbsPerServing: 32,
    estimatedCaloriesPerServing: 270,
    tags: ["sin_cocinar", "rapida", "economica", "vegetariana"],
    ingredients: [
      { name: "Lentejas cocidas (en lata o caseras)", amount: 250, unit: "g" },
      { name: "Huevos duros", amount: 2, unit: "unidades" },
      { name: "Tomate redondo cortado en gajos", amount: 1, unit: "unidad" },
      { name: "Zanahoria rallada", amount: 1, unit: "unidad" },
      { name: "Aceite y vinagre de manzana", amount: 1, unit: "cda" },
      { name: "Sal y orégano", amount: 1, unit: "al gusto" }
    ],
    instructions: [
      "Enjuagar y escurrir muy bien las lentejas cocidas.",
      "Colocarlas en un bol hondo.",
      "Incorporar la zanahoria rallada fina y el tomate cortado.",
      "Agregar los huevos duros en cuartos por encima.",
      "Aliñar con sal, orégano, aceite y vinagre. Servir inmediatamente."
    ],
    substitutions: [
      { original: "Lentejas", substitute: "Garbanzos o porotos negros", note: "Cualquier legumbre funciona genial.", carbImpact: "Similar" }
    ]
  },
  {
    id: "rec-29",
    name: "Tortilla express de zapallitos en sartén",
    category: "cena",
    image: "https://images.unsplash.com/photo-1628294895950-9805252327bc?auto=format&fit=crop&w=700&q=80",
    timePrep: 10,
    timeCook: 15,
    defaultServings: 2,
    difficulty: "Fácil",
    costLevel: "Muy económico",
    estimatedCarbsPerServing: 9,
    estimatedCaloriesPerServing: 210,
    tags: ["rapida", "sin_horno", "baja_carbos", "economica"],
    ingredients: [
      { name: "Zapallitos verdes cortados en rodajas finitas", amount: 3, unit: "unidades" },
      { name: "Huevos", amount: 3, unit: "unidades" },
      { name: "Cebolla chica picada", amount: 1, unit: "unidad" },
      { name: "Aceite", amount: 1, unit: "cda" },
      { name: "Sal, pimienta y orégano", amount: 1, unit: "al gusto" }
    ],
    instructions: [
      "Saltear la cebolla y los zapallitos en una sartén con media cucharada de aceite a fuego medio durante 8 minutos hasta que se ablanden. Escurrir bien el agua que despidan.",
      "Batir los 3 huevos con sal, pimienta y orégano en un bol.",
      "Mezclar los zapallitos con los huevos.",
      "Volver a la sartén aceitada caliente y cocinar 4 minutos por lado hasta que esté dorada."
    ],
    substitutions: [
      { original: "Zapallito", substitute: "Acelga o espinaca picada cruda", note: "La espinaca cuaja en menos tiempo.", carbImpact: "Muy bajo" }
    ]
  },
  {
    id: "rec-30",
    name: "Ñoquis de papa rápidos con salsa de tomate",
    category: "almuerzo",
    image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=700&q=80",
    timePrep: 25,
    timeCook: 10,
    defaultServings: 3,
    difficulty: "Media",
    costLevel: "Muy económico",
    estimatedCarbsPerServing: 52,
    estimatedCaloriesPerServing: 350,
    tags: ["clasica", "economica", "sin_horno", "rinde_mucho"],
    ingredients: [
      { name: "Papas medianas", amount: 3, unit: "unidades" },
      { name: "Harina de trigo 0000", amount: 180, unit: "g" },
      { name: "Huevo", amount: 1, unit: "unidad" },
      { name: "Salsa de tomate lista", amount: 250, unit: "g" },
      { name: "Sal y nuez moscada", amount: 1, unit: "al gusto" }
    ],
    instructions: [
      "Hervir las papas con cáscara para que no absorban agua. Pelar en caliente y pisar bien finas.",
      "Dejar entibiar el puré, condimentar con sal y nuez moscada, añadir el huevo y la harina de a poco uniendo sin amasar demasiado.",
      "Hacer rollitos de masa sobre la mesada enharinada y cortar trocitos de 2 cm.",
      "Cocinar en abundante agua hirviendo con sal; cuando suben a la superficie, dejarlos 1 minuto y retirar con espumadera.",
      "Servir de inmediato cubiertos con la salsa caliente."
    ],
    substitutions: [
      { original: "Papa", substitute: "Calabaza o ricota", note: "Los ñoquis de ricota son mucho más bajos en carbohidratos.", carbImpact: "-25g carbohidratos con ricota" }
    ]
  },

  // ==================== DESAYUNO Y MERIENDA ====================
  {
    id: "rec-31",
    name: "Tostadas integrales con huevo revuelto y tomate",
    category: "desayuno",
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=700&q=80",
    timePrep: 5,
    timeCook: 5,
    defaultServings: 1,
    difficulty: "Muy fácil",
    costLevel: "Muy económico",
    estimatedCarbsPerServing: 24,
    estimatedCaloriesPerServing: 220,
    tags: ["rapida", "sin_horno", "economica"],
    ingredients: [
      { name: "Pan integral o blanco en rebanadas", amount: 2, unit: "rodajas" },
      { name: "Huevos", amount: 1, unit: "unidad" },
      { name: "Tomate en rodajas", amount: 0.5, unit: "unidad" },
      { name: "Aceite o rocío vegetal", amount: 1, unit: "cdita" },
      { name: "Sal y orégano", amount: 1, unit: "al gusto" }
    ],
    instructions: [
      "Tostar las rodajas de pan en tostadora, plancha o sartén.",
      "Batir el huevo con una pizca de sal.",
      "Cocinar en sartén aceitada a fuego suave durante 1-2 minutos revolviendo con espátula hasta que quede cremoso.",
      "Disponer las rodajas de tomate sobre el pan tostado y montar el huevo revuelto encima.",
      "Terminar con una pizca de orégano."
    ],
    substitutions: [
      { original: "Pan integral", substitute: "Galletitas de arroz o panqueque de avena", note: "Apto para celíacos o menor densidad calórica.", carbImpact: "Similar" }
    ]
  },
  {
    id: "rec-32",
    name: "Porridge o gachas de avena con manzana y canela",
    category: "desayuno",
    image: "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=700&q=80",
    timePrep: 5,
    timeCook: 5,
    defaultServings: 1,
    difficulty: "Muy fácil",
    costLevel: "Muy económico",
    estimatedCarbsPerServing: 35,
    estimatedCaloriesPerServing: 230,
    tags: ["rapida", "sin_horno", "economica", "reconfortante"],
    ingredients: [
      { name: "Avena tradicional o instantánea", amount: 40, unit: "g" },
      { name: "Agua o leche descremada", amount: 200, unit: "ml" },
      { name: "Manzana rallada o en cubitos", amount: 0.5, unit: "unidad" },
      { name: "Canela en polvo", amount: 1, unit: "cdita" }
    ],
    instructions: [
      "En una ollita chica, mezclar la avena con la leche o agua.",
      "Cocinar a fuego medio-bajo revolviendo durante 3-4 minutos hasta que espese con textura cremosa.",
      "Retirar del fuego, pasar a un tazón y mezclar con la manzana picada.",
      "Espolvorear con canela en polvo."
    ],
    substitutions: [
      { original: "Manzana", substitute: "Pera, banana madura o frutos rojos", note: "La banana endulza naturalmente sin necesidad de azúcar.", carbImpact: "Sin variación significativa" }
    ]
  },
  {
    id: "rec-33",
    name: "Panqueques de avena y banana fáciles",
    category: "desayuno",
    image: "https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=700&q=80",
    timePrep: 5,
    timeCook: 6,
    defaultServings: 1,
    difficulty: "Muy fácil",
    costLevel: "Muy económico",
    estimatedCarbsPerServing: 32,
    estimatedCaloriesPerServing: 210,
    tags: ["rapida", "sin_horno", "economica", "dulce_saludable"],
    ingredients: [
      { name: "Banana madura pisada", amount: 1, unit: "unidad" },
      { name: "Huevo", amount: 1, unit: "unidad" },
      { name: "Avena instantánea", amount: 30, unit: "g" },
      { name: "Esencia de vainilla o canela", amount: 1, unit: "cdita" }
    ],
    instructions: [
      "Pisar bien la banana en un plato hondo con un tenedor.",
      "Agregar el huevo y batir hasta integrar.",
      "Incorporar la avena y la vainilla mezclando bien.",
      "Calentar una sartén antiadherente apenas aceitada a fuego medio-bajo.",
      "Volcar 2 porciones de mezcla para hacer 2 panqueques pequeños; cocinar 2 minutos por lado hasta dorar."
    ],
    substitutions: [
      { original: "Banana", substitute: "2 cucharadas de puré de manzana o calabaza cocida", note: "Opción con menos carbohidratos.", carbImpact: "-10g carbohidratos" }
    ]
  },
  {
    id: "rec-34",
    name: "Yogur natural con frutas de estación y semillas",
    category: "merienda",
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=700&q=80",
    timePrep: 5,
    timeCook: 0,
    defaultServings: 1,
    difficulty: "Muy fácil",
    costLevel: "Económico",
    estimatedCarbsPerServing: 20,
    estimatedCaloriesPerServing: 170,
    tags: ["sin_cocinar", "rapida", "fresca"],
    ingredients: [
      { name: "Yogur natural o descremado", amount: 160, unit: "g" },
      { name: "Fruta fresca (manzana, naranja o banana)", amount: 1, unit: "unidad" },
      { name: "Semillas de girasol, chía o lino", amount: 1, unit: "cda" }
    ],
    instructions: [
      "Servir el yogur en una compotera.",
      "Lavar y cortar la fruta en dados pequeños.",
      "Distribuir la fruta sobre el yogur y espolvorear la cucharada de semillas por encima."
    ],
    substitutions: [
      { original: "Yogur comprado", substitute: "Queso untable blanco con gotitas de limón o vainilla", note: "Mayor proteína y muy bajo en carbohidratos.", carbImpact: "-5g carbohidratos" }
    ]
  },
  {
    id: "rec-35",
    name: "Tostadas de queso blanco con frutas o mermelada baja en azúcar",
    category: "merienda",
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=700&q=80",
    timePrep: 5,
    timeCook: 0,
    defaultServings: 1,
    difficulty: "Muy fácil",
    costLevel: "Muy económico",
    estimatedCarbsPerServing: 26,
    estimatedCaloriesPerServing: 180,
    tags: ["rapida", "sin_cocinar", "economica"],
    ingredients: [
      { name: "Pan de molde o pan francés tostado", amount: 2, unit: "rebanadas" },
      { name: "Queso blanco untable descremado", amount: 2, unit: "cdas" },
      { name: "Mermelada reducida en azúcares o rodajas de fruta", amount: 1, unit: "cda" }
    ],
    instructions: [
      "Tostar las rebanadas de pan hasta que queden crocantes.",
      "Untar generosamente con el queso blanco.",
      "Agregar la cucharada de mermelada o rodajitas de fruta fresca por encima."
    ],
    substitutions: [
      { original: "Mermelada", substitute: "Rodajas de tomate con orégano", note: "Se convierte en una merienda salada sin azúcar agregada.", carbImpact: "-8g carbohidratos" }
    ]
  },
  {
    id: "rec-36",
    name: "Budín casero de banana y avena sin manteca",
    category: "merienda",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=700&q=80",
    timePrep: 15,
    timeCook: 30,
    defaultServings: 6,
    difficulty: "Fácil",
    costLevel: "Muy económico",
    estimatedCarbsPerServing: 22,
    estimatedCaloriesPerServing: 160,
    tags: ["con_horno", "economica", "dulce_saludable", "rinde_mucho"],
    ingredients: [
      { name: "Bananas maduras", amount: 2, unit: "unidades" },
      { name: "Huevos", amount: 2, unit: "unidades" },
      { name: "Avena arrollada", amount: 120, unit: "g" },
      { name: "Aceite neutro", amount: 2, unit: "cdas" },
      { name: "Polvo para hornear y canela", amount: 1, unit: "cdita" }
    ],
    instructions: [
      "Pisar las bananas en un bol con tenedor.",
      "Agregar los 2 huevos y el aceite, batiendo bien.",
      "Incorporar la avena, el polvo para hornear y una pizca de canela.",
      "Verter en una budinera aceitada o enmoldada.",
      "Hornear a 180°C durante 30 minutos hasta que al pinchar con un palillo salga seco."
    ],
    substitutions: [
      { original: "Avena", substitute: "Harina integral", note: "Textura más esponjosa tradicional.", carbImpact: "Similar" }
    ]
  },
  {
    id: "rec-37",
    name: "Galletitas rápidas de avena y manzana en sartén",
    category: "snack",
    image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=700&q=80",
    timePrep: 5,
    timeCook: 8,
    defaultServings: 2,
    difficulty: "Muy fácil",
    costLevel: "Muy económico",
    estimatedCarbsPerServing: 18,
    estimatedCaloriesPerServing: 120,
    tags: ["rapida", "sin_horno", "dulce_saludable"],
    ingredients: [
      { name: "Manzana rallada", amount: 1, unit: "unidad" },
      { name: "Avena instantánea", amount: 60, unit: "g" },
      { name: "Canela en polvo", amount: 1, unit: "cdita" }
    ],
    instructions: [
      "Mezclar la manzana rallada con la avena y canela en un bol hasta formar una masa húmeda compacta.",
      "Dar forma de galletitas redondas con las manos.",
      "Cocinar en sartén antiadherente a fuego bajo durante 4 minutos por lado hasta que estén firmes y doradas."
    ],
    substitutions: [
      { original: "Manzana", substitute: "Zanahoria rallada con un chorrito de agua", note: "Galletitas estilo 'carrot cake'.", carbImpact: "Similar" }
    ]
  },
  {
    id: "rec-38",
    name: "Tostado clásico de jamón cocido y queso",
    category: "desayuno",
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=700&q=80",
    timePrep: 3,
    timeCook: 5,
    defaultServings: 1,
    difficulty: "Muy fácil",
    costLevel: "Económico",
    estimatedCarbsPerServing: 24,
    estimatedCaloriesPerServing: 260,
    tags: ["rapida", "sin_horno", "clasica"],
    ingredients: [
      { name: "Pan de miga o lactal (blanco o integral)", amount: 2, unit: "rodajas" },
      { name: "Queso de máquina o cremoso", amount: 40, unit: "g" },
      { name: "Jamón cocido o paleta", amount: 30, unit: "g" }
    ],
    instructions: [
      "Armar el sándwich colocando el queso y el jamón entre las dos rodajas de pan.",
      "Tostar en tostadora, carlitera o en sartén con una tapa encima aplastando suavemente.",
      "Dorar 2 minutos por lado hasta que el queso esté bien fundido."
    ],
    substitutions: [
      { original: "Jamón cocido", substitute: "Rodajas de tomate con orégano", note: "Opción vegetariana liviana.", carbImpact: "-1g carbohidratos" }
    ]
  },
  {
    id: "rec-39",
    name: "Licuado clásico de banana con leche",
    category: "merienda",
    image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=700&q=80",
    timePrep: 3,
    timeCook: 0,
    defaultServings: 1,
    difficulty: "Muy fácil",
    costLevel: "Muy económico",
    estimatedCarbsPerServing: 30,
    estimatedCaloriesPerServing: 180,
    tags: ["sin_cocinar", "rapida", "economica"],
    ingredients: [
      { name: "Banana madura", amount: 1, unit: "unidad" },
      { name: "Leche descremada o vegetal", amount: 250, unit: "ml" },
      { name: "Hielo (opcional)", amount: 3, unit: "cubitos", optional: true }
    ],
    instructions: [
      "Colocar la banana en trozos dentro de la licuadora o vaso de minipimer.",
      "Agregar la leche y los cubos de hielo.",
      "Licuar durante 30 segundos hasta obtener una espuma suave y homogénea. Servir de inmediato."
    ],
    substitutions: [
      { original: "Leche de vaca", substitute: "Agua o bebida vegetal", note: "Opción liviana o para intolerantes a la lactosa.", carbImpact: "Menor carbohidrato si se usa bebida sin azúcar" }
    ]
  },
  {
    id: "rec-40",
    name: "Mate o infusión con tostadas de pan integral y queso fresco",
    category: "merienda",
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=700&q=80",
    timePrep: 5,
    timeCook: 0,
    defaultServings: 1,
    difficulty: "Muy fácil",
    costLevel: "Muy económico",
    estimatedCarbsPerServing: 22,
    estimatedCaloriesPerServing: 190,
    tags: ["rapida", "sin_cocinar", "clasica"],
    ingredients: [
      { name: "Pan de campo o integral tostado", amount: 2, unit: "rebanadas" },
      { name: "Queso fresco tipo por salut o cuartirolo", amount: 50, unit: "g" },
      { name: "Infusión (mate, té o café con leche)", amount: 1, unit: "taza" }
    ],
    instructions: [
      "Tostar las rebanadas de pan hasta que tomen buen color.",
      "Cortar dos fetas de queso fresco y disponer sobre el pan tibio para que afloje con el calor.",
      "Acompañar con la infusión de preferencia sin azúcar agregada."
    ],
    substitutions: [
      { original: "Queso fresco", substitute: "Ricota con una pizca de orégano", note: "Muy suave y rica en proteínas.", carbImpact: "Bajo" }
    ]
  },

  // ==================== SNACKS, 5-MINUTOS Y SIN COCINAR ====================
  {
    id: "rec-41",
    name: "Huevos duros rellenos express con atún y queso crema",
    category: "snack",
    image: "https://images.unsplash.com/photo-1510693206972-df098062cb71?auto=format&fit=crop&w=700&q=80",
    timePrep: 5,
    timeCook: 0,
    defaultServings: 1,
    difficulty: "Muy fácil",
    costLevel: "Económico",
    estimatedCarbsPerServing: 2,
    estimatedCaloriesPerServing: 190,
    tags: ["sin_cocinar", "rapida", "muy_baja_carbos", "5_minutos"],
    ingredients: [
      { name: "Huevos ya duros", amount: 2, unit: "unidades" },
      { name: "Atún al natural", amount: 40, unit: "g" },
      { name: "Queso crema o mayonesa liviana", amount: 1, unit: "cda" },
      { name: "Sal y pimentón", amount: 1, unit: "al gusto" }
    ],
    instructions: [
      "Cortar los huevos duros por la mitad a lo largo y retirar las yemas con cuidado.",
      "En un platito, pisar las yemas con el atún escurrido y la cucharada de queso crema hasta formar una pasta.",
      "Rellenar el hueco de las claras con la mezcla.",
      "Espolvorear con una pizca de pimentón o perejil picado."
    ],
    substitutions: [
      { original: "Atún", substitute: "Queso untable solo con orégano", note: "Aún más rápido y económico.", carbImpact: "<1g carbohidratos" }
    ]
  },
  {
    id: "rec-42",
    name: "Bastoncitos de zanahoria fresca con dip de queso blanco y orégano",
    category: "snack",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=700&q=80",
    timePrep: 5,
    timeCook: 0,
    defaultServings: 1,
    difficulty: "Muy fácil",
    costLevel: "Muy económico",
    estimatedCarbsPerServing: 8,
    estimatedCaloriesPerServing: 80,
    tags: ["sin_cocinar", "rapida", "5_minutos", "economica"],
    ingredients: [
      { name: "Zanahoria mediana pelada", amount: 1, unit: "unidad" },
      { name: "Queso crema o blanco untable", amount: 2, unit: "cdas" },
      { name: "Orégano o provenzal y pizca de sal", amount: 1, unit: "al gusto" }
    ],
    instructions: [
      "Cortar la zanahoria en bastones largos y cómodos para agarrar.",
      "En un pocillo, mezclar el queso blanco con orégano y sal.",
      "Untar los bastones de zanahoria en el dip y disfrutar como tentempié fresco y crocante."
    ],
    substitutions: [
      { original: "Zanahoria", substitute: "Pepino o apio", note: "Aporta aún menos calorías y muchísima hidratación.", carbImpact: "-4g carbohidratos" }
    ]
  },
  {
    id: "rec-43",
    name: "Fruta fresca de estación en trozos con semillas",
    category: "snack",
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=700&q=80",
    timePrep: 3,
    timeCook: 0,
    defaultServings: 1,
    difficulty: "Muy fácil",
    costLevel: "Muy económico",
    estimatedCarbsPerServing: 18,
    estimatedCaloriesPerServing: 95,
    tags: ["sin_cocinar", "5_minutos", "fresca"],
    ingredients: [
      { name: "Manzana, naranja o mandarina", amount: 1, unit: "unidad" },
      { name: "Semillas de girasol tostadas", amount: 1, unit: "cdita" }
    ],
    instructions: [
      "Lavar bien la fruta y cortarla en dados (o pelar los gajos).",
      "Espolvorear las semillas por encima para sumar fibra y grasas saludables que amortiguan la absorción de azúcares."
    ],
    substitutions: [
      { original: "Manzana", substitute: "Cualquier fruta que haya en la verdulería a buen precio", note: "La fruta de estación siempre es la más fresca y barata.", carbImpact: "Variable según fruta" }
    ]
  },
  {
    id: "rec-44",
    name: "Puñadito de frutos secos o maní tostado sin sal",
    category: "snack",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=700&q=80",
    timePrep: 1,
    timeCook: 0,
    defaultServings: 1,
    difficulty: "Muy fácil",
    costLevel: "Económico",
    estimatedCarbsPerServing: 5,
    estimatedCaloriesPerServing: 160,
    tags: ["sin_cocinar", "5_minutos", "muy_baja_carbos"],
    ingredients: [
      { name: "Maní tostado sin sal (o nueces/almendras)", amount: 30, unit: "g" }
    ],
    instructions: [
      "Medir una porción del tamaño de un puño cerrado (aprox. 30g).",
      "Consumir lentamente masticando bien para favorecer la sensación de saciedad."
    ],
    substitutions: [
      { original: "Maní", substitute: "Semillas de zapallo tostadas", note: "Altas en magnesio y muy accesibles.", carbImpact: "Similar" }
    ]
  },
  {
    id: "rec-45",
    name: "Sándwich express de queso, tomate y orégano",
    category: "cena",
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=700&q=80",
    timePrep: 3,
    timeCook: 0,
    defaultServings: 1,
    difficulty: "Muy fácil",
    costLevel: "Muy económico",
    estimatedCarbsPerServing: 24,
    estimatedCaloriesPerServing: 210,
    tags: ["sin_cocinar", "5_minutos", "vegetariana", "rapida"],
    ingredients: [
      { name: "Pan de mesa o rodajas de pan", amount: 2, unit: "rebanadas" },
      { name: "Queso cremoso o por salut", amount: 50, unit: "g" },
      { name: "Tomate en rodajas", amount: 0.5, unit: "unidad" },
      { name: "Orégano y gotitas de aceite", amount: 1, unit: "al gusto" }
    ],
    instructions: [
      "Abrir el pan, colocar las fetas de queso fresco.",
      "Sumar las rodajas de tomate, condimentar con orégano y una gota de aceite.",
      "Cerrar y disfrutar. Si tenés ganas, podés calentarlo 2 minutos en una sartén."
    ],
    substitutions: [
      { original: "Tomate", substitute: "Hojas de lechuga lavadas", note: "Aporta frescura crujiente.", carbImpact: "Neutro" }
    ]
  },
  {
    id: "rec-46",
    name: "Rollitos de queso de máquina y jamón cocido",
    category: "snack",
    image: "https://images.unsplash.com/photo-1510693206972-df098062cb71?auto=format&fit=crop&w=700&q=80",
    timePrep: 2,
    timeCook: 0,
    defaultServings: 1,
    difficulty: "Muy fácil",
    costLevel: "Económico",
    estimatedCarbsPerServing: 1,
    estimatedCaloriesPerServing: 150,
    tags: ["sin_cocinar", "5_minutos", "muy_baja_carbos"],
    ingredients: [
      { name: "Fetas de queso de máquina", amount: 2, unit: "fetas" },
      { name: "Fetas de jamón cocido o paleta", amount: 2, unit: "fetas" }
    ],
    instructions: [
      "Superponer una feta de queso con una feta de jamón.",
      "Enrollar de forma compacta y comer de inmediato.",
      "Resolución ultra rápida sin cocción ni vajilla extra."
    ],
    substitutions: [
      { original: "Jamón", substitute: "Hojas de rúcula o pepinillo", note: "Enrollado fresco y crocante.", carbImpact: "<1g carbohidratos" }
    ]
  },
  {
    id: "rec-47",
    name: "Revuelto express de espinaca y huevo en 5 minutos",
    category: "cena",
    image: "https://images.unsplash.com/photo-1510693206972-df098062cb71?auto=format&fit=crop&w=700&q=80",
    timePrep: 2,
    timeCook: 4,
    defaultServings: 1,
    difficulty: "Muy fácil",
    costLevel: "Muy económico",
    estimatedCarbsPerServing: 3,
    estimatedCaloriesPerServing: 170,
    tags: ["rapida", "sin_horno", "muy_baja_carbos", "5_minutos"],
    ingredients: [
      { name: "Hojas de espinaca fresca bien lavadas", amount: 100, unit: "g" },
      { name: "Huevos", amount: 2, unit: "unidades" },
      { name: "Aceite o rocío vegetal", amount: 1, unit: "cdita" },
      { name: "Sal y pimienta", amount: 1, unit: "al gusto" }
    ],
    instructions: [
      "Poner la espinaca cortada toscamente con las manos en una sartén caliente aceitada.",
      "En 1 minuto la espinaca se ablandará y reducirá su tamaño.",
      "Cascar los dos huevos directamente en la sartén sobre la espinaca.",
      "Revolver con espátula durante 2 minutos hasta lograr un revuelto cremoso.",
      "Condimentar con sal y servir caliente."
    ],
    substitutions: [
      { original: "Espinaca fresca", substitute: "Espinaca descongelada o acelga cocida", note: "Aprovecha lo que tengas en el freezer.", carbImpact: "Neutro" }
    ]
  },
  {
    id: "rec-48",
    name: "Galletas de arroz con queso untable y semillas",
    category: "snack",
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=700&q=80",
    timePrep: 2,
    timeCook: 0,
    defaultServings: 1,
    difficulty: "Muy fácil",
    costLevel: "Muy económico",
    estimatedCarbsPerServing: 14,
    estimatedCaloriesPerServing: 110,
    tags: ["sin_cocinar", "5_minutos", "economica"],
    ingredients: [
      { name: "Galletas de arroz inflado", amount: 2, unit: "unidades" },
      { name: "Queso untable o ricota", amount: 2, unit: "cdas" },
      { name: "Semillas de chía o sésamo", amount: 1, unit: "cdita" }
    ],
    instructions: [
      "Untar el queso sobre las galletas de arroz.",
      "Espolvorear con las semillas y disfrutar al instante."
    ],
    substitutions: [
      { original: "Queso untable", substitute: "Pasta de maní sin azúcar", note: "Suma mayor energía y grasas buenas.", carbImpact: "Similar" }
    ]
  },
  {
    id: "rec-49",
    name: "Ensalada express de tomate, queso y orégano",
    category: "cena",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=700&q=80",
    timePrep: 4,
    timeCook: 0,
    defaultServings: 1,
    difficulty: "Muy fácil",
    costLevel: "Muy económico",
    estimatedCarbsPerServing: 6,
    estimatedCaloriesPerServing: 180,
    tags: ["sin_cocinar", "5_minutos", "vegetariana", "rapida"],
    ingredients: [
      { name: "Tomate redondo maduro", amount: 1, unit: "unidad" },
      { name: "Queso fresco en cubitos", amount: 60, unit: "g" },
      { name: "Aceite de girasol u oliva", amount: 1, unit: "cda" },
      { name: "Orégano seco y sal", amount: 1, unit: "al gusto" }
    ],
    instructions: [
      "Lavar y cortar el tomate en cubos medianos.",
      "Colocar en un plato hondo junto con el queso en cubos.",
      "Rociar con el aceite, espolvorear sal y abundante orégano. Mezclar y listo para comer en menos de 5 minutos."
    ],
    substitutions: [
      { original: "Orégano", substitute: "Hojas de albahaca fresca", note: "Estilo ensalada caprese clásica.", carbImpact: "Neutro" }
    ]
  },
  {
    id: "rec-50",
    name: "Papas al microondas o hervidas con huevo y aceite",
    category: "almuerzo",
    image: "https://images.unsplash.com/photo-1628294895950-9805252327bc?auto=format&fit=crop&w=700&q=80",
    timePrep: 5,
    timeCook: 7,
    defaultServings: 1,
    difficulty: "Muy fácil",
    costLevel: "Muy económico",
    estimatedCarbsPerServing: 30,
    estimatedCaloriesPerServing: 240,
    tags: ["rapida", "sin_horno", "economica", "vegetariana"],
    ingredients: [
      { name: "Papa mediana lavada con cáscara", amount: 1, unit: "unidad" },
      { name: "Huevo duro o pasado por agua", amount: 1, unit: "unidad" },
      { name: "Aceite", amount: 1, unit: "cdita" },
      { name: "Sal y pimentón", amount: 1, unit: "al gusto" }
    ],
    instructions: [
      "Pinchar la papa con tenedor por varios lados, colocar en un plato apto para microondas con unas gotitas de agua y tapar.",
      "Cocinar en microondas a máxima potencia durante 6-7 minutos hasta que esté tierna (o hervir en cubitos).",
      "Cortar al medio, aplastar apenas con tenedor.",
      "Agregar el huevo cocido cortado por la mitad, rociar con el aceite y condimentar con sal y pimentón."
    ],
    substitutions: [
      { original: "Papa", substitute: "Batata dulce", note: "Rica en betacarotenos y muy sabrosa al microondas.", carbImpact: "Similar" }
    ]
  }
];

// Compatibilidad universal (navegadores con file:// y bundlers)
if (typeof window !== 'undefined') {
  window.INITIAL_RECIPES = INITIAL_RECIPES;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { INITIAL_RECIPES };
}
