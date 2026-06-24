import { useEffect, useState } from "react";
import axios from "axios";

function Display() {
  const [stats, setStats] = useState({});

  const fetchStats = async () => {
    const res = await axios.get(
      "http://localhost:5000/api/patients/stats"
    );

    setStats(res.data);
  };

  useEffect(() => {
    fetchStats();

    const interval = setInterval(() => {
      fetchStats();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
      <div className="max-w-3xl w-full">

        <h1 className="text-5xl font-bold text-center mb-10">
          🏥 Live Queue Display
        </h1>

        <div className="grid md:grid-cols-3 gap-6">

          <div className="bg-slate-800 p-8 rounded-xl text-center">
            <h2 className="text-gray-400 mb-3">
              Current Token
            </h2>

            <p className="text-6xl font-bold text-green-400">
              {stats.currentToken || "-"}
            </p>
          </div>

          <div className="bg-slate-800 p-8 rounded-xl text-center">
            <h2 className="text-gray-400 mb-3">
              Patients Waiting
            </h2>

            <p className="text-6xl font-bold text-yellow-400">
              {stats.waitingCount || 0}
            </p>
          </div>

          <div className="bg-slate-800 p-8 rounded-xl text-center">
            <h2 className="text-gray-400 mb-3">
              Est. Wait Time
            </h2>

            <p className="text-6xl font-bold text-red-400">
              {stats.estimatedWaitingTime || 0}m
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}

export default Display;