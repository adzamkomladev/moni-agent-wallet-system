import express from "express";

import { getAgentRoutes } from "./agent";

function getRoutes() {
  const router = express.Router();
  router.use("/agents", getAgentRoutes());
  return router;
}

export { getRoutes };
