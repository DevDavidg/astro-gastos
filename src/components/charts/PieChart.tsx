import React, { useEffect, useRef, useState, useCallback } from "react";
import type { Gasto, MesType } from "../../types/gasto";
import { calcularTotalPorMes } from "../../utils/calcularTotales";
import { useGastos } from "../../context/GastosContext";
import { obtenerColorMes, generarTonoGasto } from "../../utils/colorMeses";
import { useCurrency } from "../../hooks/useCurrency";

const PieChart = () => {
  const { gastos, personas } = useGastos();
  const { currency, formatCurrency } = useCurrency();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const [filtroVista, setFiltroVista] = useState<"mes" | "persona">("mes");
  const [personaSeleccionada, setPersonaSeleccionada] =
    useState<string>("todos");
  const [animProgress, setAnimProgress] = useState(0);
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);
  const [previewGasto, setPreviewGasto] = useState<Partial<Gasto> | null>(null);
  const prevGastosLengthRef = useRef<number>(0);

  const calcularGastosPorPersona = useCallback((gastos: Gasto[]) => {
    return gastos.reduce((acc, gasto) => {
      if (!gasto.escompartido) {
        const personaid = gasto.personaid;
        acc[personaid] = (acc[personaid] || 0) + gasto.monto;
      } else {
        if (gasto.porcentajepersona1) {
          acc["persona1"] =
            (acc["persona1"] || 0) +
            (gasto.monto * gasto.porcentajepersona1) / 100;
        }
        if (gasto.porcentajepersona2) {
          acc["persona2"] =
            (acc["persona2"] || 0) +
            (gasto.monto * gasto.porcentajepersona2) / 100;
        }
      }
      return acc;
    }, {} as Record<string, number>);
  }, []);

  const gastosFiltrados = useCallback(() => {
    const baseGastos = [...gastos];

    if (
      previewGasto &&
      previewGasto.monto &&
      previewGasto.monto > 0 &&
      previewGasto.mes &&
      previewGasto.personaid
    ) {
      baseGastos.push(previewGasto as Gasto);
    }

    return personaSeleccionada === "todos"
      ? baseGastos
      : baseGastos.filter(
          (gasto) =>
            gasto.personaid === personaSeleccionada ||
            (gasto.escompartido &&
              ((personaSeleccionada === "persona1" &&
                gasto.porcentajepersona1) ||
                (personaSeleccionada === "persona2" &&
                  gasto.porcentajepersona2)))
        );
  }, [personaSeleccionada, gastos, previewGasto]);

  const datosGrafico = useCallback(() => {
    if (filtroVista === "mes") {
      return calcularTotalPorMes(gastosFiltrados());
    } else {
      return calcularGastosPorPersona(gastosFiltrados());
    }
  }, [filtroVista, gastosFiltrados, calcularGastosPorPersona]);

  const calcularPorcentajesGrafico = useCallback(
    (datos: Record<string, number>) => {
      const total = Object.values(datos).reduce((sum, valor) => sum + valor, 0);
      if (total === 0) return {};

      return Object.entries(datos).reduce((porcentajes, [clave, valor]) => {
        porcentajes[clave] = (valor / total) * 100;
        return porcentajes;
      }, {} as Record<string, number>);
    },
    []
  );

  const porcentajes = useCallback(() => {
    const datos = datosGrafico();
    return calcularPorcentajesGrafico(datos);
  }, [calcularPorcentajesGrafico, datosGrafico]);

  const obtenerNombrePersona = useCallback(
    (personaid: string) => {
      const persona = personas.find((p) => p.id === personaid);
      return persona ? persona.nombre : personaid;
    },
    [personas]
  );

  const obtenerColorPersona = useCallback((personaid: string) => {
    switch (personaid) {
      case "persona1":
        return "#4F46E5"; // Indigo
      case "persona2":
        return "#EC4899"; // Pink
      default:
        return "#9CA3AF"; // Gris
    }
  }, []);

  const obtenerColor = (clave: string) => {
    if (filtroVista === "mes") {
      const colorBase = obtenerColorMes(clave as MesType);
      const gastosDelMes = gastos.filter((g) => g.mes === clave);
      const index = gastosDelMes.findIndex(
        (g) => g === gastos[gastos.length - 1]
      );
      return generarTonoGasto(colorBase, index, gastosDelMes.length);
    } else {
      return "#6B7280";
    }
  };

  const dibujarGrafico = useCallback(
    (progress = 1) => {
      if (!canvasRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);

      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      ctx.clearRect(0, 0, rect.width, rect.height);

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const radius = Math.min(centerX, centerY) - 20;

      const porcentajesData = porcentajes();

      if (Object.keys(porcentajesData).length === 0) {
        ctx.fillStyle = "#F3F4F6";
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#9CA3AF";
        ctx.font = "bold 16px Inter, system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("No hay datos", centerX, centerY);
        return;
      }

      ctx.save();
      ctx.shadowColor = "rgba(0, 0, 0, 0.1)";
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 4;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      let startAngle = 0;
      let mouseX = 0;
      let mouseY = 0;

      if (hoveredSlice) {
        const canvasRect = canvas.getBoundingClientRect();
        mouseX = canvasRect.width / 2;
        mouseY = canvasRect.height / 2;
      }

      Object.entries(porcentajesData).forEach(([clave, porcentaje]) => {
        const animatedPercentage = porcentaje * progress;
        const endAngle =
          startAngle + (animatedPercentage / 100) * (Math.PI * 2);

        const midAngle = startAngle + (endAngle - startAngle) / 2;

        const isHovered = hoveredSlice === clave;

        let explodeFactor = isHovered ? 15 : 0;

        if (previewGasto && previewGasto.monto && previewGasto.monto > 0) {
          if (
            (filtroVista === "mes" && previewGasto.mes === clave) ||
            (filtroVista === "persona" && previewGasto.personaid === clave)
          ) {
            explodeFactor = Math.max(explodeFactor, 10);
          }
        }

        const offsetX = explodeFactor * Math.cos(midAngle);
        const offsetY = explodeFactor * Math.sin(midAngle);

        ctx.fillStyle = obtenerColor(clave);

        ctx.beginPath();
        ctx.moveTo(centerX + offsetX, centerY + offsetY);
        ctx.arc(
          centerX + offsetX,
          centerY + offsetY,
          radius,
          startAngle,
          endAngle
        );
        ctx.lineTo(centerX + offsetX, centerY + offsetY);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 2;
        ctx.stroke();

        if (isHovered && progress === 1) {
          const textRadius = radius * 0.7;
          const textX = centerX + offsetX + textRadius * Math.cos(midAngle);
          const textY = centerY + offsetY + textRadius * Math.sin(midAngle);

          ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
          ctx.beginPath();
          ctx.roundRect(textX - 60, textY - 15, 120, 30, 8);
          ctx.fill();

          ctx.fillStyle = "#111827";
          ctx.font = "bold 14px Inter, system-ui, sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(
            `${
              filtroVista === "mes" ? clave : obtenerNombrePersona(clave)
            }: ${porcentaje.toFixed(1)}%`,
            textX,
            textY
          );
        }

        startAngle = endAngle;
      });
    },
    [
      porcentajes,
      hoveredSlice,
      obtenerColor,
      filtroVista,
      obtenerNombrePersona,
      previewGasto,
    ]
  );

  const detectarSegmentoHover = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (!canvasRef.current) return;

      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const radius = Math.min(centerX, centerY) - 20;

      const dx = x - centerX;
      const dy = y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > radius) {
        setHoveredSlice(null);
        return;
      }

      let angle = Math.atan2(dy, dx);
      if (angle < 0) angle += 2 * Math.PI; // Convertir a [0, 2π]

      const porcentajesData = porcentajes();
      let startAngle = 0;

      for (const [clave, porcentaje] of Object.entries(porcentajesData)) {
        const endAngle = startAngle + (porcentaje / 100) * (Math.PI * 2);

        if (angle >= startAngle && angle < endAngle) {
          setHoveredSlice(clave);
          return;
        }

        startAngle = endAngle;
      }

      setHoveredSlice(null);
    },
    [porcentajes]
  );

  useEffect(() => {
    const currentGastosLength = gastos.length;
    const shouldAnimate = currentGastosLength > prevGastosLengthRef.current;

    prevGastosLengthRef.current = currentGastosLength;

    if (!shouldAnimate) {
      dibujarGrafico(1);
      return;
    }

    setAnimProgress(0);
    let startTime: number;
    const duration = 800; // duración en ms

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      setAnimProgress(progress);
      dibujarGrafico(progress);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gastos, filtroVista, personaSeleccionada, dibujarGrafico]);

  useEffect(() => {
    if (previewGasto) {
      dibujarGrafico(1);
    }
  }, [previewGasto, dibujarGrafico]);

  useEffect(() => {
    dibujarGrafico(1);

    const handleNuevoGasto = () => {
      setAnimProgress(0);
      setPreviewGasto(null);
      dibujarGrafico(1);
    };

    const handleGastoEliminado = (e: Event) => {
      const customEvent = e as CustomEvent;
      console.log("Gasto eliminado:", customEvent.detail);
      setAnimProgress(0);
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
  }, [gastos, filtroVista, animProgress, dibujarGrafico]);

  const datosOrdenados = Object.entries(datosGrafico()).sort(
    ([, montoA], [, montoB]) => montoB - montoA
  );

  const total = Object.values(datosGrafico()).reduce(
    (sum, monto) => sum + monto,
    0
  );

  const PreviewBadge = () =>
    previewGasto && previewGasto.monto && previewGasto.monto > 0 ? (
      <span className="absolute top-0 right-0 bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-md">
        Vista previa activa
      </span>
    ) : null;

  const obtenerEstilosConsistentes = (clave: string) => {
    const color = obtenerColor(clave);

    return { backgroundColor: color };
  };

  return (
    <div className="w-full h-full">
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex items-center space-x-2 bg-white p-2 rounded-lg shadow-sm border border-gray-100 transition-all hover:shadow-md">
          <span className="text-gray-600 text-sm sm:text-base">Ver por:</span>
          <select
            value={filtroVista}
            onChange={(e) =>
              setFiltroVista(e.target.value as "mes" | "persona")
            }
            className="p-1.5 sm:p-2 border rounded-md bg-gray-50 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition-all text-sm sm:text-base"
          >
            <option value="mes">Mes</option>
            <option value="persona">Persona</option>
          </select>
        </div>

        <div className="flex items-center space-x-2 bg-white p-2 rounded-lg shadow-sm border border-gray-100 transition-all hover:shadow-md">
          <span className="text-gray-600 text-sm sm:text-base">Filtrar:</span>
          <select
            value={personaSeleccionada}
            onChange={(e) => setPersonaSeleccionada(e.target.value)}
            className="p-1.5 sm:p-2 border rounded-md bg-gray-50 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition-all text-sm sm:text-base"
          >
            <option value="todos">Todos</option>
            {personas.map((persona) => (
              <option key={persona.id} value={persona.id}>
                {persona.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="relative bg-white rounded-xl shadow-md p-2 sm:p-4 md:p-6 border border-gray-100 transition-all hover:shadow-lg">
        <PreviewBadge />

        <div className="relative w-full aspect-square max-w-[300px] mx-auto">
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full cursor-pointer"
            onMouseMove={detectarSegmentoHover}
            onMouseLeave={() => setHoveredSlice(null)}
          />
        </div>

        <div className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
          {datosOrdenados.map(([clave, monto]) => {
            const isPreviewCategory =
              previewGasto &&
              ((filtroVista === "mes" && previewGasto.mes === clave) ||
                (filtroVista === "persona" &&
                  previewGasto.personaid === clave));

            return (
              <div
                key={clave}
                className={`flex items-center p-2 sm:p-3 rounded-lg transition-all ${
                  hoveredSlice === clave
                    ? "bg-gray-100 scale-105"
                    : isPreviewCategory
                    ? "bg-indigo-50 border border-indigo-100"
                    : "hover:bg-gray-50"
                }`}
                onMouseEnter={() => setHoveredSlice(clave)}
                onMouseLeave={() => setHoveredSlice(null)}
              >
                <span
                  className="w-4 h-4 sm:w-5 sm:h-5 rounded-md inline-block mr-2 sm:mr-3 shadow-sm"
                  style={obtenerEstilosConsistentes(clave)}
                />
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-gray-800 text-sm sm:text-base truncate">
                    {filtroVista === "mes"
                      ? clave
                      : obtenerNombrePersona(clave)}
                  </span>
                  <div className="flex justify-between mt-0.5 sm:mt-1">
                    <span className="text-xs sm:text-sm text-gray-600 truncate mr-2">
                      {formatCurrency(monto)}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-indigo-600 whitespace-nowrap">
                      {((monto / total) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PieChart;
