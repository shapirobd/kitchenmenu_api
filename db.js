const { Client } = require("pg");
const { DB_URI } = require("./config");

// let db = new Client({
// 	connectionString: DB_URI,
// });
let db = new Client({
	connectionString: DB_URI,
	dialect: "postgres",
	dialectOptions: {
		ssl: { require: true },
	},
});

db.connect();

module.exports = db;
