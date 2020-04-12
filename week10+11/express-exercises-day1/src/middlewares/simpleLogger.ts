// A Simple Application-logger for the app

// a)
function simpleLogger(req: any, res: any, next: Function) {
	//middleware når Next er med
	console.log(new Date(), req.method, req.hostname);
	next();
}

// b)
module.exports = simpleLogger;
