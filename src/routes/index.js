import express from "express";

import { verifyToken } from "../middlewares/auth";

import { getAgentRoutes } from "./agent";
import { getLoanRoutes } from "./loan";
import { getWalletRoutes } from "./wallet";

function getRoutes() {
  const router = express.Router();
  router.use("/agents", getAgentRoutes());
  router.use("/wallets", verifyToken, getWalletRoutes());
  router.use("/loans", verifyToken, getLoanRoutes());
  return router;
}

export { getRoutes };
