import React, { useState } from 'react';
import { useLazyQuery } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';
import AddUser from './AddUser';

const USER = gql`
	query user($userName: String!) {
		user(userName: $userName) {
			name
			userName
			role
		}
	}
`;

export default function FindUser() {
	const [ userName, setUserName ] = useState('');
	const [ user, { loading, error, data } ] = useLazyQuery(USER);

	const fetchUser = () => {
		// if (id === "" || id.length !== 24) {
		//   return;
		// }
		user({ variables: {userName} });
	};

	return (
		<div>
			Username:<input
				type="txt"
				value={userName}
				onChange={(e) => {
					setUserName(e.target.value);
				}}
			/>
			&nbsp; <button onClick={fetchUser}>Find User</button>
			<br />
			<br />
			{loading && <h2>Loading...</h2>}
			{error && <h2>Could not find user...</h2>}
			{data && <AddUser initialUser={data.user} />}
		</div>
	);
}
