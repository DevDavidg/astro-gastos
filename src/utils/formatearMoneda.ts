/**
 * Formatea un número a formato de moneda
 */
export const formatearMoneda = (
  cantidad: number,
  currencyCode = "USD"
): string => {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 2,
  }).format(cantidad);
};
