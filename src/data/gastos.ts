import type { Gasto } from "../types/gasto";
import { generarID } from "../utils/generarID";

export const gastosIniciales: Gasto[] = [
  {
    id: generarID(),
    mes: "Enero",
    descripcion: "Gasto persona 1",
    monto: 100.0,
    fecha: new Date("2023-01-05"),
    personaid: "persona1",
    escompartido: false,
    usuarioid: "demo_user",
  },
  {
    id: generarID(),
    mes: "Enero",
    descripcion: "Gasto persona 2",
    monto: 150.0,
    fecha: new Date("2023-01-10"),
    personaid: "persona2",
    escompartido: false,
    usuarioid: "demo_user",
  },
  {
    id: generarID(),
    mes: "Febrero",
    descripcion: "Gasto compartido",
    monto: 200.0,
    fecha: new Date("2023-02-15"),
    personaid: "persona1",
    escompartido: true,
    porcentajepersona1: 60,
    porcentajepersona2: 40,
    usuarioid: "demo_user",
  },
  {
    id: generarID(),
    mes: "Marzo",
    descripcion: "Gasto compartido",
    monto: 300.0,
    fecha: new Date("2023-03-20"),
    personaid: "persona2",
    escompartido: true,
    porcentajepersona1: 50,
    porcentajepersona2: 50,
    usuarioid: "demo_user",
  },
];
