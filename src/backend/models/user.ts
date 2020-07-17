import { Model, DataTypes } from "sequelize";
import { getSequelize } from "./helpers";
const sequelize = getSequelize();
export default class User extends Model {
  id!: number;
  firstName: string;
  lastName: string;
  email!: string;
  externalId!: string;
  accessToken!: string;
  refreshToken!: string;
  lastHistoryId: string;
  watchExpiration: string;
  accessTokenExpiry: Date;

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
    lastHistoryId: DataTypes.STRING,
    watchExpiration: DataTypes.STRING,
    accessTokenExpiry: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: "user",
  }
);
