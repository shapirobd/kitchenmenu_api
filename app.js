const usersRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");
const express = require("express");
const ExpressError = require("./expressError");
const cors = require("cors");
const path = require("path");

const app = express();

const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

app.use("/users", usersRoutes);
app.use("/auth", authRoutes);

app.get("/", (req, res, next) => {
	return res.json({});
});

// 404 handler
app.use(function (req, res, next) {
	const err = new ExpressError(`Not found`, 404);
	return next(err);
});

// general error handler
app.use(function (err, req, res, next) {
	res.status(err.status || 500);

	return res.json({
		error: err,
		message: err.message,
	});
});

app.listen(port, () => {
	console.log(`Server listening on port ${port}.`);
});

// module.exports = function (app) {
// 	// add other server routes to path array
// 	app.use(proxy(["/users/register"], { target: "http://localhost:5000" }));
// };

module.exports = app;
