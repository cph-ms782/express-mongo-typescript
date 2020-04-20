import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button, FlatList, TouchableOpacity, Modal } from 'react-native';
import uuid from 'uuid/v4';

export default function App() {
	const [ enteredGoal, setEnteredGoal ] = useState('');
	const [ courseGoals, setCourseGoals ] = useState([]);
	const [ isAddMode, setIsAddMode ] = useState(false);

	const goalInputHandler = (enteredText) => {
		setEnteredGoal(enteredText);
	};

	const addGoalHandler = () => {
		setCourseGoals((currentGoals) => [ ...currentGoals, { key: uuid(), value: enteredGoal } ]);
		setIsAddMode(false);
		setEnteredGoal('');
		// setCourseGoals((currentGoals) => [ ...currentGoals, { key: Math.random().toString(), value: enteredGoal } ]);
	};

	const cancelGoalAdditionHandler = () => {
		setIsAddMode(false);
	};

	const removeGoalHandler = (goalId) => {
		setCourseGoals((currentGoals) => {
			return currentGoals.filter((goal) => goal.key !== goalId);
		});
	};

	return (
		<View style={styles.screen}>
			<Button
				title="Add new goal"
				onPress={() => {
					setIsAddMode(true);
				}}
			/>
			<FlatList
				data={courseGoals}
				renderItem={(itemData) => (
					<TouchableOpacity onPress={removeGoalHandler.bind(this, itemData.item.key)}>
						<View style={styles.listItems}>
							<Text>{itemData.item.value}</Text>
						</View>
					</TouchableOpacity>
				)}
			/>
			<Modal visible={isAddMode} animationType="slide">
				<View style={styles.inputContainer}>
					<TextInput
						placeholder="Course Goal"
						style={styles.input}
						onChangeText={goalInputHandler}
						value={enteredGoal}
					/>
					<View style={styles.buttonContainer}>
						<View style={styles.button}><Button title="ADD" onPress={addGoalHandler} /></View>
						<View style={styles.button}><Button title="CANCEL" color="red" onPress={cancelGoalAdditionHandler} /></View>
					</View>
				</View>
			</Modal>
		</View>
	);
}

const styles = StyleSheet.create({
	screen: { padding: 50 },
	inputContainer: { flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center' },
	input: { width: '80%', borderColor: 'black', borderWidth: 1, padding: 10, marginBottom: 10 },
	listItems: { marginVertical: 5, backgroundColor: '#ccc', borderColor: 'black', borderWidth: 1 },
  buttonContainer: { flexDirection: 'row', width: '60%', justifyContent: 'space-around' },
  button: {width: '40%'}
});
