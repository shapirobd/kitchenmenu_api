/** Middleware for handling req authorization for routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const ExpressError = require("../expressError");

/** Auth JWT token, add auth'd user (if any) to req. */

function authenticateJWT(req, res, next) {
	try {
		const tokenFromBody = req.body._token;
		jwt.verify(tokenFromBody, SECRET_KEY);
		return next();
	} catch (err) {
		// error in this middleware isn't error -- continue on
		return next();
	}
}

/** Require user or raise 401 */

function ensureLoggedIn(req, res, next) {
	if (!req.body.username) {
		const err = new ExpressError("Unauthorized", 401);
		return next(err);
	} else {
		return next();
	}
}

module.exports = {
	authenticateJWT,
	ensureLoggedIn,
};
