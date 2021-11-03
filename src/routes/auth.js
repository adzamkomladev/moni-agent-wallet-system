import express from "express";

import { agentLogin } from "../services/auth";

function getAuthRoutes() {
  const router = express.Router();

  router.post("/login", login);

  return router;
}

async function login(req, res) {
  const body = req.body;

  try {
    const agent = await agentLogin(body);

    return res.status(200).json({
      id: agent.id,
      token: agent.token,
      name: agent.name,
      email: agent.email,
      createdAt: agent.createdAt,
      updatedAt: agent.updatedAt,
      wallets: agent.wallets,
    });
  } catch (error) {
    if (error.message === "Invalid credentials") {
      res.status(401).json({ message: error.message });
    }
    return res.status(500).json({ message: error.message });
  }
}

export { getAuthRoutes };
