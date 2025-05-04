import { supabase } from "../lib/supabase";
import type { Gasto, Persona } from "../types/gasto";

export const obtenerPersonas = async (): Promise<Persona[]> => {
  const { data, error } = await supabase.from("personas").select("*");

  if (error) {
    console.error("Error al obtener personas:", error);
    throw error;
  }

  return data || [];
};

export const obtenerGastos = async (): Promise<Gasto[]> => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Error al obtener usuario:", userError);
    throw new Error("Usuario no autenticado");
  }

  const { data: gastosUsuario, error: errorGastosUsuario } = await supabase
    .from("gastos")
    .select("*")
    .eq("usuarioid", user.id);

  if (errorGastosUsuario) {
    console.error("Error al obtener gastos del usuario:", errorGastosUsuario);
    throw errorGastosUsuario;
  }

  const { data: gastosCompartidos, error: errorGastosCompartidos } =
    await supabase
      .from("gastos")
      .select("*")
      .eq("otrapersonaemail", user.email);

  if (errorGastosCompartidos) {
    console.error(
      "Error al obtener gastos compartidos:",
      errorGastosCompartidos
    );
    throw errorGastosCompartidos;
  }

  const todosLosGastos = [
    ...(gastosUsuario || []),
    ...(gastosCompartidos || []),
  ];
  const gastosUnicos = todosLosGastos.filter(
    (gasto, index, self) => index === self.findIndex((g) => g.id === gasto.id)
  );

  return gastosUnicos.map((gasto) => ({
    ...gasto,
    otraPersonaEmail: gasto.otrapersonaemail,
    fecha: new Date(gasto.fecha),
    fechaCreacion: gasto.fechaCreacion
      ? new Date(gasto.fechaCreacion)
      : undefined,
    fechaActualizacion: gasto.fechaActualizacion
      ? new Date(gasto.fechaActualizacion)
      : undefined,
  }));
};

export const crearGasto = async (
  gasto: Omit<Gasto, "id" | "fechaCreacion" | "fechaActualizacion">
): Promise<Gasto> => {
  if (!gasto.usuarioid) {
    throw new Error("El usuario_id es requerido para crear un gasto");
  }

  const gastoParaInsertar: any = {
    mes: gasto.mes,
    descripcion: gasto.descripcion,
    monto: gasto.monto,
    fecha: gasto.fecha.toISOString().split("T")[0],
    personaid: gasto.personaid,
    escompartido: gasto.escompartido,
    porcentajepersona1: gasto.porcentajepersona1,
    porcentajepersona2: gasto.porcentajepersona2,
    usuarioid: gasto.usuarioid,
    otrapersonaemail: gasto.escompartido ? gasto.otraPersonaEmail : null,
  };

  const { data, error } = await supabase
    .from("gastos")
    .insert(gastoParaInsertar)
    .select()
    .single();

  if (error) {
    console.error("Error al crear gasto:", error);
    throw error;
  }

  return {
    ...data,
    otraPersonaEmail: data.otrapersonaemail,
    fecha: new Date(data.fecha),
    fechaCreacion: data.fechaCreacion
      ? new Date(data.fechaCreacion)
      : undefined,
    fechaActualizacion: data.fechaActualizacion
      ? new Date(data.fechaActualizacion)
      : undefined,
  };
};

export const eliminarGasto = async (id: string): Promise<void> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Usuario no autenticado");
    }

    const { data: gastoExistente, error: errorBusqueda } = await supabase
      .from("gastos")
      .select("*")
      .eq("id", id)
      .single();

    if (errorBusqueda || !gastoExistente) {
      console.error("No se encontró el gasto:", errorBusqueda);
      return;
    }

    const esPropietario = gastoExistente.usuarioid === user.id;
    const esDestinatario = gastoExistente.otrapersonaemail === user.email;

    if (!esPropietario && !esDestinatario) {
      console.error("El usuario no tiene permisos para eliminar este gasto");
      throw new Error("No tienes permisos para eliminar este gasto");
    }

    const { error: errorEliminacion } = await supabase
      .from("gastos")
      .delete()
      .eq("id", id);

    if (errorEliminacion) {
      console.error("Error al eliminar gasto:", errorEliminacion);
      throw errorEliminacion;
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const { data: checkData } = await supabase
      .from("gastos")
      .select("id")
      .eq("id", id);

    if (checkData && checkData.length > 0) {
      console.error("El gasto sigue existiendo después de la eliminación");
      throw new Error("El gasto no se eliminó correctamente");
    }
  } catch (error) {
    console.error("Error en eliminarGasto:", error);
    throw error;
  }
};

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
export const obtenerEmailPersona = async (
  personaId: string
): Promise<string | null> => {
  const { data: userData, error: userError } = await supabase.rpc(
    "get_user_email_by_persona_id",
    { persona_id: personaId }
  );

  if (userError) {
    console.error("Error al obtener email de usuario:", userError);
    return null;
  }

  return userData ?? null;
};
