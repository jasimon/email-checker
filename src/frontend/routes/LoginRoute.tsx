import React from "react";
import { GoogleLogin, GoogleLoginResponseOffline } from "react-google-login";
import { useHistory } from "react-router-dom";

const LoginRoute = () => {
  const history = useHistory();
  const responseGoogle = (response: GoogleLoginResponseOffline) => {
    console.log(response);
  };
  const saveUserID = async (code: string) => {
    const response = await fetch("api/auth/", {
      method: "POST",
      body: JSON.stringify({ code }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.ok) {
      console.log("success");
      history.replace("/");
    }
  };

  return (
    <GoogleLogin
      clientId="26362473693-3s6p4ahk26jsrmpeu2f0vgcg47krjm0t.apps.googleusercontent.com"
      buttonText="Login"
      onSuccess={(resp: GoogleLoginResponseOffline) => {
        console.log(resp);
        saveUserID(resp.code);
      }}
      onFailure={responseGoogle}
      cookiePolicy={"single_host_origin"}
      scope="profile email https://mail.google.com/"
      responseType="code"
      prompt="consent"
    />
  );
};

export default LoginRoute;
