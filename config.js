require("dotenv").config();

let DB_URI = `postgresql://`;

if (process.env.NODE_ENV === "test") {
	DB_URI = `${DB_URI}/kitchen_menu_test`;
} else if (process.env.NODE_ENV === "production") {
	DB_URI = `${process.env.DATABASE_URL}`;
} else {
	DB_URI = `${DB_URI}/kitchen_menu`;
}

const BCRYPT_WORK_FACTOR = 12;
const SECRET_KEY = process.env.SECRET_KEY;
module.exports = { DB_URI, BCRYPT_WORK_FACTOR, SECRET_KEY };
