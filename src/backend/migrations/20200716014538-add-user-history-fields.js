"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    return queryInterface.sequelize.transaction(async (t) => {
      return await Promise.all([
        queryInterface.addColumn(
          "users",
          "lastHistoryId",
          {
            type: Sequelize.DataTypes.STRING,
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "users",
          "watchExpiration",
          {
            type: Sequelize.DataTypes.STRING,
          },
          { transaction: t }
        ),
      ]);
    });
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    return queryInterface.sequelize.transaction(async (t) => {
      return await Promise.all([
        queryInterface.removeColumn("users", "lastHistoryId", {
          transaction: t,
        }),
        queryInterface.removeColumn("users", "watchExpiration", {
          transaction: t,
        }),
      ]);
    });
  },
};
