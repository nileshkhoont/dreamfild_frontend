import { io } from "socket.io-client";

let socket = null;

/**
 * Connect to the Socket.IO server.
 * @param {string} userId - The logged-in user's ID.
 * @param {function} onNotification - Callback for leave notifications.
 */

export function connectSocket(userId, onNotification) {
  if (!userId) {
    console.warn("[Socket] connectSocket: Missing userId.");
    return;
  }

  if (socket && socket.connected) {
    console.warn("[Socket] Already connected:", socket.id);
    return;
  }

  // Log the backend URL before connecting
  console.log("[Socket] Connecting to:", import.meta.env.VITE_BACKEND_URL);

  socket = io(import.meta.env.VITE_BACKEND_URL, {
    withCredentials: true,
  });

  socket.on("connect", () => {
    console.log("[Socket] Connected:", socket.id);
    socket.emit("join", userId);
  });

  socket.on("leaveStatusUpdate", (data) => {
    console.log("[Socket] Notification received:", data);
    if (onNotification) onNotification(data);

 
  });

  socket.on("disconnect", (reason) => {
    console.log("[Socket] Disconnected:", reason);
  });

  socket.on("connect_error", (err) => {
    console.error("[Socket] Connection error:", err);
  });
}

export function disconnectSocket() {
  if (socket) {
    console.log("[Socket] Disconnecting:", socket.id);
    socket.off("leaveStatusUpdate");
    socket.disconnect();
    socket = null;
    console.log("[Socket] Disconnected.");
  } else {
    console.warn("[Socket] No active connection to disconnect.");
  }
}

export function getSocket() {
  return socket;
}

export function isSocketConnected() {
  return !!socket?.connected;
}
