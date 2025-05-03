import type { Gasto } from "../../types/gasto";
import TableRow from "./TableRow";
import TableHeader from "./TableHeader";
import { useCurrency } from "../../hooks/useCurrency";
import { useState, useEffect } from "react";

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
  const { formatCurrency } = useCurrency();
  const [sortedGastos, setSortedGastos] = useState(gastos);

  const handleSort = (criteria: "monto" | "mes" | "fecha") => {
    setSortedGastos((prev) => {
      return [...prev].sort((a, b) => {
        switch (criteria) {
          case "monto":
            return b.monto - a.monto;
          case "mes":
            const meses = [
              "enero",
              "febrero",
              "marzo",
              "abril",
              "mayo",
              "junio",
              "julio",
              "agosto",
              "septiembre",
              "octubre",
              "noviembre",
              "diciembre",
            ];
            return (
              meses.indexOf(a.mes.toLowerCase()) -
              meses.indexOf(b.mes.toLowerCase())
            );
          case "fecha":
            return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
          default:
            return 0;
        }
      });
    });
  };

  useEffect(() => {
    setSortedGastos(gastos);
  }, [gastos]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Detalles de Gastos
                </h3>
                <div className="mt-4">
                  <table className="min-w-full divide-y divide-gray-200">
                    <TableHeader showAllColumns={true} onSort={handleSort} />
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sortedGastos.map((gasto) => (
                        <TableRow
                          key={gasto.id}
                          gasto={gasto}
                          onDelete={onDelete}
                          showAllColumns={true}
                        />
                      ))}
                    </tbody>
                  </table>
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

export default TableExpandedModal;
