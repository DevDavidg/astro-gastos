import React from "react";
import TableGastos from "./table/TableGastos";
import PieChart from "./charts/PieChart";
import { GastosProvider } from "../context/GastosContext";

interface GastosAppProps {
  showTable?: boolean;
  showChart?: boolean;
}

const GastosApp: React.FC<GastosAppProps> = ({
  showTable = true,
  showChart = true,
}) => {
  return (
    <GastosProvider>
      {showTable && <TableGastos />}
      {showChart && <PieChart />}
    </GastosProvider>
  );
};

export default GastosApp;
