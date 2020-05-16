import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';
import uuid from 'uuid/v1';
import Table from 'react-bootstrap/Table';
import AddUser from './AddUser';
import FindUser from './FindUser';

const USERS = gql`
	{
		users {
			name
			userName
			role
		}
	}
`;
const DELETE_USER = gql`
	mutation deleteUser($userName: String!) {
		deleteUser(userName: $userName)
	}
`;

export default function All() {
	// const { loading, error, data, refetch, networkStatus } = useQuery(USERS);
	// const { loading, error, data, refetch } = useQuery(USERS, { fetchPolicy: 'no-cache' });
	const { loading, error, data, refetch } = useQuery(USERS, { pollInterval: 3000 });

	const [ deleteUser ] = useMutation(DELETE_USER);

	const [ showAddUser, setShowAddUser ] = useState(false);
	const [ showFindUser, setShowFindUser ] = useState(false);

	const onDeleteFullRefetch = (userName) => {
		deleteUser({ variables: { userName } });
		refetch();
	};

	const onDeleteUpdateCache = (userName) => {
		deleteUser({
			variables: { userName },
			update(cache) {
				const { users } = cache.readQuery({ query: USERS });
				const newUsers = users.filter((f) => f.userName !== userName);
				cache.writeQuery({
					query: USERS,
					data: { users: newUsers }
				});
			}
		});
	};

	if (loading) return <h3>Loading...</h3>;
	if (error) return <p> {JSON.stringify(error)}</p>;
	if (!data) return <p>No Data</p>;

	return (
		<div >
			<button
				href="#"
				onClick={() => {
					setShowAddUser(true);
					setShowFindUser(false);
				}}
			>
				Add User
			</button>
			<button
				href="#"
				onClick={() => {
					setShowFindUser(true);
					setShowAddUser(false);
				}}
			>
				Find User
			</button>
			{showAddUser && <AddUser allowEdit={true} />}
			{showFindUser && <FindUser />}
			<Table striped bordered hover>
				<thead>
					<tr>
						<th>Username</th>
						<th>Name</th>
						<th>Role</th>
						<th />
					</tr>
				</thead>
				<tbody>
					{data.users.map((f) => (
						<tr key={uuid()}>
							<td>{f.userName}</td>
							<td>{f.name ? f.name : null}</td>
							<td>{f.role}</td>
							<td>
								&nbsp;&nbsp;
								<a style={{ fontSize: 8 }} href="#" onClick={() => onDeleteFullRefetch(f.userName)}>
									Delete (Refetch All)
								</a>
								, &nbsp;
								<a style={{ fontSize: 8 }} href="#" onClick={() => onDeleteUpdateCache(f.userName)}>
									Delete (Update Cache)
								</a>
							</td>
						</tr>
					))}
				</tbody>
			</Table>
		</div>
	);
}
