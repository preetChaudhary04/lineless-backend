const { DataTypes } = require("sequelize");
const sequelize = require("../../database/db");
const User = require("./User");
const Service = require("./Services");

const QueueTicket = sequelize.define(
  "QueueTicket",
  {
    ticketId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      field: "ticket_id",
    },
    ticketNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "ticket_number",
    },
    status: {
      type: DataTypes.ENUM("WAITING", "SERVING", "COMPLETED", "SKIPPED"),
      defaultValue: "WAITING",
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "user_id",
      references: {
        model: "users",
        key: "user_id",
      },
    },
    serviceId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "service_id",
      references: {
        model: "services",
        key: "service_id",
      },
    },
  },
  {
    tableName: "queue_tickets",
    timestamps: true,
    underscored: true,
  },
);

User.hasMany(QueueTicket, { foreignKey: "userId", as: "tickets" });
QueueTicket.belongsTo(User, { foreignKey: "userId", as: "student" });

Service.hasMany(QueueTicket, { foreignKey: "serviceId", as: "tickets" });
QueueTicket.belongsTo(Service, { foreignKey: "serviceId", as: "service" });

module.exports = QueueTicket;
