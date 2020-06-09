import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';

const USERS = gql`
	{
		users {
			name
			userName
			role
		}
	}
`;
const ADD_USER = gql`
	mutation createUser($input: UserInput!) {
		createUser(input: $input)
	}
`;
const UPDATE_USER = gql`
	mutation updateUser($input: UserInput!) {
		updateUser(input: $input)
	}
`;

const AddUser = ({ initialUser, allowEdit, allowUpdate }) => {
	const EMPTY_USER = { name: '', userName: '', role: 'user', password: '' };
	console.log('initialUser', initialUser);
	let newUser = initialUser ? initialUser : { ...EMPTY_USER };
	console.log('newUser', newUser);

	const [ user, setUser ] = useState({ ...newUser });
	const [ readOnly, setReadOnly ] = useState(!allowEdit);
	const [ updatable, setUpdatable ] = useState(allowUpdate);

	const { data } = useQuery(USERS);
	const [ createUser ] = useMutation(ADD_USER, {
		update(cache, { data }) {
			const newUser = data.createUser;
			const p = cache.readQuery({ query: USERS });
			const { users } = p;
			users.push(newUser);
			cache.writeQuery({
				query: USERS,
				data: { users: [ ...users ] }
			});
		}
	});
	const [ updateUser ] = useMutation(UPDATE_USER, {
		update(cache, { data }) {
			const changedUser = data.updateUser;
			console.log('updateUser, changedUser', changedUser);
			const p = cache.readQuery({ query: USERS });
			const { users } = p;
			const newUsers = users.filter((u) => {
				return u.userName != changedUser.userName;
			});
			console.log('updateUser, newUsers', newUsers);
			newUsers.push(changedUser);
			cache.writeQuery({
				query: USERS,
				data: { users: [ ...users ] }
			});
		}
	});

	const handleChange = (event) => {
		const userName = event.target.id;
		console.log('userName: ', userName);
		user[userName] = event.target.value;
		console.log('user: ', { ...user });
		setUser({ ...user });
	};

	const handleCreateUser = (event) => {
		console.log('handleCreateUser, user', user);
		event.preventDefault();
		createUser({
			variables: {
				input: {
					name: user.name,
					userName: user.userName,
					password: user.password
				}
			}
		});
		setUser({ ...EMPTY_USER });
	};

	const handleUpdateUser = (event) => {
		console.log('handleUpdateUser, user', user);
		event.preventDefault();
		updateUser({
			variables: {
				input: {
					name: user.name,
					userName: user.userName,
					password: user.password
				}
			}
		});
		setUser({ ...EMPTY_USER });
	};

	return (
		<div>
			<form onSubmit={updatable ? handleUpdateUser : handleCreateUser}>
				<label>
					UserName <br />
					<input
						readOnly={readOnly}
						type="text"
						id="userName"
						value={user.userName}
						onChange={handleChange}
					/>
				</label>
				<br />
				<label>
					Name<br />
					<input type="text" readOnly={readOnly} id="name" value={user.name} onChange={handleChange} />
				</label>
				<br />
				{readOnly && <p>Role: {user.role}</p>}
				<label hidden={readOnly}>
					Password <br />
					<input
						readOnly={readOnly}
						type="password"
						id="password"
						value={user.password}
						onChange={handleChange}
					/>
				</label>
				<br />
				<br />
				{!readOnly && <input type="submit" value="Submit" />}
			</form>
		</div>
	);
};

export default AddUser;
