import React from "react";

const TableHeader = () => {
  return (
    <thead className="bg-gray-50">
      <tr>
        <th
          scope="col"
          className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider"
        >
          Mes
        </th>
        <th
          scope="col"
          className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider"
        >
          Descripción
        </th>
        <th
          scope="col"
          className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider"
        >
          Monto
        </th>
        <th
          scope="col"
          className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider"
        >
          Persona
        </th>
        <th
          scope="col"
          className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider"
        >
          Compartido
        </th>
        <th
          scope="col"
          className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider"
        >
          Acciones
        </th>
      </tr>
    </thead>
  );
};

export default TableHeader;
