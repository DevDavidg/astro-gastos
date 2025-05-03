import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
} from "react";
import type { ReactNode } from "react";
import type { Gasto, Persona } from "../types/gasto";
import type { UserPreferences } from "../types/userPreferences";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import {
  obtenerGastos,
  obtenerPersonas,
  eliminarGasto as eliminarGastoApi,
  actualizarSueldoPersona as actualizarSueldoPersonaApi,
  actualizarNombrePersona as actualizarNombrePersonaApi,
  obtenerEmailPersona,
} from "../services/gastoService";
import {
  getUserPreferences,
  updateUserPreferences,
} from "../services/localStoragePreferences";
import LoadingSpinner from "../components/ui/LoadingSpinner";

type GastoInput = Omit<
  Gasto,
  "id" | "fecha" | "usuarioid" | "fechaCreacion" | "fechaActualizacion"
> & { otraPersonaEmail?: string };

interface GastosContextType {
  gastos: Gasto[];
  personas: Persona[];
  isLoading: boolean;
  userPreferences: UserPreferences;
  emailsMap: Record<string, string>;
  agregarGasto: (gasto: GastoInput) => Promise<void>;
  eliminarGasto: (id: string) => Promise<void>;
  actualizarSueldoPersona: (
    personaId: string,
    nuevoSueldo: number
  ) => Promise<void>;
  actualizarNombrePersona: (
    personaId: string,
    nuevoNombre: string
  ) => Promise<void>;
  recargarDatos: () => Promise<void>;
  setUserPreferences: (preferences: UserPreferences) => void;
}

const GastosContext = createContext<GastosContextType | undefined>(undefined);

export const GastosProvider: React.FC<Readonly<{ children: ReactNode }>> = ({
  children,
}) => {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [emailsMap, setEmailsMap] = useState<Record<string, string>>({});
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(
    getUserPreferences()
  );
  const [user, setUser] = useState<User | null>(null);
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
        const emailsTemp: Record<string, string> = {};
        const uniquePersonaIds = [
          ...new Set(gastosData.map((g) => g.personaid)),
        ];

        await Promise.all(
          uniquePersonaIds.map(async (personaId) => {
            const email = await obtenerEmailPersona(personaId);
            if (email) emailsTemp[personaId] = email;
          })
        );

        setEmailsMap(emailsTemp);
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

  const enviarNotificacion = async (
    userId: string,
    personaPrincipal: Persona,
    gastoData: Omit<
      Gasto,
      "id" | "fecha" | "usuarioid" | "fechaCreacion" | "fechaActualizacion"
    >
  ) => {
    const { error: notificationError } = await supabase
      .from("notifications")
      .insert({
        user_id: userId,
        title: `Nuevo gasto compartido de ${personaPrincipal.nombre}`,
        message: `${gastoData.descripcion} - Monto: ${gastoData.monto} - Tu porcentaje: ${gastoData.porcentajepersona2}%`,
      });

    if (notificationError) {
      console.error("Error al crear notificación:", notificationError);
    }
  };

  const procesarNotificacion = async (
    otraPersonaEmail: string,
    personaPrincipal: Persona,
    gastoData: Omit<
      Gasto,
      "id" | "fecha" | "usuarioid" | "fechaCreacion" | "fechaActualizacion"
    >
  ) => {
    try {
      const { data: personaDestino } = await supabase
        .from("personas")
        .select("usuarioid, email")
        .eq("email", otraPersonaEmail)
        .maybeSingle();

      if (personaDestino) {
        await enviarNotificacion(
          personaDestino.usuarioid,
          personaPrincipal,
          gastoData
        );
        return;
      }

      const { data: authUser } = await supabase.rpc("get_user_id_by_email", {
        email_input: otraPersonaEmail,
      });

      if (authUser?.[0]?.id) {
        await enviarNotificacion(authUser[0].id, personaPrincipal, gastoData);
      }
    } catch (error) {
      console.error("Error al procesar notificación:", error);
    }
  };

  const agregarGasto = async (gasto: GastoInput) => {
    if (!user) {
      throw new Error("Usuario no autenticado");
    }

    try {
      const { otraPersonaEmail, ...gastoData } = gasto;
      await recargarDatos();

      if (gastoData.escompartido && otraPersonaEmail) {
        const personaPrincipal = personas.find(
          (p) => p.id === gastoData.personaid
        );

        if (!personaPrincipal) {
          console.error("No se encontró la persona principal");
          return;
        }

        await procesarNotificacion(
          otraPersonaEmail,
          personaPrincipal,
          gastoData
        );
      }
    } catch (error) {
      console.error("Error al agregar gasto:", error);
      throw error;
    }
  };

  const eliminarGasto = async (id: string) => {
    try {
      setGastos((prevGastos) => {
        const newGastos = prevGastos.filter((g) => g.id !== id);
        window.dispatchEvent(
          new CustomEvent("gastoEliminado", { detail: { id } })
        );
        return newGastos;
      });

      eliminarGastoApi(id).catch((error) => {
        console.error("Error al eliminar el gasto:", error);
        recargarDatos();
      });
    } catch (error) {
      console.error("Error al eliminar el gasto:", error);
      throw error;
    }
  };

  const actualizarSueldoPersona = async (
    personaId: string,
    nuevoSueldo: number
  ) => {
    try {
      await actualizarSueldoPersonaApi(personaId, nuevoSueldo);
      setPersonas((prev) =>
        prev.map((persona) =>
          persona.id === personaId
            ? { ...persona, sueldo: nuevoSueldo }
            : persona
        )
      );
    } catch (error) {
      console.error("Error al actualizar sueldo:", error);
      throw error;
    }
  };

  const actualizarNombrePersona = async (
    personaId: string,
    nuevoNombre: string
  ) => {
    try {
      await actualizarNombrePersonaApi(personaId, nuevoNombre);
      setPersonas((prev) =>
        prev.map((persona) =>
          persona.id === personaId
            ? { ...persona, nombre: nuevoNombre }
            : persona
        )
      );
    } catch (error) {
      console.error("Error actualizando nombre de persona:", error);
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

      const updatedPreferences = updateUserPreferences(preferences);

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

  const value = useMemo(
    () => ({
      gastos,
      personas,
      isLoading,
      userPreferences,
      emailsMap,
      agregarGasto,
      eliminarGasto,
      actualizarSueldoPersona,
      actualizarNombrePersona,
      obtenerTotalGastosPorPersona,
      calcularPorcentajeGasto,
      recargarDatos,
      setUserPreferences: handleUpdateUserPreferences,
    }),
    [
      gastos,
      personas,
      isLoading,
      userPreferences,
      emailsMap,
      agregarGasto,
      eliminarGasto,
      actualizarSueldoPersona,
      actualizarNombrePersona,
      obtenerTotalGastosPorPersona,
      calcularPorcentajeGasto,
      recargarDatos,
      handleUpdateUserPreferences,
    ]
  );

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
};

export function useGastos() {
  const context = useContext(GastosContext);
  if (context === undefined) {
    throw new Error("useGastos debe ser usado dentro de un GastosProvider");
  }
  return context;
}
