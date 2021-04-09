![alt text](/front-end/src/images/logo.png "Text")

[![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/colored.png)](#description)

## ➤ Description

This is the back-end API for KitchenMenu - it is used to perform CRUD operations on the KitchenMenu database in order to register/login users, bookmark/unbookmark recipes, add/remove meals from a user's meal tracker, and edit user info.

### API URL: https://www.kitchen-menu.com/

[![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/colored.png)](#installation)

## ➤ Installation (npm)

```
npm install
```

[![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/colored.png)](#usage)

## ➤ Endpoints

### GET

- /users/ _(sample response body below)_

```
[
    {
        "username": "testuser",
        "email": "firstlast@gmail.com",
        "first_name": "Bob",
        "last_name": "Smith"
    },
    {
        "username": "testuser2",
        "email": "anotheruser@gmail.com",
        "first_name": "Jane",
        "last_name": "Doe"
    }
]
```

- /users/:username _(sample response body below)_

```
{
    "username": "testuser",
    "email": "firstlast@gmail.com",
    "first_name": "First",
    "last_name": "Last",
    "bookmarks": [ 716426 ],
    "eatenMeals": { 652423 }
}
```

- /users/:username/getAllBookmarks _(sample response body below)_

```
[ 716426 ] // this id is used to get recipe details through Spoonacular API
```

- /users/:username/getEatenMeals _(sample response body below)_

```
{ 652423 } // this id is used to get recipe details through Spoonacular API
```

### POST

- /auth/register _(sample request body below)_

```
{
    "username": "testuser",
    "password": "password123",
    "first_name": "Bob",
    "last_name": "Smith",
    "email": "testuser@gmail.com",
    "weight": 175,
    "weight_goal": 160,
    "calorie_goal": 2000
}
```

- /auth/login _(sample request body below)_

```
{
    "username": "testuser",
    "password": "password123"
}
```

- /users/bookmarkRecipe _(sample request body below)_

```
{
    "username": "testuser",
    "recipeId": 652423
}
```

- /users/unbookmarkRecipe _(sample request body below)_

```
{
    "username": "testuser",
    "recipeId": 652423
}
```

- /users/addEatenMeal _(sample request body below)_

```
{
    "username": "testuser",
    "recipeId": 652423
    "date": "2021-04-09",
    "nutrients": {
        "calories": 484,
        "carbs": 53,
        "fat": 25,
        "protein": 14
    }
}
```

- /users/removeEatenMeal _(sample request body below)_

```
{
    "username": "testuser",
    "recipeId": 652423,
    "date": "2021-04-09"
}
```

### PATCH

- /users/:username _(sample request body below)_

```
{
    "username": "testuser",
    "email": "testuser@gmail.com",
    "first_name": "Bobby",
    "last_name": "Smith",
    "weight": 180,
    "weight_goal": 170,
    "calorie_goal": 2000
}
```

### DELETE

- /users/:username
