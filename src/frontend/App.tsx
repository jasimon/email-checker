import * as React from "react";
import { render } from "react-dom";
import { GoogleLogin, GoogleLoginResponse } from "react-google-login";

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

  componentDidMount() {
    this.getTime();
    setTimeout(this.getTime, 2000);
  }

  responseGoogle = (response: GoogleLoginResponse) => {
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
          onSuccess={(resp: GoogleLoginResponse) =>
            this.saveUserID(resp.profileObj)
          }
          onFailure={this.responseGoogle}
          cookiePolicy={"single_host_origin"}
          scope="https://mail.google.com/"
        />
        ,
      </>
    );
  }

  private saveUserID = async (profileObj: any /* TODO: type for this*/) => {
    const response = await fetch("api/auth", {
      method: "POST",
      body: JSON.stringify({ profileObj }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.ok) {
      console.log("success");
    }
  };

  private getTime = async () => {
    const response = await fetch("/api/test", { method: "GET" });
    if (response.ok) {
      this.setState({ time: await response.text() });
    }
  };
}

export function start() {
  const rootElem = document.getElementById("main");
  render(<App name="Hello World" />, rootElem);
}
