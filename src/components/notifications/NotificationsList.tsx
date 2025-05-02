// src/components/notifications/NotificationsList.tsx
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export const NotificationsList = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.error("No user found");
        return;
      }

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading notifications:", error);
      } else {
        setNotifications(data || []);
      }
    } catch (error) {
      console.error("Error in loadNotifications:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Cargando notificaciones...</div>;
  }

  if (notifications.length === 0) {
    return <div>No hay notificaciones</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Notificaciones</h2>
      {notifications.map((notification) => (
        <div key={notification.id} className="p-4 border rounded">
          <h3 className="font-bold">{notification.title}</h3>
          <p>{notification.message}</p>
          <p className="text-sm text-gray-500">
            {new Date(notification.created_at).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
};
