import React, { useState } from "react";
import { useCurrency } from "../../hooks/useCurrency";

const CurrencySelector = () => {
  const { currency, setCurrency } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);

  const currencies = [
    { code: "USD", symbol: "$", name: "Dólar (USD)" },
    { code: "EUR", symbol: "€", name: "Euro (EUR)" },
    { code: "GBP", symbol: "£", name: "Libra (GBP)" },
    { code: "JPY", symbol: "¥", name: "Yen (JPY)" },
    { code: "MXN", symbol: "$", name: "Peso Mexicano (MXN)" },
    { code: "ARS", symbol: "$", name: "Peso Argentino (ARS)" },
    { code: "COP", symbol: "$", name: "Peso Colombiano (COP)" },
    { code: "BRL", symbol: "R$", name: "Real Brasileño (BRL)" },
  ];

  const handleCurrencyChange = async (currencyCode: string) => {
    await setCurrency(currencyCode);
    setIsOpen(false);
  };

  const getCurrentCurrency = () => {
    return currencies.find((c) => c.code === currency) || currencies[0];
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 bg-white rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span>{getCurrentCurrency().symbol}</span>
        <span>{getCurrentCurrency().code}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-4 w-4 text-gray-500 transition-transform ${
            isOpen ? "transform rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none transition-all">
          <div className="py-1 max-h-60 overflow-auto">
            {currencies.map((curr) => (
              <button
                key={curr.code}
                onClick={() => handleCurrencyChange(curr.code)}
                className={`block w-full text-left px-4 py-2 text-sm ${
                  curr.code === currency
                    ? "bg-indigo-50 text-indigo-700 font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{curr.symbol}</span>
                  <span>{curr.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrencySelector;
