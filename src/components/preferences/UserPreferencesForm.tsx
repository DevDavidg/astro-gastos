import React, { useState, useEffect } from "react";
import { useGastos } from "../../context/GastosContext";
import { useTheme } from "../../hooks/useTheme";
import { motion, AnimatePresence } from "framer-motion";
import type { UserPreferences } from "../../types/userPreferences";

export const UserPreferencesForm: React.FC = () => {
  const { userPreferences, updateUserPreferences } = useGastos();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [formData, setFormData] = useState<UserPreferences>({
    currency: "USD",
    theme: "light",
    language: "es",
  });
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (userPreferences) {
      setFormData(userPreferences);
    }
  }, [userPreferences]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUserPreferences(formData);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Error al actualizar preferencias:", error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const currencies = [
    { value: "USD", label: "USD ($)", icon: "$" },
    { value: "EUR", label: "EUR (€)", icon: "€" },
    { value: "GBP", label: "GBP (£)", icon: "£" },
    { value: "JPY", label: "JPY (¥)", icon: "¥" },
    { value: "ARS", label: "ARS ($)", icon: "$" },
    { value: "BRL", label: "BRL (R$)", icon: "R$" },
    { value: "MXN", label: "MXN ($)", icon: "$" },
  ];

  const languages = [
    { value: "es", label: "Español", flag: "🇪🇸" },
    { value: "en", label: "English", flag: "🇺🇸" },
    { value: "pt", label: "Português", flag: "🇧🇷" },
    { value: "fr", label: "Français", flag: "🇫🇷" },
    { value: "de", label: "Deutsch", flag: "🇩🇪" },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-6">
          <div>
            <label
              htmlFor="currency-group"
              className="text-base font-medium text-gray-900 dark:text-white"
            >
              Moneda
            </label>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Selecciona la moneda principal para tus gastos
            </p>
            <div
              id="currency-group"
              className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2"
            >
              {currencies.map((currency) => (
                <motion.div
                  key={currency.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <label
                    htmlFor={`currency-${currency.value}`}
                    className={`relative flex cursor-pointer rounded-lg border bg-white dark:bg-gray-800 p-4 shadow-sm focus:outline-none ${
                      formData.currency === currency.value
                        ? "border-indigo-500 ring-2 ring-indigo-500"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                    aria-label={`Seleccionar moneda ${currency.label}`}
                  >
                    <input
                      type="radio"
                      id={`currency-${currency.value}`}
                      name="currency"
                      value={currency.value}
                      className="sr-only"
                      checked={formData.currency === currency.value}
                      onChange={handleChange}
                    />
                    <span className="flex flex-1">
                      <span className="flex flex-col">
                        <span className="block text-sm font-medium text-gray-900 dark:text-white">
                          {currency.label}
                        </span>
                        <span className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                          {currency.icon}
                        </span>
                      </span>
                    </span>
                    <span
                      className={`pointer-events-none absolute -inset-px rounded-lg border-2 ${
                        formData.currency === currency.value
                          ? "border-indigo-500"
                          : "border-transparent"
                      }`}
                      aria-hidden="true"
                    />
                  </label>
                </motion.div>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="theme-toggle"
              className="text-base font-medium text-gray-900 dark:text-white"
            >
              Tema
            </label>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Personaliza la apariencia de la aplicación
            </p>
            <div className="mt-4">
              <button
                type="button"
                id="theme-toggle"
                onClick={toggleDarkMode}
                className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                style={{
                  backgroundColor: isDarkMode ? "#4F46E5" : "#E5E7EB",
                }}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isDarkMode ? "translate-x-5" : "translate-x-0"
                  }`}
                >
                  {isDarkMode ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-indigo-600"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-yellow-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </span>
              </button>
              <label
                htmlFor="theme-toggle"
                className="ml-3 text-sm text-gray-500 dark:text-gray-400"
              >
                {isDarkMode ? "Modo oscuro" : "Modo claro"}
              </label>
            </div>
          </div>

          <div>
            <label
              htmlFor="language-group"
              className="text-base font-medium text-gray-900 dark:text-white"
            >
              Idioma
            </label>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Selecciona el idioma de la aplicación
            </p>
            <div
              id="language-group"
              className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2"
            >
              {languages.map((language) => (
                <motion.div
                  key={language.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <label
                    htmlFor={`language-${language.value}`}
                    className={`relative flex cursor-pointer rounded-lg border bg-white dark:bg-gray-800 p-4 shadow-sm focus:outline-none ${
                      formData.language === language.value
                        ? "border-indigo-500 ring-2 ring-indigo-500"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                    aria-label={`Seleccionar idioma ${language.label}`}
                  >
                    <input
                      type="radio"
                      id={`language-${language.value}`}
                      name="language"
                      value={language.value}
                      className="sr-only"
                      checked={formData.language === language.value}
                      onChange={handleChange}
                    />
                    <span className="flex flex-1">
                      <span className="flex flex-col">
                        <span className="flex items-center text-sm font-medium text-gray-900 dark:text-white">
                          <span className="mr-2">{language.flag}</span>
                          {language.label}
                        </span>
                      </span>
                    </span>
                    <span
                      className={`pointer-events-none absolute -inset-px rounded-lg border-2 ${
                        formData.language === language.value
                          ? "border-indigo-500"
                          : "border-transparent"
                      }`}
                      aria-hidden="true"
                    />
                  </label>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-4">
          <motion.button
            type="submit"
            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Guardar preferencias
          </motion.button>
        </div>
      </form>

      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg"
          >
            ¡Preferencias guardadas con éxito!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
