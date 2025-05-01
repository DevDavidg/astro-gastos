import React, { useRef, useState } from "react";
import { calcularTotalPorMes } from "../../utils/calcularTotales";
import { useGastos } from "../../context/GastosContext";
import { obtenerColorMes } from "../../utils/colorMeses";
import { useCurrency } from "../../hooks/useCurrency";

const BarChart = () => {
  const { gastos } = useGastos();
  const { currency, formatCurrency } = useCurrency();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const datosGrafico = calcularTotalPorMes(gastos);
  const datosOrdenados = Object.entries(datosGrafico).sort(
    ([, montoA], [, montoB]) => montoB - montoA
  );

  const total = Object.values(datosGrafico).reduce(
    (sum, monto) => sum + monto,
    0
  );

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-6">Gastos por Mes</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative">
          <canvas ref={canvasRef} className="w-full h-64" />
        </div>

        <div className="space-y-4">
          {datosOrdenados.map(([mes, monto]) => {
            const porcentaje = ((monto / total) * 100).toFixed(1);
            const color = obtenerColorMes(mes);

            return (
              <div
                key={mes}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                style={{ backgroundColor: color }}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="font-medium text-gray-900">{mes}</span>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">
                    {formatCurrency(monto)}
                  </div>
                  <div className="text-sm text-gray-500">{porcentaje}%</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BarChart;
