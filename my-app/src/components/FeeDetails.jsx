import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaRupeeSign,
  FaCalendarAlt,
  FaReceipt,
  FaUser,
  FaIdCard,
} from "react-icons/fa";

export default function FeeDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = location.state?.user;

  const [paymentData, setPaymentData] = useState([]);
  const [summary, setSummary] = useState({
    totalAmount: 0,
    totalPaid: 0,
    totalDue: 0,
    totalPayments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchPaymentDetails();
  }, [user, navigate]);

  const fetchPaymentDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (user.name_contactid) params.append("name", user.name_contactid);
      if (user.contact) params.append("contactId", user.contact);

 const response = await fetch(`http://localhost:5000/api/feedetails?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setPaymentData(result.data.payments || []);
        setSummary(
          result.data.summary || {
            totalAmount: 0,
            totalPaid: 0,
            totalDue: 0,
            totalPayments: 0,
          }
        );
      } else {
        setError(result.message || "Failed to fetch payment details");
      }
    } catch (err) {
      console.error("Error fetching payment details:", err);
      setError("Network error: Unable to fetch payment details");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const formatCurrency = (amt) =>
    parseFloat(amt || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-IN") : "N/A";

  const getStatusText = (p) => {
    const due = parseFloat(p.Balance || 0);
    const paid = parseFloat(p.Paid || 0);
    if (due === 0 && paid > 0) return "Paid";
    if (paid === 0) return "Pending";
    if (paid > 0 && due > 0) return "Partial";
    return "Unknown";
  };

  const getStatusColor = (p) => {
    const due = parseFloat(p.Balance || 0);
    const paid = parseFloat(p.Paid || 0);
    if (due === 0 && paid > 0) return "bg-green-100 text-green-800";
    if (paid === 0) return "bg-red-100 text-red-800";
    if (paid > 0 && due > 0) return "bg-yellow-100 text-yellow-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/dashboard", { state: { user } })}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
            >
              <FaArrowLeft />
              <span>Back</span>
            </button>
            <h1 className="text-3xl font-bold text-gray-800">Fee Details</h1>
          </div>
          <button
            onClick={fetchPaymentDetails}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Refresh
          </button>
        </div>

        {/* Student Info */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 rounded-full">
                <FaUser className="text-blue-600" />
              </div>
              <div>
                <label className="block text-sm text-gray-600">Student Name</label>
                <p className="text-lg font-semibold">
                  {user.name || "Not Available"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 rounded-full">
                <FaIdCard className="text-green-600" />
              </div>
              <div>
                <label className="block text-sm text-gray-600">Contact ID</label>
                <p className="text-lg font-semibold">
                  {user.contact || "Not Available"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-100 rounded-full">
                <FaReceipt className="text-purple-600" />
              </div>
              <div>
                <label className="block text-sm text-gray-600">Total Payments</label>
                <p className="text-lg font-semibold">{summary.totalPayments}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-red-100 rounded-full">
                <FaRupeeSign className="text-red-600" />
              </div>
              <div>
                <label className="block text-sm text-gray-600">Total Due</label>
                <p className="text-lg font-semibold">
                  ₹{formatCurrency(summary.totalDue)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Payment Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <FaReceipt className="mr-2" />
              Payment History
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading payment details...</p>
            </div>
          ) : paymentData.length === 0 ? (
            <div className="p-8 text-center text-gray-600">
              No payment records found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Receipt No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Total Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Paid
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Due
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paymentData.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm">{p.Receipt || "N/A"}</td>
                      <td className="px-6 py-4 text-sm">{p.course || "N/A"}</td>
                      <td className="px-6 py-4 text-sm">
                        ₹{formatCurrency(p.courseFees)}
                      </td>
                      <td className="px-6 py-4 text-sm text-green-600">
                        ₹{formatCurrency(p.Paid)}
                      </td>
                      <td className="px-6 py-4 text-sm text-red-600">
                        ₹{formatCurrency(p.Balance)}
                      </td>
                      <td className="px-6 py-4 text-sm">{formatDate(p.Dates)}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            p
                          )}`}
                        >
                          {getStatusText(p)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary */}
        {!loading && paymentData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <h3 className="text-lg font-semibold text-green-800">Total Paid</h3>
              <p className="text-2xl font-bold text-green-600 flex items-center">
                <FaRupeeSign className="mr-1" />
                {formatCurrency(summary.totalPaid)}
              </p>
            </div>
            <div className="bg-red-50 p-6 rounded-lg border border-red-200">
              <h3 className="text-lg font-semibold text-red-800">Total Due</h3>
              <p className="text-2xl font-bold text-red-600 flex items-center">
                <FaRupeeSign className="mr-1" />
                {formatCurrency(summary.totalDue)}
              </p>
            </div>
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-800">Total Amount</h3>
              <p className="text-2xl font-bold text-blue-600 flex items-center">
                <FaRupeeSign className="mr-1" />
                {formatCurrency(summary.totalAmount)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
