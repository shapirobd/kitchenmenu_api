const express = require("express");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const ExpressError = require("../expressError");
const continueIfValidRegister = require("../validators/registerValidator");
const continueIfValidLogin = require("../validators/loginValidator");

const router = new express.Router();

/**
 * POST route to register a new user by adding them to the database
 * If successful, return object containing user's information
 * If unsuccessful, throw error
 *
 * req.body should include:
 * - username
 * - password
 * - email
 * - first_name
 * - last_name
 * - weight
 * - weight_goal
 * - calorie_goal
 */

router.post("/register", async function (req, res, next) {
	try {
		console.log("INITIAL!");
		continueIfValidRegister(req, next);
		console.log("2. VALID");
		const user = await User.register(req.body);
		console.log("3. ", user);
		console.log(SECRET_KEY);
		const token = jwt.sign({ username: user.username }, SECRET_KEY);
		console.log("4. ", token);
		return res.json({ user, token });
	} catch (e) {
		return next(e);
	}
});

/**
 * POST route to validate a given username and password
 * If successful, return object containing user's information
 * If unsuccessful, throw 404 error
 *
 * req.body should include:
 * - username
 * - password
 */
router.post("/login", async function (req, res, next) {
	try {
		console.log(req);
		continueIfValidLogin(req, next);
		const { username, password } = req.body;
		const user = await User.authenticate(username, password);
		if (user) {
			const token = jwt.sign({ username }, SECRET_KEY);
			return res.json({ user, token });
		} else {
			throw new ExpressError("User not found", 404);
		}
	} catch (e) {
		return next(e);
	}
});

module.exports = router;
