const jsonschema = require("jsonschema");
const registerSchema = require("../schemas/registerSchema.json");
const ExpressError = require("../expressError");

function continueIfValidRegister(req, next) {
	const result = jsonschema.validate(req.body, registerSchema);
	if (!result.valid) {
		const errors = result.errors.map((e) => e.stack);
		return next(new ExpressError(errors, 400));
	}
}

module.exports = continueIfValidRegister;
