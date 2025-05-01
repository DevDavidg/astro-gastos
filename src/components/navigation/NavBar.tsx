import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import type { User } from "@supabase/supabase-js";
import { BASE_PATH } from "../../lib/constants";

export default function NavBar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setUser(session?.user || null);
        setLoading(false);
      } catch (error) {
        console.error("Error getting session:", error);
        setLoading(false);
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    getSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <nav className="flex justify-between items-center">
      <a href={`${BASE_PATH}/`} className="text-2xl font-bold text-blue-600">
        Astro Gastos
      </a>

      <div className="flex items-center space-x-4">
        {!loading && (
          <>
            {user ? (
              <>
                <a
                  href={`${BASE_PATH}/`}
                  className="text-gray-600 hover:text-blue-600"
                >
                  Inicio
                </a>
                <a
                  href={`${BASE_PATH}/resumen`}
                  className="text-gray-600 hover:text-blue-600"
                >
                  Resumen
                </a>
                <a
                  href={`${BASE_PATH}/configuracion`}
                  className="text-gray-600 hover:text-blue-600"
                >
                  Configuración
                </a>
                <a
                  href={`${BASE_PATH}/profile`}
                  className="text-gray-600 hover:text-blue-600"
                >
                  Mi Perfil
                </a>
              </>
            ) : (
              <>
                <a
                  href={`${BASE_PATH}/auth`}
                  className="text-gray-600 hover:text-blue-600"
                >
                  Iniciar sesión
                </a>
              </>
            )}
          </>
        )}
      </div>
    </nav>
  );
}
