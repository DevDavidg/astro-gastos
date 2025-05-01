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
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Error al obtener usuario:", userError);
    throw new Error("Usuario no autenticado");
  }

  console.log("Obteniendo gastos para usuario:", user.id);
  console.log("Email del usuario:", user.email);

  // Obtener todos los gastos del usuario
  const { data: gastosUsuario, error: errorGastosUsuario } = await supabase
    .from("gastos")
    .select("*")
    .eq("usuarioid", user.id);

  if (errorGastosUsuario) {
    console.error("Error al obtener gastos del usuario:", errorGastosUsuario);
    throw errorGastosUsuario;
  }

  // Obtener gastos compartidos donde el usuario es la otra persona
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

  // Combinar y eliminar duplicados
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

/**
 * Crea un nuevo gasto en la base de datos
 */
export const crearGasto = async (
  gasto: Omit<Gasto, "id" | "fechaCreacion" | "fechaActualizacion">
): Promise<Gasto> => {
  if (!gasto.usuarioid) {
    throw new Error("El usuario_id es requerido para crear un gasto");
  }

  console.log("Datos recibidos en crearGasto:", gasto);
  console.log("otraPersonaEmail:", gasto.otraPersonaEmail);

  // Preparar el objeto para insertar
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
    // AGREGAR ESTA LÍNEA para incluir otrapersonaemail
    otrapersonaemail: gasto.otraPersonaEmail || null,
  };

  console.log("Datos a insertar:", gastoParaInsertar);

  const { data, error } = await supabase
    .from("gastos")
    .insert(gastoParaInsertar)
    .select()
    .single();

  if (error) {
    console.error("Error al crear gasto:", error);
    throw error;
  }

  console.log("Gasto creado en BD:", data);

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

/**
 * Elimina un gasto de la base de datos
 */
export const eliminarGasto = async (id: string): Promise<void> => {
  try {
    console.log("Iniciando eliminación de gasto con ID:", id);

    // Obtener información del usuario actual
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Usuario no autenticado");
    }

    // Primero verificar si el gasto existe y obtener sus detalles
    const { data: gastoExistente, error: errorBusqueda } = await supabase
      .from("gastos")
      .select("*")
      .eq("id", id)
      .single();

    if (errorBusqueda || !gastoExistente) {
      console.error("No se encontró el gasto:", errorBusqueda);
      return;
    }

    console.log("Gasto encontrado:", gastoExistente);
    console.log("Usuario actual:", user.id);
    console.log("Propietario del gasto:", gastoExistente.usuarioid);

    // Verificar si el usuario tiene permiso para eliminar
    const esPropietario = gastoExistente.usuarioid === user.id;
    const esDestinatario = gastoExistente.otrapersonaemail === user.email;

    if (!esPropietario && !esDestinatario) {
      console.error("El usuario no tiene permisos para eliminar este gasto");
      throw new Error("No tienes permisos para eliminar este gasto");
    }

    // Eliminar el gasto
    const { error: errorEliminacion } = await supabase
      .from("gastos")
      .delete()
      .eq("id", id);

    if (errorEliminacion) {
      console.error("Error al eliminar gasto:", errorEliminacion);
      throw errorEliminacion;
    }

    console.log("Comando de eliminación ejecutado");

    // Esperar un momento para que la base de datos procese
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Verificar que realmente se eliminó
    const { data: checkData } = await supabase
      .from("gastos")
      .select("id")
      .eq("id", id);

    console.log("Verificación post-eliminación:", checkData);

    if (checkData && checkData.length > 0) {
      console.error("El gasto sigue existiendo después de la eliminación");
      throw new Error("El gasto no se eliminó correctamente");
    }
  } catch (error) {
    console.error("Error en eliminarGasto:", error);
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

/**
 * Obtiene el email de una persona por su ID
 */
export const obtenerEmailPersona = async (
  personaId: string
): Promise<string | null> => {
  console.log("Buscando email para personaId:", personaId);

  // Usar RPC para obtener el email directamente con el ID de la persona
  const { data: userData, error: userError } = await supabase.rpc(
    "get_user_email_by_persona_id",
    { persona_id: personaId }
  );

  console.log("Datos de usuario:", userData);

  if (userError) {
    console.error("Error al obtener email de usuario:", userError);
    return null;
  }

  return userData || null;
};
