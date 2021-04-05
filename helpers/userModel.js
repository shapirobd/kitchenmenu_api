const { default: axios } = require("axios");

const getUserBookmarks = async (db, username) => {
	const bookmarksRes = await db.query(
		`
					SELECT meal_id
					FROM bookmarks
					WHERE username=$1
					`,
		[username]
	);
	return bookmarksRes.rows.map((bookmark) => bookmark.meal_id);
};

const getUserEatenMeals = async (db, username) => {
	const eatenMealsRes = await db.query(
		`
					SELECT um.meal_id AS id, um.username, um.date, m.protein, m.carbs, m.fat
					FROM users_meals AS um
					LEFT JOIN meals AS m
					ON um.meal_id = m.id
					WHERE um.username=$1
					`,
		[username]
	);
	const eatenMeals = {};
	eatenMealsRes.rows.map((meal) => {
		let date = convertDate(meal.date);
		const { id, protein, carbs, fat } = meal;
		eatenMeals[date]
			? eatenMeals[date].push({ id, protein, carbs, fat })
			: (eatenMeals[date] = [{ id, protein, carbs, fat }]);
	});
	return eatenMeals;
};

module.exports = { getUserBookmarks, getUserEatenMeals };
