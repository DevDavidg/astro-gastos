import React, { useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../hooks/useTheme";
import { useCurrency } from "../hooks/useCurrency";
import { useGastos } from "../context/GastosContext";

const ProfilePage: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { formatCurrency } = useCurrency();
  const { personas } = useGastos();
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { id: "overview", label: "Resumen", icon: "📊" },
    { id: "settings", label: "Configuración", icon: "⚙️" },
    { id: "statistics", label: "Estadísticas", icon: "📈" },
  ];

  const persona1 = personas?.find((p) => p.id === "persona1");
  const persona2 = personas?.find((p) => p.id === "persona2");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="relative">
            <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600" />
            <div className="absolute -bottom-16 left-8">
              <div className="h-32 w-32 rounded-full border-4 border-white dark:border-gray-800 bg-white dark:bg-gray-700 flex items-center justify-center">
                <span className="text-4xl">👤</span>
              </div>
            </div>
          </div>

          <div className="pt-20 px-8 pb-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Perfil de Usuario
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  Gestiona tu perfil y preferencias
                </p>
              </div>
              <motion.button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isDarkMode ? "🌙" : "☀️"}
              </motion.button>
            </div>

            <div className="mt-8 border-b border-gray-200 dark:border-gray-700">
              <nav className="flex space-x-8">
                {tabs.map((tab) => (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </motion.button>
                ))}
              </nav>
            </div>

            <div className="mt-8">
              {activeTab === "overview" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Persona 1
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Nombre
                          </p>
                          <p className="text-gray-900 dark:text-white font-medium">
                            {persona1?.nombre ?? "No definido"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Sueldo
                          </p>
                          <p className="text-gray-900 dark:text-white font-medium">
                            {formatCurrency(persona1?.sueldo ?? 0)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Persona 2
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Nombre
                          </p>
                          <p className="text-gray-900 dark:text-white font-medium">
                            {persona2?.nombre ?? "No definido"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Sueldo
                          </p>
                          <p className="text-gray-900 dark:text-white font-medium">
                            {formatCurrency(persona2?.sueldo ?? 0)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Resumen Total
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Sueldo Total
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {formatCurrency(
                            (persona1?.sueldo ?? 0) + (persona2?.sueldo ?? 0)
                          )}
                        </p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Sueldo Promedio
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {formatCurrency(
                            ((persona1?.sueldo ?? 0) +
                              (persona2?.sueldo ?? 0)) /
                              2
                          )}
                        </p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Diferencia
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {formatCurrency(
                            Math.abs(
                              (persona1?.sueldo ?? 0) - (persona2?.sueldo ?? 0)
                            )
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "settings" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Preferencias
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            Modo Oscuro
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Cambia el tema de la aplicación
                          </p>
                        </div>
                        <button
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
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "statistics" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Estadísticas
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                        <h4 className="text-base font-medium text-gray-900 dark:text-white mb-4">
                          Distribución de Sueldos
                        </h4>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-500 dark:text-gray-400">
                                Persona 1
                              </span>
                              <span className="text-gray-900 dark:text-white font-medium">
                                {formatCurrency(persona1?.sueldo ?? 0)}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-indigo-500 h-2 rounded-full"
                                style={{
                                  width: `${
                                    ((persona1?.sueldo ?? 0) /
                                      ((persona1?.sueldo ?? 0) +
                                        (persona2?.sueldo ?? 0))) *
                                    100
                                  }%`,
                                }}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-500 dark:text-gray-400">
                                Persona 2
                              </span>
                              <span className="text-gray-900 dark:text-white font-medium">
                                {formatCurrency(persona2?.sueldo ?? 0)}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-purple-500 h-2 rounded-full"
                                style={{
                                  width: `${
                                    ((persona2?.sueldo ?? 0) /
                                      ((persona1?.sueldo ?? 0) +
                                        (persona2?.sueldo ?? 0))) *
                                    100
                                  }%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;
