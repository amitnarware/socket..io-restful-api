// src/entities/User.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../database");

const User = sequelize.define("User", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});
sequelize.sync().then(() => {
    console.log('user table created successfully!');
 }).catch((error) => {
    console.error('Unable to create table : ', error);
 });
module.exports = User;


/*const { Entity, PrimaryGeneratedColumn, Column } = require("typeorm");

@Entity()
class User {
    @PrimaryGeneratedColumn()
    id;

    @Column()
    username;

    @Column()
    password;
}

module.exports = User; */
