process.env.NODE_ENV === "test";

const app = require("../app");
const request = require("supertest");
const User = require("../models/user");
const axios = require("axios");
const { Client } = require("pg");
const { DB_URI, SECRET_KEY } = require("../config");
const jwt = require("jsonwebtoken");

let db = new Client({
	connectionString: DB_URI,
});

db.connect();

const user1 = {
	username: "username1",
	password: "password1",
	email: "email1@gmail.com",
	first_name: "Bob",
	last_name: "Smith",
	weight: 170,
	weight_goal: 160,
	calorie_goal: 2000,
};
const user1EditData = {
	email: "email12345@gmail.com",
	first_name: "Bobby",
	last_name: "Smitherson",
	weight: 175,
	weight_goal: 160,
	calorie_goal: 1900,
};
const user2 = {
	username: "username2",
	password: "password2",
	email: "email2@gmail.com",
	first_name: "Jane",
	last_name: "Doe",
	weight: 130,
	weight_goal: 115,
	calorie_goal: 1700,
};
const bookmarks1 = [716627, 716408, 716426, 715594, 715497];

const eatenMeals1 = {
	"2021-03-14": [652423, 660306],
	"2021-03-15": [715424, 662670],
	"2021-03-16": [716195, 663559],
	"2021-03-17": [633942, 715521],
};

const addBookmarks = async (bookmarks, user) => {
	for (let id of bookmarks) {
		await User.bookmarkRecipe(user.username, id);
	}
};

const addEatenMeals = async (eatenMeals, user) => {
	for (let date in eatenMeals) {
		for (let id of eatenMeals[date]) {
			await User.addEatenMeal(user.username, id, date, {
				calories: 500,
				protein: 30,
				carbs: 40,
				fat: 20,
			});
		}
	}
};

let token;

beforeEach(async () => {
	await db.query("DELETE FROM users_meals");
	await db.query("DELETE FROM bookmarks");
	await db.query("DELETE FROM users");
	await User.register(user1);
	token = jwt.sign({ username: user1.username }, SECRET_KEY);
});

