import { db } from "../utils/utils.js";

export const getFeeDetails = async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const name = url.searchParams.get("name");
    const contactId = url.searchParams.get("contactId");

    if (!name && !contactId) {
      return sendJSON(res, 400, {
        success: false,
        message: "Name or Contact ID is required",
      });
    }

    let query = `
      SELECT 
        Receipt as Receipt,
        course as course,
        courseFees as courseFees,
        Paid as Paid,
        Balance as Balance,
        Dates as Dates
      FROM payement   
      WHERE 1=1
    `;

    const params = [];
    if (name) {
      query += " AND name_contactid = ?";
      params.push(name);
    }

    query += " ORDER BY Dates DESC";

    const [payments] = await db.query(query, params);

    const summary = {
      totalAmount: 0,
      totalPaid: 0,
      totalDue: 0,
      totalPayments: payments.length,
    };

    payments.forEach((p) => {
      summary.totalAmount += parseFloat(p.courseFees || 0);
      summary.totalPaid += parseFloat(p.Paid || 0);
      summary.totalDue += parseFloat(p.Balance || 0);
    });

    sendJSON(res, 200, { success: true, data: { payments, summary } });
  } catch (err) {
    console.error("❌ FeeDetails Error:", err);
    sendJSON(res, 500, { success: false, message: "Internal server error" });
  }
};

const sendJSON = (res, status, data) => {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
};
