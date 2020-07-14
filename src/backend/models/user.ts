import { Model, DataTypes } from "sequelize";
import { getSequelize } from "./helpers";
const sequelize = getSequelize();
export default class User extends Model {
  /**
   * Helper method for defining associations.
   * This method is not a part of Sequelize lifecycle.
   * The `models/index` file will call this method automatically.
   */
  static associate(_: any) {
    // define association here
  }
}
User.init(
  {
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    externalId: { type: DataTypes.STRING, allowNull: false },
    accessToken: { type: DataTypes.STRING, allowNull: false },
    refreshToken: { type: DataTypes.STRING, allowNull: false },
  },
  {
    sequelize,
    modelName: "User",
  }
);
