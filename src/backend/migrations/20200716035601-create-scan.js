"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("scans", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      emailId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      scanType: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      version: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      result: {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("scans");
  },
};
