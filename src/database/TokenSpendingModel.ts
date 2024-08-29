import { sequelize } from "./InitializeDb.js";
import { DataTypes } from "sequelize";

export const TokenSpending = sequelize.define("TokenSpending", {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  input: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
      isInt: true,
    },
  },
  output: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
      isInt: true,
    },
  },
});

export async function insertTokenSpending(userId: number, input: number, output: number) {
  await TokenSpending.create({ userId, input, output });
}

export async function getTokenSpendingForUser(userId: number) {
  const sequelizeResult = await TokenSpending.findAll({
    where: {
      userId,
    },
  });

  return sequelizeResult.map((result) => result.get()) as {
    id: number;
    userId: number;
    input: number;
    output: number;
    createdAt: Date;
    updatedAt: Date;
  }[];
  // return sequelizeResult
}
