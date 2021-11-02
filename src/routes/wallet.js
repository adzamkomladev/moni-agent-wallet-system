import express from "express";

import { topUpWallet } from "../services/wallet";

function getWalletRoutes() {
  const router = express.Router();

  router.post("/:id/top-up", topUp);

  return router;
}

async function topUp(req, res) {
  const body = req.body;
  const id = req.params.id;

  try {
    const walletTopUpData = {
      id,
      amount: body.amount,
    };

    const walletTransaction = await topUpWallet(walletTopUpData);

    return res.json({
      amount: walletTransaction.amount,
      balanceBefore: parseFloat(walletTransaction.balanceBefore),
      balanceAfter: walletTransaction.balanceAfter,
      type: walletTransaction.type,
      description: walletTransaction.description,
      status: walletTransaction.status,
      createdAt: walletTransaction.createdAt,
      wallet: {
        currency: walletTransaction.wallet.currency,
        walletNumber: walletTransaction.wallet.walletNumber,
      },
    });
  } catch (error) {
    const response = res;

    if (error.message === "Wallet not found") {
      response = res.status(400);
    } else if (error.message === "Failed to top up") {
      response = res.status(500);
    } else {
      response = res.status(500);
    }

    return response.json({
      message: error.message,
    });
  }
}

export { getWalletRoutes };
