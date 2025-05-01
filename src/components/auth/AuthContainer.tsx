import { useState, useEffect } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import { supabase } from "../../lib/supabase";
import LoadingSpinner from "../ui/LoadingSpinner";

export default function AuthContainer() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        window.location.href = "/";
      }

      setLoading(false);
    };

    checkSession();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" color="primary" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <div className="flex justify-center mb-6">
        <div className="inline-flex bg-gray-200 rounded-lg p-1">
          <button
            className={`py-2 px-4 rounded-md ${
              isLogin ? "bg-white shadow-sm" : "text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setIsLogin(true)}
          >
            Iniciar sesión
          </button>
          <button
            className={`py-2 px-4 rounded-md ${
              !isLogin
                ? "bg-white shadow-sm"
                : "text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setIsLogin(false)}
          >
            Registrarse
          </button>
        </div>
      </div>

      {isLogin ? <LoginForm /> : <RegisterForm />}
    </div>
  );
}
