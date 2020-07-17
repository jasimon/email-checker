import React, { useEffect, useState } from "react";
import axios from "axios";
import { Redirect } from "react-router-dom";

const UNAUTHORIZED = "unauthorized";
const GENERIC_ERROR = "generic_error";

const DashboardRoute = () => {
  const [summaryMetrics, setSummaryMetrics] = useState({});
  const [error, setError] = useState("");
  useEffect(() => {
    const api = async () => {
      try {
        const resp = await axios("api/user/status");
        console.log(resp);
        setSummaryMetrics(resp.data);
      } catch (err) {
        console.log(err);
        if (err.response) {
          err.response.status === 401
            ? setError(UNAUTHORIZED)
            : setError(GENERIC_ERROR);
        }
      }
    };
    const intervalId = setInterval(api, 1000);
    return () => clearInterval(intervalId);
  }, []);
  if (error === UNAUTHORIZED) {
    return <Redirect to="/login" />;
  }
  return (
    <div>
      Logged in!
      {JSON.stringify(summaryMetrics)}
      {error && <span>An error has occurred</span>}
    </div>
  );
};

export default DashboardRoute;
