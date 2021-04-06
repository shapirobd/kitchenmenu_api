const { Client } = require("pg");
const { DB_URI } = require("./config");

// let db = new Client({
// 	connectionString: DB_URI,
// });

const clientSettings = {
	connectionString: DB_URI,
};

if (process.env.NODE_ENV === "production") {
	clientSettings.ssl = {
		rejectUnauthorized: false,
	};
}

// let db = new Client({
// 	connectionString: DB_URI,
// 	ssl: {
// 		rejectUnauthorized: false,
// 	},
// });
let db = new Client(clientSettings);

db.connect();

module.exports = db;
