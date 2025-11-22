// seed.js - Script para inicializar datos de prueba
const { sequelize } = require('./config/db');
const { Category } = require('./models/Category');
const { Cuisine } = require('./models/Cuisine');
const { Ingredient } = require('./models/Ingredient');

const seedData = async () => {
  try {
    console.log('🌱 Iniciando siembra de datos...');

    // Sincronizar base de datos
    await sequelize.sync({ force: true });
    console.log('✅ Base de datos sincronizada');

    // Crear categorías
    const categories = await Category.bulkCreate([
      { name: 'Entradas', icon: '🥗', color: '#10b981', description: 'Platos para comenzar la comida' },
      { name: 'Platos Principales', icon: '🍽️', color: '#f97316', description: 'El plato fuerte de la comida' },
      { name: 'Postres', icon: '🍰', color: '#ec4899', description: 'Dulces finales' },
      { name: 'Desayunos', icon: '🥐', color: '#fbbf24', description: 'Para empezar el día' },
      { name: 'Bebidas', icon: '🥤', color: '#3b82f6', description: 'Refrescos y bebidas varias' },
      { name: 'Snacks', icon: '🍿', color: '#8b5cf6', description: 'Picadas y aperitivos' },
      { name: 'Sopas y Cremas', icon: '🍲', color: '#f59e0b', description: 'Platos calientes y reconfortantes' },
      { name: 'Ensaladas', icon: '🥬', color: '#84cc16', description: 'Opciones frescas y saludables' }
    ]);
    console.log(`✅ ${categories.length} categorías creadas`);

    // Crear cocinas
    const cuisines = await Cuisine.bulkCreate([
      { name: 'Argentina', origin: 'Argentina', flag: '🇦🇷', description: 'Comida tradicional argentina' },
      { name: 'Italiana', origin: 'Italia', flag: '🇮🇹', description: 'Pasta, pizza y más' },
      { name: 'Mexicana', origin: 'México', flag: '🇲🇽', description: 'Tacos, burritos y picante' },
      { name: 'Española', origin: 'España', flag: '🇪🇸', description: 'Paella, tapas y jamón' },
      { name: 'Japonesa', origin: 'Japón', flag: '🇯🇵', description: 'Sushi, ramen y tempura' },
      { name: 'Francesa', origin: 'Francia', flag: '🇫🇷', description: 'Croissants, queso y vinos' },
      { name: 'Tailandesa', origin: 'Tailandia', flag: '🇹🇭', description: 'Curry, noodles y especias' },
      { name: 'India', origin: 'India', flag: '🇮🇳', description: 'Curry, especias y vegetales' },
      { name: 'China', origin: 'China', flag: '🇨🇳', description: 'Dim sum, arroz y wok' },
      { name: 'Mediterránea', origin: 'Mediterráneo', flag: '🌊', description: 'Aceite de oliva, pescado y vegetales frescos' }
    ]);
    console.log(`✅ ${cuisines.length} cocinas creadas`);

    // Crear ingredientes comunes
    const ingredients = await Ingredient.bulkCreate([
      // Carnes
      { name: 'Pollo', category: 'carnes', unit: 'gramos', isCommon: true },
      { name: 'Carne molida', category: 'carnes', unit: 'gramos', isCommon: true },
      { name: 'Pescado', category: 'pescado', unit: 'gramos', isCommon: true },
      { name: 'Salchichas', category: 'carnes', unit: 'unidades', isCommon: true },
      { name: 'Jamón', category: 'carnes', unit: 'gramos', isCommon: true },

      // Vegetales
      { name: 'Cebolla', category: 'vegetales', unit: 'unidades', isCommon: true },
      { name: 'Tomate', category: 'vegetales', unit: 'unidades', isCommon: true },
      { name: 'Ajo', category: 'vegetales', unit: 'dientes', isCommon: true },
      { name: 'Morrón', category: 'vegetales', unit: 'unidades', isCommon: true },
      { name: 'Zanahoria', category: 'vegetales', unit: 'unidades', isCommon: true },
      { name: 'Papa', category: 'vegetales', unit: 'unidades', isCommon: true },
      { name: 'Lechuga', category: 'vegetales', unit: 'unidades', isCommon: true },
      { name: 'Espinaca', category: 'vegetales', unit: 'gramos', isCommon: true },
      { name: 'Brócoli', category: 'vegetales', unit: 'gramos', isCommon: true },

      // Lácteos
      { name: 'Queso', category: 'lacteos', unit: 'gramos', isCommon: true },
      { name: 'Leche', category: 'lacteos', unit: 'ml', isCommon: true },
      { name: 'Yogur', category: 'lacteos', unit: 'gramos', isCommon: true },
      { name: 'Mantequilla', category: 'lacteos', unit: 'gramos', isCommon: true },
      { name: 'Crema', category: 'lacteos', unit: 'ml', isCommon: true },

      // Granos y Harinas
      { name: 'Arroz', category: 'granos', unit: 'gramos', isCommon: true },
      { name: 'Fideos', category: 'granos', unit: 'gramos', isCommon: true },
      { name: 'Harina', category: 'granos', unit: 'gramos', isCommon: true },
      { name: 'Pan rallado', category: 'granos', unit: 'gramos', isCommon: true },
      { name: 'Lentejas', category: 'granos', unit: 'gramos', isCommon: true },

      // Condimentos y Especias
      { name: 'Sal', category: 'condimentos', unit: 'gramos', isCommon: true },
      { name: 'Pimienta', category: 'condimentos', unit: 'gramos', isCommon: true },
      { name: 'Orégano', category: 'condimentos', unit: 'gramos', isCommon: true },
      { name: 'Comino', category: 'condimentos', unit: 'gramos', isCommon: true },
      { name: 'Perejil', category: 'condimentos', unit: 'gramos', isCommon: true },
      { name: 'Laurel', category: 'condimentos', unit: 'hojas', isCommon: true },
      { name: 'Ají molido', category: 'condimentos', unit: 'gramos', isCommon: true },
      { name: 'Cúrcuma', category: 'condimentos', unit: 'gramos', isCommon: true },

      // Aceites y Grasas
      { name: 'Aceite de oliva', category: 'aceites', unit: 'ml', isCommon: true },
      { name: 'Aceite girasol', category: 'aceites', unit: 'ml', isCommon: true },
      { name: 'Manteca', category: 'grasas', unit: 'gramos', isCommon: true },

      // Huevos
      { name: 'Huevos', category: 'huevos', unit: 'unidades', isCommon: true, allergen: true },

      // Frutas
      { name: 'Limón', category: 'frutas', unit: 'unidades', isCommon: true },
      { name: 'Naranja', category: 'frutas', unit: 'unidades', isCommon: true },
      { name: 'Manzana', category: 'frutas', unit: 'unidades', isCommon: true },
      { name: 'Plátano', category: 'frutas', unit: 'unidades', isCommon: true },

      // Endulzantes
      { name: 'Azúcar', category: 'endulzantes', unit: 'gramos', isCommon: true },
      { name: 'Miel', category: 'endulzantes', unit: 'gramos', isCommon: true },

      // Otros
      { name: 'Vinagre', category: 'otros', unit: 'ml', isCommon: true },
      { name: 'Salsa de tomate', category: 'otros', unit: 'gramos', isCommon: true },
      { name: 'Mayonesa', category: 'otros', unit: 'gramos', isCommon: true },
      { name: 'Mostaza', category: 'otros', unit: 'gramos', isCommon: true },
      { name: 'Champiñones', category: 'vegetales', unit: 'gramos', isCommon: true },
      { name: 'Aceitunas', category: 'vegetales', unit: 'gramos', isCommon: true }
    ]);
    console.log(`✅ ${ingredients.length} ingredientes creados`);

    console.log('🎉 Siembra de datos completada exitosamente');
    console.log('📊 Resumen:');
    console.log(`   - ${categories.length} categorías`);
    console.log(`   - ${cuisines.length} cocinas`);
    console.log(`   - ${ingredients.length} ingredientes`);
    console.log('');
    console.log('🔑 Credenciales de admin para pruebas:');
    console.log('   Email: admin@test.com');
    console.log('   Password: admin123');

  } catch (error) {
    console.error('❌ Error en la siembra de datos:', error);
  } finally {
    await sequelize.close();
  }
};

// Ejecutar la siembra
seedData();