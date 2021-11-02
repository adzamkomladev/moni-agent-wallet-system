import { createConnection } from "typeorm";

async function topUpWallet(walletTopUpData) {
  let connection;

  try {
    connection = await createConnection();

    let { id, amount } = walletTopUpData;

    const walletRepository = connection.getRepository("Wallet");
    const wallet = await walletRepository.findOne(id);

    if (!wallet) {
      throw new Error("Wallet not found");
    }

    amount = parseFloat(amount);

    const walletData = {
      wallet,
      amount,
      balanceBefore: wallet.balance,
      balanceAfter: parseFloat(wallet.balance) + amount,
      type: "Credit",
      description: "Top up wallet",
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
        throw new Error("Failed to top up");
      }

      return await transactionalEntityManager.save(
        "WalletTransaction",
        walletData
      );
    });
  } catch (error) {
    console.log("Error topping up", error);
    throw error;
  } finally {
    connection?.close();
  }
}

export { topUpWallet };
