import { useEffect, useState, useRef } from "react";
import io, { Socket } from "socket.io-client";
import { gameStore } from "../store/gameStore";

const SOCKET_URL = "http://localhost:3000/room";

let globalSocket: Socket | null = null;

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const { mySocketId, setMySocketId } = gameStore;
  const [socketId, setSocketId] = useState<string>(mySocketId || "");
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    let isMounted = true;

    const setupSocket = () => {
      if (globalSocket) {
        console.log("🔌 Используем существующий socket:", globalSocket.id);
        socketRef.current = globalSocket;

        if (globalSocket.connected) {
          setIsConnected(true);
          setSocketId(globalSocket.id || "");
        }

        globalSocket.off("connect");
        globalSocket.off("disconnect");
        globalSocket.off("connect_error");

        globalSocket.on("connect", () => {
          if (!isMounted) return;
          console.log("✅ Подключено! ID:", globalSocket?.id);
          setIsConnected(true);
          setMySocketId(globalSocket?.id || "");
        });

        globalSocket.on("disconnect", () => {
          if (!isMounted) return;
          console.log("❌ Отключено");
          setIsConnected(false);
        });

        globalSocket.on("connect_error", (error) => {
          if (!isMounted) return;
          console.error("❌ Ошибка подключения:", error);
          setIsConnected(false);
        });

        return;
      }

      console.log("🔌 Создаём новый socket...");

      const newSocket = io(SOCKET_URL, {
        transports: ["websocket", "polling"],
      });

      newSocket.on("connect", () => {
        if (!isMounted) return;
        console.log("✅ Подключено! ID:", newSocket.id);
        setIsConnected(true);
        const id = newSocket.id || "";
        setSocketId(id);
        localStorage.setItem("socketId", id);
        setMySocketId(id);
      });

      newSocket.on("disconnect", () => {
        if (!isMounted) return;
        console.log("❌ Отключено");
        setIsConnected(false);
      });

      newSocket.on("connect_error", (error) => {
        if (!isMounted) return;
        console.error("❌ Ошибка подключения:", error);
        setIsConnected(false);
      });

      globalSocket = newSocket;
      socketRef.current = newSocket;
    };

    setupSocket();

    return () => {
      isMounted = false;
      if (globalSocket) {
        globalSocket.off("connect");
        globalSocket.off("disconnect");
        globalSocket.off("connect_error");
      }
    };
  }, [setMySocketId]);

  return {
    socket: socketRef.current,
    isConnected,
    socketId,
  };
};
