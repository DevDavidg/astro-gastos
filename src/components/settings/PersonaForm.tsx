import React, { useState, useEffect } from "react";
import { useGastos } from "../../context/GastosContext";
import { useCurrency } from "../../hooks/useCurrency";

interface PersonaFormProps {
  personaId: string;
}

export const PersonaForm: React.FC<PersonaFormProps> = ({ personaId }) => {
  const { personas, actualizarNombrePersona, actualizarSueldoPersona } =
    useGastos();
  const { formatCurrency } = useCurrency();
  const [nombre, setNombre] = useState("");
  const [sueldo, setSueldo] = useState(0);

  useEffect(() => {
    if (personas && personas.length >= 2) {
      const persona = personas.find((p) => p.id === personaId);
      if (persona) {
        setNombre(persona.nombre);
        setSueldo(persona.sueldo);
      }
    }
  }, [personas, personaId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await actualizarNombrePersona(personaId, nombre);
      await actualizarSueldoPersona(personaId, sueldo);
    } catch (error) {
      console.error("Error al actualizar persona:", error);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h4 className="text-lg font-medium text-gray-900 dark:text-white">
          {`Persona ${personaId === "persona1" ? "1" : "2"}`}
        </h4>
      </div>
      <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:px-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor={`nombre${personaId}`}
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Nombre
            </label>
            <input
              type="text"
              id={`nombre${personaId}`}
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor={`sueldo${personaId}`}
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Sueldo
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 dark:text-gray-400 sm:text-sm">
                  {formatCurrency(0).charAt(0)}
                </span>
              </div>
              <input
                type="number"
                id={`sueldo${personaId}`}
                value={sueldo}
                onChange={(e) => setSueldo(parseFloat(e.target.value))}
                className="mt-1 block w-full pl-7 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>
          <button
            type="submit"
            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Guardar cambios
          </button>
        </form>
      </div>
    </div>
  );
};
