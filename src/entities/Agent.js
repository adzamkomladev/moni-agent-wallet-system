const EntitySchema = require("typeorm").EntitySchema;

module.exports = new EntitySchema({
  name: "Agent",
  tableName: "agents",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    name: {
      type: "varchar",
      length: "255",
    },
    email: {
      type: "varchar",
      length: "100",
    },
    password: {
      type: "text",
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
    wallets: {
      target: "Wallet",
      type: "one-to-many",
      inverseSide: "agent",
    },
  },
});
