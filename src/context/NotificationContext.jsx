import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import {
  getNotifications,
  getNotificationCounts,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getNotificationTicket,
} from "../services/notificationsApi";
import { toast } from "../Toast/ToastProvider";
import AttendanceSignatureModal from "../components/Modals/AttendanceSignatureModal";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [activeSignatureNotification, setActiveSignatureNotification] = useState(null);

  const socketRef = useRef(null);
  const pingIntervalRef = useRef(null);
  const seenNotificationIdsRef = useRef(new Set());
  const reconnectTimeoutRef = useRef(null);

  // Request browser desktop notification permission on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission().catch(() => {});
      }
    }
  }, []);

  // 1. Fetch unread counts from API
  const fetchCounts = useCallback(async () => {
    try {
      const data = await getNotificationCounts();
      setUnreadCount(typeof data?.unread === "number" ? data.unread : 0);
    } catch (e) {
      console.warn("Notification counts error:", e);
    }
  }, []);

  // 2. Fetch notifications list from API
  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getNotifications({ ordering: "-created_at", page_size: 30 });
      const items = data.results || [];
      setNotifications(items);
      items.forEach((item) => {
        if (item.id) seenNotificationIdsRef.current.add(String(item.id));
      });
    } catch (e) {
      console.warn("Notifications fetch error:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Helper to trigger system / browser notification if site is in background
  const showBrowserNotification = useCallback((title, body) => {
    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "granted" &&
      document.hidden
    ) {
      try {
        new Notification(title || "Raqamli Muloqot", {
          body: body || "Yangi xabarnoma mavjud",
          icon: "/meet_icon.svg",
        });
      } catch (e) {
        console.warn("Browser notification display error:", e);
      }
    }
  }, []);

  const reconnectAttemptsRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 3;

  // 3. Connect to WebSocket (ws/notifications/)
  const connectWs = useCallback(async () => {
    if (socketRef.current && (socketRef.current.readyState === WebSocket.OPEN || socketRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const token = localStorage.getItem("access_token") || localStorage.getItem("token");
    if (!token || token === "null" || token === "undefined") {
      return;
    }

    try {
      let ticket = null;
      try {
        const ticketRes = await getNotificationTicket();
        ticket = ticketRes?.ticket || ticketRes?.data?.ticket;
      } catch (err) {
        console.warn("Notification ticket fetch error, fallback to token:", err);
      }

      const rawWsBase = import.meta.env.VITE_WS_URL || import.meta.env.VITE_BACKEND_URL || "wss://backend-muloqot.raqamlinazorat.uz";
      let cleanWsHost = rawWsBase
        .replace(/^https?:\/\//, "")
        .replace(/^wss?:\/\//, "")
        .replace(/\/api\/v1\/?$/, "")
        .replace(/\/+$/, "");

      if (!cleanWsHost || cleanWsHost === "/api/v1" || cleanWsHost === "/api/v1/") {
        cleanWsHost = "backend-muloqot.raqamlinazorat.uz";
      }

      // Secure wss: protocol (default to wss:)
      const isLocalhost = cleanWsHost.includes("localhost") || cleanWsHost.includes("127.0.0.1");
      const wsProtocol = isLocalhost && window.location.protocol === "http:" ? "ws:" : "wss:";
      const wsUrl = `${wsProtocol}//${cleanWsHost}/ws/notifications/?${ticket ? `ticket=${ticket}` : `token=${token}`}`;

      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        // Reset reconnect attempts on successful connection
        reconnectAttemptsRef.current = 0;

        // Start 30s ping heartbeat
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "ping" }));
          }
        }, 30000);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "pong") return;

          const notifId = String(data.id || `${data.created_at || ""}_${data.title || ""}`);

          // Deduplication: prevent duplicate push
          if (seenNotificationIdsRef.current.has(notifId)) {
            return;
          }
          seenNotificationIdsRef.current.add(notifId);

          // Add to notifications list
          setNotifications((prev) => [data, ...prev.filter((n) => String(n.id) !== notifId)]);
          setUnreadCount((prev) => prev + 1);

          // In-App Toast
          const toastTitle = data.title || "Yangi bildirishnoma";
          const toastMsg = data.message || "";
          toast.info(toastTitle, toastMsg);

          // System Browser Notification if backgrounded
          showBrowserNotification(toastTitle, toastMsg);
        } catch (e) {
          console.warn("Notification WS message parse error:", e);
        }
      };

      ws.onclose = () => {
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);

        // Auto-reconnect up to max 3 times
        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttemptsRef.current += 1;
          if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWs();
          }, 5000);
        } else {
          console.warn(`Notification WS: Qayta ulanish ${MAX_RECONNECT_ATTEMPTS} marta amalga oshirildi, to'xtatildi.`);
        }
      };

      ws.onerror = () => {
        try { ws.close(); } catch {}
      };
    } catch (err) {
      console.warn("Notification WS connection setup error:", err);
    }
  }, [showBrowserNotification]);

  // Initial fetch and WebSocket connection (only once on mount)
  useEffect(() => {
    fetchCounts();
    fetchNotifications();
    connectWs();

    return () => {
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (socketRef.current) {
        try { socketRef.current.close(); } catch {}
      }
    };
  }, []);

  // 4. Mark single notification as read
  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (e) {
      console.warn("Mark as read error:", e);
    }
  };

  // 5. Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (e) {
      console.warn("Mark all as read error:", e);
    }
  };

  // 6. Open signature modal
  const openSignatureModal = (notification) => {
    setActiveSignatureNotification(notification);
  };

  // 7. Signature success callback
  const handleSignatureSuccess = (notification, signatureUrl) => {
    if (!notification) return;
    const notifId = notification.id;

    // Update local notification state to "Imzo saqlandi"
    setNotifications((prev) =>
      prev.map((n) => {
        if (n.id === notifId) {
          return {
            ...n,
            is_read: true,
            is_signed: true,
            title: "Imzo saqlandi",
            message: `«${n.extra_data?.meeting_title || "Yig'ilish"}»da qatnashganingiz tasdiqlandi.`,
            extra_data: {
              ...(n.extra_data || {}),
              is_signed: true,
              signature_url: signatureUrl,
            },
          };
        }
        return n;
      })
    );

    if (!notification.is_read) {
      handleMarkAsRead(notifId);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        markAsRead: handleMarkAsRead,
        markAllAsRead: handleMarkAllAsRead,
        refreshNotifications: fetchNotifications,
        refreshCounts: fetchCounts,
        openSignatureModal,
      }}
    >
      {children}

      {/* Global Attendance Signature Modal */}
      <AttendanceSignatureModal
        isOpen={Boolean(activeSignatureNotification)}
        onClose={() => setActiveSignatureNotification(null)}
        notificationData={activeSignatureNotification}
        onSuccess={handleSignatureSuccess}
      />
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
