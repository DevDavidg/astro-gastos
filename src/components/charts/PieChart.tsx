import React, { useEffect, useRef, useState, useCallback } from "react";
import type { Gasto, MesType } from "../../types/gasto";
import { calcularTotalPorMes } from "../../utils/calcularTotales";
import { useGastos } from "../../context/GastosContext";
import { obtenerColorMes, generarTonoGasto } from "../../utils/colorMeses";
import { useCurrency } from "../../hooks/useCurrency";
import { motion, AnimatePresence } from "framer-motion";
import DetallesGastosModal from "./DetallesGastosModal";
import { obtenerEmailPersona } from "../../services/gastoService";

const PieChart = () => {
  const { gastos, personas } = useGastos();
  const { currency, formatCurrency } = useCurrency();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const [filtroVista, setFiltroVista] = useState<"mes" | "email">("mes");
  const [emailSeleccionado, setEmailSeleccionado] = useState<string>("todos");
  const [animProgress, setAnimProgress] = useState(0);
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);
  const [previewGasto, setPreviewGasto] = useState<Partial<Gasto> | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevGastosLengthRef = useRef<number>(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<{
    gastos: Gasto[];
    titulo: string;
    subtitulo: string;
    total: number;
    estadisticas: {
      totalGastos: number;
      gastosCompartidos: number;
      gastosNoCompartidos: number;
      totalCompartido: number;
      totalNoCompartido: number;
      porcentajeCompartido: number;
      porcentajeNoCompartido: number;
    };
  } | null>(null);
  const [emailsMap, setEmailsMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const cargarEmails = async () => {
      const emailsTemp: Record<string, string> = {};
      for (const gasto of gastos) {
        if (!emailsTemp[gasto.personaid]) {
          const email = await obtenerEmailPersona(gasto.personaid);
          if (email) emailsTemp[gasto.personaid] = email;
        }
      }
      setEmailsMap(emailsTemp);
    };
    cargarEmails();
  }, [gastos]);

  const calcularGastosPorEmail = useCallback(
    (gastos: Gasto[]) => {
      return gastos.reduce((acc, gasto) => {
        const email = emailsMap[gasto.personaid] || gasto.personaid;

        if (!gasto.escompartido) {
          acc[email] = (acc[email] || 0) + gasto.monto;
        } else {
          if (gasto.porcentajepersona1) {
            acc[email] =
              (acc[email] || 0) +
              (gasto.monto * gasto.porcentajepersona1) / 100;
          }
          if (gasto.porcentajepersona2 && gasto.otraPersonaEmail) {
            acc[gasto.otraPersonaEmail] =
              (acc[gasto.otraPersonaEmail] || 0) +
              (gasto.monto * gasto.porcentajepersona2) / 100;
          }
        }
        return acc;
      }, {} as Record<string, number>);
    },
    [emailsMap]
  );

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

    return emailSeleccionado === "todos"
      ? baseGastos
      : baseGastos.filter(
          (gasto) =>
            emailsMap[gasto.personaid] === emailSeleccionado ||
            gasto.personaid === emailSeleccionado ||
            (gasto.escompartido && gasto.otraPersonaEmail === emailSeleccionado)
        );
  }, [emailSeleccionado, gastos, previewGasto, emailsMap]);

  const datosGrafico = useCallback(() => {
    if (filtroVista === "mes") {
      return calcularTotalPorMes(gastosFiltrados());
    } else {
      return calcularGastosPorEmail(gastosFiltrados());
    }
  }, [filtroVista, gastosFiltrados, calcularGastosPorEmail]);

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
    const colors = [
      "#4F46E5",
      "#EC4899",
      "#10B981",
      "#F59E0B",
      "#3B82F6",
      "#8B5CF6",
      "#EF4444",
      "#14B8A6",
      "#F97316",
      "#6366F1",
    ];

    let hash = 0;
    for (let i = 0; i < personaid.length; i++) {
      hash = personaid.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
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
      return obtenerColorPersona(clave);
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

      let startAngle = 0;

      Object.entries(porcentajesData).forEach(([clave, porcentaje]) => {
        const animatedPercentage = porcentaje * progress;
        const endAngle =
          startAngle + (animatedPercentage / 100) * (Math.PI * 2);
        const midAngle = startAngle + (endAngle - startAngle) / 2;

        const isHovered = hoveredSlice === clave;
        const explodeFactor = isHovered ? 10 : 0;

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

        startAngle = endAngle;
      });
    },
    [porcentajes, hoveredSlice, obtenerColor]
  );

  const HoverModal = ({
    clave,
    porcentaje,
    monto,
    x,
    y,
  }: {
    clave: string;
    porcentaje: number;
    monto: number;
    x: number;
    y: number;
  }) => {
    const displayText =
      filtroVista === "mes"
        ? clave
        : `${obtenerNombrePersona(clave)} (${clave})`;

    return (
      <motion.div
        className="absolute z-50 bg-white rounded-xl shadow-lg border border-gray-100 p-4 min-w-[200px]"
        style={{
          left: `${x}px`,
          top: `${y}px`,
          transform: "translate(-50%, -100%)",
        }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: obtenerColor(clave) }}
            />
            <span className="font-medium text-gray-900 text-sm">
              {displayText}
            </span>
          </div>
          <div className="text-sm text-gray-600">{formatCurrency(monto)}</div>
          <div className="text-sm font-semibold text-indigo-600">
            {porcentaje.toFixed(1)}%
          </div>
        </div>
      </motion.div>
    );
  };

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
      if (angle < 0) angle += 2 * Math.PI;

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

    setIsAnimating(true);
    setAnimProgress(0);
    let startTime: number;
    const duration = 800;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      setAnimProgress(progress);
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
  }, [gastos, filtroVista, emailSeleccionado, dibujarGrafico]);

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

  const handleSliceClick = useCallback(
    (clave: string) => {
      let gastosFiltrados: Gasto[] = [];
      let titulo = "";
      let subtitulo = "";

      if (filtroVista === "mes") {
        gastosFiltrados = gastos.filter((g) => g.mes === clave);
        titulo = `Gastos de ${clave}`;
        subtitulo = `${gastosFiltrados.length} gastos registrados`;
      } else {
        gastosFiltrados = gastos.filter((g) => {
          const emailGasto = emailsMap[g.personaid] || g.personaid;
          const emailOtraPersona = g.otraPersonaEmail;

          return (
            emailGasto === clave ||
            (g.escompartido && emailOtraPersona === clave)
          );
        });

        const persona = personas.find((p) => emailsMap[p.id] === clave);
        titulo = `Gastos de ${persona?.nombre || clave}`;
        subtitulo = clave;
      }

      const total = gastosFiltrados.reduce((sum, g) => {
        if (filtroVista === "email") {
          const emailGasto = emailsMap[g.personaid] || g.personaid;
          if (g.escompartido) {
            if (emailGasto === clave) {
              return sum + (g.monto * (g.porcentajepersona1 || 0)) / 100;
            } else if (g.otraPersonaEmail === clave) {
              return sum + (g.monto * (g.porcentajepersona2 || 0)) / 100;
            }
          }
        }
        return sum + g.monto;
      }, 0);

      const gastosCompartidos = gastosFiltrados.filter((g) => g.escompartido);
      const gastosNoCompartidos = gastosFiltrados.filter(
        (g) => !g.escompartido
      );
      const totalCompartido = gastosCompartidos.reduce((sum, g) => {
        if (filtroVista === "email") {
          const emailGasto = emailsMap[g.personaid] || g.personaid;
          if (emailGasto === clave) {
            return sum + (g.monto * (g.porcentajepersona1 || 0)) / 100;
          } else if (g.otraPersonaEmail === clave) {
            return sum + (g.monto * (g.porcentajepersona2 || 0)) / 100;
          }
        }
        return sum + g.monto;
      }, 0);
      const totalNoCompartido = gastosNoCompartidos.reduce(
        (sum, g) => sum + g.monto,
        0
      );

      setModalData({
        gastos: gastosFiltrados,
        titulo,
        subtitulo,
        total,
        estadisticas: {
          totalGastos: gastosFiltrados.length,
          gastosCompartidos: gastosCompartidos.length,
          gastosNoCompartidos: gastosNoCompartidos.length,
          totalCompartido,
          totalNoCompartido,
          porcentajeCompartido: total > 0 ? (totalCompartido / total) * 100 : 0,
          porcentajeNoCompartido:
            total > 0 ? (totalNoCompartido / total) * 100 : 0,
        },
      });
      setIsModalOpen(true);
    },
    [filtroVista, gastos, personas, emailsMap]
  );

  const detectarSegmentoClick = useCallback(
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

      if (distance > radius) return;

      let angle = Math.atan2(dy, dx);
      if (angle < 0) angle += 2 * Math.PI;

      const porcentajesData = porcentajes();
      let startAngle = 0;

      for (const [clave, porcentaje] of Object.entries(porcentajesData)) {
        const endAngle = startAngle + (porcentaje / 100) * (Math.PI * 2);

        if (angle >= startAngle && angle < endAngle) {
          handleSliceClick(clave);
          return;
        }

        startAngle = endAngle;
      }
    },
    [porcentajes, handleSliceClick]
  );

  return (
    <motion.div
      className="w-full h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-4">
        <motion.div
          className="flex items-center space-x-2 bg-white p-2 rounded-lg shadow-sm border border-gray-100"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="text-gray-600 text-sm sm:text-base">Ver por:</span>
          <select
            value={filtroVista}
            onChange={(e) => setFiltroVista(e.target.value as "mes" | "email")}
            className="p-1.5 sm:p-2 border rounded-md bg-gray-50 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none text-sm sm:text-base"
          >
            <option value="mes">Mes</option>
            <option value="email">Email</option>
          </select>
        </motion.div>

        <motion.div
          className="flex items-center space-x-2 bg-white p-2 rounded-lg shadow-sm border border-gray-100"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="text-gray-600 text-sm sm:text-base">Filtrar:</span>
          {filtroVista === "email" && (
            <select
              value={emailSeleccionado}
              onChange={(e) => setEmailSeleccionado(e.target.value)}
              className="p-1.5 sm:p-2 border rounded-md bg-gray-50 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none text-sm sm:text-base"
            >
              <option value="todos">Todos</option>
              {Object.values(emailsMap)
                .concat(
                  gastos
                    .filter((g) => g.escompartido && g.otraPersonaEmail)
                    .map((g) => g.otraPersonaEmail!)
                )
                .filter(
                  (email, index, self) => email && self.indexOf(email) === index
                )
                .sort()
                .map((email) => (
                  <option key={email} value={email}>
                    {email}
                  </option>
                ))}
            </select>
          )}
        </motion.div>
      </div>

      <motion.div
        className="relative bg-white rounded-xl shadow-md p-2 sm:p-4 md:p-6 border border-gray-100"
        animate={isAnimating ? { scale: [1, 1.02, 1] } : { scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <PreviewBadge />

        <div className="relative w-full aspect-square max-w-[300px] mx-auto">
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="relative w-[300px] h-[300px]">
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full cursor-pointer"
                onMouseMove={detectarSegmentoHover}
                onMouseLeave={() => setHoveredSlice(null)}
                onClick={detectarSegmentoClick}
              />
              <AnimatePresence>
                {hoveredSlice && (
                  <HoverModal
                    clave={hoveredSlice}
                    porcentaje={porcentajes()[hoveredSlice]}
                    monto={datosGrafico()[hoveredSlice]}
                    x={150}
                    y={150}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
          {datosOrdenados.map(([clave, monto]) => {
            const isPreviewCategory =
              previewGasto &&
              ((filtroVista === "mes" && previewGasto.mes === clave) ||
                (filtroVista === "email" && previewGasto.personaid === clave));

            return (
              <motion.div
                key={clave}
                className={`flex items-center p-2 sm:p-3 rounded-lg transition-colors ${
                  hoveredSlice === clave
                    ? "bg-gray-100"
                    : isPreviewCategory
                    ? "bg-indigo-50 border border-indigo-100"
                    : "hover:bg-gray-50"
                }`}
                onMouseEnter={() => setHoveredSlice(clave)}
                onMouseLeave={() => setHoveredSlice(null)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (filtroVista === "mes") {
                    setSelectedMonth(clave);
                  }
                }}
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
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      <AnimatePresence>
        {modalData && isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-500 to-purple-500" />

              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {modalData.titulo}
                    </h2>
                    <p className="text-gray-500">{modalData.subtitulo}</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      setModalData(null);
                    }}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    aria-label="Cerrar modal"
                  >
                    <svg
                      className="w-6 h-6 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Resumen
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Gastos</span>
                        <span className="font-medium">
                          {modalData.estadisticas.totalGastos}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Monto</span>
                        <span className="font-medium">
                          {formatCurrency(modalData.total)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Distribución
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          Gastos Compartidos
                        </span>
                        <span className="font-medium">
                          {modalData.estadisticas.gastosCompartidos}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          Gastos Individuales
                        </span>
                        <span className="font-medium">
                          {modalData.estadisticas.gastosNoCompartidos}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="overflow-auto max-h-[50vh]">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Descripción
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Monto
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tipo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {modalData.gastos.map((gasto) => (
                        <tr key={gasto.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {gasto.descripcion}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(gasto.monto)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {gasto.escompartido ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                Compartido
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Individual
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {gasto.mes}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PieChart;
