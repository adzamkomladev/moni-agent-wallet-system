import {
  createConnection,
  LessThanOrEqual,
  MoreThanOrEqual,
  Raw,
} from "typeorm";

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

async function withdrawFromWallet(walletWithdrawalData) {
  let connection;

  try {
    connection = await createConnection();

    let { id, amount, agentId } = walletWithdrawalData;

    const walletRepository = connection.getRepository("Wallet");
    const wallet = await walletRepository.findOne({
      where: { id, agent: agentId },
    });

    if (!wallet) {
      throw new Error("Wallet not found");
    }

    amount = +amount;

    if (amount > parseFloat(wallet.balance)) {
      throw new Error("Insufficient balance");
    }

    const walletTransactionData = {
      wallet,
      amount,
      balanceBefore: wallet.balance,
      balanceAfter: parseFloat(wallet.balance) - amount,
      type: "Debit",
      description: "Withdraw from wallet",
      status: "COMPLETED",
    };

    return await connection.transaction(async (transactionalEntityManager) => {
      const results = await transactionalEntityManager.update(
        "Wallet",
        wallet.id,
        {
          balance: walletTransactionData.balanceAfter,
        }
      );

      if (results.affected === 0) {
        throw new Error("Failed to top up");
      }

      return await transactionalEntityManager.save(
        "WalletTransaction",
        walletTransactionData
      );
    });
  } catch (error) {
    console.log("Error topping up", error);
    throw error;
  } finally {
    connection?.close();
  }
}

async function filterAndPaginateWalletTransactions(filterAndPaginationData) {
  let connection;

  try {
    connection = await createConnection();

    let { id, start, end, type, size, page = 1 } = filterAndPaginationData;

    const limit = size ? +size : 3;
    const offset = page ? (+page - 1) * limit : 0;

    let filters = {};

    if (id) {
      filters = {
        wallet: {
          agent: id,
        },
      };
    }

    if (start || end) {
      filters = {
        ...filters,
        createdAt: Raw((alias) => filterQuery(alias, start, end), {
          start,
          end,
        }),
      };
    }

    if (type) {
      filters = {
        ...filters,
        type,
      };
    }

    const walletTransactionRepository =
      connection.getRepository("WalletTransaction");
    const [walletTransactions, total] =
      await walletTransactionRepository.findAndCount({
        relations: ["wallet", "wallet.agent"],
        where: filters,
        skip: offset,
        take: limit,
      });

    return {
      walletTransactions,
      total,
      totalPerPage: limit,
      currentPage: total == 0 ? 0 : +page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.log("Error topping up", error);
    throw error;
  } finally {
    connection?.close();
  }
}

const filterQuery = (alias, start, end) => {
  let query = "";

  if (start) {
    query += `${alias} >= :start`;
  }

  if (end) {
    if (start) {
      query += " AND ";
    }

    query += `${alias} <= :end`;
  }

  return query;
};

export { topUpWallet, withdrawFromWallet, filterAndPaginateWalletTransactions };
