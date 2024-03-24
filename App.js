const express = require('express');
const bodyParser = require('body-parser');
const pg = require('pg');
require('dotenv').config()

const app = express();
const port = process.env.PORT ;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


const db = new pg.Client({
    user: process.env.postgres_user,
    host: process.env.postgres_host,
    database: process.env.postgres_database,
    password: process.env.postgres_password,
    port: process.env.postgres_port,
});

db.connect()




app.get('/',async (req, res) => {
    const result = await db.query('SELECT * FROM recipes'); // Fetching only one recipe
        const recipes = result.rows; // Accessing the first (and only) recipe
        // console.log('Fetched recipe:', recipe);
        res.render('index.ejs', { recipes });
});

app.post('/add', async (req, res) => {
    const { name, ingredient, directions } = req.body;
    const result = await db.query('INSERT INTO recipes (name, ingredient, directions) VALUES ($1, $2, $3) RETURNING *', [name, ingredient, directions]);
    res.redirect('/');
});

app.post('/delete', async (req, res) => {
    const recipeId = req.body.id;
    try {
        await db.query('DELETE FROM recipes WHERE id = $1', [recipeId]);
        res.redirect('/');
    } catch (error) {
        console.error('Error deleting recipe:', error);
        res.status(500).send('Error deleting recipe');
    }
});

app.post('/edit', async (req, res) => {
    const { id, name, ingredient, directions } = req.body;
    const result = await db.query('UPDATE recipes SET name = $1, ingredient = $2, directions = $3 WHERE id = $4 RETURNING *', [name, ingredient, directions, id]);
    res.redirect('/');
    
    
});


app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
  