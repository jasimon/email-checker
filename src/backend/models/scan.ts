import { Model, DataTypes } from "sequelize";
import { getSequelize } from "./helpers";
import Email from "./email";

const sequelize = getSequelize();
class Scan extends Model {
  id!: number;
  emailId!: number;
  scanType!: string;
  version!: number;
  result!: number;
  /**
   * Helper method for defining associations.
   * This method is not a part of Sequelize lifecycle.
   * The `models/index` file will call this method automatically.
   */
  static associate() {
    // define association here
  }
}
//
Scan.init(
  {
    scanType: { type: DataTypes.STRING, allowNull: false },
    version: { type: DataTypes.INTEGER, allowNull: false },
    result: { type: DataTypes.DECIMAL, allowNull: false },
  },
  {
    sequelize,
    modelName: "scan",
  }
);

Scan.belongsTo(Email);

export default Scan;
