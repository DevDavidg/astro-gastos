import React, { useState, useEffect } from "react";
import type { Gasto } from "../../types/gasto";
import { useGastos } from "../../context/GastosContext";
import { useCurrency } from "../../hooks/useCurrency";
import { obtenerEmailPersona } from "../../services/gastoService";

interface TableRowProps {
  gasto: Gasto;
  onDelete: (id: string) => void;
  currencyCode: string;
  showAllColumns?: boolean;
}

const TableRow = ({
  gasto,
  onDelete,
  currencyCode,
  showAllColumns = false,
}: TableRowProps) => {
  const { personas, eliminarGasto } = useGastos();
  const { formatCurrency } = useCurrency();
  const [isHovered, setIsHovered] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmail = async () => {
      const personaEmail = await obtenerEmailPersona(gasto.personaid);
      setEmail(personaEmail);
    };
    fetchEmail();
  }, [gasto.personaid]);

  const handleDelete = () => {
    setIsDeleting(true);

    setTimeout(() => {
      onDelete(gasto.id);
    }, 300);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      handleDelete();
    }
  };

  const renderizarInfoCompartido = () => {
    if (!gasto.escompartido) {
      return <span className="text-gray-600">No</span>;
    }

    return (
      <div className="text-xs space-y-1 bg-indigo-50 p-1.5 sm:p-2 rounded-lg border border-indigo-100">
        <div className="flex justify-between items-center gap-2">
          <span
            className="text-gray-700 truncate max-w-[140px]"
            title={email || gasto.personaid}
          >
            {email || gasto.personaid}
          </span>
          <span className="font-medium bg-indigo-100 text-indigo-800 px-1.5 sm:px-2 py-0.5 rounded shrink-0 min-w-[40px] text-center">
            {gasto.porcentajepersona1}%
          </span>
        </div>
        <div className="flex justify-between items-center gap-2">
          <span
            className="text-gray-700 truncate max-w-[140px]"
            title={gasto.otraPersonaEmail || ""}
          >
            {gasto.otraPersonaEmail}
          </span>
          <span className="font-medium bg-pink-100 text-pink-800 px-1.5 sm:px-2 py-0.5 rounded shrink-0 min-w-[40px] text-center">
            {gasto.porcentajepersona2}%
          </span>
        </div>
      </div>
    );
  };

  const obtenerColorMes = () => {
    const meses: Record<string, string> = {
      Enero: "bg-blue-100 text-blue-800",
      Febrero: "bg-purple-100 text-purple-800",
      Marzo: "bg-green-100 text-green-800",
      Abril: "bg-yellow-100 text-yellow-800",
      Mayo: "bg-red-100 text-red-800",
      Junio: "bg-indigo-100 text-indigo-800",
      Julio: "bg-orange-100 text-orange-800",
      Agosto: "bg-emerald-100 text-emerald-800",
      Septiembre: "bg-cyan-100 text-cyan-800",
      Octubre: "bg-amber-100 text-amber-800",
      Noviembre: "bg-violet-100 text-violet-800",
      Diciembre: "bg-rose-100 text-rose-800",
    };

    return meses[gasto.mes] || "bg-gray-100 text-gray-800";
  };

  const formatAmount = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}m`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}k`;
    }
    return amount.toString();
  };

  return (
    <tr
      className={`border-b transition-all duration-300 ${
        isDeleting
          ? "opacity-0 transform scale-95"
          : isHovered
          ? "bg-gray-50 shadow-sm"
          : "hover:bg-gray-50"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <td className="p-2">
        <span
          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${obtenerColorMes()}`}
        >
          {gasto.mes}
        </span>
      </td>
      <td className="p-2">
        <div className="flex flex-col">
          <span className="font-medium text-gray-800 text-sm truncate max-w-[150px]">
            {gasto.descripcion}
          </span>
          <span className="text-xs text-gray-500">
            {new Date(gasto.fecha).toLocaleDateString()}
          </span>
        </div>
      </td>
      <td className="p-2 w-[80px] !min-w-[80px] !max-w-[80px]">
        <div className="flex flex-col">
          <span className="font-medium text-gray-900 text-sm whitespace-nowrap">
            {!showAllColumns
              ? formatAmount(gasto.monto)
              : formatCurrency(gasto.monto)}
          </span>
          {!showAllColumns && (
            <span
              className="text-xs text-gray-500"
              title={formatCurrency(gasto.monto)}
            >
              {formatCurrency(gasto.monto)}
            </span>
          )}
        </div>
      </td>
      <td className="p-2">
        <div className="flex items-center space-x-2">
          <span
            className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 truncate max-w-[120px]`}
            title={email || gasto.personaid}
          >
            {email || gasto.personaid}
          </span>
          {showAllColumns && gasto.escompartido && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              Compartido
            </span>
          )}
        </div>
      </td>
      {showAllColumns && (
        <>
          <td className="p-2">{renderizarInfoCompartido()}</td>
          <td className="p-2 text-center">
            <button
              onClick={() => eliminarGasto(gasto.id)}
              onKeyDown={handleKeyDown}
              className={`text-red-500 hover:text-red-700 transition-colors p-1.5 rounded-full hover:bg-red-50 ${
                isHovered ? "animate-pulse" : ""
              }`}
              aria-label="Eliminar gasto"
              tabIndex={0}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </td>
        </>
      )}
    </tr>
  );
};

export default TableRow;
