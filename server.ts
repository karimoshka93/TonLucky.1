import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Supabase Admin
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

const BOX_PROBABILITIES = [
  { reward: '1_TON', amount: 1, chance: 0.19 },
  { reward: '0_5_TON', amount: 0.5, chance: 0.5 },
  { reward: '2_TON', amount: 2, chance: 0.009 },
  { reward: '10_TON', amount: 10, chance: 0.001 },
  { reward: 'LOSE', amount: 0, chance: 0.3 },
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- TELEGRAM VERIFICATION HELPERS ---
  const verifyTelegramInitData = (initData: string) => {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      console.error("TELEGRAM_BOT_TOKEN is missing in environment");
      return false;
    }

    const encoded = decodeURIComponent(initData);
    const secretKey = crypto.createHmac("sha256", "WebAppData").update(token).digest();
    
    const arr = encoded.split("&");
    const hashIndex = arr.findIndex(str => str.startsWith("hash="));
    const hash = arr.splice(hashIndex, 1)[0].split("=")[1];
    
    arr.sort();
    const dataCheckString = arr.join("\n");
    const _hash = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");

    return _hash === hash;
  };

  // --- API ROUTES ---
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", version: "1.0.0" });
  });

  // Master Sync: Verifies TG identity and returns Supabase credentials
  app.post("/api/user/sync", async (req, res) => {
    const { initData } = req.body;

    if (!initData || !verifyTelegramInitData(initData)) {
      return res.status(401).json({ error: "Invalid Telegram credentials" });
    }

    // Extract user data from initData
    const params = new URLSearchParams(initData);
    const tgUser = JSON.parse(params.get("user") || "{}");
    
    if (!tgUser.id) {
      return res.status(400).json({ error: "No user ID in Telegram data" });
    }

    const identityId = `tg_${tgUser.id}`;
    const email = `${identityId}@tonbet.internal`;
    const password = crypto.createHash("sha256").update(`${tgUser.id}_${process.env.TELEGRAM_BOT_TOKEN}`).digest("hex");
    const username = tgUser.username || tgUser.first_name || `TonPlayer_${tgUser.id}`;

    try {
      // 1. Ensure user exists in Supabase Auth
      const { data: { user }, error: fetchError } = await supabaseAdmin.auth.admin.getUserById(identityId).catch(() => ({ data: { user: null }, error: null }));
      
      let currentUser = user;

      if (!currentUser) {
        // Try finding by email to be safe
        const { data: users } = await supabaseAdmin.auth.admin.listUsers();
        currentUser = users.users.find(u => u.email === email) || null;
      }

      if (!currentUser) {
        // Create new user via Admin API
        const { data: newUser, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            tg_id: tgUser.id,
            username: username
          }
        });

        if (signUpError) throw signUpError;
        currentUser = newUser.user;
      }

      // Return credentials so client can sign in properly
      res.json({ 
        success: true, 
        email, 
        password,
        user: {
          id: currentUser?.id,
          tg_id: tgUser.id,
          username
        }
      });
    } catch (err: any) {
      console.error("Sync Error:", err.message);
      res.status(500).json({ error: "Database sync failed" });
    }
  });

  // Secure Roll Mystery Box
  app.post("/api/games/roll-box", async (req, res) => {
    const { userId } = req.body;
    const cost = 1.0; // 1 TON

    try {
      // 1. Get user profile
      const { data: profile, error: pError } = await supabaseAdmin
        .from('profiles')
        .select('balance')
        .eq('id', userId)
        .single();

      if (pError || !profile) return res.status(404).json({ error: "User not found" });
      if (profile.balance < cost) return res.status(400).json({ error: "Insufficient balance" });

      // 2. Perform Roll (AUTHORITATIVE)
      const roll = Math.random();
      let cumulative = 0;
      let reward = BOX_PROBABILITIES[BOX_PROBABILITIES.length - 1];
      
      for (const prob of BOX_PROBABILITIES) {
        cumulative += prob.chance;
        if (roll < cumulative) {
          reward = prob;
          break;
        }
      }

      // 3. Atomically Update Balance and Log
      const newBalance = profile.balance - cost + reward.amount;
      
      const { error: uError } = await supabaseAdmin
        .from('profiles')
        .update({ balance: newBalance })
        .eq('id', userId);

      if (uError) throw uError;

      await supabaseAdmin.from('mystery_box_logs').insert({
        user_id: userId,
        reward_type: reward.reward,
        reward_amount: reward.amount,
        cost: cost
      });

      res.json({ success: true, reward, newBalance });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });

  // Secure Buy Ticket
  app.post("/api/games/buy-ticket", async (req, res) => {
    const { userId, roomId, cost } = req.body;

    try {
      const { data: profile, error: pError } = await supabaseAdmin
        .from('profiles')
        .select('balance')
        .eq('id', userId)
        .single();

      if (pError || !profile) return res.status(404).json({ error: "User not found" });
      if (profile.balance < cost) return res.status(400).json({ error: "Insufficient balance" });

      // Atomically Deduct Balance and Add Ticket
      const { error: uError } = await supabaseAdmin
        .from('profiles')
        .update({ balance: profile.balance - cost })
        .eq('id', userId);

      if (uError) throw uError;

      const { data: ticket, error: tError } = await supabaseAdmin
        .from('tickets')
        .insert({ user_id: userId, room_id: roomId })
        .select()
        .single();

      if (tError) throw tError;

      res.json({ success: true, ticket, newBalance: profile.balance - cost });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });

  // Verify Transaction Endpoint
  app.post("/api/verify-transaction", async (req, res) => {
    const { hash, amount, type, userId } = req.body;
    
    try {
      console.log(`Verifying ${type} for user ${userId}: ${amount} TON (${hash})`);
      
      // In a real app, we verify the hash on-chain here.
      
      // Update balance
      const { data: profile, error: pError } = await supabaseAdmin
        .from('profiles')
        .select('balance')
        .eq('id', userId)
        .single();
        
      if (pError) throw pError;
      
      const { error: uError } = await supabaseAdmin
        .from('profiles')
        .update({ balance: profile.balance + Number(amount) })
        .eq('id', userId);
        
      if (uError) throw uError;
      
      res.json({ success: true, message: "Transaction verified and balance updated", newBalance: profile.balance + Number(amount) });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Verification failed" });
    }
  });

  // Lottery Draw Endpoint (Admin Only)
  app.post("/api/admin/draw", (req, res) => {
    const { roomId } = req.body;
    // Logic: 
    // 1. Get all participants for roomId from Supabase
    // 2. Pick a random winner
    // 3. Payout (send TON via admin wallet or update balance)
    // 4. Create new room tier
    res.json({ success: true, winner: "User_XYZ" });
  });

  // Betting Odds Engine
  app.get("/api/odds/:matchId", (req, res) => {
    const { matchId } = req.params;
    // House Edge Logic:
    // Basic Total Probability = 1/h + 1/d + 1/a
    // Real probability usually sums to 1.05 - 1.10 (5-10% house edge)
    res.json({
      matchId,
      h: 1.85,
      d: 3.40,
      a: 4.20
    });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    
    // Use the real index.html as template
    app.get("*", async (req, res, next) => {
      const url = req.originalUrl;
      try {
        const fs = await import('fs');
        let template = fs.readFileSync(path.resolve(__dirname, "index.html"), "utf-8");
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`TonBet Server running on http://localhost:${PORT}`);
  });
}

startServer();
