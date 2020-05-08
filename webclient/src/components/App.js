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
import AddUser from "./AddUser";
import AllUsers from "./AllUsers"
import FindUser from "./FindUser"
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
            <NavLink exact activeClassName="selected" to="/allUsers">All Users</NavLink>
          </li>
          <li>
            <NavLink exact activeClassName="selected" to="/findUser">Find User</NavLink>
          </li>
          <li>
            <NavLink exact activeClassName="selected" to="/addUser">Add User</NavLink>
          </li>
        </ul>

        <hr />
        <ApolloProvider client={client}>
          <div className="content">
            <Switch>

              <Route exact path="/">
                <Home />
              </Route>
              <Route path="/allUsers">
                <AllUsers />
              </Route>
              <Route path="/findUser">
                <FindUser />
              </Route>
              <Route path="/addUser">
                <AddUser allowEdit={true}/>
              </Route>

            </Switch>
          </div>
        </ApolloProvider>
      </div>
    </Router>
  );
}
