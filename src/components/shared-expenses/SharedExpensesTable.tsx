import React, { useState, useEffect } from "react";
import { useGastos } from "../../context/GastosContext";
import { useCurrency } from "../../hooks/useCurrency";
import type { Gasto } from "../../types/gasto";
import SharedExpenseDetailsModal from "./SharedExpenseDetailsModal";
import { supabase } from "../../lib/supabase";

const SharedExpensesTable: React.FC = () => {
  const { gastos, personas, recargarDatos } = useGastos();
  const { formatCurrency } = useCurrency();
  const [selectedGastos, setSelectedGastos] = useState<Gasto[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [myEmail, setMyEmail] = useState<string>("");

  useEffect(() => {
    const handleActualizarGastos = () => {
      recargarDatos();
    };

    window.addEventListener("actualizarGastos", handleActualizarGastos);

    return () => {
      window.removeEventListener("actualizarGastos", handleActualizarGastos);
    };
  }, [recargarDatos]);

  useEffect(() => {
    console.log("Personas:", personas);
    console.log("Gastos:", gastos);
  }, [personas, gastos]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setMyEmail(user?.email ?? "");
    });
  }, []);

  // Filter only shared expenses
  const sharedExpenses = gastos.filter((gasto) => gasto.escompartido);

  // Calculate totals for each person
  const calculatePersonTotals = () => {
    const totals: Record<
      string,
      {
        total: number;
        email: string;
        percentage: number;
        otherPersonEmail: string;
      }
    > = {};

    personas.forEach((persona) => {
      totals[persona.id] = {
        total: 0,
        email: persona.email,
        percentage: 0,
        otherPersonEmail: "",
      };
    });

    sharedExpenses.forEach((expense) => {
      const person1 = expense.personaid;
      const person2 = expense.otraPersonaEmail;

      if (person1 && expense.porcentajepersona1) {
        const amount1 = (expense.monto * expense.porcentajepersona1) / 100;
        totals[person1].total += amount1;
        totals[person1].percentage = expense.porcentajepersona1;
        totals[person1].otherPersonEmail = person2 ?? "";
      }

      if (person2 && expense.porcentajepersona2) {
        const amount2 = (expense.monto * expense.porcentajepersona2) / 100;
        const person2Id = personas.find((p) => p.email === person2)?.id;
        if (person2Id) {
          totals[person2Id].total += amount2;
          totals[person2Id].percentage = expense.porcentajepersona2;
          totals[person2Id].otherPersonEmail =
            personas.find((p) => p.id === person1)?.email ?? "";
        }
      }
    });

    return totals;
  };

  const personTotals = calculatePersonTotals();

  const handleExpenseClick = () => {
    setSelectedGastos(sharedExpenses);
    setIsModalOpen(true);
  };

  // Filtrar solo personas con gastos compartidos
  const personasConGastosCompartidos = personas.filter(
    (persona) => personTotals[persona.id]?.total > 0
  );

  if (
    sharedExpenses.length === 0 ||
    personasConGastosCompartidos.length === 0
  ) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Gastos Compartidos
        </h2>
        <p className="text-gray-500">No hay gastos compartidos registrados.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Gastos Compartidos
      </h2>

      <div className="space-y-4">
        {personasConGastosCompartidos.map((persona) => {
          const personaData = personTotals[persona.id];
          const esUsuarioActual = persona.email === myEmail;
          return (
            <div
              key={persona.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">
                  {persona.nombre} {esUsuarioActual && <span>(soy yo)</span>}
                </div>
                <div className="text-xs text-gray-500">
                  Compartido con {personaData?.otherPersonEmail}
                </div>
              </div>
              <button
                onClick={handleExpenseClick}
                className="bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-indigo-600 font-medium">
                    Compartido
                  </span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(personaData?.total || 0)}
                  </span>
                </div>
                <div className="text-xs text-indigo-500">
                  {personaData?.percentage || 0}% del total
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {selectedGastos.length > 0 && (
        <SharedExpenseDetailsModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedGastos([]);
          }}
          gastos={selectedGastos}
          personas={personas}
        />
      )}
    </div>
  );
};

export default SharedExpensesTable;
