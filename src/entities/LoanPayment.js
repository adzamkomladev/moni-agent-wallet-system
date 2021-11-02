const EntitySchema = require("typeorm").EntitySchema;

module.exports = new EntitySchema({
  name: "LoanPayment",
  tableName: "loan_payments",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    amount: {
      type: "decimal",
      precision: 18,
      scale: 4,
    },
    amountBefore: {
      type: "decimal",
      precision: 18,
      scale: 4,
    },
    amountAfter: {
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
    loan: {
      type: "many-to-one",
      target: "Loan",
      joinColumn: true,
    },
    walletTransaction: {
      target: "WalletTransaction",
      type: "one-to-one",
      joinColumn: true,
    },
  },
});
