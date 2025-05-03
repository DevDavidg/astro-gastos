import { useState } from "react";
import { useGastos } from "../../context/GastosContext";

interface PersonaSelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const PersonaSelector: React.FC<PersonaSelectorProps> = ({
  value,
  onChange,
  className = "",
}) => {
  const { personas, isLoading } = useGastos();
  const [isOpen, setIsOpen] = useState(false);

  if (isLoading) {
    return (
      <div
        className={`animate-pulse bg-gray-200 rounded-md h-10 ${className}`}
      />
    );
  }

  const personaSeleccionada = personas.find((p) => p.id === value);

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-2 border rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all ${
          isOpen ? "ring-2 ring-indigo-200 border-indigo-500" : ""
        }`}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <div className="flex items-center space-x-2">
          <span className="text-gray-700">
            {personaSeleccionada
              ? personaSeleccionada.nombre
              : "Seleccionar persona"}
          </span>
          {personaSeleccionada && (
            <span className="text-sm text-gray-500">
              ({personaSeleccionada.email})
            </span>
          )}
        </div>
        <svg
          className={`h-5 w-5 text-gray-400 transition-transform ${
            isOpen ? "transform rotate-180" : ""
          }`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1">
          {personas.map((persona) => (
            <button
              key={persona.id}
              onClick={() => {
                onChange(persona.id);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm ${
                persona.id === value
                  ? "bg-indigo-50 text-indigo-700 font-medium"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{persona.nombre}</span>
                <span className="text-sm text-gray-500">{persona.email}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
