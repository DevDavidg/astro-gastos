import React, { useEffect, useState } from "react";
import TableHeader from "./TableHeader";
import TableRow from "./TableRow";
import TableExpandedModal from "./TableExpandedModal";
import { useGastos } from "../../context/GastosContext";
import type { Gasto } from "../../types/gasto";
import LoadingSpinner from "../ui/LoadingSpinner";
import { useCurrency } from "../../hooks/useCurrency";

const TotalDisplay: React.FC<{
  total: number;
  totalCompartido: number;
  totalNoCompartido: number;
  formatCurrency: (value: number) => string;
}> = ({ total, totalCompartido, totalNoCompartido, formatCurrency }) => {
  const porcentajeCompartido = ((totalCompartido / total) * 100).toFixed(1);
  const porcentajeNoCompartido = ((totalNoCompartido / total) * 100).toFixed(1);

  useEffect(() => {
    // Dispatch the total to update the salary modal
    window.dispatchEvent(
      new CustomEvent("updateTotalExpenses", { detail: { total } })
    );
  }, [total]);

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Total General
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">Total</h3>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(total)}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">Compartido</h3>
            <p className="text-2xl font-bold text-indigo-600">
              {formatCurrency(totalCompartido)}
            </p>
            <p className="text-sm text-gray-500">{porcentajeCompartido}%</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">No Compartido</h3>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(totalNoCompartido)}
            </p>
            <p className="text-sm text-gray-500">{porcentajeNoCompartido}%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const TableGastos = () => {
  const {
    gastos,
    eliminarGasto,
    agregarGasto,
    personas,
    isLoading: isDataLoading,
    recargarDatos,
  } = useGastos();
  const { formatCurrency } = useCurrency();
  const [animatedGastos, setAnimatedGastos] = useState<Gasto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm] = useState("");
  const [filtroMes] = useState<string | null>(null);
  const [filtroPersona] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortCriteria, setSortCriteria] = useState<"monto" | "mes" | "fecha">(
    "fecha"
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    const handleActualizarGastos = () => {
      recargarDatos();
    };

    window.addEventListener("actualizarGastos", handleActualizarGastos);

    return () => {
      window.removeEventListener("actualizarGastos", handleActualizarGastos);
    };
  }, [recargarDatos]);

  const handleSort = (criteria: "monto" | "mes" | "fecha") => {
    if (criteria === sortCriteria) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortCriteria(criteria);
      setSortDirection("desc");
    }
  };

  const sortGastos = (gastos: Gasto[]) => {
    return [...gastos].sort((a, b) => {
      const modifier = sortDirection === "asc" ? 1 : -1;

      switch (sortCriteria) {
        case "monto":
          return (a.monto - b.monto) * modifier;
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
            (meses.indexOf(a.mes.toLowerCase()) -
              meses.indexOf(b.mes.toLowerCase())) *
            modifier
          );
        case "fecha":
          return (
            (new Date(b.fecha).getTime() - new Date(a.fecha).getTime()) *
            modifier
          );
        default:
          return 0;
      }
    });
  };

  useEffect(() => {
    setIsLoading(true);

    setTimeout(() => {
      setAnimatedGastos(gastos);
      setIsLoading(false);
    }, 300);
  }, [gastos]);

  const obtenerNombrePersona = (personaid: string) => {
    const persona = personas.find((p) => p.id === personaid);
    return persona ? persona.nombre : "Persona no encontrada";
  };

  const gastosFiltrados = animatedGastos.filter((gasto) => {
    const personaNombre = obtenerNombrePersona(gasto.personaid);
    const matchSearch = searchTerm
      ? gasto.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gasto.mes.toLowerCase().includes(searchTerm.toLowerCase()) ||
        personaNombre.toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    const matchMes = filtroMes ? gasto.mes === filtroMes : true;

    const matchPersona = filtroPersona
      ? gasto.personaid === filtroPersona ||
        (gasto.escompartido && gasto.otraPersonaEmail === filtroPersona)
      : true;

    return matchSearch && matchMes && matchPersona;
  });

  const calcularTotales = () => {
    const total = gastosFiltrados.reduce((acc, gasto) => acc + gasto.monto, 0);
    const totalCompartido = gastosFiltrados
      .filter((gasto) => gasto.escompartido)
      .reduce((acc, gasto) => acc + gasto.monto, 0);
    const totalNoCompartido = total - totalCompartido;

    return { total, totalCompartido, totalNoCompartido };
  };

  const renderTableBody = () => {
    if (isLoading || isDataLoading) {
      return (
        <tr>
          <td colSpan={4} className="px-4 py-4 text-center">
            <LoadingSpinner />
          </td>
        </tr>
      );
    }

    if (gastosFiltrados.length === 0) {
      return (
        <tr>
          <td colSpan={4} className="px-4 py-4 text-center text-gray-500">
            No hay gastos para mostrar
          </td>
        </tr>
      );
    }

    const sortedGastos = sortGastos(gastosFiltrados).slice(0, 5);

    return sortedGastos.map((gasto) => (
      <TableRow
        key={gasto.id}
        gasto={gasto}
        onDelete={eliminarGasto}
        showAllColumns={false}
      />
    ));
  };

  return (
    <div className="space-y-6">
      {gastosFiltrados.length > 0 && !isLoading && !isDataLoading && (
        <TotalDisplay {...calcularTotales()} formatCurrency={formatCurrency} />
      )}
      <div className="relative w-full">
        <div className="overflow-x-auto">
          <div className="min-w-[520px]">
            <table className="w-full divide-y divide-gray-200 table-fixed">
              <colgroup>
                <col className="w-[60px]" />
                <col className="w-[110px]" />
                <col className="w-[90px]" />
                <col className="w-[100px]" />
              </colgroup>
              <TableHeader
                showAllColumns={false}
                onExpand={() => setIsModalOpen(true)}
                showExpandButton={gastosFiltrados.length > 0}
                onSort={handleSort}
              />
              <tbody className="bg-white divide-y divide-gray-200">
                {renderTableBody()}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <TableExpandedModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        gastos={gastosFiltrados}
        onDelete={eliminarGasto}
        totals={calcularTotales()}
      />
    </div>
  );
};

export default TableGastos;
