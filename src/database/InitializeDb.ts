import { DataTypes, Sequelize } from "sequelize";

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "db.sqlite",
});

// Error: Type 'UserData' does not satisfy the constraint 'Model<any, any>'.
//   Type 'UserData' is missing the following properties from type 'Model<any, any>': _attributes, dataValues, _creationAttributes, isNewRecord, and 26 more

// Answer: Add the missing properties to the UserData model. Like this:
//
// import { INTEGER, JSON, Model, Sequelize } from "sequelize";
//

// Define models
const UserData = sequelize.define("UserData", {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
  },
  usage: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
  },
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

export async function updateUserData(userData: UserData) {
  console.log(userData);
  await UserData.upsert(userData);
}

export async function getUserData() {
  const userData = await UserData.findAll();

  console.log(userData);

  return userData;
}
