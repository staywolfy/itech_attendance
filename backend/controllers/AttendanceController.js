import { db } from "../utils/utils.js";

export const getAttendanceDetails = async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const name_contactid = url.searchParams.get("name_contactid");
    const course = url.searchParams.get("course");
    const batch = url.searchParams.get("batch");

    if (!name_contactid || !course || !batch) {
      return sendJSON(res, 400, {
        success: false,
        message: "Missing parameters",
      });
    }

    const [rows] = await db.query(
      "SELECT date, name, attendence,topic, Reasonfor_absent FROM attendence WHERE name = ? AND course = ? AND batchno = ? ORDER BY date ASC",
      [name_contactid, course, batch]
    );

    return sendJSON(res, 200, { success: true, data: rows });
  } catch (err) {
    console.error(err);
    return sendJSON(res, 500, { success: false, message: err.message });
  }
};

function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}
