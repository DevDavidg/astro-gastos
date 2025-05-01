import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { BASE_PATH } from "../../lib/constants";

export default function HomeRedirect() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          window.location.href = `${BASE_PATH}/auth`;
        }

        setLoading(false);
      } catch (error) {
        console.error("Error checking auth:", error);
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return null;
  }

  return null;
}
