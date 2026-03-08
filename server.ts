import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Pusher from "pusher";
import { generateRoomCode } from "./utils/roomUtils";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let pusher: Pusher | null = null;

if (process.env.PUSHER_APP_ID && process.env.PUSHER_APP_KEY && process.env.PUSHER_APP_SECRET && process.env.PUSHER_APP_CLUSTER) {
  pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_APP_KEY,
    secret: process.env.PUSHER_APP_SECRET,
    cluster: process.env.PUSHER_APP_CLUSTER,
    useTLS: true,
  });
} else {
  console.warn("Pusher environment variables are missing. Real-time features will be limited to Socket.io.");
}

async function startServer() {
  const app = express();
  app.use(express.json());
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const PORT = 3000;

  // API Routes for Pusher
  app.post('/api/game/create', async (req, res) => {
    const roomCode = generateRoomCode();
    const { hostUser } = req.body;

    const initialRoomState = {
      roomCode,
      host: hostUser.id,
      gameState: 'lobby',
      players: [{ ...hostUser, role: 'host' }],
      scores: { [hostUser.id]: 0 },
      branches: { [hostUser.id]: 30 },
    };

    rooms.set(roomCode, initialRoomState);
    res.json(initialRoomState);
  });

  app.post('/api/game/submit', async (req, res) => {
    const { roomCode, submission } = req.body;
    const room = rooms.get(roomCode);
    if (room) {
      room.submissions.push(submission);
      if (pusher) {
        await pusher.trigger(`room-${roomCode}`, 'new-submission', { submission });
        await pusher.trigger(`room-${roomCode}`, 'room-update', room);
      }
    }
    res.json({ success: true });
  });

  app.post('/api/game/use-hint', async (req, res) => {
    const { roomCode, playerId, cost } = req.body;
    const room = rooms.get(roomCode);
    if (room && room.branches) {
      room.branches[playerId] = cost;
      if (pusher) {
        await pusher.trigger(`room-${roomCode}`, 'branch-deduction', { playerId, newBranchCount: cost });
        await pusher.trigger(`room-${roomCode}`, 'room-update', room);
      }
    }
    res.json({ success: true });
  });

  app.post('/api/update-game', async (req, res) => {
    const { roomCode, newState } = req.body;
    const room = rooms.get(roomCode);
    if (room) {
      Object.assign(room, newState);
      if (pusher) {
        await pusher.trigger(`room-${roomCode}`, 'room-update', room);
      }
    }
    res.json({ success: true });
  });

  // Game state storage (in-memory for now)
  const rooms = new Map<string, any>();
  const socketToUser = new Map<string, { userId: string, roomCode: string }>();

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join-room", ({ roomCode, user }) => {
      socket.join(roomCode);
      
      if (!rooms.has(roomCode)) {
        rooms.set(roomCode, {
          code: roomCode,
          host: user.id,
          players: [],
          gameState: 'lobby', // lobby, role-select, playing, judging, results
          activeStripId: null,
          submissions: [],
          winner: null,
          scores: {},
          branches: {},
          winningComics: [],
          timeLimit: 2,
          pointsToWin: 3
        });
      }

      const room = rooms.get(roomCode);
      const player = {
        id: user.id,
        socketId: socket.id,
        name: user.name,
        picture: user.picture,
        role: room.host === user.id ? 'host' : null
      };
      
      socketToUser.set(socket.id, { userId: user.id, roomCode });

      // Check if player already in room by user.id
      const existingPlayerIdx = room.players.findIndex((p: any) => p.id === user.id);
      if (existingPlayerIdx === -1) {
        room.players.push(player);
        if (room.scores && !room.scores[user.id]) {
          room.scores[user.id] = 0;
        }
        if (room.branches && !room.branches[user.id]) {
          room.branches[user.id] = 30;
        }
      } else {
        // Update socket ID and other info
        room.players[existingPlayerIdx] = { ...room.players[existingPlayerIdx], ...player };
      }

      io.to(roomCode).emit("room-update", room);
      console.log(`User ${user.name} joined room ${roomCode}`);
    });

    socket.on("update-game-state", ({ roomCode, newState }) => {
      const room = rooms.get(roomCode);
      if (room) {
        Object.assign(room, newState);
        io.to(roomCode).emit("room-update", room);
      }
    });

    socket.on("submit-comic", ({ roomCode, submission }) => {
      const room = rooms.get(roomCode);
      if (room) {
        room.submissions.push(submission);
        io.to(roomCode).emit("room-update", room);
      }
    });

    socket.on("use-hint", ({ roomCode }) => {
      const userInfo = socketToUser.get(socket.id);
      if (!userInfo) return;
      const { userId } = userInfo;
      const room = rooms.get(roomCode);
      if (room && room.branches && room.branches[userId] > 0) {
        room.branches[userId] -= 1;
        io.to(roomCode).emit("room-update", room);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      const userInfo = socketToUser.get(socket.id);
      if (userInfo) {
        const { userId, roomCode } = userInfo;
        const room = rooms.get(roomCode);
        if (room) {
          const playerIdx = room.players.findIndex((p: any) => p.id === userId);
          if (playerIdx !== -1) {
            // Optional: Don't remove immediately to allow reconnection
            // For now, we'll keep the original logic of removing them
            room.players.splice(playerIdx, 1);
            if (room.players.length === 0) {
              rooms.delete(roomCode);
            } else {
              if (room.host === userId) {
                room.host = room.players[0].id;
                room.players[0].role = 'host';
              }
              io.to(roomCode).emit("room-update", room);
            }
          }
        }
        socketToUser.delete(socket.id);
      }
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
