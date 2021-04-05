const { Client } = require("pg");
const { DB_URI } = require("./config");

// let db = new Client({
// 	connectionString: DB_URI,
// });
let db = new Client({
	connectionString: DB_URI,
	dialectOptions: {
		rejectUnauthorized: false,
	},
});

db.connect();

module.exports = db;
