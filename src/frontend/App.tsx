import * as React from "react";
import { render } from "react-dom";
import { GoogleLogin, GoogleLoginResponseOffline } from "react-google-login";

interface AppProps {
  name: string;
}

interface AppState {
  time: string;
}

export class App extends React.Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);
    this.state = {
      time: null,
    };
  }

  responseGoogle = (response: GoogleLoginResponseOffline) => {
    console.log(response);
  };

  render() {
    const { name } = this.props;
    const { time } = this.state;
    return (
      <>
        <h1>{name}</h1>
        <div>{time}</div>
        <GoogleLogin
          clientId="26362473693-3s6p4ahk26jsrmpeu2f0vgcg47krjm0t.apps.googleusercontent.com"
          buttonText="Login"
          onSuccess={(resp: GoogleLoginResponseOffline) => {
            console.log(resp);
            this.saveUserID(resp.code);
          }}
          onFailure={this.responseGoogle}
          cookiePolicy={"single_host_origin"}
          scope="profile email https://mail.google.com/"
          prompt="consent"
          responseType="code"
        />
      </>
    );
  }

  private saveUserID = async (code: string) => {
    const response = await fetch("api/auth/", {
      method: "POST",
      body: JSON.stringify({ code }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.ok) {
      console.log("success");
    }
  };
}

export function start() {
  const rootElem = document.getElementById("main");
  render(<App name="Hello World" />, rootElem);
}
