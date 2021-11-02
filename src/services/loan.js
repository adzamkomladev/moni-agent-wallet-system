import { createConnection } from "typeorm";

async function receiveLoan(receiveLoanData) {
  let connection;

  try {
    connection = await createConnection();

    let { id, amount, reason, deadline, walletId } = receiveLoanData;

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

    amount = parseFloat(amount);

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
      balanceAfter: parseFloat(wallet.balance) + amount,
      type: "Loan Deposit",
      description: "Receive loan deposit",
      status: "COMPLETED",
    };

    return await connection.transaction(async (transactionalEntityManager) => {
      const results = await transactionalEntityManager.update(
        "Wallet",
        wallet.id,
        {
          balance: parseFloat(wallet.balance) + amount,
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

export { receiveLoan };
