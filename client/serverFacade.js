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
	let encodedAuth = base64.encode(userName + ':' + password);

	const headerBody = {
		method: 'POST',
		headers: {
			"Authorization": 'Basic ' + encodedAuth,
			"Content-Type": "application/json",
			"Accept": "application/json",
		},
		body: JSON.stringify({
			userName,
			lon,
			lat
		})
	};
	return headerBody;
};
const postNearbyPlayersConfig = (userName, password, lon, lat, distance) => {
	let encodedAuth = base64.encode(userName + ':' + password);

	const headerBody = {
		method: 'POST',
		headers: {
			"Authorization": 'Basic ' + encodedAuth,
			"Content-Type": "application/json",
			"Accept": "application/json",
		},
		body: JSON.stringify({
			userName,
			password,
			lon,
			lat,
			distance
		})
	};
	return headerBody;
};
const getpostifreached = (postId, lon, lat) => {
	let encodedAuth = base64.encode(userName + ':' + password);

	const headerBody = {
		method: 'POST',
		headers: {
			"Authorization": 'Basic ' + encodedAuth,
			"Content-Type": "application/json",
			"Accept": "application/json",
		},
		body: JSON.stringify({
			postId, lon, lat
		})
	};
	return headerBody;
};

ServerFacade = () => {
	/**
   * make base64 encoding for authorization
   */

	async function fetchPostUpdatePosition(userName, password, lon, lat) {
		console.log('fetchPostUpdatePosition', userName, password, lon, lat);
		const res = await fetch(
			`${SERVER_URL}/gameapi/updateposition`,
			postConfig(userName, password, lon, lat)
		).then((res) => res.json());
		console.log('fetchPostUpdatePosition res', res);
		return res;
	}

	async function fetchPostNearbyPlayers(userName, password, lon, lat, distance) {
		console.log('fetchPostNearbyPlayers', userName, password, lon, lat, distance);
		const config = postNearbyPlayersConfig(userName, password, lon, lat, distance)
		const res = await fetch(
			`${SERVER_URL}/gameapi/nearbyplayers`,config).then((res) => res.json());
		// console.log('fetchPostNearbyPlayers, res', res);
		return res;
	}

	async function fetchPostGetpostifreached(postId, lon, lat) {
		console.log('fetchPostGetpostifreached', postId, lon, lat);
		const config = getpostifreached(postId, lon, lat)
		const res = await fetch(
			`${SERVER_URL}/gameapi/getpostifreached`,config).then((res) => res.json());
		console.log('fetchPostGetpostifreached, res', res);
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
		fetchPostNearbyPlayers,
		fetchPostGetpostifreached,
		fetchGameArea,
		isUserInArea
	};
};

export default ServerFacade();
