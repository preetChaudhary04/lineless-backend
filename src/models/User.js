const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");

const User = sequelize.define(
  "User",
  {
    userId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      field: "user_id",
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "full_name",
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      field: "phone_number",
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "password_hash",
    },
    role: {
      type: DataTypes.ENUM("CUSTOMER", "PROVIDER", "ADMIN"),
      allowNull: false,
      defaultValue: "CUSTOMER",
    },
    accountStatus: {
      type: DataTypes.ENUM("ACTIVE", "SUSPENDED"),
      allowNull: false,
      defaultValue: "ACTIVE",
      field: "account_status",
    },
  },
  {
    tableName: "users",
    timestamps: true,
    underscored: true,
  },
);

module.exports = User;
