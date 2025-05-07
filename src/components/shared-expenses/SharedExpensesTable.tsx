import React, { useState, useEffect } from "react";
import { useGastos } from "../../context/GastosContext";
import { useCurrency } from "../../hooks/useCurrency";
import type { Gasto } from "../../types/gasto";
import SharedExpenseDetailsModal from "./SharedExpenseDetailsModal";
import { supabase } from "../../lib/supabase";
import { motion } from "framer-motion";

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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-lg p-8 flex justify-center items-center"
      >
        <div className="flex flex-col items-center justify-center text-center py-12">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-indigo-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            No has compartido gastos
          </h2>
          <p className="text-gray-500 max-w-md text-lg leading-relaxed">
            Cuando compartas gastos con otra persona, aparecerán aquí para que
            puedas ver el desglose de los gastos compartidos.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl shadow-lg p-8 mb-8"
    >
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
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
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </div>
          Gastos Compartidos
        </h2>
      </div>

      <div className="space-y-4">
        {personasConGastosCompartidos.map((persona) => {
          const personaData = personTotals[persona.id];
          const esUsuarioActual = persona.email === myEmail;
          return (
            <motion.div
              key={persona.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.02 }}
              className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:shadow-md transition-all duration-300 border border-gray-100"
            >
              <div className="flex-1">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mr-3 shadow-inner">
                    <span className="text-indigo-600 font-semibold">
                      {persona.nombre.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-gray-900 flex items-center">
                      {persona.nombre}
                      {esUsuarioActual && (
                        <span className="ml-3 px-3 py-1 text-xs font-medium bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 rounded-full shadow-sm">
                          Tú
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Compartido con {personaData?.otherPersonEmail}
                    </div>
                  </div>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleExpenseClick}
                className="bg-white p-5 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200 hover:border-indigo-300"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-indigo-600 font-medium">
                    Compartido
                  </span>
                  <span className="font-bold text-gray-900 text-lg">
                    {formatCurrency(personaData?.total || 0)}
                  </span>
                </div>
                <div className="text-sm text-indigo-500 font-medium">
                  {personaData?.percentage || 0}% del total
                </div>
              </motion.button>
            </motion.div>
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
    </motion.div>
  );
};

export default SharedExpensesTable;
