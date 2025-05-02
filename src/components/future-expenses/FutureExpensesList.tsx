import React, { useState, useEffect } from "react";
import { useGastos } from "../../context/GastosContext";

interface FutureExpense {
  id: string;
  description: string;
  amount: number;
  userId: string;
  sharedEmail?: string;
  porcentajeYo?: number;
  porcentajeOtro?: number;
  date: string;
  isCompleted: boolean;
  isShared: boolean;
}

const FutureExpensesList: React.FC = () => {
  const { personas } = useGastos();
  const [futureExpenses, setFutureExpenses] = useState<FutureExpense[]>([]);
  const [newExpense, setNewExpense] = useState<Partial<FutureExpense>>({
    description: "",
    amount: 0,
    userId: "yo",
    date: new Date().toISOString().split("T")[0],
    isShared: false,
    porcentajeYo: 50,
    porcentajeOtro: 50,
  });

  useEffect(() => {
    const savedExpenses = localStorage.getItem("futureExpenses");
    if (savedExpenses) {
      setFutureExpenses(JSON.parse(savedExpenses));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("futureExpenses", JSON.stringify(futureExpenses));
  }, [futureExpenses]);

  const handleAddExpense = () => {
    // Validación básica
    if (!newExpense.description || !newExpense.amount) {
      alert("Por favor complete la descripción y monto");
      return;
    }

    // Validación para gastos compartidos
    if (newExpense.isShared) {
      if (!newExpense.sharedEmail) {
        alert(
          "Para gastos compartidos, debe ingresar el email de la otra persona"
        );
        return;
      }
      if (!newExpense.porcentajeYo || !newExpense.porcentajeOtro) {
        alert("Debe especificar los porcentajes para ambos participantes");
        return;
      }
      if (newExpense.porcentajeYo + newExpense.porcentajeOtro !== 100) {
        alert("La suma de los porcentajes debe ser 100%");
        return;
      }
    }

    const expense: FutureExpense = {
      id: Date.now().toString(),
      description: newExpense.description,
      amount: newExpense.amount,
      userId: "yo",
      sharedEmail: newExpense.isShared ? newExpense.sharedEmail : undefined,
      porcentajeYo: newExpense.isShared ? newExpense.porcentajeYo : undefined,
      porcentajeOtro: newExpense.isShared
        ? newExpense.porcentajeOtro
        : undefined,
      date: newExpense.date || new Date().toISOString().split("T")[0],
      isCompleted: false,
      isShared: newExpense.isShared || false,
    };

    setFutureExpenses([...futureExpenses, expense]);
    setNewExpense({
      description: "",
      amount: 0,
      userId: "yo",
      date: new Date().toISOString().split("T")[0],
      isShared: false,
      porcentajeYo: 50,
      porcentajeOtro: 50,
      sharedEmail: "",
    });
  };

  const handleToggleComplete = (id: string) => {
    setFutureExpenses(
      futureExpenses.map((expense) =>
        expense.id === id
          ? { ...expense, isCompleted: !expense.isCompleted }
          : expense
      )
    );
  };

  const handleDelete = (id: string) => {
    setFutureExpenses(futureExpenses.filter((expense) => expense.id !== id));
  };

  const handlePercentageChange = (value: number, isYo: boolean) => {
    const otherValue = 100 - value;
    setNewExpense({
      ...newExpense,
      porcentajeYo: isYo ? value : otherValue,
      porcentajeOtro: isYo ? otherValue : value,
    });
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Gastos Futuros
        </h2>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Descripción del gasto"
              value={newExpense.description}
              onChange={(e) =>
                setNewExpense({ ...newExpense, description: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="number"
              placeholder="Monto"
              value={newExpense.amount || ""}
              onChange={(e) =>
                setNewExpense({ ...newExpense, amount: Number(e.target.value) })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={newExpense.isShared}
                onChange={(e) =>
                  setNewExpense({ ...newExpense, isShared: e.target.checked })
                }
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label className="text-sm text-gray-700">Compartido</label>
            </div>

            <input
              type="date"
              value={newExpense.date}
              onChange={(e) =>
                setNewExpense({ ...newExpense, date: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {newExpense.isShared && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <input
                  type="email"
                  placeholder="Email de la otra persona"
                  value={newExpense.sharedEmail || ""}
                  onChange={(e) =>
                    setNewExpense({
                      ...newExpense,
                      sharedEmail: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Porcentaje Mio
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newExpense.porcentajeYo}
                    onChange={(e) =>
                      handlePercentageChange(Number(e.target.value), true)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Porcentaje de {newExpense.sharedEmail}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newExpense.porcentajeOtro}
                    onChange={(e) =>
                      handlePercentageChange(Number(e.target.value), false)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleAddExpense}
            className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Agregar Gasto Futuro
          </button>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {futureExpenses.map((expense) => (
          <div
            key={expense.id}
            className="p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <input
                  type="checkbox"
                  checked={expense.isCompleted}
                  onChange={() => handleToggleComplete(expense.id)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <div>
                  <p
                    className={`text-sm font-medium ${
                      expense.isCompleted
                        ? "line-through text-gray-500"
                        : "text-gray-900"
                    }`}
                  >
                    {expense.description}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(expense.date).toLocaleDateString()} - Yo
                    {expense.isShared &&
                      expense.porcentajeYo !== undefined &&
                      expense.porcentajeOtro !== undefined && (
                        <>
                          {" "}
                          (Compartido con {expense.sharedEmail})
                          <br />
                          <span className="text-xs text-gray-500">
                            {expense.porcentajeYo}% ($
                            {(
                              (expense.amount * expense.porcentajeYo) /
                              100
                            ).toLocaleString()}
                            ) / {expense.porcentajeOtro}% ($
                            {(
                              (expense.amount * expense.porcentajeOtro) /
                              100
                            ).toLocaleString()}
                            )
                          </span>
                        </>
                      )}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-900">
                  ${expense.amount.toLocaleString()}
                </span>
                <button
                  onClick={() => handleDelete(expense.id)}
                  className="text-red-500 hover:text-red-700"
                  aria-label="Eliminar gasto"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FutureExpensesList;
