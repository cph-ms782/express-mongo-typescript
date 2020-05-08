import React from 'react';
import { useQuery } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';

const ALL_USERS = gql`
	{
		users {
			name
			userName
			role
		}
	}
`;

export default function All() {
	// const { loading, error, data, networkStatus } = useQuery(ALL_FRIENDS);
	const { loading, error, data, networkStatus } = useQuery(ALL_USERS, { fetchPolicy: 'no-cache' });
	// const { loading, error, data, networkStatus } = useQuery(ALL_FRIENDS, { pollInterval: 15000 });
	if (loading) return <h3>Loading...</h3>;
	if (error) return <p> {JSON.stringify(error)}</p>;
	if (!data) return <p>No Data</p>;

	return data.users.map((f) => {
		const name = f.name ? `Name: ${f.name}` : null;
		return (
			<p key={f.userName}>
				{name}, Username: {f.userName}, Role: {f.role}
			</p>
		);
	});
}
