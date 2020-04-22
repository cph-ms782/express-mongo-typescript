// npm install react-native-base64

import React, { useState, useEffect, useRef } from 'react';
import {
	Platform,
	Text,
	View,
	StyleSheet,
	Dimensions,
	TouchableHighlight,
	Alert,
	Modal,
	TextInput,
	Button
} from 'react-native';
import * as Location from 'expo-location';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import Constants from 'expo-constants';
import facade from './serverFacade';

const MyButton = ({ txt, onPressButton }) => {
	return (
		<TouchableHighlight style={styles.touchable} onPress={onPressButton}>
			<Text style={styles.touchableTxt}>{txt}</Text>
		</TouchableHighlight>
	);
};

export default (App = () => {
	//HOOKS
	const [ position, setPosition ] = useState({ latitude: null, longitude: null });
	const [ errorMessage, setErrorMessage ] = useState(null);
	const [ gameArea, setGameArea ] = useState([]);
	const [ players, setPlayers ] = useState([]);
	const [ region, setRegion ] = useState(null);
	const [ serverIsUp, setServerIsUp ] = useState(false);
	const [ status, setStatus ] = useState('');
	const [ distance, setDistance ] = useState(100000);
	const [ username, setUsername ] = useState('admin');
	const [ password, setPassword ] = useState('secret');
	const [ showLoginModal, setShowLoginModal ] = useState(false);
	const [ showAboutModal, setShowAboutModal ] = useState(false);
	let mapRef = useRef(null);

	useEffect(() => {
		getGameArea();
	}, []);

	useEffect(() => {
		getLocationAsync();
	}, []);

	const userInputHandler = (eventText) => {
		setUsername(eventText);
	};

	const passwordInputHandler = (eventText) => {
		setPassword(eventText);
	};

	const cancelAuthHandler = () => {
		setShowLoginModal(false);
		setUsername('');
		setPassword('');
	};

	const getGameArea = async () => {
		try {
			const area = await facade.fetchGameArea(username, password);
			setGameArea(area);
			setServerIsUp(true);
		} catch (err) {
			setErrorMessage('Could not fetch GameArea');
		}
	};

	const getPlayers = async () => {
		try {
			const arrayPlayers = await facade.fetchPostNearbyPlayers(
				username,
				password,
				position.longitude,
				position.latitude,
				distance
			);
			if (arrayPlayers) setPlayers(arrayPlayers);
			console.log('arrayPlayers', arrayPlayers);
			setServerIsUp(true);
		} catch (err) {
			setErrorMessage('Could not fetch Players');
		}
	};

	getLocationAsync = async () => {
		try {
			let { status } = await Location.requestPermissionsAsync();
			if (status !== 'granted') {
				setErrorMsg('Permission to access location was denied');
				return;
			}

			let location = await Location.getCurrentPositionAsync({});
			// console.log(location);
			const lat = location.coords.latitude;
			const lon = location.coords.longitude;
			setPosition({ latitude: lat, longitude: lon });

			setRegion({
				latitude: location.coords.latitude,
				longitude: location.coords.longitude,
				latitudeDelta: 0.0722,
				longitudeDelta: 0.0321
			});
		} catch (err) {
			console.log('error', err);
		}
	};

	/*
  When a press is done on the map, coordinates (lat,lon) are provided via the event object
  */
	onMapPress = async (event) => {
		//Get location from where user pressed on map, and check it against the server
		const lat = event.nativeEvent.coordinate.latitude;
		const lon = event.nativeEvent.coordinate.longitude;
		console.log('lat lon', lat, lon);

		try {
			const status = await facade.isUserInArea(username, password, lon, lat);
			console.log('status', status);
			showStatusFromServer(setStatus, status);
		} catch (err) {
			Alert.alert('Error', 'Server could not be reached ' + err);
			setServerIsUp(false);
		}
	};

	onCenterGameArea = () => {
		// (RED) Center map around the gameArea fetched from the backend
		console.log('test, oncenter');

		//Hardcoded, should be calculated as center of polygon received from server
		const latitude = 55.777055745928664;
		const longitude = 12.55897432565689;
		mapRef.current.animateToRegion(
			{
				latitude,
				longitude,
				latitudeDelta: 0.002,
				longitudeDelta: 0.04
			},
			1000
		);
	};

	sendRealPosToServer = async () => {
		//Upload users current position to the isuserinarea endpoint and present result
		console.log('test, realposition');
		const lat = position.latitude;
		const lon = position.longitude;
		try {
			console.log('test', username, password, lon, lat);
			const updated = await facade.fetchPostUpdatePosition(username, password, lon, lat);
			console.log('updated', updated);
			const status = await facade.isUserInArea(username, password, lon, lat);
			getPlayers();
			showStatusFromServer(setStatus, status);
			setServerIsUp(true);
		} catch (err) {
			console.log('err', err);
			setErrorMessage('Could not get result from server');
			setServerIsUp(false);
		}
	};

	const info = serverIsUp ? status : ' Server is not up';
	const err = errorMessage ? errorMessage : '';

	return (
		<View style={{ flex: 1, paddingTop: 20 }}>
			{!region && <Text style={styles.fetching}>.. Fetching data</Text>}

			{region && (
				<MapView
					ref={mapRef}
					style={{ flex: 14 }}
					onPress={onMapPress}
					mapType="standard"
					region={region}
					showsUserLocation
					showsCompass
					showsTraffic
					showsBuildings
				>
					{serverIsUp && (
						<MapView.Polygon
							coordinates={gameArea}
							strokeWidth={1}
							onPress={onMapPress}
							fillColor="rgba(128, 153, 177, 0.5)"
						/>
					)}

					<MapView.Marker
						key="mig"
						coordinate={{ longitude: position.longitude, latitude: position.latitude }}
					>
						<Text>me</Text>
					</MapView.Marker>
					{Array.isArray(players) &&
						players.length > 0 &&
						players.map((player) => {
							return (
								<MapView.Marker
									key={player.userName}
									coordinate={{ longitude: player.lon, latitude: player.lat }}
								>
									<Text>{player.userName}</Text>
								</MapView.Marker>
							);
						})}
				</MapView>
			)}

			<Text style={{ flex: 1, textAlign: 'center', fontWeight: 'bold' }}>
				Your position (lat,long): {position.latitude}, {position.longitude}
			</Text>

			<Text style={{ flex: 1, textAlign: 'center' }}>{info}</Text>
			<Text style={{ flex: 1, textAlign: 'center' }}>{err}</Text>

			<MyButton style={{ flex: 2 }} onPressButton={sendRealPosToServer} txt="Upload Position and see other players" />

			<MyButton style={{ flex: 2 }} onPressButton={onCenterGameArea} txt="Show Game Area" />

			<View style={{ flexDirection: 'row', justifyContent: 'center' }}>
				<MyButton
					style={{ flex: 2, color: '#4682B4' }}
					onPressButton={() => setShowAboutModal(true)}
					txt="About"
				/>
				<MyButton
					style={{ flex: 2, backgroundColor: 'red' }}
					onPressButton={() => setShowLoginModal(true)}
					txt="Login"
				/>
			</View>

			<Modal visible={showAboutModal} animationType="slide">
				<View style={styles.button}>
					<Text style={styles.aboutText}>cph-ms782</Text>
					<Text style={styles.aboutText}>Martin Bøgh Sander-Thomsen</Text>
					<View style={{ paddingTop: 20 }}>
						<Button
							title="RETURN"
							color="green"
							onPress={() => {
								setShowAboutModal(false);
							}}
						/>
					</View>
				</View>
			</Modal>
			<Modal visible={showLoginModal} animationType="slide">
				<View style={styles.inputContainer}>
					<TextInput
						placeholder="Username"
						style={styles.input}
						onChangeText={userInputHandler}
						value={username}
						autoFocus={true}
					/>
					<TextInput
						placeholder="Password"
						style={styles.input}
						onChangeText={passwordInputHandler}
						value={password}
						autoFocus={true}
					/>
					<View style={styles.buttonContainer}>
						<View style={styles.button}>
							<Button
								title="LOGIN"
								onPress={() => {
									setShowLoginModal(false);
								}}
							/>
						</View>
						<View style={styles.button}>
							<Button title="CANCEL" color="red" onPress={cancelAuthHandler} />
						</View>
					</View>
				</View>
			</Modal>
		</View>
	);
});

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		paddingTop: Constants.statusBarHeight,
		backgroundColor: '#ecf0f1'
	},
	touchable: { backgroundColor: '#4682B4', margin: 3 },
	touchableTxt: { fontSize: 22, textAlign: 'center', padding: 5 },
	inputContainer: {
		flex: 1,
		flexDirection: 'column',
		padding: 100,
		justifyContent: 'flex-start',
		alignItems: 'center'
	},
	input: { width: '80%', borderColor: 'black', borderWidth: 1, padding: 10, marginBottom: 10 },
	aboutText: { textAlign: 'center', fontSize: 20, fontWeight: 'bold', padding: 10 },
	fetching: {
		fontSize: 35,
		flex: 14,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		paddingTop: Constants.statusBarHeight
	},
	paragraph: {
		margin: 24,
		fontSize: 18,
		textAlign: 'center'
	}
});

function showStatusFromServer(setStatus, status) {
	setStatus(status.msg);
	setTimeout(() => setStatus('- - - - - - - - - - - - - - - - - - - -'), 3000);
}
