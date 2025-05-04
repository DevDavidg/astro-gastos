import React from "react";
import { GastosProvider } from "../../context/GastosContext";
import SharedExpensesTable from "./SharedExpensesTable";

const SharedExpensesWrapper: React.FC = () => {
  return (
    <GastosProvider>
      <SharedExpensesTable />
    </GastosProvider>
  );
};

export default SharedExpensesWrapper;
