import { Model, DataTypes } from "sequelize";
import { getSequelize } from "./helpers";
import User from "./user";
const sequelize = getSequelize();
class Email extends Model {
  id!: number;
  userId!: number;
  sentAt: Date;
  externalId!: string;
  /**
   * Helper method for defining associations.
   * This method is not a part of Sequelize lifecycle.
   * The `models/index` file will call this method automatically.
   */
  static associate() {
    // define association here
  }

  static async unscannedForUser(userId: number, scanType: string) {
    // Doing this as a raw query to avoid spending time diving deep on sequelize associations
    return await sequelize.query(
      `SELECT emails.* from emails full outer join scans on scans."emailId" = emails.id and scans."scanType" = '${scanType}' where emails."userId" = ${userId} and scans.id is null`,
      { mapToModel: true, model: Email }
    );
  }
}
Email.init(
  {
    sentAt: DataTypes.DATE,
    externalId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize,
    modelName: "email",
  }
);

Email.belongsTo(User);

export default Email;
