const EntitySchema = require("typeorm").EntitySchema;

module.exports = new EntitySchema({
  name: "Loan",
  tableName: "loans",
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
    deadline: {
      type: "date",
    },
    amount: {
      type: "decimal",
      precision: 18,
      scale: 4,
    },
    amountLeft: {
      type: "decimal",
      precision: 18,
      scale: 4,
    },
    status: {
      type: "varchar",
      length: "50",
      nullable: true,
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
  },
});
