import React, { useEffect, useState } from "react";
import axios from "axios";

const DashboardRoute = () => {
  const [summaryMetrics, setSummaryMetrics] = useState({});
  useEffect(() => {
    const api = async () => {
      const resp = await axios("api/user/status");
      console.log(resp);
      setSummaryMetrics(resp.data);
    };
    const intervalId = setInterval(api, 1000);
    return () => clearInterval(intervalId);
  }, []);
  return (
    <div>
      Logged in!
      {JSON.stringify(summaryMetrics)}
    </div>
  );
};

export default DashboardRoute;
