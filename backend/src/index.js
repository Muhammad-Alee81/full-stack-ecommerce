import dotenv from "dotenv";
dotenv.config();
import app from "./app.js";
import connect_DB from "./config/database.connection.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connect_DB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

startServer();
