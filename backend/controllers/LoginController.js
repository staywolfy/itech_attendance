import { db } from "../utils/utils.js";

export const login = async (req, res) => {
  const { username, password } = req.body;
  console.log("📥 Incoming login:", username, password);

  try {
    const [rows] = await db.query(
      "SELECT * FROM student WHERE username = ? AND password = ?",
      [username, password]
    );

    if (rows.length === 0) {
      return sendJSON(res, 401, {
        success: false,
        message: "Invalid username or password.",
      });
    }

    sendJSON(res, 200, { success: true, user: rows[0] });
  } catch (err) {
    console.error("❌ Error during login:", err);
    sendJSON(res, 500, { success: false, message: err.message });
  }
};

function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}
