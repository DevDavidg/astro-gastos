import type { Gasto } from "../types/gasto";

/**
 * Calcula el total de gastos
 */
export const calcularTotal = (gastos: Gasto[]): number => {
  return gastos.reduce((total, gasto) => total + gasto.monto, 0);
};

/**
 * Calcula el total de gastos por mes
 */
export const calcularTotalPorMes = (
  gastos: Gasto[]
): Record<string, number> => {
  return gastos.reduce((acc: Record<string, number>, gasto) => {
    const { mes, monto } = gasto;
    if (!acc[mes]) {
      acc[mes] = 0;
    }
    acc[mes] += monto;
    return acc;
  }, {});
};

/**
 * Calcula el porcentaje de gastos para gráficos
 */
export const calcularPorcentajes = (
  gastos: Gasto[]
): Record<string, number> => {
  const totalGastos = calcularTotal(gastos);
  const totalPorMes = calcularTotalPorMes(gastos);

  const porcentajes: Record<string, number> = {};

  Object.entries(totalPorMes).forEach(([mes, total]) => {
    porcentajes[mes] = totalGastos > 0 ? (total / totalGastos) * 100 : 0;
  });

  return porcentajes;
};
