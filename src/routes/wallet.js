import express from "express";
import { repayLoanFromWallet } from "../services/loan";

import { topUpWallet, withdrawFromWallet } from "../services/wallet";

function getWalletRoutes() {
  const router = express.Router();

  router.post("/:id/top-up", topUp);
  router.post("/:id/withdraw", withdraw);

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
    let response = res;

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

async function withdraw(req, res) {
  const body = req.body;
  const id = req.params.id;

  try {
    const walletWithdrawalData = {
      id,
      amount: body.amount,
      agentId: body.agentId,
    };

    const walletTransaction = await withdrawFromWallet(walletWithdrawalData);

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
    let response = res;

    if (
      error.message === "Wallet not found" ||
      error.message === "Insufficient balance"
    ) {
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
