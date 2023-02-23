const history = require('connect-history-api-fallback');
const express = require('express');
const path = require('path');

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('testdb.db');

const app = express(),
	bodyParser = require("body-parser");
	port = process.env.PORT || 3080;

app.use(bodyParser.json());

app.get('/api/productsList', async (req,res) => {

	let data = {};
	console.log(req);
	db.all("SELECT * FROM products", function(err, rows) {

		rows.forEach((row) => data[row.id] = row);
		res.json(data);

	}); 

})

app.get('/api/productsListOpt', async (req,res) => {

	let data = {};
	db.all("SELECT * FROM productsOpt", function(err, rows) {

		rows.forEach((row) => data[row.id] = row);
		res.json(data);

	}); 

})

app.use(history());
app.use(express.static(path.join(__dirname, './Craft-honey/dist')));

app.listen(port, () => {

	console.log("hellofe world!")

})
