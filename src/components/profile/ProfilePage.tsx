import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import type { Persona } from "../../types/gasto";
import type { User } from "@supabase/supabase-js";
import LoadingSpinner from "../ui/LoadingSpinner";
import { BASE_PATH } from "../../lib/constants";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);

        if (user) {
          loadPersonas(user);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        setError(error instanceof Error ? error.message : "An error occurred");
        setLoading(false);
      }
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        loadPersonas(session.user);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadPersonas(currentUser: User) {
    try {
      const { data, error } = await supabase
        .from("personas")
        .select("*")
        .eq("usuarioid", currentUser.id);

      if (error) {
        throw error;
      }

      setPersonas(data || []);
    } catch (err: any) {
      console.error("Error loading personas:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = `${BASE_PATH}/auth`;
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" color="primary" />
      </div>
    );
  }

  if (!user) {
    window.location.href = `${BASE_PATH}/auth`;
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Mi Perfil</h1>
          <button
            onClick={handleSignOut}
            className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
          >
            Cerrar sesión
          </button>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Información de usuario</h2>
          <p className="text-gray-700">
            <span className="font-medium">Email:</span> {user?.email}
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">Personas</h2>

          {error && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
              role="alert"
            >
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {personas.length === 0 ? (
            <p className="text-gray-500">No hay personas registradas.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {personas.map((persona) => (
                <div
                  key={persona.id}
                  className="border rounded-lg p-4 bg-gray-50"
                >
                  <h3 className="font-medium text-lg">{persona.nombre}</h3>
                  <p className="text-gray-600">
                    <span className="font-medium">Sueldo:</span> $
                    {persona.sueldo.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
