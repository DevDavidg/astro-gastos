import React, { useState, useEffect } from "react";
import type { Gasto } from "../../types/gasto";
import { formatearMoneda } from "../../utils/formatearMoneda";
import { useGastos } from "../../context/GastosContext";
import { useCurrency } from "../../hooks/useCurrency";
import { obtenerEmailPersona } from "../../services/gastoService";

interface TableRowProps {
  gasto: Gasto;
  onDelete: (id: string) => void;
  currencyCode: string;
}

const TableRow = ({ gasto, onDelete, currencyCode }: TableRowProps) => {
  const { personas, eliminarGasto } = useGastos();
  const { formatCurrency } = useCurrency();
  const [isHovered, setIsHovered] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmail = async () => {
      console.log("Fetching email for gasto:", gasto);
      const personaEmail = await obtenerEmailPersona(gasto.personaid);
      console.log("Email fetched:", personaEmail);
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

  const obtenerNombrePersona = (personaid: string) => {
    const persona = personas.find((p) => p.id === personaid);
    return persona ? persona.nombre : personaid;
  };

  const renderizarInfoCompartido = () => {
    if (!gasto.escompartido) {
      return <span className="text-gray-600">No</span>;
    }

    const persona1 = personas[0];
    const persona2 = personas[1];

    return (
      <div className="text-xs space-y-1 bg-indigo-50 p-1.5 sm:p-2 rounded-lg border border-indigo-100">
        <div className="flex justify-between items-center">
          <span className="text-gray-700">
            {persona1?.nombre || "Persona 1"}:
          </span>
          <span className="font-medium bg-indigo-100 text-indigo-800 px-1.5 sm:px-2 py-0.5 rounded">
            {gasto.porcentajepersona1}%
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-700">
            {persona2?.nombre || "Persona 2"}:
          </span>
          <span className="font-medium bg-pink-100 text-pink-800 px-1.5 sm:px-2 py-0.5 rounded">
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

  const obtenerColorPersona = (personaid: string) => {
    switch (personaid) {
      case "persona1":
        return "bg-indigo-100 text-indigo-800";
      case "persona2":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
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
      <td className="p-2 sm:p-4">
        <span
          className={`inline-flex px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-xs font-medium ${obtenerColorMes()}`}
        >
          {gasto.mes}
        </span>
      </td>
      <td className="p-2 sm:p-4">
        <div className="flex flex-col">
          <span className="font-medium text-gray-800 text-sm sm:text-base">
            {gasto.descripcion}
          </span>
          <span className="text-xs text-gray-500">
            {new Date(gasto.fecha).toLocaleDateString()}
          </span>
        </div>
      </td>
      <td className="p-2 sm:p-4 font-medium text-gray-900 text-sm sm:text-base">
        {formatCurrency(gasto.monto)}
      </td>
      <td className="p-2 sm:p-4">
        <span
          className={`inline-flex px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-xs font-medium ${obtenerColorPersona(
            gasto.personaid
          )}`}
        >
          {email || obtenerNombrePersona(gasto.personaid)}
        </span>
      </td>
      <td className="p-2 sm:p-4">{renderizarInfoCompartido()}</td>
      <td className="p-2 sm:p-4 text-center">
        <button
          onClick={() => eliminarGasto(gasto.id)}
          onKeyDown={handleKeyDown}
          className={`text-red-500 hover:text-red-700 transition-colors p-1.5 sm:p-2 rounded-full hover:bg-red-50 ${
            isHovered ? "animate-pulse" : ""
          }`}
          aria-label="Eliminar gasto"
          tabIndex={0}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 sm:h-5 sm:w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </td>
    </tr>
  );
};

export default TableRow;
