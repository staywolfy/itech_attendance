// components/Attendance.jsx
import React from "react";

export default function Attendance({ attendance, selectedBatch, formatDate, onClose }) {
  if (!selectedBatch) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg w-11/12 md:w-2/3 p-6 relative">
        <h3 className="text-xl font-bold mb-4">
          Attendance for {selectedBatch.batchno || selectedBatch.batchname}
        </h3>
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
          onClick={onClose}
        >
          ✖
        </button>
        {attendance.length ? (
          <table className="min-w-full border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 border">Date</th>
                <th className="px-4 py-2 border">Status</th>
                <th className="px-4 py-2 border">Topic</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((att, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-2 border">{formatDate(att.date)}</td>
                  <td className="px-4 py-2 border">{att.attendence}</td>
                  <td className="px-4 py-2 border">{att.topic || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500 text-center py-4">No attendance records found.</p>
        )}
      </div>
    </div>
  );
}
