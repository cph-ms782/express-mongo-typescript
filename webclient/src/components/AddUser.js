import React, { useState } from "react";


const AddUser = ({ initialUser, allowEdit }) => {
  const EMPTY_USER = { name: "", userName: "", role: "user", password: "" }
  let newUser = initialUser ? initialUser : { ...EMPTY_USER }

  const [user, setUser] = useState({ ...newUser })
  const [readOnly, setReadOnly] = useState(!allowEdit)

  const handleChange = (event) => {
    const id = event.target.id;
    user[id] = event.target.value;
    setUser({ ...user })
  }
  const handleSubmit = (event) => {
    event.preventDefault();
    //Todo
    alert(JSON.stringify(user))
    setUser({ ...EMPTY_USER })
  }


  return (
    <form onSubmit={handleSubmit}>
      <label>
        Name<br/>
        <input type="text" readOnly={readOnly} id="name" value={user.name} onChange={handleChange} />
      </label>
      <br />
      <label>
      UserName <br/>
        <input readOnly={readOnly} type="text" id="userName" value={user.userName} onChange={handleChange} />
      </label>
      <br />
      <label>
        Password <br/>
          <input readOnly={readOnly} type="password" id="password" value={user.password} onChange={handleChange} />
      </label>
      <br /><br/>
      {!readOnly && <input type="submit" value="Submit" />}
    </form>
  );
}

export default AddUser;