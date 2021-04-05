const jsonschema = require("jsonschema");
const editUserSchema = require("../schemas/editUserSchema.json");
const ExpressError = require("../expressError");

function continueIfValidEdit(req, next) {
	const result = jsonschema.validate(req.body.data, editUserSchema);
	if (!result.valid) {
		const errors = result.errors.map((e) => e.stack);
		return next(new ExpressError(errors, 400));
	}
}

module.exports = continueIfValidEdit;
