import express from "express";

import { getAgentRoutes } from "./agent";
import { getWalletRoutes } from "./wallet";

function getRoutes() {
  const router = express.Router();
  router.use("/agents", getAgentRoutes());
  router.use("/wallets", getWalletRoutes());
  return router;
}

export { getRoutes };
