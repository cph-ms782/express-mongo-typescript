// npm install react-bootstrap bootstrap
// npm install react-leaflet leaflet

import React from "react";
import "../App.css"
import {
  BrowserRouter as Router,
  Switch,
  Route,
  NavLink
} from "react-router-dom";

import { ApolloProvider } from "@apollo/react-hooks"
import ApolloClient from "apollo-boost"
import Geo from "./Geo";
import Users from "./Users"
import Home from "./Home"

const client = new ApolloClient({
  uri: 'http://localhost:5000/graphql',
})

export default function App() {
  return (
    <Router>
      <div>
        <ul className="header">
          <li>
            <NavLink exact activeClassName="selected" to="/">Home</NavLink>
          </li>
          <li>
            <NavLink exact activeClassName="selected" to="/users">Users</NavLink>
          </li>
          <li>
            <NavLink exact activeClassName="selected" to="/geo">Geo</NavLink>
          </li>
        </ul>

        <hr />
        <ApolloProvider client={client}>
          <div className="content">
            <Switch>

              <Route exact path="/">
                <Home />
              </Route>
              <Route path="/users">
                <Users />
              </Route>
              <Route path="/geo">
                <Geo />
              </Route>
              
            </Switch>
          </div>
        </ApolloProvider>
      </div>
    </Router>
  );
}
