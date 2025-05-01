import { useGastos } from "../context/GastosContext";
import { useEffect } from "react";

const currencySymbols: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  ARS: "$",
  BRL: "R$",
  MXN: "$",
};

export const useCurrency = () => {
  const { userPreferences, updateUserPreferences } = useGastos();
  const currency = userPreferences?.currency ?? "USD";

  useEffect(() => {
    // Sync with localStorage for components that haven't been updated yet
    localStorage.setItem("currency", currency);
  }, [currency]);

  const setCurrency = async (newCurrency: string) => {
    if (userPreferences) {
      await updateUserPreferences({
        ...userPreferences,
        currency: newCurrency,
      });
    }
  };

  const formatCurrency = (amount: number): string => {
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
    currency,
    setCurrency,
    formatCurrency,
  };
};
