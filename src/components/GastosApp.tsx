import React from "react";
import { GastosProvider } from "../context/GastosContext";
import TableGastos from "./table/TableGastos";
import PieChart from "./charts/PieChart";
import FutureExpensesList from "./future-expenses/FutureExpensesList";

const GastosApp: React.FC = () => {
  return (
    <GastosProvider>
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <TableGastos />
            <div className="mt-8">
              <FutureExpensesList />
            </div>
          </div>
          <div className="flex justify-center items-center">
            <PieChart />
          </div>
        </div>
      </div>
    </GastosProvider>
  );
};

export default GastosApp;
