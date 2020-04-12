
function myCORS(req: any, res: any, next: Function) {
	res.header("Access-Control-Allow-Origin","*");
	res.header("Access-Control-Allow-Headers","Origin, X-Requested-With, Content-Type, Accept");
	next();
}

module.exports = myCORS;