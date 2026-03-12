import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import Pusher from "pusher";
import { kv } from "@vercel/kv";
import { generateRoomCode } from "./utils/roomUtils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Game state storage
// We'll use @vercel/kv for persistence if configured, otherwise fall back to Map
const roomsMap = new Map<string, any>();
const imageCache = new Map<string, string>();

// Helper to get room from Redis or Map
async function getRoom(code: string): Promise<any> {
  const upperCode = code.toUpperCase();
  try {
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      return await kv.get(`room:${upperCode}`);
    }
  } catch (e) {
    console.error("Redis get error:", e);
  }
  return roomsMap.get(upperCode);
}

// Helper to save room to Redis or Map
async function saveRoom(code: string, room: any): Promise<void> {
  const upperCode = code.toUpperCase();
  try {
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      await kv.set(`room:${upperCode}`, room, { ex: 86400 }); // 24h expiry
      return;
    }
  } catch (e) {
    console.error("Redis set error:", e);
  }
  roomsMap.set(upperCode, room);
}

// Helper to delete room
async function deleteRoom(code: string): Promise<void> {
  const upperCode = code.toUpperCase();
  try {
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      await kv.del(`room:${upperCode}`);
      return;
    }
  } catch (e) {
    console.error("Redis del error:", e);
  }
  roomsMap.delete(upperCode);
}

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
app.post('/api/upload-image', (req, res) => {
  try {
    const { id, dataUrl } = req.body;
    if (!id || !dataUrl) {
      return res.status(400).send('Missing id or dataUrl');
    }
    imageCache.set(id, dataUrl);
    
    // Clean up old images if cache gets too large (e.g. > 100 images)
    if (imageCache.size > 100) {
      const firstKey = imageCache.keys().next().value;
      if (firstKey) imageCache.delete(firstKey);
    }
    
    res.json({ url: `/api/image/${id}` });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).send('Failed to upload image');
  }
});

app.get('/api/image/:id', (req, res) => {
  try {
    const dataUrl = imageCache.get(req.params.id);
    if (!dataUrl) return res.status(404).send('Image not found');
    
    const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).send('Invalid image data');
    }
    
    res.setHeader('Content-Type', matches[1]);
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.send(Buffer.from(matches[2], 'base64'));
  } catch (error) {
    console.error('Image retrieval error:', error);
    res.status(500).send('Failed to retrieve image');
  }
});

app.get('/api/proxy-image', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url || typeof url !== 'string') {
      return res.status(400).send('Missing url parameter');
    }
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const contentType = response.headers.get('content-type');
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    
    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).send('Failed to proxy image');
  }
});

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
    try {
      const { hostUser, avatarPool } = req.body;
      console.log(`Creating room for user: ${hostUser?.name} (${hostUser?.id})`);
      
      if (!hostUser || !hostUser.id) {
        return res.status(400).json({ error: "Invalid host user data" });
      }

      const roomCode = generateRoomCode();
      console.log(`Generated room code: ${roomCode}`);

      const initialRoomState = {
        roomCode,
        host: hostUser.id,
        players: [{ ...hostUser, role: 'host' }],
        avatarPool: avatarPool || [],
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

      roomsMap.set(roomCode, initialRoomState);
      await saveRoom(roomCode, initialRoomState);
      console.log(`Room ${roomCode} stored. Redis used if configured.`);
      
      if (pusher) {
        try {
          await pusher.trigger(`room-${roomCode}`, 'room-update', { timestamp: Date.now() });
        } catch (pusherError) {
          console.error("Pusher trigger failed:", pusherError);
        }
      }
    
    res.json(initialRoomState);
  } catch (error) {
    console.error("Game creation error:", error);
    res.status(500).json({ error: "Failed to create game room", details: error instanceof Error ? error.message : String(error) });
  }
});

app.get('/api/game/room/:code', async (req, res) => {
  const room = await getRoom(req.params.code.toUpperCase());
  if (!room) return res.status(404).json({ error: "Room not found" });
  res.json(room);
});

