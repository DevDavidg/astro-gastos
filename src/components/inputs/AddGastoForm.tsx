import { useState, useRef, useEffect } from "react";
import { useGastos } from "../../context/GastosContext";
import { PersonaSelector } from "./PersonaSelector";
import LoadingSpinner from "../ui/LoadingSpinner";
import { supabase } from "../../lib/supabase";

export const AddGastoForm: React.FC = () => {
  const { agregarGasto, isLoading, personas, gastos } = useGastos();
  const [isShared, setIsShared] = useState(false);
  const [percentage1, setPercentage1] = useState(50);
  const [percentage2, setPercentage2] = useState(50);
  const [selectedPersona, setSelectedPersona] = useState<string>("");
  const [otraPersonaEmail, setOtraPersonaEmail] = useState("");
  const [monto, setMonto] = useState<string>("");
  const [descripcion, setDescripcion] = useState<string>("");
  const [mes, setMes] = useState<string>("enero");
  const formRef = useRef<HTMLFormElement>(null);

  // Set default persona when component mounts
  useEffect(() => {
    if (personas && personas.length > 0) {
      // Get current user's email from Supabase
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          // Find persona that matches user's email
          const userPersona = personas.find((p) => p.email === user.email);
          if (userPersona) {
            setSelectedPersona(userPersona.id);
          }
        }
      });
    }
  }, [personas]);

  // Generate default description
  const generateDefaultDescription = () => {
    if (!mes) return "Nombre de gasto";

    // Get all gastos for the selected month
    const gastosDelMes = gastos.filter((g) => g.mes === mes);

    // Find the highest number in existing descriptions
    let maxNumber = 0;
    gastosDelMes.forEach((g) => {
      const match = g.descripcion.match(/\((\d+)\)$/);
      if (match) {
        const num = parseInt(match[1]);
        if (num > maxNumber) maxNumber = num;
      }
    });

    return `Nombre de gasto${maxNumber > 0 ? ` (${maxNumber + 1})` : ""}`;
  };

  // Update description when month changes
  useEffect(() => {
    setDescripcion(generateDefaultDescription());
  }, [mes, gastos]);

  // Sync percentages
  const handlePercentageChange = (value: number, isPercentage1: boolean) => {
    if (isPercentage1) {
      setPercentage1(value);
      setPercentage2(100 - value);
    } else {
      setPercentage2(value);
      setPercentage1(100 - value);
    }
  };

  // Handle monto input
  const handleMontoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty string, numbers, and decimal point
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setMonto(value);
    }
  };

  // Función para emitir el evento de preview
  const emitPreviewEvent = () => {
    if (!selectedPersona || !monto || !descripcion || !mes) return;

    const previewGasto = {
      mes,
      descripcion,
      monto: parseFloat(monto),
      personaid: selectedPersona,
      escompartido: isShared,
      porcentajepersona1: isShared ? percentage1 : 100,
      porcentajepersona2: isShared ? percentage2 : 0,
      otraPersonaEmail: isShared ? otraPersonaEmail : undefined,
    };

    document.dispatchEvent(
      new CustomEvent("gastoPreview", { detail: previewGasto })
    );
  };

  // Emit preview event when any relevant field changes
  useEffect(() => {
    emitPreviewEvent();
  }, [
    monto,
    descripcion,
    mes,
    selectedPersona,
    isShared,
    percentage1,
    percentage2,
    otraPersonaEmail,
  ]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="large" color="primary" />
        </div>
      </div>
    );
  }

  // Función para validar si el email existe
  const validarEmail = async (email: string) => {
    // Primero buscar en la tabla personas
    const { data, error } = await supabase
      .from("personas")
      .select("email")
      .eq("email", email)
      .maybeSingle();

    // Si se encuentra en personas, está validado
    if (data) return true;

    // Si no está en personas, podría estar solo registrado en auth
    // En este caso, informar al usuario pero permitir continuar
    return false;
  };

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

    const montoValue = parseFloat(monto);
    if (isNaN(montoValue)) {
      alert("Por favor ingresa un monto válido");
      return;
    }

    // Validar que el monto no exceda el límite
    if (montoValue > 99999999.99) {
      alert("El monto no puede exceder $99,999,999.99");
      return;
    }

    const gasto = {
      mes,
      descripcion,
      monto: montoValue,
      personaid: selectedPersona,
      escompartido: isShared,
      porcentajepersona1: isShared ? percentage1 : 100,
      porcentajepersona2: isShared ? percentage2 : 0,
      otraPersonaEmail: isShared ? otraPersonaEmail : undefined,
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
      setMonto("");
      setDescripcion(generateDefaultDescription());
      setMes("enero");
      // Recargar la página después de agregar el gasto
      window.location.reload();
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
              type="text"
              id="monto"
              name="monto"
              required
              value={monto}
              onChange={handleMontoChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition-all"
              placeholder="0.00"
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
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
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
              value={mes}
              onChange={(e) => setMes(e.target.value)}
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
                onChange={(e) =>
                  handlePercentageChange(parseInt(e.target.value), true)
                }
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
                onChange={(e) =>
                  handlePercentageChange(parseInt(e.target.value), false)
                }
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
