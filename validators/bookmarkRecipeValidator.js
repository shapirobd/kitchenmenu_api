const jsonschema = require("jsonschema");
const bookmarkRecipeSchema = require("../schemas/bookmarkRecipeSchema.json");
const ExpressError = require("../expressError");

function continueIfValidBookmark(req, next) {
	const result = jsonschema.validate(req.body, bookmarkRecipeSchema);
	if (!result.valid) {
		const errors = result.errors.map((e) => e.stack);
		return next(new ExpressError(errors, 400));
	}
}

module.exports = continueIfValidBookmark;
