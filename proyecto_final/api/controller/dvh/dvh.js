const crypto = require('crypto');

/**
 * Calcula el Dígito Verificador Horizontal (DVH) para un registro
 * Usando el método de concatenación de datos, conversión a int y división por 7
 *
 * @param {Object} data - Objeto con los datos del registro (sin incluir DVH)
 * @returns {number} - DVH calculado como número (módulo 7)
 */
function calcularDVH(data) {
  try {
    // Eliminar campos que no deben participar en el cálculo
    const { dvh, id, createdAt, updatedAt, ...datosLimpios } = data;

    // Ordenar las claves para garantizar consistencia
    const clavesOrdenadas = Object.keys(datosLimpios).sort();

    // Construir string concatenando todos los valores de forma ordenada
    let stringConcatenado = '';
    for (const clave of clavesOrdenadas) {
      if (datosLimpios[clave] !== null && datosLimpios[clave] !== undefined) {
        stringConcatenado += String(datosLimpios[clave]);
      }
    }

    // Convertir el string concatenado a número (suma de códigos ASCII)
    let sumaTotal = 0;
    for (let i = 0; i < stringConcatenado.length; i++) {
      sumaTotal += stringConcatenado.charCodeAt(i);
    }

    // Dividir por 7 y retornar el resultado
    return sumaTotal % 7;
  } catch (error) {
    console.error('Error al calcular DVH:', error);
    // En caso de error, retornar un valor por defecto
    return 0;
  }
}

/**
 * Verifica si el DVH de un registro es válido
 *
 * @param {Object} registro - Registro completo con su DVH
 * @returns {boolean} - true si el DVH es válido, false si hay manipulación
 */
function verificarDVH(registro) {
  if (registro.dvh === null || registro.dvh === undefined) {
    return false;
  }

  const dvhCalculado = calcularDVH(registro);
  return Number(registro.dvh) === dvhCalculado;
}

/**
 * Calcula DVH usando método alternativo (suma ponderada con primo 7)
 * Este método es más simple pero menos seguro que el hash
 *
 * @param {Object} data - Objeto con los datos del registro
 * @returns {number} - DVH calculado como número
 */
function calcularDVHSimple(data) {
  try {
    const { dvh, id, createdAt, updatedAt, ...datosLimpios } = data;

    let sumaTotal = 0;
    let peso = 1;

    // Recorrer todos los valores y sumar caracteres ASCII con pesos
    const valores = Object.values(datosLimpios);
    for (const valor of valores) {
      if (valor !== null && valor !== undefined) {
        const stringValor = String(valor);
        for (let i = 0; i < stringValor.length; i++) {
          sumaTotal += stringValor.charCodeAt(i) * peso;
          peso = (peso % 7) + 1; // Ciclar entre 1 y 7
        }
      }
    }

    return sumaTotal % 100000000; // Mantenerlo en 8 dígitos
  } catch (error) {
    console.error('Error al calcular DVH simple:', error);
    return 0;
  }
}

/**
 * Calcula el Dígito Verificador Vertical (DVV) para una tabla
 * Suma todos los DVH de los registros (sin aplicar módulo 7)
 *
 * @param {Array} registros - Array de registros con sus DVH
 * @returns {number} - DVV calculado como número (suma simple)
 */
function calcularDVV(registros) {
  try {
    let sumaDVH = 0;

    for (const registro of registros) {
      if (registro.dvh !== null && registro.dvh !== undefined) {
        sumaDVH += Number(registro.dvh);
      }
    }

    return sumaDVH; // Solo la suma, sin módulo 7
  } catch (error) {
    console.error('Error al calcular DVV:', error);
    return 0;
  }
}

/**
 * Función principal para actualizar toda la integridad de datos
 * Calcula DVH para todos los registros y luego el DVV para la tabla
 *
 * @param {Object} modelo - Modelo de Sequelize
 * @param {string} nombreTabla - Nombre de la tabla
 * @returns {Promise<Object>} - Objeto con DVV calculado
 */
async function actualizarIntegridadCompleta(modelo, nombreTabla) {
  try {
    // Obtener todos los registros
    const registros = await modelo.findAll();

    // Calcular y actualizar DVH para cada registro
    for (const registro of registros) {
      const datos = registro.get({ plain: true });
      const nuevoDVH = calcularDVH(datos);

      if (Number(registro.dvh) !== nuevoDVH) {
        await registro.update({ dvh: nuevoDVH });
      }
    }

    // Actualizar la suma de DVH en la tabla digito_verificador
    const { DigitoVerificador } = require('../models');
    const sumaDVH = await DigitoVerificador.actualizarSumaDVH(nombreTabla, modelo);

    return { sumaDVH, registrosActualizados: registros.length };
  } catch (error) {
    console.error('Error al actualizar integridad completa:', error);
    throw error;
  }
}

module.exports = {
  calcularDVH,
  verificarDVH,
  calcularDVHSimple,
  calcularDVV,
  actualizarIntegridadCompleta
};