/** Express router providing user related routes
 * @module routes/users
 * @requires express
 */

const User = require("../models/user");
const bcrypt = require("bcrypt");
const express = require("express");
const continueIfValidEdit = require("../validators/editUserValidator");
const continueIfValidBookmark = require("../validators/bookmarkRecipeValidator");
const continueIfValidEatenMeal = require("../validators/eatenMealValidator");
const { ensureLoggedIn, authenticateJWT } = require("../middleware/auth");

/**
 * Express router to mount user related functions on.
 * @type {object}
 * @const
 * @namespace users
 */
const router = new express.Router();

/**
 * Route for getting all users from the database.
 * @return {Array} Array of user objects (each object containing username, email, first_name, last_name)
 */
router.get("/", async function (req, res, next) {
	try {
		const users = await User.findAll();
		return res.json(users);
	} catch (e) {
		return next(e);
	}
});

/**
 * Route for finding a user from the databse with a given username
 * @return {Object} Object containing username, email, first_name and last_name of the found user
 */
router.get("/:username", async function (req, res, next) {
	try {
		const user = await User.findOne(req.params.username);
		return res.json(user);
	} catch (e) {
		return next(e);
	}
});

/**
 *  Edit a user's basic information
 * @return {Object} Object containing username, email, first_name, last_name, weight, weight_goal, calorie_goal     				bookmarks and eatenMEals of the editted user
 */
router.patch("/:username", authenticateJWT, async function (req, res, next) {
	try {
		continueIfValidEdit(req, next);
		const resp = await User.editProfile(req.body.data, req.params.username);
		return res.json(resp);
	} catch (e) {
		return next(e);
	}
});

/**
 *  Adds a recipe id to a user's list of bookmarked recipes
 * @return {Object} Object containing success message with recipeId
 */
router.post("/bookmarkRecipe", ensureLoggedIn, async function (req, res, next) {
	try {
		continueIfValidBookmark(req, next);
		const { username, recipeId } = req.body;
		const resp = await User.bookmarkRecipe(username, recipeId);
		return res.json(resp);
	} catch (e) {
		return next(e);
	}
});

/**
 *  Removes a recipe id from a user's list of bookmarked recipes
 * @return {Object} Object containing success message with recipeId
 */
router.post(
	"/unbookmarkRecipe",
	ensureLoggedIn,
	async function (req, res, next) {
		try {
			continueIfValidBookmark(req, next);
			const { username, recipeId } = req.body;
			const resp = await User.unbookmarkRecipe(username, recipeId);
			return res.json(resp);
		} catch (e) {
			return next(e);
		}
	}
);

/**
 *  Finds and returns all bookmarked recipes for a given user
 * @return {Object} Array of all recipe ids that a user has bookmarked
 */
router.get("/:username/getAllBookmarks", async function (req, res, next) {
	try {
		const recipes = await User.getAllBookmarks(req.params.username);
		return res.json(recipes);
	} catch (e) {
		return next(e);
	}
});

/**
 *  Finds and returns all eaten meals for a given user on a given day
 * @return {Object} Array of all recipe ids that a user has eaten on the given date
 */
router.get("/:username/getEatenMeals", async function (req, res, next) {
	try {
		const meals = await User.getEatenMeals(req.params.username, req.query.date);
		return res.json(meals);
	} catch (e) {
		return next(e);
	}
});

/**
 *  Adds a recipe id to a user's list of eaten meals for a given date
 * @return {Object} Object containing success message
 */
router.post("/addEatenMeal", ensureLoggedIn, async function (req, res, next) {
	try {
		continueIfValidEatenMeal(req, next);
		const { username, recipeId, date, nutrients } = req.body;
		const resp = await User.addEatenMeal(username, recipeId, date, nutrients);
		return res.json(resp);
	} catch (e) {
		return next(e);
	}
});

/**
 *  Removes a recipe id from a user's list of eaten meals for a given date
 * @return {Object} Object containing success message
 */
router.post(
	"/removeEatenMeal",
	ensureLoggedIn,
	async function (req, res, next) {
		try {
			continueIfValidEatenMeal(req, next);
			const { username, recipeId, date } = req.body;
			const resp = await User.removeEatenMeal(username, recipeId, date);
			return res.json(resp);
		} catch (e) {
			return next(e);
		}
	}
);

router.delete("/:username", authenticateJWT, async function (req, res, next) {
	try {
		const resp = await User.deleteUser(req.params.username);
		return res.json(resp);
	} catch (e) {
		return next(e);
	}
});

module.exports = router;
