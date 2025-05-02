import React, { useRef, useState, useEffect, useMemo } from "react";
import { calcularTotalPorMes } from "../../utils/calcularTotales";
import { useGastos } from "../../context/GastosContext";
import { obtenerColorMes, generarTonoGasto } from "../../utils/colorMeses";
import { useCurrency } from "../../hooks/useCurrency";
import type { MesType, Gasto } from "../../types/gasto";
import { motion } from "framer-motion";
import { useTheme } from "@/hooks/useTheme";

const BarChart = () => {
  const { gastos } = useGastos();
  const { formatCurrency } = useCurrency();
  const { isDarkMode } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [previewGasto, setPreviewGasto] = useState<Partial<Gasto> | null>(null);
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<number | null>(null);
  const prevGastosLengthRef = useRef<number>(0);

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

  const datosOrdenados = Object.entries(datosGrafico).sort(([mesA], [mesB]) => {
    const meses = [
      "enero",
      "febrero",
      "marzo",
      "abril",
      "mayo",
      "junio",
      "julio",
      "agosto",
      "septiembre",
      "octubre",
      "noviembre",
      "diciembre",
    ];
    return meses.indexOf(mesA) - meses.indexOf(mesB);
  });

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

  const formatearValor = (valor: number) => {
    if (valor >= 1000000) {
      return `${(valor / 1000000).toFixed(1)}M`;
    } else if (valor >= 1000) {
      return `${(valor / 1000).toFixed(1)}K`;
    }
    return valor.toString();
  };

  const dibujarGrafico = (progress = 1) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = 470;
    const height = 300;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.clearRect(0, 0, width, height);

    const padding = {
      top: 40,
      right: 30,
      bottom: 60,
      left: 70,
    };

    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const maxValue = Math.max(...Object.values(datosGrafico));
    const scale = chartHeight / maxValue;

    ctx.strokeStyle = isDarkMode ? "#374151" : "#E5E7EB";
    ctx.lineWidth = 1;
    const gridLines = 5;

    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (chartHeight * i) / gridLines;
      const value = maxValue - (maxValue * i) / gridLines;

      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      ctx.fillStyle = isDarkMode ? "#9CA3AF" : "#6B7280";
      ctx.font = "12px Inter, system-ui, sans-serif";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillText(`$ ${formatearValor(value)}`, padding.left - 10, y);
    }

    const barCount = datosOrdenados.length;
    const barWidth = Math.min(
      40,
      (chartWidth - (barCount - 1) * 20) / barCount
    );
    const spacing = 20;

    datosOrdenados.forEach(([mes, monto], index) => {
      const x = padding.left + index * (barWidth + spacing);
      const barHeight = monto * scale * progress;
      const y = padding.top + chartHeight - barHeight;

      const color = obtenerColorGasto(mes, index, barCount);
      const isHovered = hoveredBar === mes;

      if (isHovered) {
        ctx.shadowColor = color;
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 5;
      }

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, [8, 8, 0, 0]);
      ctx.fill();

      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      ctx.fillStyle = isDarkMode ? "#9CA3AF" : "#6B7280";
      ctx.font = "12px Inter, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(mes, x + barWidth / 2, height - padding.bottom + 10);

      if (isHovered) {
        ctx.fillStyle = isDarkMode ? "#F3F4F6" : "#1F2937";
        ctx.font = "bold 12px Inter, system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillText(formatCurrency(monto), x + barWidth / 2, y - 5);
      }
    });
  };

  useEffect(() => {
    const currentGastosLength = gastos.length;
    const shouldAnimate = currentGastosLength > prevGastosLengthRef.current;

    prevGastosLengthRef.current = currentGastosLength;

    if (!shouldAnimate) {
      dibujarGrafico(1);
      return;
    }

    setIsAnimating(true);
    let startTime: number;
    const duration = 800;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      dibujarGrafico(progress);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gastos, previewGasto, hoveredBar, isDarkMode]);

  useEffect(() => {
    dibujarGrafico(1);

    const handleNuevoGasto = () => {
      setPreviewGasto(null);
      dibujarGrafico(1);
    };

    const handleGastoEliminado = (e: Event) => {
      const customEvent = e as CustomEvent;
      setPreviewGasto(null);
      dibujarGrafico(1);
    };

    const handleGastoPreview = (e: Event) => {
      const customEvent = e as CustomEvent;
      setPreviewGasto(customEvent.detail);
      dibujarGrafico(1);
    };

    window.addEventListener("nuevoGasto", handleNuevoGasto);
    window.addEventListener("gastoEliminado", handleGastoEliminado);
    document.addEventListener("gastoPreview", handleGastoPreview);

    return () => {
      window.removeEventListener("nuevoGasto", handleNuevoGasto);
      window.removeEventListener("gastoEliminado", handleGastoEliminado);
      document.removeEventListener("gastoPreview", handleGastoPreview);
    };
  }, [gastos, previewGasto, hoveredBar, isDarkMode]);

  const detectarBarraHover = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const padding = {
      left: 70,
      right: 30,
    };

    const barCount = datosOrdenados.length;
    const barWidth = Math.min(
      40,
      (470 - padding.left - padding.right - (barCount - 1) * 20) / barCount
    );
    const spacing = 20;

    const barIndex = Math.floor((x - padding.left) / (barWidth + spacing));
    const meses = datosOrdenados.map(([mes]) => mes);

    if (barIndex >= 0 && barIndex < meses.length) {
      setHoveredBar(meses[barIndex]);
    } else {
      setHoveredBar(null);
    }
  };

  return (
    <motion.div
      className="w-full h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
            Gastos por Mes
          </h3>
          {previewGasto && (
            <span className="bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-xs font-medium px-2.5 py-0.5 rounded-md">
              Vista previa activa
            </span>
          )}
        </div>

        <div className="relative w-[470px] h-[300px] mx-auto">
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full cursor-pointer"
            onMouseMove={detectarBarraHover}
            onMouseLeave={() => setHoveredBar(null)}
          />
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {datosOrdenados.map(([mes, monto], index) => {
            const porcentaje = ((monto / total) * 100).toFixed(1);
            const gastosDelMes = gastos.filter((g) => g.mes === mes);
            const color = obtenerColorGasto(mes, index, gastosDelMes.length);
            const isPreviewCategory = previewGasto && previewGasto.mes === mes;
            const isHovered = hoveredBar === mes;

            return (
              <motion.div
                key={mes}
                className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                  isPreviewCategory
                    ? "bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800"
                    : isHovered
                    ? "bg-gray-100 dark:bg-gray-700"
                    : "bg-gray-50 dark:bg-gray-800/50"
                }`}
                onMouseEnter={() => setHoveredBar(mes)}
                onMouseLeave={() => setHoveredBar(null)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">
                    {mes}
                  </span>
                </div>
                <div className="text-right ml-2">
                  <div className="font-medium text-gray-900 dark:text-white text-sm sm:text-base whitespace-nowrap">
                    {formatCurrency(monto)}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {porcentaje}%
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default BarChart;
