import { Sequelize } from "sequelize";

export const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "db.sqlite",
});

export async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");

    await sequelize.sync();
    console.log("Database initialized");
  } catch (error) {
    console.error("Unable to initialize the database:", error);
  }
}
