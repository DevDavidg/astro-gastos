import React from "react";
import { UserPreferencesForm } from "../preferences/UserPreferencesForm";
import { PersonaForm } from "./PersonaForm";
import { GastosProvider } from "../../context/GastosContext";

export const ConfigPage: React.FC = () => {
  return (
    <GastosProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Configuración
              </h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Personaliza tu experiencia en la aplicación
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Preferencias de Usuario
                  </h2>
                  <UserPreferencesForm />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Personas
                  </h2>
                  <div className="space-y-4">
                    <PersonaForm personaId="persona1" />
                    <PersonaForm personaId="persona2" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GastosProvider>
  );
};
