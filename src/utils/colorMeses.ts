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
 * Genera diferentes tonos de un color base para los gastos dentro de cada mes
 * @param colorBase El color base del mes
 * @param index El índice del gasto dentro del mes
 * @param totalGastos El total de gastos en el mes
 * @returns Un color en formato hexadecimal
 */
export const generarTonoGasto = (
  colorBase: string,
  index: number,
  totalGastos: number
): string => {
  if (!colorBase || !colorBase.startsWith("#")) {
    return "#C9CBCF"; // Color gris por defecto
  }

  try {
    // Convertir el color hexadecimal a RGB
    const r = parseInt(colorBase.slice(1, 3), 16);
    const g = parseInt(colorBase.slice(3, 5), 16);
    const b = parseInt(colorBase.slice(5, 7), 16);

    // Calcular el factor de oscurecimiento basado en el índice
    const factor = 0.2 + (index / totalGastos) * 0.6; // Oscila entre 0.2 y 0.8

    // Aplicar el factor a cada componente RGB
    const newR = Math.round(r * factor);
    const newG = Math.round(g * factor);
    const newB = Math.round(b * factor);

    // Convertir de nuevo a hexadecimal
    return `#${newR.toString(16).padStart(2, "0")}${newG
      .toString(16)
      .padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`;
  } catch (error) {
    console.error("Error al generar tono de color:", error);
    return "#C9CBCF"; // Color gris por defecto en caso de error
  }
};

/**
 * Obtiene el color base para un mes específico
 */
export const obtenerColorMes = (mes: string): string => {
  const mesNormalizado =
    mes.charAt(0).toUpperCase() + mes.slice(1).toLowerCase();
  return coloresMeses[mesNormalizado as MesType] || "#C9CBCF";
};
