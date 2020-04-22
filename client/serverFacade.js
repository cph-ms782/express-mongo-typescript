import { SERVER_URL } from './settings';
import base64 from 'react-native-base64';

const config = (user, password) => {
	let encodedAuth = base64.encode(user + ':' + password);

	const header = {
		method: 'GET',
		headers: {
			Authorization: 'Basic ' + encodedAuth
		}
	};
	return header;
};
const postConfig = (userName, password, lon, lat) => {
	let encodedAuth = base64.encode(user + ':' + password);

	const headerBody = {
		method: 'POST',
		headers: {
			Authorization: 'Basic ' + encodedAuth
		},
		body: {
			userName: userName,
			lon: lon,
			lat: lat
		}
	};
	return headerBody;
};

ServerFacade = () => {
	/**
   * make base64 encoding for authorization
   */

	async function fetchPostUpdatePosition(userName, password, lon, lat) {
		console.log("fetchPostUpdatePosition",userName, password, lon, lat )
		const res = await fetch(`${SERVER_URL}/gameapi/updateposition`, postConfig(userName, password, lon, lat)).then((res) => res.json());
		console.log("res", res)
		return res;
	}

	async function fetchGameArea(user, password) {
		const res = await fetch(`${SERVER_URL}/gameapi/gamearea`, config(user, password)).then((res) => res.json());
		return res.coordinates;
	}

	async function isUserInArea(user, password, lon, lat) {
		const status = await fetch(
			`${SERVER_URL}/gameapi/isuserinarea/${lon}/${lat}`,
			config(user, password)
		).then((res) => res.json());
		return status;
	}

	return {
		fetchPostUpdatePosition,
		fetchGameArea,
		isUserInArea
	};
};

export default ServerFacade();
