import express from "express";

import { getAgentRoutes } from "./agent";
import { getLoanRoutes } from "./loan";
import { getWalletRoutes } from "./wallet";

function getRoutes() {
  const router = express.Router();
  router.use("/agents", getAgentRoutes());
  router.use("/wallets", getWalletRoutes());
  router.use("/loans", getLoanRoutes());
  return router;
}

export { getRoutes };
