// npm install react-native-base64

import React, { useState, useEffect, useRef } from 'react';
import {
	Text,
	View,
	StyleSheet,
	TouchableHighlight,
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
	const [ position, setPosition ] = useState({ latitude: null, longitude: null });
	const [ errorMessage, setErrorMessage ] = useState(null);
	const [ gameArea, setGameArea ] = useState([]);
	const [ players, setPlayers ] = useState([]);
	const [ region, setRegion ] = useState(null);
	const [ serverIsUp, setServerIsUp ] = useState(false);
	const [ status, setStatus ] = useState('');
	const [ distance, setDistance ] = useState(100000);
	const [ username, setUsername ] = useState('');
	const [ password, setPassword ] = useState('secret');
	const [ nextPostID, setNextPostID ] = useState('Post3');
	const [ post, setPost ] = useState({ postID: 'Post3', task: '', solution: '', isUrl: false });
	const [ showPostModal, setShowPostModal ] = useState(false);
	const [ showAboutModal, setShowAboutModal ] = useState(false);
	const [ showLoginModal, setShowLoginModal ] = useState(false);
	let mapRef = useRef(null);

	useEffect(() => {
		getGameArea();
	}, []);

	useEffect(() => {
		getLocationAsync();
		sendRealPosToServer();
	}, []);

	useEffect(() => {
		const interval = setInterval(() => {
			// getLocationAsync();
			sendRealPosToServer();
		}, 15000);
		return () => clearInterval(interval);
	}, []);

	// useEffect(() => {

	// }, []);

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
		console.log('getPlayers');
		console.log('getPlayers position.longitude, position.latitude', position.longitude, position.latitude);
		try {
			const arrayPlayers = await facade.fetchPostNearbyPlayers(
				username,
				password,
				position.longitude,
				position.latitude,
				distance
			);
			if (arrayPlayers) setPlayers(arrayPlayers);
			// console.log('arrayPlayers', arrayPlayers);
			setServerIsUp(true);
			setErrorMessage('');
		} catch (err) {
			setServerIsUp(false);
			setErrorMessage('Could not fetch Players');
		}
	};

	const checkPosts = async () => {
		console.log('checkPosts');
		console.log('checkPosts position.longitude, position.latitude', position.longitude, position.latitude);
		try {
			const postOrNot = await facade.fetchPostGetpostifreached(post, position.longitude, position.latitude);
			console.log('postOrNot', postOrNot);
			setNextPostID('Post4');
			console.log('next PostId: ', nextPostID);
			setPost(...postOrNot);
			console.log('post reached: ', post);
			if (post.task !== '') {
				setShowPostModal(true);
			}
			setServerIsUp(true);
			setErrorMessage('');
		} catch (err) {
			setServerIsUp(false);
			setErrorMessage('Could not fetch Post');
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
			if(location){
				console.log("getLocationAsync location", location);
				const lat = location.coords.latitude;
				const lon = location.coords.longitude;
				setPosition({ latitude: lat, longitude: lon });
				
				const LATITUD_DELTA=0.0922;
				
				// setRegion({
				// 	latitude: location.coords.latitude,
				// 	longitude: location.coords.longitude,
				// 	latitudeDelta: 0.0922,
				// 	longitudeDelta: 0.04
				// });
			} else{
				console.log("getLocationAsync location -> null")
			}
		} catch (err) {
			console.log('error', err);
		}
	};

	onMapRegionChange = async (event) => {
		// console.log('onMapRegionChange');
		// console.log("event", event)
		setRegion({...event})
	}

	/*
  When a press is done on the map, coordinates (lat,lon) are provided via the event object
  */
	onMapPress = async (event) => {
		//Get location from where user pressed on map, and check it against the server
		const lat = event.nativeEvent.coordinate.latitude;
		const lon = event.nativeEvent.coordinate.longitude;
		console.log('lat lon', lat, lon);

		try {
			
			setRegion({
				latitude: location.coords.latitude,
				longitude: location.coords.longitude,
				latitudeDelta: LATITUD_DELTA,
				longitudeDelta: LONGITUDE_DELTA
			});
			const status = await facade.isUserInArea(username, password, lon, lat);
			console.log('status', status);
			showStatusFromServer(setStatus, status);
			setErrorMessage('');
			setServerIsUp(true);
		} catch (err) {
			setErrorMessage('Server could not be reached');
			setServerIsUp(false);
		}
	};

	onCenterGameArea = async () => {
		try{

			// (RED) Center map around the gameArea fetched from the backend
			console.log('test, oncenter');
			
			//Hardcoded, should be calculated as cPostenter of polygon received from server
			let location = await Location.getCurrentPositionAsync({});
			console.log('onCenterGameArea, location', location);

			const latitude =  location.coords.latitude;
			const longitude =  location.coords.longitude;
			mapRef.current.animateToRegion(
				{
					latitude,
					longitude,
					latitudeDelta: 0.002,
					longitudeDelta: 0.04
				},
				1000
				);
				setErrorMessage('');
				setServerIsUp(true);
			} catch (err) {
				setErrorMessage('Server could not be reached');
				setServerIsUp(false);
			}
	};

	sendRealPosToServer = async () => {
		//Upload users current position to the isuserinarea endpoint and present result
		console.log('sendRealPosToServer');
		try {
			let location = await Location.getCurrentPositionAsync({});
			if(location){
				console.log('sendRealPosToServer location', location);
			} else{
				console.log('sendRealPosToServer location - > null', );
			}
			const lat = location.coords.latitude;
			const lon = location.coords.longitude;

			console.log('sendRealPosToServer', username, password, lon, lat);

			const updated = await facade.fetchPostUpdatePosition(username, password, lon, lat);
			if(updated){
				console.log('sendRealPosToServer updated', updated);
			} else{
				console.log('sendRealPosToServer updated - > null', );
			}

			getPlayers();
			// checkPosts();

			const status = await facade.isUserInArea(username, password, lon, lat);
			if(status){
				console.log('sendRealPosToServer status', status);
			} else{
				console.log('sendRealPosToServer status - > null', );
			}
			showStatusFromServer(setStatus, status);
			setErrorMessage('');
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
					mapType="hybrid"
					region={region}
					showsUserLocation
					showsCompass
					showsTraffic
					showsBuildings
					onRegionChangeComplete={onMapRegionChange}
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
						<Text style={{color: "white", paddingBottom:9}}>me</Text>
					</MapView.Marker>

					{Array.isArray(players) &&
						players.length > 0 &&
						players.map((player) => {
							return (
								<MapView.Marker
									key={player.userName}
									coordinate={{ longitude: player.lon, latitude: player.lat }}
								>
									<Text style={{color: "yellow"}}>{player.userName}</Text>
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

			{/* <MyButton
				style={{ flex: 2 }}
				onPressButton={sendRealPosToServer}
				txt="Upload Position and see other players"
			/> */}
			<Text style={{ flex: 1, textAlign: 'center', fontWeight: 'bold' }} >Position uploaded every 30 seconds</Text>
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

			<Modal visible={showPostModal} animationType="slide">
				<View style={styles.inputContainer}>
					<TextInput
						placeholder="Username"
						style={styles.input}
						onChangeText={userInputHandler}
						value={username}
						autoFocus={true}
					/>
					<View style={styles.buttonContainer}>
						<View style={styles.button}>
							<Button
								title="ANSWER"
								onPress={() => {
									setShowPostModal(false);
								}}
							/>
						</View>
					</View>
				</View>
			</Modal>
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
						<Text style={{ textAlign: 'center' }}>Mulige brugere alle med kodeordet secret</Text>
						<Text style={{ textAlign: 'center' }}>t1, t2, t3 og andre.</Text>
						<Text style={{ textAlign: 'center' }}>t1-3 er permanente</Text>
						<Text></Text>
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
