import React, { createContext, useContext, useRef } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ userId, children }) => {
  const socketRef = useRef(null);

  React.useEffect(() => {
    console.log("userId:", userId, "socketRef.current:", socketRef.current);
    if (userId && !socketRef.current) {
      console.log("Connecting socket to:", import.meta.env.VITE_BACKEND_URL);
      socketRef.current = io(import.meta.env.VITE_BACKEND_URL, { withCredentials: true });
      socketRef.current.on("connect", () => {
        socketRef.current.emit("join", userId);
        alert("Socket connected: " + socketRef.current.id + " userId: " + userId);
        console.log("Socket connected:", socketRef.current.id, "userId:", userId);
        // Store connection info in localStorage
        localStorage.setItem("socketConnection", JSON.stringify({
          socketId: socketRef.current.id,
          userId: userId,
          connectedAt: new Date().toISOString()
        }));
      });
      // Log immediately after socket creation (for debugging)
      alert("Socket instance created for userId: " + userId);
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        localStorage.removeItem("socketConnection");
        console.log("Socket disconnected");
      }
    };
  }, [userId]);

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
};