import { createConnection } from "typeorm";

async function receiveLoan(receivePayment) {
  let connection;

  try {
    connection = await createConnection();

    let { id, amount, reason, deadline, walletId } = receivePayment;

    const agentRepository = connection.getRepository("Agent");
    const agent = await agentRepository.findOne(id, { relations: ["wallets"] });

    if (!agent) {
      throw new Error("Agent not found");
    }

    const walletRepository = connection.getRepository("Wallet");
    const wallet = await walletRepository.findOne(walletId);

    if (!wallet) {
      throw new Error("Wallet not found");
    }

    amount = +amount;

    const loanData = {
      amount,
      amountLeft: amount,
      status: "COLLECTED",
      reason,
      deadline,
      agent,
    };

    const walletData = {
      wallet,
      amount,
      balanceBefore: wallet.balance,
      balanceAfter: +wallet.balance + amount,
      type: "Loan Deposit",
      description: "Receive loan deposit",
      status: "COMPLETED",
    };

    return await connection.transaction(async (transactionalEntityManager) => {
      const results = await transactionalEntityManager.update(
        "Wallet",
        wallet.id,
        {
          balance: +wallet.balance + amount,
        }
      );

      if (results.affected === 0) {
        throw new Error("Failed to depositing loan into wallet");
      }

      await transactionalEntityManager.save("WalletTransaction", walletData);

      return await transactionalEntityManager.save("Loan", loanData);
    });
  } catch (error) {
    console.log("Error depositing loan", error);
    throw error;
  } finally {
    connection?.close();
  }
}

async function repayLoanFromWallet(repayLoadData) {
  let connection;

  try {
    connection = await createConnection();

    let { id, amount, walletId } = repayLoadData;

    const loanRepository = connection.getRepository("Loan");
    const loan = await loanRepository.findOne(id, { relations: ["agent"] });

    if (!loan) {
      throw new Error("Loan not found");
    }

    const walletRepository = connection.getRepository("Wallet");
    const wallet = await walletRepository.findOne(walletId);

    if (!wallet) {
      throw new Error("Wallet not found");
    }

    amount = +amount;

    if (amount > +wallet.balance) {
      throw new Error("Insufficient balance");
    }

    let loanPaymentData = {
      amount,
      amountBefore: +loan.amountLeft,
      amountAfter: +loan.amountLeft - amount,
      status: "PAID",
      loan,
    };

    const walletTransactionData = {
      wallet,
      amount,
      balanceBefore: wallet.balance,
      balanceAfter: +wallet.balance - amount,
      type: "Loan Repayment",
      description: "Make loan payment from wallet",
      status: "COMPLETED",
    };

    return await connection.transaction(async (transactionalEntityManager) => {
      let results = await transactionalEntityManager.update(
        "Wallet",
        wallet.id,
        {
          balance: +wallet.balance - amount,
        }
      );

      if (results.affected === 0) {
        throw new Error("Failed to pay loan from wallet");
      }

      const amountLeft = +loan.amountLeft - amount;

      results = await transactionalEntityManager.update("Loan", loan.id, {
        amountLeft,
        status: amountLeft == 0.0 ? "PAID" : "PAYING",
      });

      if (results.affected === 0) {
        throw new Error("Failed to pay loan from wallet");
      }

      const walletTransaction = await transactionalEntityManager.save(
        "WalletTransaction",
        walletTransactionData
      );

      const loanPayment = await transactionalEntityManager.save("LoanPayment", {
        ...loanPaymentData,
        walletTransaction,
      });

      return await transactionalEntityManager.findOne(
        "LoanPayment",
        loanPayment.id,
        {
          relations: ["loan", "walletTransaction", "walletTransaction.wallet"],
        }
      );
    });
  } catch (error) {
    console.log("Error making loan payment from wallet", error);
    throw error;
  } finally {
    connection?.close();
  }
}

export { receiveLoan, repayLoanFromWallet };
