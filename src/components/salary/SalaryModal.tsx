import React, { useState, useEffect } from "react";
import { useCurrency } from "../../hooks/useCurrency";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Pencil,
  X,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  Target,
  AlertCircle,
} from "lucide-react";

const isBrowser = typeof window !== "undefined";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

interface BudgetSuggestion {
  category: string;
  suggested: number;
  current: number;
  difference: number;
  percentage: number;
  color: string;
  icon: React.ReactNode;
  subcategories: string[];
  advice: {
    over: string;
    under: string;
    perfect: string;
  };
}

const SalaryModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(() => {
    if (!isBrowser) return true;
    return !localStorage.getItem("userSalary");
  });
  const [salary, setSalary] = useState<number>(() => {
    if (!isBrowser) return 0;
    const savedSalary = localStorage.getItem("userSalary");
    return savedSalary ? Number(savedSalary) : 0;
  });
  const [totalExpenses, setTotalExpenses] = useState<number>(0);
  const [expenseHistory, setExpenseHistory] = useState<
    { date: string; amount: number }[]
  >(() => {
    if (!isBrowser) return [];
    const savedHistory = localStorage.getItem("expenseHistory");
    return savedHistory ? JSON.parse(savedHistory) : [];
  });
  const { formatCurrency } = useCurrency();

  useEffect(() => {
    if (!isBrowser) return;

    // Listen for total expenses updates
    const handleTotalUpdate = (e: CustomEvent) => {
      if (e.detail?.total) {
        const newTotal = e.detail.total;
        setTotalExpenses(newTotal);
        localStorage.setItem("totalExpenses", newTotal.toString());

        // Update expense history only if the total has changed
        const currentDate = new Date().toLocaleDateString();
        const lastEntry = expenseHistory[expenseHistory.length - 1];

        if (!lastEntry || lastEntry.date !== currentDate) {
          const newHistory = [
            ...expenseHistory,
            {
              date: currentDate,
              amount: newTotal,
            },
          ].slice(-6); // Keep last 6 months

          setExpenseHistory(newHistory);
          localStorage.setItem("expenseHistory", JSON.stringify(newHistory));
        }
      }
    };

    window.addEventListener(
      "updateTotalExpenses",
      handleTotalUpdate as EventListener
    );

    return () => {
      window.removeEventListener(
        "updateTotalExpenses",
        handleTotalUpdate as EventListener
      );
    };
  }, [expenseHistory]);

  const hasSalary = () => {
    if (!isBrowser) return false;
    return !!localStorage.getItem("userSalary");
  };

  const handleSaveSalary = () => {
    if (!isBrowser) return;
    if (salary > 0) {
      localStorage.setItem("userSalary", salary.toString());
      setSalary(salary);
      setIsOpen(false);
    }
  };

  const calculateRemainingSalary = () => {
    return salary - totalExpenses;
  };

  const getExpensePercentage = () => {
    return (totalExpenses / salary) * 100;
  };

  const getSavingsPercentage = () => {
    return ((salary - totalExpenses) / salary) * 100;
  };

  const getBudgetSuggestions = (): BudgetSuggestion[] => {
    const suggestedAmount = salary / 3;
    const currentSavings = calculateRemainingSalary();

    return [
      {
        category: "Gastos Fijos (Necesidades)",
        suggested: suggestedAmount,
        current: totalExpenses,
        difference: totalExpenses - suggestedAmount,
        percentage: (totalExpenses / suggestedAmount) * 100,
        color: "#FF6B6B",
        icon: <Wallet className="h-5 w-5" />,
        subcategories: [
          "Alquiler o hipoteca",
          "Expensas",
          "Servicios (luz, agua, gas, internet)",
          "Transporte (nafta, SUBE, seguro)",
          "Comida básica",
          "Deudas mínimas mensuales",
        ],
        advice: {
          over: "⚠️ Estás gastando más del 33% en necesidades. Esto puede hacer tu economía frágil ante imprevistos.",
          under:
            "✅ Buen control de gastos fijos. Mantené este nivel para tener margen de ahorro.",
          perfect:
            "🎯 Excelente balance en gastos fijos. Estás en el punto ideal.",
        },
      },
      {
        category: "Ahorro e Inversión",
        suggested: suggestedAmount,
        current: currentSavings,
        difference: currentSavings - suggestedAmount,
        percentage: (currentSavings / suggestedAmount) * 100,
        color: "#45B7D1",
        icon: <TrendingUp className="h-5 w-5" />,
        subcategories: [
          "Fondo de emergencia (3-6 meses de sueldo)",
          "Inversiones (plazos fijos, dólar, cripto)",
          "Aportes voluntarios a jubilación",
          "Ahorro para objetivos grandes",
        ],
        advice: {
          over: "🌟 Excelente nivel de ahorro. Considerá diversificar tus inversiones.",
          under: "💡 Priorizá crear un fondo de emergencia antes de invertir.",
          perfect: "🎯 Balance perfecto entre ahorro e inversión.",
        },
      },
      {
        category: "Gastos Personales",
        suggested: suggestedAmount,
        current: 0, // Asumiendo que no hay tracking de ocio por ahora
        difference: -suggestedAmount,
        percentage: 0,
        color: "#4ECDC4",
        icon: <TrendingDown className="h-5 w-5" />,
        subcategories: [
          "Salidas, delivery, bares",
          "Suscripciones (Netflix, Spotify)",
          "Ropa, tecnología, hobbies",
          "Viajes y entretenimiento",
        ],
        advice: {
          over: "⚠️ Estás gastando más de lo recomendado en ocio. Considerá reducir algunos gastos.",
          under:
            "✅ Buen control de gastos personales. Podés permitirte algunos gustos.",
          perfect: "🎯 Excelente balance entre disfrute y control financiero.",
        },
      },
    ];
  };

  const pieChartData = [
    { name: "Gastos", value: totalExpenses },
    { name: "Ahorros", value: calculateRemainingSalary() },
  ];

  const barChartData = expenseHistory.map((item, index) => ({
    name: item.date,
    Gastos: item.amount,
    Salario: salary,
  }));

  const budgetSuggestions = getBudgetSuggestions();

  const EditSalaryDialog = () => (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-xl font-semibold">
              Configurar Salario
            </Dialog.Title>
            <Dialog.Close className="text-gray-500 hover:text-gray-700">
              <X size={20} />
            </Dialog.Close>
          </div>
          <div className="mb-4">
            <label
              htmlFor="salary"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Ingrese su salario mensual
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                id="salary"
                value={salary || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "" || /^\d+$/.test(value)) {
                    setSalary(value === "" ? 0 : Number(value));
                  }
                }}
                className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Ingrese su salario"
                autoFocus
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleSaveSalary}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Guardar
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );

  const BudgetAnalysis: React.FC<{ suggestions: BudgetSuggestion[] }> = ({
    suggestions,
  }) => {
    const [expandedCategory, setExpandedCategory] = useState<string | null>(
      null
    );

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="h-5 w-5 text-yellow-500" />
          <h3 className="text-lg font-semibold text-gray-900">
            Análisis de Presupuesto
          </h3>
        </div>
        <div className="space-y-4">
          {suggestions.map((suggestion) => (
            <div key={suggestion.category} className="space-y-2">
              <button
                onClick={() =>
                  setExpandedCategory(
                    expandedCategory === suggestion.category
                      ? null
                      : suggestion.category
                  )
                }
                className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`p-1 rounded-full`}
                    style={{ backgroundColor: `${suggestion.color}20` }}
                  >
                    {suggestion.icon}
                  </div>
                  <div className="text-left">
                    <h4 className="text-sm font-medium text-gray-900">
                      {suggestion.category}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {formatCurrency(suggestion.current)} /{" "}
                      {formatCurrency(suggestion.suggested)}
                    </p>
                  </div>
                </div>
                <div
                  className={`text-sm font-medium ${
                    suggestion.difference > 0
                      ? "text-red-500"
                      : "text-green-500"
                  }`}
                >
                  {Math.abs(suggestion.difference) > 0
                    ? `${suggestion.difference > 0 ? "+" : ""}${formatCurrency(
                        Math.abs(suggestion.difference)
                      )}`
                    : "✓"}
                </div>
              </button>

              {expandedCategory === suggestion.category && (
                <div className="pl-4 space-y-3 border-l-2 border-gray-200">
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full"
                      style={{
                        width: `${Math.min(suggestion.percentage, 100)}%`,
                        backgroundColor: suggestion.color,
                      }}
                    />
                  </div>

                  <div className="space-y-1">
                    <h5 className="text-xs font-medium text-gray-700">
                      Incluye:
                    </h5>
                    <ul className="list-disc list-inside text-xs text-gray-600">
                      {suggestion.subcategories.map((sub, i) => (
                        <li key={i}>{sub}</li>
                      ))}
                    </ul>
                  </div>

                  <div
                    className={`p-2 rounded text-xs ${
                      suggestion.difference > 0
                        ? "bg-red-50 text-red-700"
                        : suggestion.difference < 0
                        ? "bg-green-50 text-green-700"
                        : "bg-blue-50 text-blue-700"
                    }`}
                  >
                    {suggestion.difference > 0
                      ? suggestion.advice.over
                      : suggestion.difference < 0
                      ? suggestion.advice.under
                      : suggestion.advice.perfect}
                  </div>
                </div>
              )}
            </div>
          ))}

          <div className="mt-4 p-3 bg-indigo-50 rounded-lg">
            <h4 className="text-xs font-medium text-indigo-900 mb-1">
              Consejos Generales
            </h4>
            <ul className="list-disc list-inside text-xs text-indigo-700 space-y-0.5">
              <li>
                Si no podés aplicar el 33% completo, adaptá la regla
                progresivamente
              </li>
              <li>Priorizá crear un fondo de emergencia antes de invertir</li>
              <li>Mantené un registro de tus gastos personales</li>
            </ul>
          </div>
        </div>
      </div>
    );
  };

  // Si no hay salario configurado, solo mostrar el modal de configuración
  if (!hasSalary()) {
    return <EditSalaryDialog />;
  }

  // Si hay salario configurado, mostrar el componente completo
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      <EditSalaryDialog />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column - Salary Overview */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Salario Mensual
              </h3>
              <p className="text-2xl font-bold text-indigo-600">
                {formatCurrency(salary)}
              </p>
            </div>
            <button
              onClick={() => setIsOpen(true)}
              className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-full"
            >
              <Pencil size={20} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-5 w-5 text-red-500" />
                <h4 className="text-sm font-medium text-gray-700">Gastos</h4>
              </div>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(totalExpenses)}
              </p>
              <p className="text-sm text-gray-500">
                {getExpensePercentage().toFixed(1)}% del salario
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <h4 className="text-sm font-medium text-gray-700">Ahorros</h4>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(calculateRemainingSalary())}
              </p>
              <p className="text-sm text-gray-500">
                {getSavingsPercentage().toFixed(1)}% del salario
              </p>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="h-64">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Distribución
            </h4>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {pieChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column - Expense History */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-indigo-500" />
            <h3 className="text-lg font-semibold text-gray-900">
              Historial de Gastos
            </h3>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="Gastos" fill="#FF6B6B" />
                <Bar dataKey="Salario" fill="#4ECDC4" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Resumen</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Salario Promedio:</span>
                <span className="font-medium">{formatCurrency(salary)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Gastos Promedio:</span>
                <span className="font-medium text-red-600">
                  {formatCurrency(totalExpenses)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ahorros Promedio:</span>
                <span className="font-medium text-green-600">
                  {formatCurrency(calculateRemainingSalary())}
                </span>
              </div>
            </div>
          </div>

          {/* Budget Analysis */}
          <BudgetAnalysis suggestions={budgetSuggestions} />
        </div>
      </div>
    </div>
  );
};

export default SalaryModal;
