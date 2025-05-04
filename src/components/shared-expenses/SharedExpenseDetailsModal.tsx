import React from "react";
import { useCurrency } from "../../hooks/useCurrency";
import type { Gasto, Persona } from "../../types/gasto";

interface SharedExpenseDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  gastos: Gasto[];
  personas: Persona[];
}

const SharedExpenseDetailsModal: React.FC<SharedExpenseDetailsModalProps> = ({
  isOpen,
  onClose,
  gastos,
  personas,
}) => {
  const { formatCurrency } = useCurrency();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Detalles de Gastos Compartidos
                </h3>

                <div className="space-y-4">
                  {gastos.map((gasto) => {
                    const porcentajePersona1 = gasto.porcentajepersona1 || 0;
                    const porcentajePersona2 = gasto.porcentajepersona2 || 0;
                    const persona1 = personas.find(
                      (p) => p.id === gasto.personaid
                    );
                    const persona2 = personas.find(
                      (p) => p.email === gasto.otraPersonaEmail
                    );

                    return (
                      <div
                        key={gasto.id}
                        className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="text-lg font-semibold text-indigo-600">
                              {formatCurrency(gasto.monto)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {gasto.descripcion}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {new Date(gasto.fecha).toLocaleDateString(
                                "es-ES",
                                {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                }
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {persona1?.email}
                              </div>
                              <div className="text-xs text-gray-500">
                                {porcentajePersona1}% del total
                              </div>
                            </div>
                            <div className="text-sm font-medium text-gray-900">
                              {formatCurrency(
                                (gasto.monto * porcentajePersona1) / 100
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {gasto.otraPersonaEmail}
                              </div>
                              <div className="text-xs text-gray-500">
                                {porcentajePersona2}% del total
                              </div>
                            </div>
                            <div className="text-sm font-medium text-gray-900">
                              {formatCurrency(
                                (gasto.monto * porcentajePersona2) / 100
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedExpenseDetailsModal;
