import React from "react";

interface TableHeaderProps {
  showAllColumns?: boolean;
  onExpand?: () => void;
  showExpandButton?: boolean;
}

const TableHeader = ({
  showAllColumns = false,
  onExpand,
  showExpandButton = false,
}: TableHeaderProps) => {
  const baseHeaderClass =
    "p-2 sm:p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap";

  return (
    <thead className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
      <tr>
        <th scope="col" className={baseHeaderClass} aria-sort="none">
          <div className="flex items-center gap-1">
            <span>Mes</span>
            <svg
              className="w-4 h-4 text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                d="M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zM16 2v4M8 2v4M3 10h18"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </th>
        <th scope="col" className={baseHeaderClass} aria-sort="none">
          <div className="flex items-center gap-1">
            <span>Descripción</span>
            <svg
              className="w-4 h-4 text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                d="M4 6h16M4 12h16M4 18h7"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </th>
        <th
          scope="col"
          className={`${baseHeaderClass} w-[80px] !min-w-[80px] !max-w-[80px]`}
          aria-sort="none"
        >
          <div className="flex items-center gap-1">
            <span>Monto</span>
            <svg
              className="w-4 h-4 text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </th>
        <th
          scope="col"
          className={`${baseHeaderClass} relative`}
          aria-sort="none"
        >
          <div className="flex items-center justify-start">
            <div className="flex items-center gap-1">
              <span>Persona</span>
              <svg
                className="w-4 h-4 text-gray-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            {!showAllColumns && showExpandButton && (
              <button
                onClick={onExpand}
                className="ml-2 text-indigo-600 hover:text-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-md p-1"
                aria-label="Expandir tabla para ver más detalles"
                title="Ver todos los detalles"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
          </div>
        </th>
        {showAllColumns && (
          <>
            <th scope="col" className={baseHeaderClass} aria-sort="none">
              <div className="flex items-center gap-1">
                <span>Compartido</span>
                <svg
                  className="w-4 h-4 text-gray-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </th>
            <th
              scope="col"
              className={`${baseHeaderClass} text-center`}
              aria-label="Acciones"
            >
              <span className="sr-only">Acciones</span>
              <svg
                className="w-4 h-4 text-gray-400 mx-auto"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </th>
          </>
        )}
      </tr>
    </thead>
  );
};

export default TableHeader;
