import { supabase } from "../lib/supabase";
import type { Gasto, Persona } from "../types/gasto";

/**
 * Obtiene todas las personas del usuario actual
 */
export const obtenerPersonas = async (): Promise<Persona[]> => {
  const { data, error } = await supabase.from("personas").select("*");

  if (error) {
    console.error("Error al obtener personas:", error);
    throw error;
  }

  return data || [];
};

/**
 * Obtiene todos los gastos del usuario actual
 */
export const obtenerGastos = async (): Promise<Gasto[]> => {
  const { data, error } = await supabase.from("gastos").select("*");

  if (error) {
    console.error("Error al obtener gastos:", error);
    throw error;
  }

  return (data || []).map((gasto) => ({
    ...gasto,
    fecha: new Date(gasto.fecha),
    fechaCreacion: gasto.fechaCreacion
      ? new Date(gasto.fechaCreacion)
      : undefined,
    fechaActualizacion: gasto.fechaActualizacion
      ? new Date(gasto.fechaActualizacion)
      : undefined,
  }));
};

/**
 * Crea un nuevo gasto en la base de datos
 */
export const crearGasto = async (
  gasto: Omit<Gasto, "id" | "fechaCreacion" | "fechaActualizacion">
): Promise<Gasto> => {
  if (!gasto.usuarioid) {
    throw new Error("El usuario_id es requerido para crear un gasto");
  }

  const { data, error } = await supabase
    .from("gastos")
    .insert({
      ...gasto,
      fecha: gasto.fecha.toISOString().split("T")[0],
      usuarioid: gasto.usuarioid,
    })
    .select()
    .single();

  if (error) {
    console.error("Error al crear gasto:", error);
    throw error;
  }

  return {
    ...data,
    fecha: new Date(data.fecha),
    fechaCreacion: data.fechaCreacion
      ? new Date(data.fechaCreacion)
      : undefined,
    fechaActualizacion: data.fechaActualizacion
      ? new Date(data.fechaActualizacion)
      : undefined,
  };
};

/**
 * Elimina un gasto de la base de datos
 */
export const eliminarGasto = async (id: string): Promise<void> => {
  const { error } = await supabase.from("gastos").delete().eq("id", id);

  if (error) {
    console.error("Error al eliminar gasto:", error);
    throw error;
  }
};

/**
 * Actualiza el sueldo de una persona
 */
export const actualizarSueldoPersona = async (
  personaId: string,
  monto: number
): Promise<void> => {
  const { error } = await supabase
    .from("personas")
    .update({ sueldo: monto })
    .eq("id", personaId);

  if (error) {
    console.error("Error al actualizar sueldo:", error);
    throw error;
  }
};

/**
 * Actualiza el nombre de una persona
 */
export const actualizarNombrePersona = async (
  personaId: string,
  nombre: string
): Promise<void> => {
  const { error } = await supabase
    .from("personas")
    .update({ nombre })
    .eq("id", personaId);

  if (error) {
    console.error("Error al actualizar nombre:", error);
    throw error;
  }
};
