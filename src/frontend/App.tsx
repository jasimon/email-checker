import * as React from "react";
import { render } from "react-dom";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import LoginRoute from "./routes/LoginRoute";
import DashboardRoute from "./routes/DashboardRoute";

export class App extends React.Component {
  render() {
    return (
      <Router>
        <Switch>
          <Route exact path="/login">
            <LoginRoute />
          </Route>
          <Route exact path="/">
            <DashboardRoute />
          </Route>
        </Switch>
      </Router>
    );
  }
}

export function start() {
  const rootElem = document.getElementById("main");
  render(<App />, rootElem);
}
