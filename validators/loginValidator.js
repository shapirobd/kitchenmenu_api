const jsonschema = require("jsonschema");
const loginSchema = require("../schemas/loginSchema.json");
const ExpressError = require("../expressError");

function continueIfValidLogin(req, next) {
	const result = jsonschema.validate(req.body, loginSchema);
	if (!result.valid) {
		const errors = result.errors.map((e) => e.stack);
		return next(new ExpressError(errors, 400));
	}
}

module.exports = continueIfValidLogin;
