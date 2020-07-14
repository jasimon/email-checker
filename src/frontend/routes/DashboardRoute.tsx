import React, { useEffect } from "react";

const DashboardRoute = () => {
  useEffect(() => {
    const api = async () => {
      const resp = await fetch("api/user/status");
      console.log(resp);
    };
    api();
  });
  return <div>Logged in!</div>;
};

export default DashboardRoute;
