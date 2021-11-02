import express from "express";

import { createAgent } from "../services/agent";

function getAgentRoutes() {
  const router = express.Router();

  router.post("/", create);

  return router;
}

async function create(req, res) {
  const body = req.body;
  
  try {
    const agent = await createAgent(body);

    return res.status(201).json({
      id: agent.id,
      name: agent.name,
      email: agent.email,
      createdAt: agent.createdAt,
      updatedAt: agent.updatedAt,
      wallets: agent.wallets
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export { getAgentRoutes };
