import React from 'react';
import { useQuery } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';
import uuid from "uuid/v1";
import Table from 'react-bootstrap/Table';

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
	if (loading) return <h3>Loading gamearea...</h3>;
	if (error) return <p> {JSON.stringify(error)}</p>;
	if (!data) return <p>No Data from gamearea</p>;

	return (
		<div style={{ textAlign: 'center' }}>
			<h2>Gamearea som koordinater</h2>
			<Table striped bordered hover>
				<thead>
					<tr>
						<th>Longitude</th>
						<th>Latitude</th>
					</tr>
				</thead>
				<tbody>
					{data.gamearea.coordinates[0].map((e) => (
						<tr key={uuid()}>
							<td>{e[0]}</td>
							<td>{e[1]}</td>
						</tr>
					))}
				</tbody>
			</Table>
		</div>
	);
}
