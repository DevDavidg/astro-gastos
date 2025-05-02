import React from "react";
import type { Gasto } from "../../types/gasto";
import TableRow from "./TableRow";
import TableHeader from "./TableHeader";
import { useCurrency } from "../../hooks/useCurrency";

interface TableExpandedModalProps {
  isOpen: boolean;
  onClose: () => void;
  gastos: Gasto[];
  onDelete: (id: string) => void;
  totals: {
    total: number;
    totalCompartido: number;
    totalNoCompartido: number;
  };
}

const TableExpandedModal = ({
  isOpen,
  onClose,
  gastos,
  onDelete,
  totals,
}: TableExpandedModalProps) => {
  const { currency, formatCurrency } = useCurrency();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-6xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex flex-col">
              <h2 className="text-xl font-semibold text-gray-900">
                Detalles de Gastos
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Vista detallada de todos los gastos
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full p-1"
              aria-label="Cerrar modal"
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

          {/* Content */}
          <div className="p-6">
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <TableHeader showAllColumns={true} />
                <tbody className="bg-white divide-y divide-gray-200">
                  {gastos.map((gasto) => (
                    <TableRow
                      key={gasto.id}
                      gasto={gasto}
                      onDelete={onDelete}
                      currencyCode={currency}
                      showAllColumns={true}
                    />
                  ))}
                </tbody>
                {/* Totals Row */}
                <tfoot>
                  <tr className="bg-gradient-to-r from-indigo-50 via-white to-pink-50 border-t-2 border-gray-200">
                    <td colSpan={6} className="p-6">
                      <div className="flex flex-col items-end gap-4">
                        <div className="flex flex-col items-end">
                          <div className="text-sm text-gray-600 mb-1">
                            Total General
                          </div>
                          <div className="text-3xl font-bold text-gray-900">
                            {formatCurrency(totals.total)}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-x-16 gap-y-2 text-sm bg-white p-4 rounded-lg shadow-sm">
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-indigo-600 font-medium">
                              Gastos Compartidos:
                            </span>
                            <span className="font-semibold text-gray-900">
                              {formatCurrency(totals.totalCompartido)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-pink-600 font-medium">
                              Gastos No Compartidos:
                            </span>
                            <span className="font-semibold text-gray-900">
                              {formatCurrency(totals.totalNoCompartido)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-indigo-600">
                              % Compartido:
                            </span>
                            <span className="font-medium">
                              {(
                                (totals.totalCompartido / totals.total) *
                                100
                              ).toFixed(1)}
                              %
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-pink-600">
                              % No Compartido:
                            </span>
                            <span className="font-medium">
                              {(
                                (totals.totalNoCompartido / totals.total) *
                                100
                              ).toFixed(1)}
                              %
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableExpandedModal;
