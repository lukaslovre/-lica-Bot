import { sequelize } from "./InitializeDb.js";
import { DataTypes } from "sequelize";

export const Spending = sequelize.define("Spending", {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  amountDollars: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
      isFloat: true,
    },
  },
});

export async function insertSpending(userId: number, amountDollars: number) {
  await Spending.create({ userId, amountDollars });
}

export async function getSpendingForUser(userId: number) {
  const sequelizeResult = await Spending.findAll({
    where: {
      userId,
    },
  });

  return sequelizeResult.map((result) => result.get()) as {
    id: number;
    userId: number;
    amountDollars: number;
    createdAt: Date;
    updatedAt: Date;
  }[];
}
