export interface Gasto {
  id: string;
  mes: string;
  descripcion: string;
  monto: number;
  fecha: Date;
  personaid: string;
  escompartido: boolean;
  porcentajepersona1?: number;
  porcentajepersona2?: number;
  usuarioid: string;
  otraPersonaEmail?: string;
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
}

export interface Persona {
  id: string;
  nombre: string;
  sueldo: number;
  email: string;
  usuarioid: string;
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
}

export interface Sueldo {
  monto: number;
  fecha: Date;
}

export type MesType =
  | "Enero"
  | "Febrero"
  | "Marzo"
  | "Abril"
  | "Mayo"
  | "Junio"
  | "Julio"
  | "Agosto"
  | "Septiembre"
  | "Octubre"
  | "Noviembre"
  | "Diciembre";

export const MESES: MesType[] = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];
