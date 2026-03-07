import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const PORT = 3000;

  // Game state storage (in-memory for now)
  const rooms = new Map<string, any>();

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join-room", ({ roomCode, user }) => {
      socket.join(roomCode);
      
      if (!rooms.has(roomCode)) {
        rooms.set(roomCode, {
          code: roomCode,
          host: socket.id,
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
        id: socket.id,
        name: user.name,
        picture: user.picture,
        role: null
      };
      
      // Check if player already in room
      const existingPlayerIdx = room.players.findIndex((p: any) => p.id === socket.id);
      if (existingPlayerIdx === -1) {
        room.players.push(player);
        if (room.scores && !room.scores[socket.id]) {
          room.scores[socket.id] = 0;
        }
        if (room.branches && !room.branches[socket.id]) {
          room.branches[socket.id] = 30;
        }
      } else {
        room.players[existingPlayerIdx] = player;
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
      const room = rooms.get(roomCode);
      if (room && room.branches && room.branches[socket.id] > 0) {
        room.branches[socket.id] -= 1;
        io.to(roomCode).emit("room-update", room);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      // Handle player removal from rooms
      rooms.forEach((room, roomCode) => {
        const playerIdx = room.players.findIndex((p: any) => p.id === socket.id);
        if (playerIdx !== -1) {
          room.players.splice(playerIdx, 1);
          if (room.players.length === 0) {
            rooms.delete(roomCode);
          } else {
            if (room.host === socket.id) {
              room.host = room.players[0].id;
            }
            io.to(roomCode).emit("room-update", room);
          }
        }
      });
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
