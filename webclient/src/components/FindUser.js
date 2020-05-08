import React, { useState } from "react";
import { useLazyQuery } from "@apollo/react-hooks"
import { gql } from "apollo-boost"
import AddUser from "./AddUser"

const GET_USER = gql`
  query getOneUser($id:ID!){
  getOneUser(id:$id){
    name
    userName
    role
  }
}
`

export default function FindUser() {
  const [id, setId] = useState("")
  const [getUser, { loading, error, data }] = useLazyQuery(GET_USER);

  const fetchUser = () => {
    // if (id === "" || id.length !== 24) {
    //   return;
    // }
    alert(`Find user with id: ${id}`)
  }

  return (
    <div>
      ID:<input type="txt" value={id} onChange={e => { setId(e.target.value) }} />
      &nbsp; <button onClick={fetchUser}>Find User</button>
      <br/>
      <br/>

      <h2>Fetch a user using the provided id</h2>

    </div>)
}
