import express from "express";
import { createServer } from "http";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Pusher from "pusher";
import { generateRoomCode } from "./utils/roomUtils";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Game state storage (in-memory for now)
// NOTE: On Vercel, this will be reset when the function spins down.
const rooms = new Map<string, any>();

let pusher: Pusher | null = null;

if (process.env.PUSHER_APP_ID && process.env.PUSHER_APP_KEY && process.env.PUSHER_APP_SECRET && process.env.PUSHER_APP_CLUSTER) {
  pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_APP_KEY,
    secret: process.env.PUSHER_APP_SECRET,
    cluster: process.env.PUSHER_APP_CLUSTER,
    useTLS: true,
  });
}

// API Routes
app.get('/api/health', (req, res) => {
    const config = {
      appId: !!process.env.PUSHER_APP_ID,
      key: !!process.env.PUSHER_APP_KEY,
      secret: !!process.env.PUSHER_APP_SECRET,
      cluster: !!process.env.PUSHER_APP_CLUSTER,
      nodeEnv: process.env.NODE_ENV,
    };

    const isConfigured = Object.values(config).every(val => val !== false);

    res.json({
      status: isConfigured ? "Multiplayer Engine Ready" : "Multiplayer Configuration Missing",
      checks: config
    });
  });

  app.post('/api/pusher/auth', (req, res) => {
    if (!pusher) {
      return res.status(503).send("Pusher not configured");
    }
    
    const body = req.body || {};
    const socketId = body.socket_id;
    const channel = body.channel_name;
    
    if (!socketId || !channel) {
      return res.status(400).send("Missing socket_id or channel_name");
    }

    const user_id = body.user_id || `user_${Math.random().toString(36).slice(2, 7)}`;
    
    const presenceData = {
      user_id: user_id,
      user_info: {
        name: body.user_name || "Anonymous Player",
      },
    };

    try {
      const authResponse = pusher.authenticate(socketId, channel, presenceData);
      res.send(authResponse);
    } catch (error) {
      console.error("Pusher Auth Error:", error);
      res.status(403).send("Forbidden");
    }
  });

  app.post('/api/game/create', async (req, res) => {
    const roomCode = generateRoomCode();
    const { hostUser } = req.body;

    const initialRoomState = {
      roomCode,
      host: hostUser.id,
      players: [{ ...hostUser, role: 'host' }],
      gameState: 'lobby',
      activeStripId: null,
      submissions: [],
      winner: null,
      scores: { [hostUser.id]: 0 },
      branches: { [hostUser.id]: 30 },
      winningComics: [],
      timeLimit: 2,
      pointsToWin: 3
    };

    rooms.set(roomCode, initialRoomState);
    
    if (pusher) {
      await pusher.trigger(`presence-room-${roomCode}`, 'room-update', initialRoomState);
    }
    
    res.json(initialRoomState);
  });

  app.post('/api/game/join', async (req, res) => {
    const { roomCode, user } = req.body;
    let room = rooms.get(roomCode);
    
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    const player = {
      id: user.id,
      name: user.name,
      picture: user.picture,
      role: room.host === user.id ? 'host' : null
    };

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
      room.players[existingPlayerIdx] = { ...room.players[existingPlayerIdx], ...player };
    }

    if (pusher) {
      await pusher.trigger(`presence-room-${roomCode}`, 'room-update', room);
    }

    res.json(room);
  });

  app.post('/api/game/leave', async (req, res) => {
    const { roomCode, userId } = req.body;
    const room = rooms.get(roomCode);
    
    if (room) {
      const playerIdx = room.players.findIndex((p: any) => p.id === userId);
      if (playerIdx !== -1) {
        room.players.splice(playerIdx, 1);
        if (room.players.length === 0) {
          rooms.delete(roomCode);
        } else {
          if (room.host === userId) {
            room.host = room.players[0].id;
            room.players[0].role = 'host';
          }
          if (pusher) {
            await pusher.trigger(`presence-room-${roomCode}`, 'room-update', room);
          }
        }
      }
    }
    res.json({ success: true });
  });

  app.post('/api/game/submit', async (req, res) => {
    const { roomCode, submission } = req.body;
    const room = rooms.get(roomCode);
    if (room) {
      room.submissions.push(submission);
      if (pusher) {
        await pusher.trigger(`presence-room-${roomCode}`, 'new-submission', { submission });
        await pusher.trigger(`presence-room-${roomCode}`, 'room-update', room);
      }
    }
    res.json({ success: true });
  });

  app.post('/api/game/use-hint', async (req, res) => {
    const { roomCode, playerId } = req.body;
    const room = rooms.get(roomCode);
    if (room && room.branches) {
      const currentBranches = room.branches[playerId] ?? 30;
      const newBranchCount = Math.max(0, currentBranches - 1);
      room.branches[playerId] = newBranchCount;
      
      if (pusher) {
        await pusher.trigger(`presence-room-${roomCode}`, 'branch-deduction', { playerId, newBranchCount });
        await pusher.trigger(`presence-room-${roomCode}`, 'room-update', room);
      }
    }
    res.json({ success: true });
  });

  app.post('/api/game/update-state', async (req, res) => {
  const { roomCode, newState } = req.body;
  const room = rooms.get(roomCode);
  if (room) {
    Object.assign(room, newState);
    if (pusher) {
      await pusher.trigger(`presence-room-${roomCode}`, 'room-update', room);
    }
  }
  res.json({ success: true });
});

export default app;

async function startServer() {
  const PORT = 3000;
  const httpServer = createServer(app);

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

if (!process.env.VERCEL) {
  startServer();
}
