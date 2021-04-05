// const app = require("./app");
// const path = require("path");
// const express = require("express");

// Have Node serve the files for our built React app
// app.use(express.static(path.resolve(__dirname, "./front-end/build")));

// Handle GET requests to /api route
// app.get("/api", (req, res) => {
// 	res.json({ message: "Hello from server!" });
// });

// All other GET requests not handled before will return our React app
// app.get("*", (req, res) => {
// 	res.sendFile(path.resolve(__dirname, "./front-end/build", "index.html"));
// });

// app.listen(process.env.PORT || 5000, () => {
// 	console.log("Server listening on port 5000.");
// });
