const fs = require("fs");
const path = require("path");
const { pool } = require("./pool");
async function migrate() {
  const sql = fs.readFileSync(path.join(__dirname, "migrations", "001_init.sql"), "utf8");
  await pool.query(sql);
  console.log("User migrations applied");
  await pool.end();
}
migrate().catch((e) => { console.error(e); process.exit(1); });
