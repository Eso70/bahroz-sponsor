function loadEnv() {
  try {
    require("dotenv").config();
  } catch (_e) {
    // dotenv not installed - environment variables must be set manually
  }
}

function getDbConfig() {
  const dbHost = process.env.DB_HOST || "localhost";
  const dbPort = parseInt(process.env.DB_PORT || "5432", 10);
  const dbName = process.env.DB_NAME || "bahroz";
  const dbUser = process.env.DB_USER || "postgres";
  const dbPassword = process.env.DB_PASSWORD;

  if (!dbPassword || dbPassword.trim() === "") {
    console.error("❌ Error: DB_PASSWORD environment variable is required!");
    console.error("💡 Please create a .env file with your database credentials.");
    console.error("💡 You can copy env.md to .env and update the values.");
    console.error("");
    console.error("Required variables:");
    console.error("  DB_HOST=localhost");
    console.error("  DB_PORT=5432");
    console.error("  DB_NAME=bahroz");
    console.error("  DB_USER=postgres");
    console.error("  DB_PASSWORD=your_password");
    process.exit(1);
  }

  return {
    host: dbHost,
    port: dbPort,
    database: dbName,
    user: dbUser,
    password: dbPassword,
  };
}

module.exports = { loadEnv, getDbConfig };
