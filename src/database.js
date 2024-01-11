// src/database.js
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("user", "root", "", {
    host: "localhost",
    dialect: "mysql",
    logging: false, // set to true if you want to see SQL queries in the console
});

module.exports = { sequelize };
