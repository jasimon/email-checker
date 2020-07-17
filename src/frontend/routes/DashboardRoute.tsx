import React, { useEffect, useState } from "react";
import axios from "axios";
import { Redirect } from "react-router-dom";
import { Statistic, Card } from "antd";

const UNAUTHORIZED = "unauthorized";
const GENERIC_ERROR = "generic_error";

const DashboardRoute = () => {
  const [summaryMetrics, setSummaryMetrics] = useState(null);
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
    const intervalId = setInterval(api, 2000);
    return () => clearInterval(intervalId);
  }, []);
  if (error === UNAUTHORIZED) {
    return <Redirect to="/login" />;
  }
  return (
    <div>
      {summaryMetrics && (
        <div>
          <h2>Summary Statistics</h2>
          <Card className="stats-card">
            <Statistic
              title="Emails Pulled"
              value={summaryMetrics.emailCount}
            />
          </Card>
          {summaryMetrics.scanMetrics.map(
            ({
              failedScans,
              totalScans,
              type,
            }: {
              failedScans: number;
              totalScans: number;
              type: string;
            }) => (
              <Card className="stats-card">
                <Statistic
                  title={type}
                  value={failedScans}
                  suffix={`/ ${totalScans || 0}`}
                />
              </Card>
            )
          )}
        </div>
      )}
      {error && <span>An error has occurred</span>}{" "}
    </div>
  );
};

export default DashboardRoute;
