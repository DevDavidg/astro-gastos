import { useState, useRef } from "react";
import { useGastos } from "../../context/GastosContext";
import { PersonaSelector } from "./PersonaSelector";
import LoadingSpinner from "../ui/LoadingSpinner";

export const AddGastoForm: React.FC = () => {
  const { agregarGasto, isLoading, personas } = useGastos();
  const [isShared, setIsShared] = useState(false);
  const [percentage1, setPercentage1] = useState(50);
  const [percentage2, setPercentage2] = useState(50);
  const [selectedPersona, setSelectedPersona] = useState<string>("");
  const [otraPersonaEmail, setOtraPersonaEmail] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="large" color="primary" />
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedPersona) {
      alert("Por favor selecciona una persona");
      return;
    }

    if (isShared && !otraPersonaEmail) {
      alert("Por favor ingresa el email de la otra persona");
      return;
    }

    const formData = new FormData(e.currentTarget);
    const gasto = {
      mes: formData.get("mes") as string,
      descripcion: formData.get("descripcion") as string,
      monto: Number(formData.get("monto")),
      personaid: selectedPersona,
      escompartido: isShared,
      porcentajepersona1: isShared ? percentage1 : 100,
      porcentajepersona2: isShared ? percentage2 : 0,
      otraPersonaEmail: isShared ? otraPersonaEmail : null,
    };

    console.log("Nuevo gasto:", gasto);

    try {
      await agregarGasto(gasto);
      if (formRef.current) {
        formRef.current.reset();
      }
      setSelectedPersona("");
      setIsShared(false);
      setPercentage1(50);
      setPercentage2(50);
      setOtraPersonaEmail("");
    } catch (error) {
      console.error("Error al agregar gasto:", error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="monto"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Monto
            </label>
            <input
              type="number"
              id="monto"
              name="monto"
              step="0.01"
              min="0"
              required
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition-all"
            />
          </div>

          <div>
            <label
              htmlFor="descripcion"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Descripción
            </label>
            <input
              type="text"
              id="descripcion"
              name="descripcion"
              required
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition-all"
            />
          </div>

          <div>
            <label
              htmlFor="mes"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Mes
            </label>
            <select
              id="mes"
              name="mes"
              required
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition-all"
            >
              <option value="enero">Enero</option>
              <option value="febrero">Febrero</option>
              <option value="marzo">Marzo</option>
              <option value="abril">Abril</option>
              <option value="mayo">Mayo</option>
              <option value="junio">Junio</option>
              <option value="julio">Julio</option>
              <option value="agosto">Agosto</option>
              <option value="septiembre">Septiembre</option>
              <option value="octubre">Octubre</option>
              <option value="noviembre">Noviembre</option>
              <option value="diciembre">Diciembre</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="persona"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Persona
            </label>
            <PersonaSelector
              value={selectedPersona}
              onChange={(value) => setSelectedPersona(value)}
              className="w-full"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="shared"
            name="shared"
            checked={isShared}
            onChange={(e) => setIsShared(e.target.checked)}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="shared" className="text-sm text-gray-700">
            Gasto compartido
          </label>
        </div>

        {isShared && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="otraPersonaEmail"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email de la otra persona
              </label>
              <input
                type="email"
                id="otraPersonaEmail"
                name="otraPersonaEmail"
                value={otraPersonaEmail}
                onChange={(e) => setOtraPersonaEmail(e.target.value)}
                required={isShared}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition-all"
                placeholder="ejemplo@email.com"
              />
            </div>

            <div>
              <label
                htmlFor="percentage1"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Porcentaje Persona 1
              </label>
              <input
                type="number"
                id="percentage1"
                name="percentage1"
                min="0"
                max="100"
                value={percentage1}
                onChange={(e) => setPercentage1(parseInt(e.target.value))}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <div>
              <label
                htmlFor="percentage2"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Porcentaje Persona 2
              </label>
              <input
                type="number"
                id="percentage2"
                name="percentage2"
                min="0"
                max="100"
                value={percentage2}
                onChange={(e) => setPercentage2(parseInt(e.target.value))}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
        >
          Agregar Gasto
        </button>
      </form>
    </div>
  );
};
