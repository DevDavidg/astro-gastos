import type { MesType } from "../types/gasto";

/**
 * Mapa de colores para cada mes, para mantener consistencia en toda la UI
 */
export const coloresMeses: Record<MesType, string> = {
  Enero: "#FF6384", // Rojo claro
  Febrero: "#FF9F40", // Naranja
  Marzo: "#FFCE56", // Amarillo
  Abril: "#4BC0C0", // Verde azulado
  Mayo: "#36A2EB", // Azul claro
  Junio: "#9966FF", // Púrpura
  Julio: "#FF6384", // Rojo claro (repetido)
  Agosto: "#FF9F40", // Naranja (repetido)
  Septiembre: "#FFCE56", // Amarillo (repetido)
  Octubre: "#4BC0C0", // Verde azulado (repetido)
  Noviembre: "#36A2EB", // Azul claro (repetido)
  Diciembre: "#9966FF", // Púrpura (repetido)
};

/**
 * Obtiene el color correspondiente a un mes
 */
export const obtenerColorMes = (mes: string): string => {
  return coloresMeses[mes as MesType] || "#C9CBCF"; // Gris por defecto si no hay coincidencia
};
