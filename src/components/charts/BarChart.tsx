import React, { useRef, useState, useEffect, useMemo } from "react";
import { calcularTotalPorMes } from "../../utils/calcularTotales";
import { useGastos } from "../../context/GastosContext";
import { obtenerColorMes, generarTonoGasto } from "../../utils/colorMeses";
import { useCurrency } from "../../hooks/useCurrency";
import type { MesType, Gasto } from "../../types/gasto";

const BarChart = () => {
  const { gastos } = useGastos();
  const { currency, formatCurrency } = useCurrency();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [previewGasto, setPreviewGasto] = useState<Partial<Gasto> | null>(null);

  const datosGrafico = useMemo(() => {
    const baseGastos = [...gastos];

    if (
      previewGasto &&
      previewGasto.monto &&
      previewGasto.monto > 0 &&
      previewGasto.mes
    ) {
      baseGastos.push(previewGasto as Gasto);
    }

    return calcularTotalPorMes(baseGastos);
  }, [gastos, previewGasto]);

  const datosOrdenados = Object.entries(datosGrafico).sort(
    ([, montoA], [, montoB]) => montoB - montoA
  );

  const total = Object.values(datosGrafico).reduce(
    (sum, monto) => sum + monto,
    0
  );

  const obtenerColorGasto = (
    mes: string,
    index: number,
    totalGastos: number
  ) => {
    const colorBase = obtenerColorMes(mes as MesType);
    return generarTonoGasto(colorBase, index, totalGastos);
  };

  const dibujarGrafico = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Limpiar el canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // ... existing code ...
  };

  useEffect(() => {
    dibujarGrafico();

    const handleNuevoGasto = () => {
      setPreviewGasto(null);
      dibujarGrafico();
    };

    const handleGastoEliminado = (e: Event) => {
      const customEvent = e as CustomEvent;
      setPreviewGasto(null);
      dibujarGrafico();
    };

    const handleGastoPreview = (e: Event) => {
      const customEvent = e as CustomEvent;
      setPreviewGasto(customEvent.detail);
      dibujarGrafico();
    };

    window.addEventListener("nuevoGasto", handleNuevoGasto);
    window.addEventListener("gastoEliminado", handleGastoEliminado);
    document.addEventListener("gastoPreview", handleGastoPreview);

    return () => {
      window.removeEventListener("nuevoGasto", handleNuevoGasto);
      window.removeEventListener("gastoEliminado", handleGastoEliminado);
      document.removeEventListener("gastoPreview", handleGastoPreview);
    };
  }, [gastos, previewGasto]);

  return (
    <div className="bg-white shadow rounded-lg p-2 sm:p-4 md:p-6">
      <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4 md:mb-6">
        Gastos por Mes
      </h3>

      <div className="relative w-full aspect-[4/3] max-w-[600px] mx-auto">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      </div>

      <div className="space-y-2 sm:space-y-3 md:space-y-4 mt-3 sm:mt-4 md:mt-6">
        {datosOrdenados.map(([mes, monto], index) => {
          const porcentaje = ((monto / total) * 100).toFixed(1);
          const gastosDelMes = gastos.filter((g) => g.mes === mes);
          const color = obtenerColorGasto(mes, index, gastosDelMes.length);
          const isPreviewCategory = previewGasto && previewGasto.mes === mes;

          return (
            <div
              key={mes}
              className={`flex items-center justify-between p-2 sm:p-3 md:p-4 rounded-lg transition-all ${
                isPreviewCategory
                  ? "bg-indigo-50 border border-indigo-100"
                  : "bg-gray-50"
              }`}
              style={{ backgroundColor: color }}
            >
              <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                <div
                  className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="font-medium text-gray-900 text-sm sm:text-base truncate">
                  {mes}
                </span>
              </div>
              <div className="text-right ml-2">
                <div className="font-medium text-gray-900 text-sm sm:text-base whitespace-nowrap">
                  {formatCurrency(monto)}
                </div>
                <div className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">
                  {porcentaje}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BarChart;
