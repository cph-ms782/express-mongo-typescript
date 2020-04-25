const currentDateTime = () => {
	let currentdate = new Date();
	let month = String(currentdate.getUTCMonth() + 1);
	if (month.length == 1) {
		month = '0' + month;
	}

	let day = String(currentdate.getUTCDate());
	if (day.length == 1) {
		day = '0' + day;
	}

	let hours = String(currentdate.getUTCHours());
	// console.log('hours', hours);
	if (hours.length == 1) {
		hours = '0' + hours;
	}
	// console.log('hours', hours);

	let minutes = String(currentdate.getUTCMinutes());
	// console.log('minutes', minutes);
	if (minutes.length == 1) {
		minutes = '0' + minutes;
	}
	// console.log('minutes', minutes);

	let seconds = String(currentdate.getUTCSeconds());
	// console.log('seconds', seconds);
	if (seconds.length == 1) {
		seconds = '0' + seconds;
	}
	seconds += '.000';
	// console.log('seconds', seconds);

	const dt =
		String(currentdate.getUTCFullYear()) +
		'-' +
		month +
		'-' +
        day + 'T' +
		hours +
		':' +
		minutes+
		':' +
		seconds +
		"+00:00";
	console.log("current datetime: ", dt);
	return dt;
};
// currentDateTime();
export default currentDateTime;
