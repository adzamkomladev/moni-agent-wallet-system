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
    wallet_id: {
      type: "varchar",
      length: "255",
    },
    wallet_balance: {
      type: "decimal",
      precision: 18,
      scale: 4,
    },
    created_at: {
      type: "timestamp",
      createDate: true,
    },
    updated_at: {
      type: "timestamp",
      updateDate: true,
    },
  },
});
