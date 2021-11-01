import express from "express";

import { createAgent } from "../services/agent";

function getAgentRoutes() {
  const router = express.Router();

  router.post("/", create);
  
  return router;
}

async function create(req, res) {
  const body = req.body;
  const agent = await createAgent(body);
  return res.status(201).json(agent);
}

export { getAgentRoutes };
