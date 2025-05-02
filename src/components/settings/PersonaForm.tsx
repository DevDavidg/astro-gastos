import React, { useState, useEffect } from "react";
import { useGastos } from "../../context/GastosContext";
import { useCurrency } from "../../hooks/useCurrency";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";

interface PersonaFormProps {
  personaId: string;
}

export const PersonaForm: React.FC<PersonaFormProps> = ({ personaId }) => {
  const { personas, actualizarNombrePersona, actualizarSueldoPersona } =
    useGastos();
  const { formatCurrency } = useCurrency();
  const { isDarkMode } = useTheme();
  const [nombre, setNombre] = useState("");
  const [sueldo, setSueldo] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

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
      setIsEditing(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Error al actualizar persona:", error);
    }
  };

  const handleSueldoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, "");
    setSueldo(parseFloat(value) || 0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
              <span className="text-white font-semibold">
                {personaId === "persona1" ? "1" : "2"}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {`Persona ${personaId === "persona1" ? "1" : "2"}`}
            </h3>
          </div>
          <motion.button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              backgroundColor: isEditing
                ? isDarkMode
                  ? "rgb(99, 102, 241)"
                  : "rgb(79, 70, 229)"
                : isDarkMode
                ? "rgb(31, 41, 55)"
                : "rgb(243, 244, 246)",
              color: isEditing
                ? "white"
                : isDarkMode
                ? "rgb(156, 163, 175)"
                : "rgb(75, 85, 99)",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            {isEditing ? "Cancelar" : "Editar"}
          </motion.button>
        </div>
      </div>

      <div className="px-6 py-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor={`nombre${personaId}`}
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Nombre
            </label>
            <div className="relative">
              <input
                type="text"
                id={`nombre${personaId}`}
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                disabled={!isEditing}
                className={`block w-full rounded-lg px-4 py-3 text-sm transition-all duration-200 ${
                  isEditing
                    ? "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-500"
                    : "bg-gray-50 dark:bg-gray-800 border-transparent"
                } dark:text-white placeholder-gray-400 dark:placeholder-gray-500`}
                placeholder="Ingresa un nombre"
              />
              {!isEditing && (
                <div className="absolute inset-0 bg-gray-50 dark:bg-gray-800 opacity-50 rounded-lg" />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor={`sueldo${personaId}`}
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Sueldo
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 dark:text-gray-400 text-sm">
                  {formatCurrency(0).charAt(0)}
                </span>
              </div>
              <input
                type="text"
                id={`sueldo${personaId}`}
                value={sueldo || ""}
                onChange={handleSueldoChange}
                disabled={!isEditing}
                className={`block w-full rounded-lg pl-8 pr-12 py-3 text-sm transition-all duration-200 ${
                  isEditing
                    ? "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-500"
                    : "bg-gray-50 dark:bg-gray-800 border-transparent"
                } dark:text-white placeholder-gray-400 dark:placeholder-gray-500`}
                placeholder="0.00"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 dark:text-gray-400 text-sm">
                  {formatCurrency(0).slice(-3)}
                </span>
              </div>
              {!isEditing && (
                <div className="absolute inset-0 bg-gray-50 dark:bg-gray-800 opacity-50 rounded-lg" />
              )}
            </div>
          </div>

          <AnimatePresence>
            {isEditing && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex justify-end"
              >
                <motion.button
                  type="submit"
                  className="inline-flex justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Guardar cambios
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 p-3 bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg text-sm text-center"
            >
              Cambios guardados exitosamente
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
