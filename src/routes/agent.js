import express from "express";

import { createAgent } from "../services/agent";
import { receiveLoan } from "../services/loan";

function getAgentRoutes() {
  const router = express.Router();

  router.post("/", create);
  router.post("/:id/loans/receive", getLoan);

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
      wallets: agent.wallets,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function getLoan(req, res) {
  const body = req.body;
  const id = req.params.id;

  try {
    const receiveLoanData = {
      id,
      amount: body.amount,
      reason: body.reason,
      deadline: body.deadline,
      walletId: body.walletId,
    };

    const loan = await receiveLoan(receiveLoanData);
    const wallet = loan.agent?.wallets?.find(
      (w) => w.id == receiveLoanData.walletId
    );

    return res.status(200).json({
      id: loan.id,
      description: loan.description,
      amount: loan.amount,
      deadline: loan.deadline,
      amountLeft: loan.amountLeft,
      createdAt: loan.createdAt,
      status: loan.status,
      agent: {
        id: loan.agent.id,
        name: loan.agent.name,
        wallet: {
          balance: wallet?.balance,
          currency: wallet?.currency,
          balanceBefore: wallet?.balanceBefore,
          balanceAfter: wallet?.balanceAfter,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export { getAgentRoutes };
