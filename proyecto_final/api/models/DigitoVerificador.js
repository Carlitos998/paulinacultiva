const { sequelize } = require("../config/db");
const { DataTypes } = require('sequelize');

const DigitoVerificador = sequelize.define('digito_verificador', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre_tabla: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    field: 'nombre_tabla'
  },
  suma_dvh: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'suma_dvh'
  },
  fecha_calculo: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'fecha_calculo'
  }
}, {
  tableName: 'digito_verificador',
  timestamps: true
});

// Método para actualizar la suma de DVH de una tabla
DigitoVerificador.actualizarSumaDVH = async function(nombreTabla, modelo) {
  try {
    // Obtener todos los registros de la tabla
    const registros = await modelo.findAll({ attributes: ['dvh'] });

    // Calcular la suma total de DVH
    let sumaTotal = 0;
    for (const registro of registros) {
      if (registro.dvh !== null && registro.dvh !== undefined) {
        sumaTotal += Number(registro.dvh);
      }
    }

    // Actualizar o crear el registro en digito_verificador
    await DigitoVerificador.upsert({
      nombre_tabla: nombreTabla,
      suma_dvh: sumaTotal,
      fecha_calculo: new Date()
    });

    return sumaTotal;
  } catch (error) {
    console.error('Error al actualizar suma DVH:', error);
    throw error;
  }
};

module.exports = {
  DigitoVerificador
};