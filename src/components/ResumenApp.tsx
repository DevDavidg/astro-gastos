import React from "react";
import BarChart from "./charts/BarChart";
import PieChart from "./charts/PieChart";
import { GastosProvider } from "../context/GastosContext";

const ResumenApp: React.FC = () => {
  return (
    <GastosProvider>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Distribución por Mes</h2>
          <PieChart />
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <BarChart />
        </div>
      </div>
    </GastosProvider>
  );
};

export default ResumenApp;
