import React from 'react';
import { useQuery } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';
const uuidv4 = require('uuid/v4');

const ALL_POSITIONS = gql`
	{
		users {
			name
			userName
			role
		}
	}
`;

const GAMEAREA = gql`
	{
		gamearea {
			coordinates
		}
	}
`;

export default function All() {
	// const { loading, error, data, networkStatus } = useQuery(ALL_POSITIONS);
	// const { loading, error, data, networkStatus } = useQuery(ALL_POSITIONS, { fetchPolicy: 'no-cache' });
	const { loading, error, data, networkStatus } = useQuery(GAMEAREA, { fetchPolicy: 'no-cache' });
	// const { loading, error, data, networkStatus } = useQuery(ALL_POSITIONS, { pollInterval: 15000 });
	// if (loading) return <h3>Loading...</h3>;
	// if (error) return <p> {JSON.stringify(error)}</p>;
	// if (!data) return <p>No Data</p>;
	if (loading) return <h3>Loading gamearea...</h3>;
	if (error) return <p> {JSON.stringify(error)}</p>;
	if (!data) return <p>No Data from gamearea</p>;

	return (
		<div>
			{/* data.users.map((f) => ( const name = f.name ? `Name: ${f.name}` : null; return (
			<p key={f.userName}>
				{name}, Username: {f.userName}, Role: {f.role}
			</p>
			); 
			))  */}
			{data.gamearea.coordinates[0].map((e) => (
				<div>
				<p key={uuidv4()}>
					Longitude: {e[0]}, Latitude: {e[1]}
					{/* Latitude:{} , Longitude: {f.role} */}
				</p>
				</div>
			))}
		</div>
	);
}
