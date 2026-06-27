const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");
const User = require("./User");

const Service = sequelize.define(
  "Service",
  {
    serviceId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      field: "service_id",
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    serviceStatus: {
      type: DataTypes.ENUM("OPEN", "CLOSED", "PAUSED"),
      defaultValue: "CLOSED",
      allowNull: false,
      field: "service_status",
    },
    providerId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "provider_id",
      references: {
        model: "users",
        key: "user_id",
      },
    },
  },
  {
    tableName: "services",
    timestamps: true,
    underscored: true,
  },
);

// Define Relationships (Associations)
User.hasMany(Service, { foreignKey: "providerId", as: "services" });
Service.belongsTo(User, { foreignKey: "providerId", as: "provider" });

module.exports = Service;
