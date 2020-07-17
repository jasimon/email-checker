import * as React from "react";
import { render } from "react-dom";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import LoginRoute from "./routes/LoginRoute";
import DashboardRoute from "./routes/DashboardRoute";
import "./App.css";
import { Layout } from "antd";

export class App extends React.Component {
  render() {
    return (
      <Router>
        <Switch>
          <Layout>
            <Layout.Header style={{ color: "#eeeeee" }}>
              Welcome to Argus!
            </Layout.Header>
            <Layout.Content style={{ margin: "30px" }}>
              <Route exact path="/login">
                <LoginRoute />
              </Route>
              <Route exact path="/">
                <DashboardRoute />
              </Route>
            </Layout.Content>
          </Layout>
        </Switch>
      </Router>
    );
  }
}

export function start() {
  const rootElem = document.getElementById("main");
  render(<App />, rootElem);
}
