import { useState } from "react";
import { supabase } from "../../lib/supabase";
import LoadingSpinner from "../ui/LoadingSpinner";
import { BASE_PATH } from "../../lib/constants";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("Email not confirmed")) {
          setError(
            "Necesitas confirmar tu email antes de iniciar sesión. Por favor revisa tu bandeja de entrada."
          );
        } else {
          setError(error.message);
        }
        setLoading(false);
      } else {
        window.location.href = `${BASE_PATH}/`;
      }
    } catch (error: any) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    setResendingEmail(true);
    setResendSuccess(false);

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
      });

      if (error) {
        setError(`Error al reenviar correo: ${error.message}`);
      } else {
        setResendSuccess(true);
        setError(null);
      }
    } catch (err) {
      setError("No se pudo reenviar el correo de confirmación");
      console.error(err);
    } finally {
      setResendingEmail(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form
        onSubmit={handleLogin}
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Iniciar sesión</h2>

        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
            {error.includes("confirmar tu email") && (
              <button
                type="button"
                onClick={handleResendConfirmation}
                disabled={resendingEmail}
                className="mt-2 text-blue-700 underline hover:text-blue-900 disabled:opacity-50"
              >
                {resendingEmail
                  ? "Enviando..."
                  : "Reenviar correo de confirmación"}
              </button>
            )}
          </div>
        )}

        {resendSuccess && (
          <div
            className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <span className="block sm:inline">
              Se ha enviado un nuevo correo de confirmación. Por favor verifica
              tu bandeja de entrada.
            </span>
          </div>
        )}

        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="email"
          >
            Email
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-6">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="password"
          >
            Contraseña
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            id="password"
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <LoadingSpinner size="small" color="white" />
                <span className="ml-2">Cargando...</span>
              </div>
            ) : (
              "Iniciar sesión"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
