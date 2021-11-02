const EntitySchema = require("typeorm").EntitySchema;

module.exports = new EntitySchema({
  name: "Wallet",
  tableName: "wallets",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    walletNumber: {
      type: "text",
    },
    balance: {
      type: "decimal",
      precision: 18,
      scale: 4,
    },
    currency: {
      type: "varchar",
      length: 20,
    },
    createdAt: {
      type: "timestamp",
      createDate: true,
    },
    updatedAt: {
      type: "timestamp",
      updateDate: true,
    },
  },
  relations: {
    agent: {
      target: "Agent",
      type: "many-to-one",
      joinColumn: true,
    },
    walletTransactions: {
      target: "WalletTransaction",
      type: "one-to-many",
      inverseSide: "wallet",
    },
  },
});
