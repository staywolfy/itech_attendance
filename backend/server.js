import http from "http";
import dotenv from "dotenv";
import { db } from "./utils/utils.js";

import { login } from "./controllers/LoginController.js";
import { getCourseDetails } from "./controllers/CourseController.js";
import { getBatchDetails } from "./controllers/BatchController.js";
import { getFeeDetails } from "./controllers/FeeDetailsController.js";
import { getAttendanceDetails } from "./controllers/AttendanceController.js";

dotenv.config();

const PORT = process.env.PORT || 5000;
const DB_HOST = process.env.DB_HOST || "localhost";

// 🧩 Utility functions
const setCorsHeaders = (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
};

const sendJSON = (res, statusCode, data) => {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
};

const parseBody = (req) => {
  return new Promise((resolve, reject) => {
    if (req.method === "GET" || req.method === "OPTIONS") return resolve({});
    let body = "";
    req.on("data", (chunk) => (body += chunk.toString()));
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", reject);
  });
};

// 🧠 Create server
const server = http.createServer(async (req, res) => {
  setCorsHeaders(req, res);

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  try {
    req.body = await parseBody(req);

    // 🔹 Test route
    if (
      req.method === "GET" &&
      (req.url === "/test" || req.url === "/api/test")
    ) {
      const connection = await db.getConnection();
      const [rows] = await connection.query("SELECT 1+1 AS result");
      connection.release();
      return sendJSON(res, 200, {
        success: true,
        message: "Server OK",
        database: rows[0].result,
      });
    }

    // 🔹 Login route
    if (
      req.method === "POST" &&
      (req.url === "/login" || req.url === "/api/login")
    ) {
      return login(req, res);
    }

    // 🔹 Course route
    if (req.method === "GET" && req.url.startsWith("/api/courses/details")) {
      return getCourseDetails(req, res);
    }

    // 🔹 Batch route
    if (req.method === "GET" && req.url.startsWith("/api/batch/details")) {
      return getBatchDetails(req, res);
    }

    // 🔹 Fee details route
    if (req.method === "GET" && req.url.startsWith("/api/feedetails")) {
      return getFeeDetails(req, res);
    }

    // 🔹 Attendance route
    if (req.method === "GET" && req.url.startsWith("/api/attendance/details")) {
      return getAttendanceDetails(req, res);
    }

    // Default 404
    sendJSON(res, 404, { success: false, message: "Route not found" });
  } catch (error) {
    console.error("Server error:", error);
    sendJSON(res, 400, { success: false, message: "Invalid request body" });
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Server running at http://${DB_HOST}:${PORT}`);
});
