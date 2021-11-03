import express from "express";
import { body, param, query, validationResult } from "express-validator";

import { receiveLoan } from "../services/loan";
import { filterAndPaginateWalletTransactions } from "../services/wallet";

function getAgentRoutes() {
  const router = express.Router();

  router.post(
    "/:id/loans/receive",
    [
      body("amount").exists().isNumeric(),
      body("reason").exists(),
      body("deadline").exists().isDate(),
      body("walletId").exists().isNumeric(),
      param("id").exists().isNumeric(),
    ],
    getLoan
  );
  router.get(
    "/:id/wallet-transactions",
    [
      param("id").exists().isNumeric(),
      query("page").optional().isInt(),
      query("size").optional().isInt(),
      query("type")
        .optional()
        .isIn(["Credit", "Debit", "Loan Repayment", "Loan Deposit"]),
      query("start").optional().isDate(),
      query("end").optional().isDate(),
    ],
    findAllWalletTransactions
  );

  return router;
}

async function getLoan(req, res) {
  const body = req.body;
  const id = req.params.id;

  try {
    const errors = validationResult(req); // Finds the validation errors in this request and wraps them in an object with handy functions

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

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

async function findAllWalletTransactions(req, res) {
  const filterAndPaginationData = {
    id: req.params.id,
    page: req.query.page,
    size: req.query.size,
    start: req.query.start,
    end: req.query.end,
    type: req.query.type,
  };

  try {
    const errors = validationResult(req); // Finds the validation errors in this request and wraps them in an object with handy functions

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const paginatedData = await filterAndPaginateWalletTransactions(
      filterAndPaginationData
    );

    return res.json(paginatedData);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
}

export { getAgentRoutes };
