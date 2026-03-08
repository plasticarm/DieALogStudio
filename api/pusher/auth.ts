import Pusher from "pusher";
import type { IncomingMessage, ServerResponse } from 'http';

// Extend the basic types to include 'body' and 'status/json' which Vercel adds
interface VercelRequest extends IncomingMessage {
  body: any;
  query: { [key: string]: string | string[] };
}

interface VercelResponse extends ServerResponse {
  send: (body: any) => VercelResponse;
  json: (jsonBody: any) => VercelResponse;
  status: (statusCode: number) => VercelResponse;
}

// Your existing Pusher init and handler code...

// Initialize Pusher with Server-Side variables (No VITE_ prefix)
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_APP_KEY!,
  secret: process.env.PUSHER_APP_SECRET!,
  cluster: process.env.PUSHER_APP_CLUSTER!,
  useTLS: true,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Get the data Pusher sends automatically
  const socketId = req.body.socket_id;
  const channel = req.body.channel_name;

  // 2. Extract user info from your game logic 
  // (In a real app, you'd get this from a session or cookie)
  const user_id = req.body.user_id || `user_${Math.random().toString(36).slice(2, 7)}`;
  
  const presenceData = {
    user_id: user_id,
    user_info: {
      name: req.body.user_name || "Anonymous Player",
    },
  };

  try {
    // 3. Generate the authorized token
    const authResponse = pusher.authenticate(socketId, channel, presenceData);
    res.status(200).send(authResponse);
  } catch (error) {
    console.error("Pusher Auth Error:", error);
    res.status(403).send("Forbidden");
  }
}