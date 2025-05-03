import React from "react";
import type { Gasto } from "../../types/gasto";
import { useCurrency } from "../../hooks/useCurrency";

interface DetallesGastosModalProps {
  isOpen: boolean;
  onClose: () => void;
  gastos: Gasto[];
  titulo: string;
  total: number;
}

const DetallesGastosModal: React.FC<DetallesGastosModalProps> = ({
  isOpen,
  onClose,
  gastos,
  titulo,
  total,
}) => {
  const { formatCurrency } = useCurrency();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <button
            className="absolute inset-0 bg-gray-500 opacity-75 w-full h-full border-0"
            onClick={onClose}
            aria-label="Cerrar modal"
            type="button"
            tabIndex={0}
          ></button>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  {titulo}
                </h3>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="text-2xl font-bold text-indigo-600">
                    {formatCurrency(total)}
                  </div>
                  <div className="text-sm text-gray-500">Total de gastos</div>
                </div>

                <div className="space-y-4">
                  {gastos.map((gasto) => (
                    <div
                      key={gasto.id}
                      className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {gasto.descripcion}
                        </p>
                        <div className="flex items-center mt-1">
                          <span className="text-xs text-gray-500">
                            {new Date(gasto.fecha).toLocaleDateString("es-ES", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </span>
                          <span className="mx-2 text-gray-300">•</span>
                          <span className="text-xs text-gray-500">
                            {gasto.escompartido
                              ? "Gasto compartido"
                              : "Gasto individual"}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(gasto.monto)}
                        </div>
                        {gasto.escompartido && (
                          <div className="text-xs text-gray-500">
                            {gasto.porcentajepersona1}% /{" "}
                            {gasto.porcentajepersona2}%
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
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

export default DetallesGastosModal;
