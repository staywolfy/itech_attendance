import { db } from "../utils/utils.js";

export const getBatchDetails = async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const id = url.searchParams.get("id");
    const course = url.searchParams.get("course");

    console.log("🔍 Batch details request:", { id, course });

    if (!id || !course) {
      return sendJSON(res, 400, {
        success: false,
        message: "Missing id or course",
      });
    }

    // Fix collation issues by specifying consistent collation
    const [persuing] = await db.query(
      "SELECT * FROM faculty_student WHERE (nameid = ? OR studentid = ?) AND course = ? AND status = 'Persuing'",
      [id, id, course]
    );

    const [completed] = await db.query(
      "SELECT * FROM faculty_student WHERE (nameid = ? OR studentid = ?) AND course = ? AND status = 'Completed'",
      [id, id, course]
    );

    // Fixed query with consistent collation
    const [pending] = await db.query(
      `SELECT s.subjectname 
       FROM subject s 
       WHERE s.coursename = ? 
         AND s.subjectname COLLATE utf8mb4_unicode_ci NOT IN (
           SELECT fs.subject COLLATE utf8mb4_unicode_ci
           FROM faculty_student fs 
           WHERE (fs.nameid = ? OR fs.studentid = ?) 
             AND fs.course = ? 
             AND fs.status IN ('Completed', 'Persuing')
         )`,
      [course, id, id, course]
    );

    console.log("✅ Batch query results:", {
      persuing: persuing.length,
      completed: completed.length,
      pending: pending.length,
    });

    return sendJSON(res, 200, {
      success: true,
      data: {
        persuing: persuing,
        completed: completed,
        pending: pending,
      },
    });
  } catch (err) {
    console.error("❌ Batch details error:", err);
    return sendJSON(res, 500, {
      success: false,
      message: "Database error: " + err.message,
    });
  }
};

function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}
