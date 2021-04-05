process.env.NODE_ENV === "test";

const User = require("./user");
const axios = require("axios");
const { Client } = require("pg");
const { DB_URI } = require("../config");

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

const addBookmarks = async (bookmarks, user) => {
	for (let id of bookmarks) {
		await User.bookmarkRecipe(user.username, id);
	}
};

const addEatenMeals = async (eatenMeals, user) => {
	for (let date in eatenMeals) {
		for (let meal of eatenMeals[date]) {
			await User.addEatenMeal(user.username, meal.id, date, {
				calories: 500,
				protein: 30,
				carbs: 40,
				fat: 20,
			});
		}
	}
};

const bookmarks1 = [716627, 716408, 716426, 715594, 715497];
// const bookmarks2 = [644387, 715392, 716268, 716381, 782601]

const eatenMeals1 = {
	"2021-03-14": [
		{
			id: 652423,
			protein: 30,
			carbs: 40,
			fat: 20,
		},
		{
			id: 660306,
			protein: 30,
			carbs: 40,
			fat: 20,
		},
	],
	"2021-03-15": [
		{
			id: 715424,
			protein: 30,
			carbs: 40,
			fat: 20,
		},
		{
			id: 662670,
			protein: 30,
			carbs: 40,
			fat: 20,
		},
	],
	"2021-03-16": [
		{
			id: 716195,
			protein: 30,
			carbs: 40,
			fat: 20,
		},
		{
			id: 663559,
			protein: 30,
			carbs: 40,
			fat: 20,
		},
	],
	"2021-03-17": [
		{
			id: 633942,
			protein: 30,
			carbs: 40,
			fat: 20,
		},

		{
			id: 715521,
			protein: 30,
			carbs: 40,
			fat: 20,
		},
	],
};

beforeEach(async () => {
	await db.query("DELETE FROM users_meals");
	await db.query("DELETE FROM bookmarks");
	await db.query("DELETE FROM users");
});

describe("User.register() method", () => {
	it("should return object containing information on user who is registering", async () => {
		const resp = await User.register(user1);
		expect(resp).toEqual({
			username: user1.username,
			email: user1.email,
			first_name: user1.first_name,
			last_name: user1.last_name,
			weight: user1.weight,
			weight_goal: user1.weight_goal,
			calorie_goal: user1.calorie_goal,
			bookmarks: [],
			eatenMeals: {},
		});
	});
});

describe("User.findAll() method", () => {
	it("should return information on all users", async () => {
		await User.register(user1);
		await User.register(user2);
		const resp = await User.findAll();
		expect(resp).toEqual([
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

describe("User.editProfile() method", () => {
	it("should edit information in a user's profile", async () => {
		await User.register(user1);
		await addBookmarks(bookmarks1, user1);
		await addEatenMeals(eatenMeals1, user1);

		const resp = await User.editProfile(user1EditData, user1.username);

		expect(resp).toEqual({
			username: user1.username,
			email: user1EditData.email,
			first_name: user1EditData.first_name,
			last_name: user1EditData.last_name,
			weight: user1EditData.weight,
			weight_goal: user1EditData.weight_goal,
			calorie_goal: user1EditData.calorie_goal,
			bookmarks: bookmarks1,
			eatenMeals: eatenMeals1,
		});
	});
});
describe("User.bookmarkRecipe() method", () => {
	it("should add a recipe to a user's bookmarks", async () => {
		await User.register(user1);
		const resp = await User.bookmarkRecipe(user1.username, bookmarks1[0]);
		expect(resp).toEqual({ message: "Bookmarked recipe 716627" });
		const user = await User.findOne(user1.username);
		expect(user.bookmarks.length).toBe(1);
		expect(user.bookmarks).toContain(716627);
	});
});
describe("User.unbookmarkRecipe() method", () => {
	it("should remove a recipe from a user's bookmarks", async () => {
		await User.register(user1);
		await User.bookmarkRecipe(user1.username, bookmarks1[0]);
		const resp = await User.unbookmarkRecipe(user1.username, bookmarks1[0]);
		expect(resp).toEqual({ message: "Unbookmarked recipe 716627" });
		const user = await User.findOne(user1.username);
		expect(user.bookmarks.length).toBe(0);
	});
});
describe("User.getAllBookmarks() method", () => {
	it("should get all recipes that a user has bookmarked", async () => {
		await User.register(user1);
		await addBookmarks(bookmarks1, user1);
		const resp = await User.getAllBookmarks(user1.username);
		expect(resp).toEqual(bookmarks1);
	});
});
describe("User.addEatenMeal() method", () => {
	it("should add a meal to a user's eaten meals", async () => {
		await User.register(user1);
		const resp = await User.addEatenMeal(
			user1.username,
			eatenMeals1["2021-03-14"][0].id,
			"2021-03-14",
			{
				calories: 500,
				protein: 30,
				carbs: 40,
				fat: 20,
			}
		);
		expect(resp).toEqual({ message: "Meal eaten" });
		const user = await User.findOne(user1.username);
		expect(Object.keys(user.eatenMeals)).toContain("2021-03-14");
		expect(user.eatenMeals["2021-03-14"][0]).toEqual(
			eatenMeals1["2021-03-14"][0]
		);
	});
});
describe("User.getEatenMeals() method", () => {
	it("should get all meals that a user has eaten for a specific date", async () => {
		await User.register(user1);
		await addEatenMeals(eatenMeals1, user1);
		for (let date in eatenMeals1) {
			let resp = await User.getEatenMeals(user1.username, date);
			expect(resp).toEqual(eatenMeals1[date].map((meal) => meal.id));
		}
	});
});

describe("User.removeEatenMeal() method", () => {
	it("should remove a meal from a user's eaten meals", async () => {
		await User.register(user1);
		await User.addEatenMeal(
			user1.username,
			eatenMeals1["2021-03-14"][0].id,
			"2021-03-14",
			{
				calories: 500,
				protein: 30,
				carbs: 40,
				fat: 20,
			}
		);
		const resp = await User.removeEatenMeal(
			user1.username,
			eatenMeals1["2021-03-14"][0].id,
			"2021-03-14"
		);
		expect(resp).toEqual({ message: "Meal deleted" });
		const user = await User.findOne(user1.username);
		expect(Object.keys(user.eatenMeals)).not.toContain("2021-03-14");
	});
});

describe("User.findOne() method", () => {
	it("should get information on a single user", async () => {
		await User.register(user1);

		await addBookmarks(bookmarks1, user1);
		await addEatenMeals(eatenMeals1, user1);

		const resp = await User.findOne(user1.username);
		expect(resp).toEqual({
			username: user1.username,
			email: user1.email,
			first_name: user1.first_name,
			last_name: user1.last_name,
			bookmarks: bookmarks1,
			eatenMeals: eatenMeals1,
		});
	});
});

describe("User.authenticate() method", () => {
	it("should return object containing information on user who is logging in, including their bookmarks and eatenMeals", async () => {
		await User.register(user1);

		await addBookmarks(bookmarks1, user1);
		await addEatenMeals(eatenMeals1, user1);

		const resp = await User.authenticate(user1.username, user1.password);
		expect(resp).toEqual({
			username: user1.username,
			email: user1.email,
			first_name: user1.first_name,
			last_name: user1.last_name,
			weight: user1.weight,
			weight_goal: user1.weight_goal,
			calorie_goal: user1.calorie_goal,
			bookmarks: bookmarks1,
			eatenMeals: eatenMeals1,
		});
	});
});

afterAll(async () => {
	await db.end();
});
