require("dotenv").config();
const app = require("./src/app");
const sequelize = require("./config/database");

const PORT = process.env.PORT || 5000;

sequelize
  .sync({ force: false })
  .then(() => {
    console.log(`Database connected...`);
    app.listen(PORT, () => {
      console.log(`Listening to port: ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Unable to connect to the PostgreSQL database:", error);
  });
