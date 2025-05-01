/**
 * Genera un ID único basado en timestamp + número aleatorio
 */
export const generarID = (): string => {
  const random = Math.random().toString(36).substring(2);
  const fecha = Date.now().toString(36);
  return random + fecha;
};
