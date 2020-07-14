import { Sequelize } from "sequelize";

// Yes, this is cheating - tabling this for now as it's taking a while to sort out
const config = require("../config/config.js");
const env = process.env.NODE_ENV || "development";

const envConfig = config[env];
export function getSequelize(): Sequelize {
  if (envConfig.use_env_variable) {
    return new Sequelize(process.env[envConfig.use_env_variable], envConfig);
  } else {
    return new Sequelize(
      envConfig.database,
      envConfig.username,
      envConfig.password,
      envConfig
    );
  }
}
