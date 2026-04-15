import { WebSocketServer } from "ws";
import { verifyToken } from "../../utils/jsonWebTokensHelper.js";
import { streamChatMessage } from "./chatbot.service.js";
import logger from "../../utils/logger.js";

const WS_PATH = "/ws/chat";

/**
 * Attach the chatbot WebSocket server to an existing HTTP server.
 *
 * Protocol:
 *   Client connects to   ws(s)://host/ws/chat?token=<jwt>
 *   Client sends JSON:   { type: "message", id, message, conversationHistory }
 *   Server emits JSON:   { type: "chunk", id, delta }          (repeated)
 *                        { type: "done",  id, timestamp }      (once)
 *                        { type: "error", id, message }        (on failure)
 */
export const attachChatWebSocket = (httpServer) => {
  const wss = new WebSocketServer({ noServer: true });

  httpServer.on("upgrade", (req, socket, head) => {
    let pathname;
    try {
      pathname = new URL(req.url, "http://localhost").pathname;
    } catch {
      socket.destroy();
      return;
    }

    if (pathname !== WS_PATH) {
      // Not ours — leave it alone so other upgrade handlers (if any) can take it.
      return;
    }

    // Authenticate via ?token= query param (browser WebSocket API can't set headers)
    let token;
    try {
      const url = new URL(req.url, "http://localhost");
      token = url.searchParams.get("token");
    } catch {
      socket.write("HTTP/1.1 400 Bad Request\r\n\r\n");
      socket.destroy();
      return;
    }

    if (!token) {
      socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
      socket.destroy();
      return;
    }

    const result = verifyToken(token);
    if (!result.success) {
      socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
      socket.destroy();
      return;
    }

    wss.handleUpgrade(req, socket, head, (ws) => {
      ws.user = result.data;
      wss.emit("connection", ws, req);
    });
  });

  wss.on("connection", (ws) => {
    const userId = ws.user?.id;
    logger.info("CHAT_WS", `Client connected (userId=${userId})`);

    // Keep-alive ping so proxies don't drop idle sockets
    ws.isAlive = true;
    ws.on("pong", () => {
      ws.isAlive = true;
    });

    ws.on("message", async (raw) => {
      let payload;
      try {
        payload = JSON.parse(raw.toString());
      } catch {
        ws.send(JSON.stringify({ type: "error", message: "Invalid JSON" }));
        return;
      }

      if (payload.type !== "message") {
        ws.send(JSON.stringify({ type: "error", id: payload.id, message: "Unknown message type" }));
        return;
      }

      const { id, message, conversationHistory } = payload;

      if (!message || typeof message !== "string") {
        ws.send(JSON.stringify({ type: "error", id, message: "message field is required" }));
        return;
      }

      try {
        await streamChatMessage(
          {
            message,
            userId,
            conversationHistory: Array.isArray(conversationHistory) ? conversationHistory : [],
          },
          (delta) => {
            if (ws.readyState === ws.OPEN) {
              ws.send(JSON.stringify({ type: "chunk", id, delta }));
            }
          }
        );

        if (ws.readyState === ws.OPEN) {
          ws.send(
            JSON.stringify({
              type: "done",
              id,
              timestamp: new Date().toISOString(),
            })
          );
        }
      } catch (error) {
        logger.error("CHAT_WS", "Streaming error", error);
        if (ws.readyState === ws.OPEN) {
          ws.send(
            JSON.stringify({
              type: "error",
              id,
              message: error.message || "Internal error",
            })
          );
        }
      }
    });

    ws.on("close", () => {
      logger.info("CHAT_WS", `Client disconnected (userId=${userId})`);
    });

    ws.on("error", (err) => {
      logger.error("CHAT_WS", "Socket error", err);
    });
  });

  // Heartbeat: drop dead clients every 30s
  const heartbeat = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) return ws.terminate();
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on("close", () => clearInterval(heartbeat));

  return wss;
};
