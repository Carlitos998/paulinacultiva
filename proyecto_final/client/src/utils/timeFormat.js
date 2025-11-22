// utils/timeFormat.js

/**
 * Formatea el tiempo a un formato legible
 * @param {number} time - Tiempo (número)
 * @param {string} unidad - Unidad del tiempo ('min' o 'horas')
 * @returns {string} Tiempo formateado
 */
export const formatTime = (time, unidad = 'min') => {
  if (!time || time <= 0) {
    return 'Tiempo no especificado';
  }

  // Si no se especifica unidad o es 'min', usar la lógica original para mantener compatibilidad
  if (unidad === 'min') {
    if (time < 60) {
      return `${time} min`;
    }

    const hours = Math.floor(time / 60);
    const remainingMinutes = time % 60;

    if (remainingMinutes === 0) {
      return `${hours}h`;
    }

    return `${hours}h ${remainingMinutes}min`;
  }

  // Si la unidad es 'horas', mostrar directamente en horas
  if (unidad === 'horas') {
    // Si es un número entero, mostrar solo horas
    if (Number.isInteger(time)) {
      return time === 1 ? '1 hora' : `${time} horas`;
    }

    // Si tiene decimales, formatear mejor
    const hours = Math.floor(time);
    const decimalPart = (time - hours).toFixed(1);

    if (decimalPart === '0.0') {
      return hours === 1 ? '1 hora' : `${hours} horas`;
    }

    // Convertir decimales a minutos (0.5 hora = 30 minutos)
    const minutes = Math.round(decimalPart * 60);
    if (minutes > 0) {
      return `${hours}h ${minutes}min`;
    } else {
      return `${hours}h`;
    }
  }

  // Por defecto, asumir minutos
  return `${time} min`;
};

/**
 * Formatea una fecha a un formato legible
 * @param {Date|string} date - Fecha a formatear
 * @returns {string} Fecha formateada
 */
export const formatDate = (date) => {
  if (!date) return '';

  const dateObj = new Date(date);
  return dateObj.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

/**
 * Formatea una fecha con hora a un formato legible
 * @param {Date|string} date - Fecha a formatear
 * @returns {string} Fecha y hora formateadas
 */
export const formatDateTime = (date) => {
  if (!date) return '';

  const dateObj = new Date(date);
  return dateObj.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};