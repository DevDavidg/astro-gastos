import React, { useEffect, useState } from "react";
import TableHeader from "./TableHeader";
import TableRow from "./TableRow";
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
        (gasto.escompartido &&
          ((filtroPersona === personas[0]?.id && gasto.porcentajepersona1) ||
            (filtroPersona === personas[1]?.id && gasto.porcentajepersona2)))
      : true;

    return matchSearch && matchMes && matchPersona;
  });

  const mesesUnicos = [
    ...new Set(animatedGastos.map((gasto) => gasto.mes)),
  ].sort();

  const personasUnicas = personas.map((p) => p.id);

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-start sm:items-center">
          <div className="w-full sm:flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <select
              value={filtroMes || ""}
              onChange={(e) => setFiltroMes(e.target.value || null)}
              className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Todos los meses</option>
              {mesesUnicos.map((mes) => (
                <option key={mes} value={mes}>
                  {mes}
                </option>
              ))}
            </select>
            <select
              value={filtroPersona || ""}
              onChange={(e) => setFiltroPersona(e.target.value || null)}
              className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Todas las personas</option>
              {personasUnicas.map((id) => (
                <option key={id} value={id}>
                  {obtenerNombrePersona(id)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <TableHeader />
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading || isDataLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center">
                  <LoadingSpinner />
                </td>
              </tr>
            ) : gastosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
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
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableGastos;