describe("GET / route", () => {
	it("should return JSON of all users", async () => {
		await User.register(user2);
		const resp = await request(app).get("/users");
		expect(resp.body).toEqual([
			{
				username: user1.username,
				email: user1.email,
				first_name: user1.first_name,
				last_name: user1.last_name,
			},
			{
				username: user2.username,
				email: user2.email,
				first_name: user2.first_name,
				last_name: user2.last_name,
			},
		]);
	});
});
describe("GET /:username route", () => {
	it("should return information on a single user", async () => {
		const resp = await request(app).get(`/users/${user1.username}`);
		expect(resp.body).toEqual({
			username: user1.username,
			email: user1.email,
			first_name: user1.first_name,
			last_name: user1.last_name,
			bookmarks: [],
			eatenMeals: {},
		});
	});
});
describe("PATCH /:username route", () => {
	it("should update information on a single user", async () => {
		const resp = await request(app)
			.patch(`/users/${user1.username}`)
			.send({ data: user1EditData, _token: token });

		expect(resp.body).toEqual({
			username: user1.username,
			email: user1EditData.email,
			first_name: user1EditData.first_name,
			last_name: user1EditData.last_name,
			weight: user1EditData.weight,
			weight_goal: user1EditData.weight_goal,
			calorie_goal: user1EditData.calorie_goal,
			bookmarks: [],
			eatenMeals: {},
		});
	});
	it("should throw error if request body doesn't match json schema", async () => {
		const resp = await request(app)
			.patch(`/users/${user1.username}`)
			.send({ _token: token, data: {} });

		expect(resp.status).toEqual(400);
		expect(resp.body.message).toEqual([
			'instance requires property "email"',
			'instance requires property "first_name"',
			'instance requires property "last_name"',
			'instance requires property "weight"',
			'instance requires property "weight_goal"',
			'instance requires property "calorie_goal"',
		]);
	});
});
describe("POST /bookmarkRecipe route", () => {
	it("should add a recipe to a user's bookmarks", async () => {
		const resp = await request(app)
			.post(`/users/bookmarkRecipe`)
			.send({ username: user1.username, recipeId: bookmarks1[1] });
		expect(resp.body).toEqual({ message: "Bookmarked recipe 716408" });

		const user = await db.query(
			`SELECT meal_id FROM bookmarks WHERE username=$1`,
			[user1.username]
		);
		expect(user.rows[0]).toEqual({ meal_id: 716408 });
	});
	it("should throw error if request body doesn't match json schema", async () => {
		const resp = await request(app)
			.post(`/users/bookmarkRecipe`)
			.send({ username: user1.username });

		expect(resp.status).toEqual(400);
		expect(resp.body.message).toEqual([
			'instance requires property "recipeId"',
		]);
	});
	it("should throw error if username not included in request body", async () => {
		const resp = await request(app).post(`/users/bookmarkRecipe`).send({});

		expect(resp.status).toEqual(401);
	});
});
describe("POST /unbookmarkRecipe route", () => {
	it("should remove a recipe from a user's bookmarks", async () => {
		await User.bookmarkRecipe(user1.username, bookmarks1[2]);
		const resp = await request(app)
			.post(`/users/unbookmarkRecipe`)
			.send({ username: user1.username, recipeId: bookmarks1[2] });
		expect(resp.body).toEqual({ message: "Unbookmarked recipe 716426" });

		const user = await db.query(
			`SELECT meal_id FROM bookmarks WHERE username=$1`,
			[user1.username]
		);
		expect(user.rows.length).toBe(0);
	});
	it("should throw error if request body doesn't match json schema", async () => {
		const resp = await request(app)
			.post(`/users/unbookmarkRecipe`)
			.send({ username: user1.username });

		expect(resp.status).toEqual(400);
		expect(resp.body.message).toEqual([
			'instance requires property "recipeId"',
		]);
	});
	it("should throw error if request body doesn't contain username", async () => {
		const resp = await request(app).post(`/users/unbookmarkRecipe`).send({});

		expect(resp.status).toEqual(401);
	});
});
describe("GET /:username/getAllBookmarks route", () => {
	it("should get all recipes that a user has bookmarked", async () => {
		await addBookmarks(bookmarks1, user1);
		const resp = await request(app).get(
			`/users/${user1.username}/getAllBookmarks`
		);
		expect(resp.body).toEqual(bookmarks1);
	});
});
describe("GET /:username/getEatenMeals route", () => {
	it("should get all meals that a user has eaten for a specific date", async () => {
		await addEatenMeals(eatenMeals1, user1);
		for (let date in eatenMeals1) {
			const resp = await request(app).get(
				`/users/${user1.username}/getEatenMeals?date=${date}`
			);
			expect(resp.body).toEqual(eatenMeals1[date]);
		}
	});
});
describe("POST /addEatenMeal route", () => {
	it("should add a meal to a user's eaten meals", async () => {
		const resp = await request(app)
			.post(`/users/addEatenMeal`)
			.send({
				username: user1.username,
				recipeId: bookmarks1[0],
				date: "2021-03-14",
				nutrients: {
					calories: 500,
					protein: 30,
					carbs: 40,
					fat: 20,
				},
			});
		expect(resp.body).toEqual({ message: "Meal eaten" });

		const user = await User.findOne(user1.username);
		expect(Object.keys(user.eatenMeals)).toContain("2021-03-14");
		expect(user.eatenMeals["2021-03-14"]).toEqual([
			{
				carbs: 40,
				fat: 20,
				id: 716627,
				protein: 30,
			},
		]);
	});
	it("should throw error if request body doesn't match json schema", async () => {
		const resp = await request(app)
			.post(`/users/addEatenMeal`)
			.send({ username: user1.username });
		expect(resp.status).toEqual(400);
		expect(resp.body.message).toEqual([
			'instance requires property "recipeId"',
			'instance requires property "date"',
		]);
	});
	it("should throw error if request body doesn't contain username", async () => {
		const resp = await request(app).post(`/users/addEatenMeal`).send({});
		expect(resp.status).toEqual(401);
	});
});
describe("POST /removeEatenMeal route", () => {
	it("should remove a meal from a user's eaten meals", async () => {
		await User.addEatenMeal(user1.username, bookmarks1[0], "2021-03-14", {
			calories: 500,
			protein: 30,
			carbs: 40,
			fat: 20,
		});
		const resp = await request(app).post(`/users/removeEatenMeal`).send({
			username: user1.username,
			recipeId: bookmarks1[0],
			date: "2021-03-14",
		});
		expect(resp.body).toEqual({ message: "Meal deleted" });

		const user = await User.findOne(user1.username);
		expect(Object.keys(user.eatenMeals)).not.toContain("2021-03-14");
	});
	it("should throw error if request body doesn't match json schema", async () => {
		const resp = await request(app)
			.post(`/users/removeEatenMeal`)
			.send({ username: user1.username });
		expect(resp.status).toEqual(400);
		expect(resp.body.message).toEqual([
			'instance requires property "recipeId"',
			'instance requires property "date"',
		]);
	});
	it("should throw error if request body doesn't contain username", async () => {
		const resp = await request(app).post(`/users/removeEatenMeal`).send({});
		expect(resp.status).toEqual(401);
	});
});

afterAll(async () => {
	await db.end();
});
