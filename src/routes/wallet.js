import express from "express";
import { body, param, validationResult } from "express-validator";

import { topUpWallet, withdrawFromWallet } from "../services/wallet";

function getWalletRoutes() {
  const router = express.Router();

  router.post(
    "/:id/top-up",
    [param("id").exists().isNumeric(), body("amount").exists().isNumeric()],
    topUp
  );
  router.post(
    "/:id/withdraw",
    [
      param("id").exists().isNumeric(),
      body("amount").exists().isNumeric(),
      body("agentId").exists().isNumeric(),
    ],
    withdraw
  );

  return router;
}

async function topUp(req, res) {
  const body = req.body;
  const id = req.params.id;

  try {
    const errors = validationResult(req); // Finds the validation errors in this request and wraps them in an object with handy functions

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

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
    const errors = validationResult(req); // Finds the validation errors in this request and wraps them in an object with handy functions

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

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
