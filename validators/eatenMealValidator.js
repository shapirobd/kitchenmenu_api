const jsonschema = require("jsonschema");
const eatenMealSchema = require("../schemas/eatenMealSchema.json");
const ExpressError = require("../expressError");

function continueIfValidEatenMeal(req, next) {
	const result = jsonschema.validate(req.body, eatenMealSchema);
	if (!result.valid) {
		const errors = result.errors.map((e) => e.stack);
		return next(new ExpressError(errors, 400));
	}
}

module.exports = continueIfValidEatenMeal;
