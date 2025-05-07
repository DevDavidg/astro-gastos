import React from "react";
import { useCurrency } from "../../hooks/useCurrency";
import type { Gasto, Persona } from "../../types/gasto";
import { motion, AnimatePresence } from "framer-motion";

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
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 overflow-y-auto"
        >
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.75 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
              onClick={onClose}
            >
              <div className="absolute inset-0 bg-gray-900"></div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full"
            >
              <div className="bg-white px-6 pt-6 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mr-3 shadow-inner">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-indigo-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                    </div>
                    Detalles de Gastos Compartidos
                  </h3>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500 transition-colors"
                  >
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  {gastos.map((gasto, index) => {
                    const porcentajePersona1 = gasto.porcentajepersona1 || 0;
                    const porcentajePersona2 = gasto.porcentajepersona2 || 0;
                    const persona1 = personas.find(
                      (p) => p.id === gasto.personaid
                    );
                    const persona2 = personas.find(
                      (p) => p.email === gasto.otraPersonaEmail
                    );

                    return (
                      <motion.div
                        key={gasto.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 hover:shadow-md transition-all duration-300 border border-gray-100"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <div className="text-2xl font-bold text-indigo-600">
                              {formatCurrency(gasto.monto)}
                            </div>
                            <div className="text-lg text-gray-700 mt-1">
                              {gasto.descripcion}
                            </div>
                            <div className="text-sm text-gray-500 mt-2">
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

                        <div className="space-y-3">
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200"
                          >
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mr-3 shadow-inner">
                                <span className="text-indigo-600 font-semibold">
                                  {persona1?.email?.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {persona1?.email}
                                </div>
                                <div className="text-xs text-indigo-500 font-medium">
                                  {porcentajePersona1}% del total
                                </div>
                              </div>
                            </div>
                            <div className="text-lg font-bold text-gray-900">
                              {formatCurrency(
                                (gasto.monto * porcentajePersona1) / 100
                              )}
                            </div>
                          </motion.div>

                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200"
                          >
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mr-3 shadow-inner">
                                <span className="text-indigo-600 font-semibold">
                                  {gasto.otraPersonaEmail?.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {gasto.otraPersonaEmail}
                                </div>
                                <div className="text-xs text-indigo-500 font-medium">
                                  {porcentajePersona2}% del total
                                </div>
                              </div>
                            </div>
                            <div className="text-lg font-bold text-gray-900">
                              {formatCurrency(
                                (gasto.monto * porcentajePersona2) / 100
                              )}
                            </div>
                          </motion.div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SharedExpenseDetailsModal;
