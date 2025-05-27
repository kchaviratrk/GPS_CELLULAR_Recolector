require("dotenv").config();
const sql = require("mssql");

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: process.env.DB_ENCRYPT === "true",
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === "true",
  },
};

const poolPromise = sql
  .connect(config)
  .then((pool) => {
    console.log("Connected to Azure SQL");
    return pool;
  })
  .catch((err) => {
    console.error("Database Connection Failed!", err);
    throw err;
  });

module.exports = {
  sql,
  poolPromise,
};
