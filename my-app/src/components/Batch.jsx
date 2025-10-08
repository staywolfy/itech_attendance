// components/Batch.jsx
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Attendance from "./Attendance";

export default function Batch() {
  const location = useLocation();
  const user = location.state?.user;

  const [selectedCourse, setSelectedCourse] = useState("");
  const [batches, setBatches] = useState({ persuing: [], completed: [], pending: [] });
  const [activeTab, setActiveTab] = useState("Persuing");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [attendance, setAttendance] = useState([]);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);

  if (!user) return <p>User data missing. Please login again.</p>;
  const courses = Array.isArray(user.course) ? user.course : [user.course];

  useEffect(() => {
    if (!selectedCourse) return;

    const fetchBatches = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `http://localhost:5000/api/batch/details?id=${user.name_contactid}&course=${encodeURIComponent(selectedCourse)}`
        );
        if (!res.ok) throw new Error("Failed to fetch batches");
        const data = await res.json();
        if (!data.success) throw new Error(data.message || "No batches found");
        setBatches({
          persuing: data.data.persuing || [],
          completed: data.data.completed || [],
          pending: data.data.pending || [],
        });
      } catch (err) {
        console.error(err);
        setError(err.message);
        setBatches({ persuing: [], completed: [], pending: [] });
      } finally {
        setLoading(false);
      }
    };
    fetchBatches();
  }, [selectedCourse, user.name_contactid]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    if (dateString.includes("-")) {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
    }
    return dateString;
  };

  const getFacultyName = (facultyid) => (facultyid ? facultyid.split("@")[0] : "N/A");

  const fetchAttendance = async (batch) => {
    try {
      setSelectedBatch(batch);
      setAttendance([]);
      setShowAttendanceModal(true);

     const res = await fetch(
  `http://localhost:5000/api/attendance/details?name_contactid=${user.name_contactid}&course=${encodeURIComponent(selectedCourse)}&batch=${encodeURIComponent(batch.batchno || batch.batchname)}`
);

      if (!res.ok) throw new Error("Failed to fetch attendance");
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "No attendance found");
      setAttendance(data.data);
    } catch (err) {
      console.error(err);
      setAttendance([]);
    }
  };

  const renderBatchTable = () => {
    const list = activeTab === "Persuing" ? batches.persuing : activeTab === "Completed" ? batches.completed : batches.pending;
    if (loading) return <p className="text-blue-600 text-center py-4">Loading batches...</p>;
    if (error) return <p className="text-red-600 text-center py-4">Error: {error}</p>;
    if (!list.length) return <p className="text-gray-500 text-center py-4">No {activeTab.toLowerCase()} batches found.</p>;

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 border-b">Subject</th>
              <th className="px-4 py-3 border-b">Batch Name</th>
              <th className="px-4 py-3 border-b">Faculty</th>
              <th className="px-4 py-3 border-b">Start Date</th>
              <th className="px-4 py-3 border-b">End Date</th>
              <th className="px-4 py-3 border-b">Batch Time</th>
              <th className="px-4 py-3 border-b">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {list.map((batch, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-4 py-3">{batch.subject || "N/A"}</td>
                <td className="px-4 py-3">{batch.batchno || batch.batchname || "N/A"}</td>
                <td className="px-4 py-3">{getFacultyName(batch.facultyid || batch.faculty)}</td>
                <td className="px-4 py-3">{formatDate(batch.startdate || batch.date)}</td>
                <td className="px-4 py-3">{formatDate(batch.ExceptedEnddate || batch.endate)}</td>
                <td className="px-4 py-3">{batch.batch_time || "N/A"}</td>
                <td className="px-4 py-3">
           <button
  type="button"
  onClick={(e) => {
    e.preventDefault(); // ✅ stop navigation
    e.stopPropagation(); // ✅ stop bubbling
    fetchAttendance(batch);
  }}
  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
>
  View Attendance
</button>


                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderPendingList = () => {
    if (loading) return <p className="text-blue-600 text-center py-4">Loading pending batches...</p>;
    if (error) return <p className="text-red-600 text-center py-4">Error: {error}</p>;
    if (!batches.pending.length) return <p className="text-gray-500 text-center py-4">No pending batches found.</p>;

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 border-b">Subject Name</th>
              <th className="px-4 py-3 border-b">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {batches.pending.map((subject, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-4 py-3">{subject.subjectname || subject.subject || "N/A"}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Pending</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Batch Details</h2>

      <div className="mb-6">
        <label htmlFor="course" className="block mb-2 font-semibold text-gray-700">Select Course:</label>
        <select
          id="course"
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="w-full md:w-1/2 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Select a course --</option>
          {courses.filter(course => course).map((course, idx) => (
            <option key={idx} value={course}>{course}</option>
          ))}
        </select>
      </div>

      {selectedCourse && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-wrap gap-2 mb-6 border-b pb-4">
            {["Persuing", "Completed", "Pending"].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  activeTab === tab ? "bg-blue-600 text-white shadow-lg" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {tab} Batches
              </button>
            ))}
          </div>

          <div className="min-h-40">
            <h3 className="font-bold text-xl mb-4 text-gray-800">{activeTab} Batches for {selectedCourse}</h3>
            {activeTab === "Pending" ? renderPendingList() : renderBatchTable()}
          </div>
        </div>
      )}

{showAttendanceModal && selectedBatch && (
  <Attendance
    attendance={attendance}
    selectedBatch={selectedBatch}
    formatDate={formatDate}
    onClose={() => setShowAttendanceModal(false)}
  />
)}

    </div>
  );
}
