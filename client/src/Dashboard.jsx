import { BrowserRouter, Routes, Route } from "react-router-dom";
import Display from "./Display";
import { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";


function Dashboard() {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({});
  const [patientName, setPatientName] = useState("");
  const [adding, setAdding] = useState(false);
const [calling, setCalling] = useState(false);
const [deleting, setDeleting] = useState(false);
const [darkMode, setDarkMode] = useState(() => {
  const savedTheme = localStorage.getItem("theme");
  return savedTheme ? JSON.parse(savedTheme) : true;
});

  const API = "http://localhost:5000/api/patients";

  const fetchPatients = async () => {
    const res = await axios.get(API);
    setPatients(res.data.patients);
  };

  const fetchStats = async () => {
    const res = await axios.get(`${API}/stats`);
    setStats(res.data);
  };

const addPatient = async () => {
  if (!patientName.trim()) {
    toast.error("Enter patient name");
    return;
  }

  try {
    setAdding(true);

    await axios.post(API, {
      patientName,
    });

    toast.success("Patient added successfully");

    setPatientName("");
    fetchPatients();
    fetchStats();
  } catch (error) {
    toast.error("Failed to add patient");
  } finally {
    setAdding(false);
  }
};

const callNext = async () => {
  if (
    stats.waitingCount === 0 &&
    stats.currentToken === null
  ) {
    toast.error("No patients waiting in queue");
    return;
  }

  try {
    setCalling(true);

    await new Promise((resolve) =>
  setTimeout(resolve, 2000)
);

    await axios.post(`${API}/call-next`);

    toast.success("Next patient called");

    fetchPatients();
    fetchStats();
  } catch (error) {
    toast.error("Failed to call next patient");
  } finally {
    setCalling(false);
  }
};

const exportCSV = () => {
  const headers = ["Token", "Patient", "Status"];

  const rows = patients.map((patient) => [
    patient.tokenNumber,
    patient.patientName,
    patient.status,
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "clinic-queue-report.csv";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  toast.success("Report downloaded");
};

const deletePatient = async (tokenNumber) => {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this patient?"
  );

  if (!confirmDelete) return;

  try {
    setDeleting(true);

    await axios.delete(`${API}/${tokenNumber}`);

    toast.success("Patient deleted");

    fetchPatients();
    fetchStats();
  } catch (error) {
    toast.error("Delete failed");
  } finally {
    setDeleting(false);
  }
};

 useEffect(() => {
  fetchPatients();
  fetchStats();

  const interval = setInterval(() => {
    fetchPatients();
    fetchStats();
  }, 5000);

  return () => clearInterval(interval);
}, []);

useEffect(() => {
  localStorage.setItem(
    "theme",
    JSON.stringify(darkMode)
  );
}, [darkMode]);

const filteredPatients = patients.filter((patient) =>
  patient.patientName
    .toLowerCase()
    .includes(searchTerm.toLowerCase())
);

const chartData = [
  {
    name: "Waiting",
    count: stats.waitingCount || 0,
  },
  {
    name: "Completed",
    count: stats.completedCount || 0,
  },
  {
    name: "Current",
    count: stats.currentToken ? 1 : 0,
  },
];

  return (  
  <>
    <Toaster position="top-right" />

    <div
  className={`min-h-screen p-6 transition-all duration-300 ${
    darkMode
      ? "bg-slate-900 text-white"
      : "bg-slate-100 text-slate-900"
  }`}
>
      <div className="max-w-6xl mx-auto">

        <h1 className="text-5xl font-bold text-center mb-10">
          🏥 Clinic Queue Manager
        </h1>
        <div className="flex justify-end mb-6">
  <button
    onClick={() => setDarkMode(!darkMode)}
    className="px-4 py-2 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700"
  >
    {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
  </button>
</div>

        <div className="flex justify-end mb-6">
  <button
    onClick={exportCSV}
    className="bg-purple-600 hover:bg-purple-700 px-5 py-3 rounded-lg font-semibold"
  >
    📥 Export Report
  </button>
</div>

        <div className="grid md:grid-cols-5 gap-6 mb-10">

  <div className="bg-slate-800 rounded-xl p-6 text-center shadow-lg">
    <h2 className="text-gray-400 mb-2">Current Token</h2>
    <p className="text-4xl font-bold text-green-400">
      {stats.currentToken || "-"}
    </p>
  </div>

  <div
  className={`rounded-xl p-6 shadow-lg ${
    darkMode ? "bg-slate-800" : "bg-white"
  }`}
>
    <h2 className="text-gray-400 mb-2">Waiting</h2>
    <p className="text-4xl font-bold text-yellow-400">
      {stats.waitingCount || 0}
    </p>
  </div>

  <div
  className={`rounded-xl p-6 shadow-lg ${
    darkMode ? "bg-slate-800" : "bg-white"
  }`}
>
    <h2 className="text-gray-400 mb-2">Completed</h2>
    <p className="text-4xl font-bold text-blue-400">
      {stats.completedCount || 0}
    </p>
  </div>

  <div
  className={`rounded-xl p-6 shadow-lg ${
    darkMode ? "bg-slate-800" : "bg-white"
  }`}
>
    <h2 className="text-gray-400 mb-2">
      Avg Consultation
    </h2>
    <p className="text-4xl font-bold text-purple-400">
      {stats.averageConsultationTime || 0}m
    </p>
  </div>

  <div
  className={`rounded-xl p-6 shadow-lg ${
    darkMode ? "bg-slate-800" : "bg-white"
  }`}
>
    <h2 className="text-gray-400 mb-2">
      Est. Wait
    </h2>
    <p className="text-4xl font-bold text-red-400">
      {stats.estimatedWaitingTime || 0}m
    </p>
  </div>

</div>

        <div
  className={`rounded-xl p-6 shadow-lg ${
    darkMode ? "bg-slate-800" : "bg-white"
  }`}
>

          <h2 className="text-2xl font-semibold mb-4">
            Add Patient
          </h2>

          <div className="flex gap-3">

            <input
              type="text"
              placeholder="Enter Patient Name"
              value={patientName}
              onChange={(e) =>
                setPatientName(e.target.value)
              }
              className="flex-1 p-3 rounded-lg bg-slate-700 outline-none"
            />

            <button
  onClick={addPatient}
  className="bg-green-500 hover:bg-green-600 px-5 py-3 rounded-lg font-semibold"
>
  {adding ? "Adding..." : "Add"}
</button>

            <button
  onClick={callNext}
  disabled={calling}
  className="bg-blue-500 hover:bg-blue-600 px-5 py-3 rounded-lg font-semibold disabled:opacity-50"
>
  {calling ? "Calling..." : "Call Next"}
</button>

          </div>

        </div>

        <div
  className={`rounded-xl p-6 shadow-lg ${
    darkMode ? "bg-slate-800" : "bg-white"
  }`}
>

          <h2 className="text-2xl font-semibold mb-5">
            Patient Queue
          </h2>

          <div className="mb-5">
  <input
    type="text"
    placeholder="🔍 Search Patient..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className={`w-full p-3 rounded-lg outline-none ${
  darkMode
    ? "bg-slate-700 text-white"
    : "bg-slate-200 text-black"
}`}
  />
</div>

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead>
                <tr className="border-b border-slate-600">
                  <th className="p-3 text-left">Token</th>
                  <th className="p-3 text-left">Patient</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Action</th>
                </tr>
              </thead>

              <tbody>
  {patients.length === 0 ? (
    <tr>
      <td
        colSpan="4"
        className="text-center p-10 text-gray-400"
      >
        🏥 No Patients In Queue
      </td>
    </tr>
  ) : (
    filteredPatients.map((patient) => (
      <tr
        key={patient._id}
        className="border-b border-slate-700"
      >
        <td className="p-3">
          {patient.tokenNumber}
        </td>

        <td className="p-3">
          {patient.patientName}
        </td>

        <td className="p-3">
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold
            ${
              patient.status === "waiting"
                ? "bg-yellow-500 text-black"
                : patient.status === "in-progress"
                ? "bg-green-500 text-black"
                : "bg-blue-500 text-black"
            }`}
          >
            {patient.status}
          </span>
        </td>

        <td className="p-3">
          <button
  onClick={() =>
    deletePatient(patient.tokenNumber)
  }
  disabled={deleting}
  className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded disabled:opacity-50"
>
  {deleting ? "Deleting..." : "Delete"}
</button>
        </td>
      </tr>
    ))
  )}

  {filteredPatients.length === 0 && (
  <tr>
    <td
      colSpan="4"
      className="text-center p-5 text-gray-400"
    >
      No patient found
    </td>
  </tr>
)}
</tbody>

            </table>

          </div>

        </div>
        <div className="bg-slate-800 rounded-xl p-6 mt-8">
  <h2 className="text-2xl font-semibold mb-5">
    Queue Analytics
  </h2>

  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={chartData}>
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Bar
        dataKey="count"
        fill="#3b82f6"
      />
    </BarChart>
  </ResponsiveContainer>
</div>

      </div>
    </div>
    </>
    
  );
}

export default Dashboard;