const db = require("../db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR, SECRET_KEY, DB_URI } = require("../config");
const { default: axios } = require("axios");
const convertDate = require("../helpers/convertDate");
const { getUserBookmarks, getUserEatenMeals } = require("../helpers/userModel");

/**
 *  User model with the following static methods:
 * @method register - inserts new user into database
 * @method authenticate - confirms username & password correspond to user from database
 * @method findAll - gets all users from the database
 * @method findOne - gets one user from the databse (by username)
 * @method editProfile - modifies data on a single user from the database
 * @method bookmarkRecipe - adds a recipe to a user's bookmarks in the database
 * @method unbookmarkRecipe - removes a recipe from a user's bookmarks in the database
 * @method getAllBookmarks - gets all recipes that a single user has bookmarked
 * @method getEatenMeals - gets all recipes that a single user has eaten on a specific date
 * @method addEatenMeal - adds a recipe to a user's eaten meals in the database for a specific date
 * @method removeEatenMeal - removes a recipe from a user's eaten meals in the database for a specific date
 */
class User {
	/**
	 *  Inserts a new user into the database with hashed password
	 * @param {Object} (contains username, email, first_name, last_name, weight, weight_goal, calorie_goal)
	 * @return {Object} User object (contains username, email, first_name, last_name, weight, weight_goal, calorie_goal)
	 */
	static async register({
		username,
		password,
		email,
		first_name,
		last_name,
		weight,
		weight_goal,
		calorie_goal,
	}) {
		const hashedPwd = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
		const results = await db.query(
			`
            INSERT INTO users (username, password, email, first_name, last_name, weight, weight_goal, calorie_goal)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING username, email, first_name, last_name, weight, weight_goal, calorie_goal
        `,
			[
				username,
				hashedPwd,
				email,
				first_name,
				last_name,
				+weight,
				+weight_goal,
				+calorie_goal,
			]
		);
		const user = results.rows[0];
		user.bookmarks = [];
		user.eatenMeals = {};
		return user;
	}

	/**
	 *  Checks that the passed username & password correlate to a username & hashed password
	 * 				from the users table.
	 * @param {String} username the username that the user has entered in to the login form
	 * @param {String} password the password that the user has entered in to the login for
	 * @return {Object} User object (contains username, email, first_name, last_name, weight, weight_goal, calorie_goal, * 					bookmarks, eatenMeals)
	 */
	static async authenticate(username, password) {
		const userRes = await db.query(
			`
            SELECT * 
            FROM users
            WHERE username=$1
        `,
			[username]
		);
		const user = userRes.rows[0];
		if (user) {
			if (await bcrypt.compare(password, user.password)) {
				user.bookmarks = await getUserBookmarks(db, username);
				user.eatenMeals = await getUserEatenMeals(db, username);
				delete user.password;
				return user;
			}
		}
		return false;
	}

	/**
	 *  Finds and returns all users from the database.
	 * @return {Array} Array of user objects (each object containing username, email, first_name, last_name)
	 */
	static async findAll() {
		const userRes = await db.query(
			`
            SELECT username,
                email,
                first_name,
                last_name
            FROM users
            ORDER BY username;
        `
		);

		return userRes.rows;
	}

	/**
	 *  Finds a user from the databse with a given username
	 * @param {String} username The username of the user that we are trying to find
	 * @return {Object} Object containing username, email, first_name and last_name of the found user
	 */
	static async findOne(username) {
		const userRes = await db.query(
			`
            SELECT username,
                email,
                first_name,
                last_name
            FROM users 
            WHERE username=$1
            `,
			[username]
		);

		const user = userRes.rows[0];
		user.bookmarks = await getUserBookmarks(db, username);
		user.eatenMeals = await getUserEatenMeals(db, username);
		return user;
	}

	/**
	 *  Edit a user's basic information
	 * @param {Object} data Contains the new email, first_name, last_name, weight, weight_goal and calorie_goal
	 * @param {String} username The username of the user that we are trying to edit
	 * @return {Object} Object containing username, email, first_name, last_name, weight, weight_goal, calorie_goal, *   *     				bookmarks and eatenMEals of the editted user
	 */
	static async editProfile(data, username) {
		let query = "";
		let count = 1;

		Object.keys(data).map((key, idx) => {
			query += `${key}=$${count}`;
			idx === Object.keys(data).length - 1 ? (query += " ") : (query += ", ");
			count++;
		});

		const userRes = await db.query(
			`
			UPDATE users
			SET ${query}
			WHERE username=$${count}
			RETURNING username, email, first_name, last_name, weight, weight_goal, calorie_goal
			`,
			[...Object.values(data), username]
		);

		const user = userRes.rows[0];
		user.bookmarks = await getUserBookmarks(db, username);
		user.eatenMeals = await getUserEatenMeals(db, username);
		return user;
	}

	/**
	 *  Adds a recipe id to a user's list of bookmarked recipes
	 * @param {String} username The username of the user whose bookmarks we are adding to
	 * @param {Number} recipeId The id of the recipe being bookmarked
	 * @return {Object} Object containing success message with recipeId
	 */
	static async bookmarkRecipe(username, recipeId) {
		await db.query(
			`
			INSERT INTO bookmarks (username, meal_id)
			VALUES ($1, $2)
			`,
			[username, recipeId]
		);
		return { message: `Bookmarked recipe ${recipeId}` };
	}

	/**
	 *  Removes a recipe id from a user's list of bookmarked recipes
	 * @param {String} username The username of the user whose bookmarks we are removing from
	 * @param {Number} recipeId The id of the recipe being unbookmarked
	 * @return {Object} Object containing success message with recipeId
	 */
	static async unbookmarkRecipe(username, recipeId) {
		await db.query(
			`
			DELETE FROM bookmarks 
			WHERE username=$1 AND meal_id=$2
			`,
			[username, recipeId]
		);
		return { message: `Unbookmarked recipe ${recipeId}` };
	}

	/**
	 *  Finds and returns all bookmarked recipes for a given user
	 * @param {String} username The username of the user whose bookmarks we are looking for
	 * @return {Object} Array of all recipe ids that a user has bookmarked
	 */
	static async getAllBookmarks(username) {
		const results = await db.query(
			`
			SELECT meal_id FROM bookmarks
			WHERE username=$1
			`,
			[username]
		);
		return results.rows.map((meal) => meal.meal_id);
	}

	/**
	 *  Finds and returns all eaten meals for a given user on a given day
	 * @param {String} username The username of the user whose eaten meals we are looking for
	 * @param {String} date The date that the desired meals were eaten by the user ("YYYY-MM-DD")
	 * @return {Object} Array of all recipe ids that a user has eaten on the given date
	 */
	static async getEatenMeals(username, date) {
		const results = await db.query(
			`
			SELECT um.meal_id FROM users
			JOIN users_meals AS um 
			ON users.username = um.username
			WHERE users.username=$1 AND um.date=$2
			`,
			[username, date]
		);
		return results.rows.map((meal) => meal.meal_id);
	}

	/**
	 *  Adds a recipe id to a user's list of eaten meals for a given date
	 * @param {String} username The username of the user whose eaten meals we are adding to
	 * @param {Number} recipeId The id of the recipe being added
	 * @param {String} date The date that the user ate this meal
	 * @return {Object} Object containing success message
	 */
	static async addEatenMeal(username, recipeId, date, nutrients) {
		const { calories, fat, carbs, protein } = nutrients;

		await db.query(
			`
			INSERT INTO meals 
			(id, calories, fat, carbs, protein)
			VALUES ($1, $2, $3, $4, $5)
			ON CONFLICT (id)
			DO NOTHING
			`,
			[recipeId, calories, fat, carbs, protein]
		);

		await db.query(
			`
			INSERT INTO users_meals 
			(username, meal_id, date)
			VALUES ($1, $2, $3)
			`,
			[username, recipeId, date]
		);
		return { message: "Meal eaten" };
	}
	/**
	 *  Removes a recipe id from a user's list of eaten meals for a given date
	 * @param {String} username The username of the user whose eaten meals we are removing from
	 * @param {Number} recipeId The id of the recipe being removed
	 * @param {String} date The date that the user ate this meal
	 * @return {Object} Object containing success message
	 */
	static async removeEatenMeal(username, recipeId, date) {
		await db.query(
			`
			DELETE FROM users_meals 
			WHERE username=$1 AND meal_id=$2 AND date=$3
			`,
			[username, recipeId, date]
		);
		await db.query(
			`
			DELETE FROM meals 
			WHERE id=$1
			`,
			[recipeId]
		);
		return { message: "Meal deleted" };
	}

	static async deleteUser(username) {
		await db.query(
			`
			DELETE FROM users_meals WHERE username=$1
		`,
			[username]
		);
		await db.query(
			`
			DELETE FROM bookmarks WHERE username=$1
		`,
			[username]
		);
		await db.query(
			`
			DELETE FROM users WHERE username=$1
		`,
			[username]
		);
		return { message: "User deleted" };
	}
}

module.exports = User;
