import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";

interface ExtWebSocket extends WebSocket {
  isAlive: boolean;
}

const wss = new WebSocketServer({ port: 8080 });
const matchSubscribers = new Map(); // want to track which sockets are subscribed to which matches => A map prevents a user from being added twice to the same match

function subscribe(matchId: any, socket: any) {
  if (!matchSubscribers.has(matchId)) {
    matchSubscribers.set(matchId, new Set());
  }
  matchSubscribers.get(matchId).add(socket);
}

function unsubscribe(matchId: any, socket: any) {
  const subscribers = matchSubscribers.get(matchId);
  if (!subscribers) return;
  subscribers.delete(socket);
  if (subscribers.size === 0) {
    matchSubscribers.delete(matchId);
  }
}

function broadcastToMatch(matchId: any, payload: any) {
  const subscribers = matchSubscribers.get(matchId);
  if (!subscribers || subscribers.size === 0) return;
  const message = JSON.stringify(payload);
  for (const client of subscribers) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

// when a user closes their browser or loses internet  , we loop through the local subscription set and remove them from all match rooms
function cleanSubscriptions(socket: any) {
  for (const matchId of socket.subscriptions) {
    unsubscribe(matchId, socket);
  }
}

function sendJson(socket: WebSocket, payload: any) {
  if (socket.readyState !== WebSocket.OPEN) return;
  socket.send(JSON.stringify(payload));
}

function broadcast(wss: WebSocketServer, payload: any) {
  for (const client of wss.clients) {
    if (client.readyState !== WebSocket.OPEN) continue;
    client.send(JSON.stringify(payload));
  }
}

// This function will receive the HTTP server instance created by Express and we are passing it into the websocket so that it can attach itself to the same underlying server
// The HTTP server will then listen on that port and handle normal Rest requests
//! While the web socket uses the same server to listen for upgrade requests
// => This avoids running a separate port just for websockets. Using the same server simplifies deployment and networking

export function attachWebSocketServer(server: Server) {
  // path: This is a string representing the websocket endpoint and only requests made to this exact path are eligible for websocket upgrades
  //! requests to other paths continue to be handled by express normally
  const wss = new WebSocketServer({
    server,
    path: "/ws",
    // maxPayload : This is a number represented in bytes and it defines the the maximum size allowed for a single incoming websocket message
    //! This acts as a security measure agains memory abuse or flooding
    maxPayload: 1024 * 1024,
  });
  wss.on("connection", (socket: ExtWebSocket) => {
    socket.isAlive = true;
    socket.on("pong", () => {
      socket.isAlive = true;
    });
    sendJson(socket, { type: "welcome" });
    socket.on("error", console.error);
  });

  const interval = setInterval(() => {
    wss.clients.forEach((client) => {
      const ws = client as ExtWebSocket;
      if (ws.isAlive === false) return ws.terminate();
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);
  wss.on("close", () => clearInterval(interval));

  function broadcastMatchCreated(match: any) {
    broadcast(wss, { type: "match_created", data: match });
  }
  return { broadcastMatchCreated };
}

// Connection Event :
wss.on("connection", (socket, request) => {
  const ip = request.socket.remoteAddress;
  socket.on("message", (rawData) => {
    console.log({ rawData });
    const message = rawData.toString();
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN)
        client.send(`Server Broadcast :${message} `);
    });
    socket.on("error", (err) => {
      console.error(`Error : ${err.message}:${ip} `);
    });

    socket.on("close", () => {
      console.log("Client Disconnected");
    });
  });
});