app.post('/api/game/join', async (req, res) => {
  try {
    const { roomCode, user } = req.body;
    
    if (!roomCode) {
      return res.status(400).json({ error: "Room code is required" });
    }
    
    if (!user || !user.id) {
      return res.status(400).json({ error: "Valid user data is required" });
    }

    let room = await getRoom(roomCode);
    
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    const isGuest = user.id.startsWith('guest_') || user.name.startsWith('Player ');
    let picture = user.picture;

    // If guest and has a default/missing picture, try to pick from pool
    if (isGuest && (!picture || picture.includes('picsum.photos')) && room.avatarPool && room.avatarPool.length > 0) {
      const randomIndex = Math.floor(Math.random() * room.avatarPool.length);
      picture = room.avatarPool[randomIndex];
    }

    const player = {
      id: user.id,
      name: user.name || 'Unknown Player',
      picture: picture,
      role: room.host === user.id ? 'host' : null
    };

    // Check if player already in room by user.id
    if (!room.players) room.players = [];
    const existingPlayerIdx = room.players.findIndex((p: any) => p.id === user.id);
    
    if (existingPlayerIdx === -1) {
      room.players.push(player);
      if (!room.scores) room.scores = {};
      if (!room.scores[user.id]) {
        room.scores[user.id] = 0;
      }
      if (!room.branches) room.branches = {};
      if (!room.branches[user.id]) {
        room.branches[user.id] = 30;
      }
    } else {
      room.players[existingPlayerIdx] = { ...room.players[existingPlayerIdx], ...player };
    }

    await saveRoom(roomCode, room);

    if (pusher) {
      try {
        await pusher.trigger(`room-${roomCode}`, 'room-update', { timestamp: Date.now() });
      } catch (pusherError) {
        console.error("Pusher trigger failed:", pusherError);
      }
    }

    res.json(room);
  } catch (error) {
    console.error("Join room error:", error);
    res.status(500).json({ error: "Failed to join room", details: error instanceof Error ? error.message : String(error) });
  }
});

  app.post('/api/game/leave', async (req, res) => {
    const { roomCode, userId } = req.body;
    const room = await getRoom(roomCode);
    
    if (room) {
      const playerIdx = room.players.findIndex((p: any) => p.id === userId);
      if (playerIdx !== -1) {
        room.players.splice(playerIdx, 1);
        if (room.players.length === 0) {
          await deleteRoom(roomCode);
        } else {
          if (room.host === userId) {
            room.host = room.players[0].id;
            room.players[0].role = 'host';
          }
          await saveRoom(roomCode, room);
          if (pusher) {
            try {
              await pusher.trigger(`room-${roomCode}`, 'room-update', { timestamp: Date.now() });
            } catch (pusherError) {
              console.error("Pusher trigger failed:", pusherError);
            }
          }
        }
      }
    }
    res.json({ success: true });
  });

  app.post('/api/game/submit', async (req, res) => {
    const { roomCode, submission } = req.body;
    const room = await getRoom(roomCode);
    if (room) {
      // Prevent duplicate submissions from the same player
      if (!room.submissions) room.submissions = [];
      const existingIndex = room.submissions.findIndex((s: any) => s.playerId === submission.playerId);
      if (existingIndex > -1) {
        room.submissions[existingIndex] = submission;
      } else {
        room.submissions.push(submission);
      }
      
      await saveRoom(roomCode, room);
      
      if (pusher) {
        try {
          await pusher.trigger(`room-${roomCode}`, 'new-submission', { submissionId: submission.id, submission });
          await pusher.trigger(`room-${roomCode}`, 'room-update', { timestamp: Date.now() });
        } catch (pusherError) {
          console.error("Pusher trigger failed:", pusherError);
        }
      }
    }
    res.json({ success: true });
  });

  app.post('/api/game/use-hint', async (req, res) => {
    const { roomCode, playerId, cost } = req.body;
    const room = await getRoom(roomCode);
    if (room && room.branches) {
      const currentBranches = room.branches[playerId] ?? 30;
      const deduction = cost || 1;
      const newBranchCount = Math.max(0, currentBranches - deduction);
      room.branches[playerId] = newBranchCount;
      
      await saveRoom(roomCode, room);
      
      if (pusher) {
        try {
          await pusher.trigger(`room-${roomCode}`, 'branch-deduction', { playerId, newBranchCount });
          await pusher.trigger(`room-${roomCode}`, 'room-update', { timestamp: Date.now() });
        } catch (pusherError) {
          console.error("Pusher trigger failed:", pusherError);
        }
      }
    }
    res.json({ success: true });
  });

  app.post('/api/game/update-state', async (req, res) => {
  const { roomCode, newState } = req.body;
  const room = await getRoom(roomCode);
  if (room) {
    Object.assign(room, newState);
    await saveRoom(roomCode, room);
    if (pusher) {
      try {
        await pusher.trigger(`room-${roomCode}`, 'room-update', { timestamp: Date.now() });
      } catch (pusherError) {
        console.error("Pusher trigger failed:", pusherError);
      }
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
    const { createServer: createViteServer } = await import("vite");
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
