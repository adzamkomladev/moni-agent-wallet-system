const EntitySchema = require("typeorm").EntitySchema;

module.exports = new EntitySchema({
  name: "WalletTransaction",
  tableName: "wallet_transactions",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    description: {
      type: "text",
      nullable: true,
    },
    type: {
      type: "varchar",
    },
    amount: {
      type: "decimal",
      precision: 18,
      scale: 4,
    },
    balanceBefore: {
      type: "decimal",
      precision: 18,
      scale: 4,
    },
    balanceAfter: {
        type: "decimal",
        precision: 18,
        scale: 4,
      },
    status: {
      type: "varchar",
      length: 50,
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
    wallet: {
      target: "Wallet",
      type: "many-to-one",
      joinColumn: true,
    },
  },
});
