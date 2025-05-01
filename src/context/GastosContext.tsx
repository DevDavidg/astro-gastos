import React, { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { Gasto, Persona } from "../types/gasto";
import type { UserPreferences } from "../types/userPreferences";
import { supabase } from "../lib/supabase";
import {
  obtenerGastos,
  obtenerPersonas,
  crearGasto,
  eliminarGasto as eliminarGastoApi,
  actualizarSueldoPersona as actualizarSueldoPersonaApi,
  actualizarNombrePersona as actualizarNombrePersonaApi,
} from "../services/gastoService";
import {
  getUserPreferences,
  updateUserPreferences,
} from "../services/localStoragePreferences";
import LoadingSpinner from "../components/ui/LoadingSpinner";

interface GastosContextType {
  gastos: Gasto[];
  personas: Persona[];
  isLoading: boolean;
  userPreferences: UserPreferences | null;
  agregarGasto: (
    gasto: Omit<
      Gasto,
      "id" | "fecha" | "usuarioid" | "fechaCreacion" | "fechaActualizacion"
    > & { otraPersonaEmail?: string }
  ) => Promise<void>;
  eliminarGasto: (id: string) => Promise<void>;
  actualizarSueldoPersona: (personaId: string, monto: number) => Promise<void>;
  actualizarNombrePersona: (personaId: string, nombre: string) => Promise<void>;
  obtenerTotalGastosPorPersona: (personaId: string) => number;
  calcularPorcentajeGasto: (
    sueldoPersona1: number,
    sueldoPersona2: number
  ) => { porcentajePersona1: number; porcentajePersona2: number };
  recargarDatos: () => Promise<void>;
  updateUserPreferences: (
    preferences: Partial<UserPreferences>
  ) => Promise<void>;
}

const GastosContext = createContext<GastosContextType | undefined>(undefined);

export function GastosProvider({ children }: { children: ReactNode }) {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userPreferences, setUserPreferences] =
    useState<UserPreferences | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (mounted) {
          setUser(data.session?.user || null);
          setIsInitialized(true);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        if (mounted) {
          setIsInitialized(true);
        }
      }
    };

    initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (mounted) {
        setUser(session?.user || null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (isInitialized && user) {
      cargarDatos();
    }
  }, [user, isInitialized]);

  const cargarDatos = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const [gastosData, personasData, preferencesData] = await Promise.all([
        obtenerGastos(),
        obtenerPersonas(),
        getUserPreferences(),
      ]);

      if (personasData && personasData.length > 0) {
        setGastos(gastosData);
        setPersonas(personasData);
        setUserPreferences(preferencesData);
      } else {
        console.error("No personas found in database");
        setGastos([]);
        setPersonas([]);
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
      setGastos([]);
      setPersonas([]);
    } finally {
      setIsLoading(false);
    }
  };

  const recargarDatos = async () => {
    await cargarDatos();
  };

  const agregarGasto = async (
    gasto: Omit<
      Gasto,
      "id" | "fecha" | "usuarioid" | "fechaCreacion" | "fechaActualizacion"
    > & { otraPersonaEmail?: string }
  ) => {
    if (!user) {
      throw new Error("Usuario no autenticado");
    }

    try {
      const { otraPersonaEmail, ...gastoData } = gasto;

      console.log("Creando nuevo gasto:", gastoData);
      const nuevoGasto = await crearGasto({
        ...gastoData,
        personaid: gastoData.personaid,
        escompartido: gastoData.escompartido,
        porcentajepersona1: gastoData.porcentajepersona1,
        porcentajepersona2: gastoData.porcentajepersona2,
        fecha: new Date(),
        usuarioid: user.id,
      });

      setGastos((prevGastos) => [...prevGastos, nuevoGasto]);

      if (gastoData.escompartido && otraPersonaEmail) {
        const personaPrincipal = personas.find(
          (p) => p.id === gastoData.personaid
        );

        if (personaPrincipal) {
          try {
            console.log("Preparando para enviar email:", {
              to: otraPersonaEmail,
              personaPrincipal: personaPrincipal.nombre,
              gasto: gastoData,
            });

            // Obtener el token de acceso de manera asíncrona
            const {
              data: { session },
            } = await supabase.auth.getSession();
            const accessToken = session?.access_token;

            if (!accessToken) {
              throw new Error("No se pudo obtener el token de acceso");
            }

            const response = await fetch(
              "https://dasmcjyukwazanjruxzk.supabase.co/functions/v1/send-email",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${accessToken}`,
                  apikey: import.meta.env.PUBLIC_SUPABASE_ANON_KEY || "",
                },
                body: JSON.stringify({
                  to: otraPersonaEmail,
                  subject: `Nuevo gasto compartido de ${personaPrincipal.nombre}`,
                  html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                      <h2>Nuevo gasto compartido</h2>
                      <p>${personaPrincipal.nombre} ha agregado un nuevo gasto compartido:</p>
                      <ul>
                        <li><strong>Descripción:</strong> ${gastoData.descripcion}</li>
                        <li><strong>Monto:</strong> ${gastoData.monto}</li>
                        <li><strong>Mes:</strong> ${gastoData.mes}</li>
                        <li><strong>Tu porcentaje:</strong> ${gastoData.porcentajepersona2}%</li>
                      </ul>
                      <p>Puedes ver este gasto en tu cuenta.</p>
                    </div>
                  `,
                }),
              }
            );

            if (!response.ok) {
              const error = await response.json();
              console.error("Error al enviar email:", error);
            } else {
              const data = await response.json();
              console.log("Email enviado exitosamente:", data);
            }
          } catch (error) {
            console.error("Error al enviar email:", {
              error,
              message: error instanceof Error ? error.message : "Unknown error",
              stack: error instanceof Error ? error.stack : undefined,
            });
          }
        }
      }

      await recargarDatos();
    } catch (error) {
      console.error("Error al agregar gasto:", error);
      throw error;
    }
  };

  const eliminarGasto = async (id: string) => {
    try {
      await eliminarGastoApi(id);
      setGastos((prev) => prev.filter((gasto) => gasto.id !== id));
    } catch (error) {
      console.error("Error al eliminar gasto:", error);
      throw error;
    }
  };

  const actualizarSueldoPersona = async (personaId: string, monto: number) => {
    try {
      await actualizarSueldoPersonaApi(personaId, monto);
      setPersonas((prev) =>
        prev.map((persona) =>
          persona.id === personaId ? { ...persona, sueldo: monto } : persona
        )
      );
    } catch (error) {
      console.error("Error al actualizar sueldo:", error);
      throw error;
    }
  };

  const actualizarNombrePersona = async (personaId: string, nombre: string) => {
    try {
      await actualizarNombrePersonaApi(personaId, nombre);
      setPersonas((prev) =>
        prev.map((persona) =>
          persona.id === personaId ? { ...persona, nombre } : persona
        )
      );
    } catch (error) {
      console.error("Error al actualizar nombre:", error);
      throw error;
    }
  };

  const handleUpdateUserPreferences = async (
    preferences: Partial<UserPreferences>
  ) => {
    try {
      if (!user) {
        console.error("No user found when updating preferences");
        return;
      }

      const updatedPreferences = await updateUserPreferences(preferences);

      if (updatedPreferences) {
        setUserPreferences(updatedPreferences);
      } else {
        console.error("Failed to update user preferences");
      }
    } catch (error) {
      console.error("Error al actualizar preferencias:", error);
    }
  };

  const obtenerTotalGastosPorPersona = (personaid: string) => {
    return gastos.reduce((total, gasto) => {
      if (gasto.personaid === personaid) {
        return total + gasto.monto;
      }
      if (gasto.escompartido) {
        if (gasto.porcentajepersona1 && gasto.porcentajepersona2) {
          return (
            total +
            (gasto.monto *
              (personaid === "persona1"
                ? gasto.porcentajepersona1
                : gasto.porcentajepersona2)) /
              100
          );
        }
      }
      return total;
    }, 0);
  };

  const calcularPorcentajeGasto = (
    sueldoPersona1: number,
    sueldoPersona2: number
  ) => {
    const sueldoTotal = sueldoPersona1 + sueldoPersona2;

    if (sueldoTotal === 0) {
      return { porcentajePersona1: 50, porcentajePersona2: 50 };
    }

    const porcentajePersona1 = Math.round((sueldoPersona1 / sueldoTotal) * 100);
    const porcentajePersona2 = 100 - porcentajePersona1;

    return { porcentajePersona1, porcentajePersona2 };
  };

  const value = {
    gastos,
    personas,
    isLoading,
    userPreferences,
    agregarGasto,
    eliminarGasto,
    actualizarSueldoPersona,
    actualizarNombrePersona,
    obtenerTotalGastosPorPersona,
    calcularPorcentajeGasto,
    recargarDatos,
    updateUserPreferences: handleUpdateUserPreferences,
  };

  if (!isInitialized) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" color="primary" />
      </div>
    );
  }

  return (
    <GastosContext.Provider value={value}>{children}</GastosContext.Provider>
  );
}

export function useGastos() {
  const context = useContext(GastosContext);
  if (context === undefined) {
    throw new Error("useGastos debe ser usado dentro de un GastosProvider");
  }
  return context;
}
