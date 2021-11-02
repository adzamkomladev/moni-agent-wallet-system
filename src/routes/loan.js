import express from "express";

import { repayLoanFromWallet } from "../services/loan";

function getLoanRoutes() {
  const router = express.Router();

  router.post("/:id/wallets/pay", repayLoan);

  return router;
}

async function repayLoan(req, res) {
  const body = req.body;
  const id = req.params.id;

  try {
    const walletWithdrawalData = {
      id,
      amount: body.amount,
      walletId: body.walletId,
    };

    const loanPayment = await repayLoanFromWallet(walletWithdrawalData);

    return res.json({
      amount: +loanPayment.amount,
      amountBefore: +loanPayment.amountBefore,
      amountAfter: +loanPayment.amountAfter,
      status: loanPayment.status,
      createdAt: loanPayment.createdAt,
      loan: {
        amount: +loanPayment.loan?.amount,
        amountLeft: +loanPayment.loan?.amountLeft,
        deadline: loanPayment.loan?.deadline,
        status: loanPayment.loan?.status,
      },
      walletTransaction: {
        wallet: {
          id: loanPayment.walletTransaction?.wallet?.id,
          name: loanPayment.walletTransaction?.wallet?.name,
          balance: +loanPayment.walletTransaction?.wallet?.balance,
        },
      },
    });
  } catch (error) {
    let response = res;

    if (
      error.message === "Loan not found" ||
      error.message === "Wallet not found" ||
      error.message === "Insufficient balance"
    ) {
      response = res.status(400);
    } else if (error.message === "Failed to pay loan from wallet") {
      response = res.status(500);
    } else {
      response = res.status(500);
    }

    return response.json({
      message: error.message,
    });
  }
}

export { getLoanRoutes };
