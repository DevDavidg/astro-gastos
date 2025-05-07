import React, { useState } from "react";
import { GastosProvider } from "../../context/GastosContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Shield,
  Users,
  Settings,
  Moon,
  Sun,
  DollarSign,
} from "lucide-react";
import { useCurrency } from "../../hooks/useCurrency";
import { useTheme } from "../../hooks/useTheme";

const ConfigTabs = {
  PREFERENCES: "preferences",
  PERSONAS: "personas",
  NOTIFICATIONS: "notifications",
  SECURITY: "security",
} as const;

type ConfigTab = (typeof ConfigTabs)[keyof typeof ConfigTabs];

export const ConfigPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ConfigTab>(ConfigTabs.PREFERENCES);
  const { currency, setCurrency } = useCurrency();
  const { isDarkMode, toggleDarkMode } = useTheme();

  const tabs = [
    {
      id: ConfigTabs.PREFERENCES,
      label: "Preferencias",
      icon: <Settings className="h-5 w-5" />,
    },
    {
      id: ConfigTabs.PERSONAS,
      label: "Personas",
      icon: <Users className="h-5 w-5" />,
    },
    {
      id: ConfigTabs.NOTIFICATIONS,
      label: "Notificaciones",
      icon: <Bell className="h-5 w-5" />,
    },
    {
      id: ConfigTabs.SECURITY,
      label: "Seguridad",
      icon: <Shield className="h-5 w-5" />,
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case ConfigTabs.PREFERENCES:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Moon className="h-5 w-5 text-indigo-500" />
                <h3 className="text-lg font-medium">Tema</h3>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => toggleDarkMode()}
                  className={`p-2 rounded-md ${
                    isDarkMode
                      ? "bg-gray-800 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {isDarkMode ? (
                    <Moon className="h-5 w-5" />
                  ) : (
                    <Sun className="h-5 w-5" />
                  )}
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {isDarkMode ? "Modo Oscuro" : "Modo Claro"}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-indigo-500" />
                <h3 className="text-lg font-medium">Moneda</h3>
              </div>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full max-w-xs p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ARS">Peso Argentino (ARS)</option>
                <option value="USD">Dólar Estadounidense (USD)</option>
                <option value="EUR">Euro (EUR)</option>
                <option value="BRL">Real Brasileño (BRL)</option>
              </select>
            </div>
          </div>
        );
      case ConfigTabs.PERSONAS:
        return (
          <div className="space-y-6">
            <div className="p-4 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-500">
                Próximamente: Gestión de personas para compartir gastos
              </p>
            </div>
          </div>
        );
      case ConfigTabs.NOTIFICATIONS:
        return (
          <div className="space-y-6">
            <div className="p-4 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-500">
                Próximamente: Configuración de notificaciones
              </p>
            </div>
          </div>
        );
      case ConfigTabs.SECURITY:
        return (
          <div className="space-y-6">
            <div className="p-4 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-500">
                Próximamente: Configuración de seguridad
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <GastosProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-bold text-gray-900 dark:text-white"
              >
                Configuración
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mt-2 text-sm text-gray-600 dark:text-gray-400"
              >
                Personaliza tu experiencia en la aplicación
              </motion.p>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex space-x-8 px-6" aria-label="Tabs">
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
                      {tab.icon}
                      <span>{tab.label}</span>
                    </motion.button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {renderTabContent()}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GastosProvider>
  );
};
