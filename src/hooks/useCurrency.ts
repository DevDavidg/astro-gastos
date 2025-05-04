const currencySymbols: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  ARS: "$",
  BRL: "R$",
  MXN: "$",
};

const isBrowser = typeof window !== "undefined";

export const useCurrency = () => {
  const getCurrency = () => {
    if (!isBrowser) return "ARS";
    return localStorage.getItem("currency") || "ARS";
  };

  const setCurrency = (newCurrency: string) => {
    if (!isBrowser) return;
    localStorage.setItem("currency", newCurrency);
  };

  const formatCurrency = (amount: number): string => {
    const currency = getCurrency();
    const symbol = currencySymbols[currency] || "$";
    const formatter = new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return formatter.format(amount).replace(currency, symbol);
  };

  return {
    currency: getCurrency(),
    setCurrency,
    formatCurrency,
  };
};
