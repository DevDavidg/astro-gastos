import React, { useEffect, useState } from "react";
import TableHeader from "./TableHeader";
import TableRow from "./TableRow";
import TableExpandedModal from "./TableExpandedModal";
import { useGastos } from "../../context/GastosContext";
import type { Gasto } from "../../types/gasto";
import LoadingSpinner from "../ui/LoadingSpinner";
import { useCurrency } from "../../hooks/useCurrency";

const TableGastos = () => {
  const {
    gastos,
    eliminarGasto,
    agregarGasto,
    personas,
    isLoading: isDataLoading,
    recargarDatos,
  } = useGastos();
  const { currency, formatCurrency } = useCurrency();
  const [animatedGastos, setAnimatedGastos] = useState<Gasto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroMes, setFiltroMes] = useState<string | null>(null);
  const [filtroPersona, setFiltroPersona] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setIsLoading(true);

    setTimeout(() => {
      setAnimatedGastos(gastos);
      setIsLoading(false);
    }, 300);
  }, [gastos]);

  useEffect(() => {
    const handleNuevoGasto = async (e: Event) => {
      const customEvent = e as CustomEvent;
      try {
        await agregarGasto(customEvent.detail);

        await recargarDatos();
      } catch (error) {
        console.error("Error al agregar gasto:", error);
      }
    };

    document.addEventListener("nuevoGasto", handleNuevoGasto);

    return () => {
      document.removeEventListener("nuevoGasto", handleNuevoGasto);
    };
  }, [agregarGasto, recargarDatos]);

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

  const mesesUnicos = [
    ...new Set(animatedGastos.map((gasto) => gasto.mes)),
  ].sort();

  // Get unique emails from gastos, filtering out non-email values
  const emailsUnicos = [
    ...new Set(
      animatedGastos.flatMap((gasto) => {
        const emails = [];
        // Only add if it's an actual email address
        if (gasto.personaid && gasto.personaid.includes("@")) {
          emails.push(gasto.personaid);
        }
        if (gasto.otraPersonaEmail) {
          emails.push(gasto.otraPersonaEmail);
        }
        return emails;
      })
    ),
  ].sort();

  const calcularTotales = () => {
    const total = gastosFiltrados.reduce((acc, gasto) => acc + gasto.monto, 0);
    const totalCompartido = gastosFiltrados
      .filter((gasto) => gasto.escompartido)
      .reduce((acc, gasto) => acc + gasto.monto, 0);
    const totalNoCompartido = total - totalCompartido;

    return { total, totalCompartido, totalNoCompartido };
  };

  const TotalDisplay = () => {
    const { total, totalCompartido, totalNoCompartido } = calcularTotales();
    const porcentajeCompartido = ((totalCompartido / total) * 100).toFixed(1);
    const porcentajeNoCompartido = ((totalNoCompartido / total) * 100).toFixed(
      1
    );

    return (
      <div className="bg-gradient-to-r from-indigo-50 to-pink-50 rounded-lg p-4 mb-6 shadow-sm">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col items-center">
            <span className="text-sm text-gray-600 mb-1">Total General</span>
            <span className="text-2xl sm:text-3xl font-bold text-gray-900">
              {formatCurrency(total)}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-indigo-600 font-medium">Compartido</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(totalCompartido)}
                </span>
              </div>
              <div className="text-xs text-indigo-500">
                {porcentajeCompartido}% del total
              </div>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-pink-600 font-medium">No Compartido</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(totalNoCompartido)}
                </span>
              </div>
              <div className="text-xs text-pink-500">
                {porcentajeNoCompartido}% del total
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {gastosFiltrados.length > 0 && !isLoading && !isDataLoading && (
        <TotalDisplay />
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
              />
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading || isDataLoading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-4 text-center">
                      <LoadingSpinner />
                    </td>
                  </tr>
                ) : gastosFiltrados.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-4 text-center text-gray-500"
                    >
                      No hay gastos para mostrar
                    </td>
                  </tr>
                ) : (
                  gastosFiltrados.map((gasto) => (
                    <TableRow
                      key={gasto.id}
                      gasto={gasto}
                      onDelete={eliminarGasto}
                      currencyCode={currency}
                      showAllColumns={false}
                    />
                  ))
                )}
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
