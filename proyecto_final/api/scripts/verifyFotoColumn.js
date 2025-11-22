const { sequelize, DataTypes } = require('../config/db');

async function verifyFotoColumn() {
  try {
    console.log('🔍 Verificando campo foto en la tabla posts...');

    // Verificar si la columna ya existe
    const results = await sequelize.getQueryInterface().describeTable('posts');

    if (results.foto) {
      console.log('✅ Campo foto existe en la tabla posts:', results.foto);
    } else {
      console.log('❌ El campo foto NO existe en la tabla posts');
      console.log('Campos existentes:', Object.keys(results));

      // Agregar el campo si no existe
      console.log('🔄 Agregando campo foto a la tabla posts...');
      await sequelize.getQueryInterface().addColumn('posts', 'foto', {
        type: DataTypes.STRING(500),
        allowNull: true
      });
      console.log('✅ Campo foto agregado exitosamente');
    }

  } catch (error) {
    console.error('❌ Error verificando campo foto:', error);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar la verificación
verifyFotoColumn();