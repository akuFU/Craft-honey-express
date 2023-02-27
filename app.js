const history = require('connect-history-api-fallback');
const fs = require('fs');
const express = require('express');
const path = require('path');
const dot = require('dotenv');
const pg = require('pg');

dot.config();
let conString = process.env.CON_STRING;
const client = new pg.Client(conString);
client.connect();

const app = express(),
	bodyParser = require("body-parser")
	port = process.env.PORT || 3080;

app.use(bodyParser.json());

app.post('/api/users', (req, res) => {

	console.log(req.body);
	let { '1': key, '2': uid, '3': type, '4': quantity } = req.body;
	console.log(key)
	let order = { id: key, quantity: quantity }
	console.log(order)
	client.query("SELECT * FROM products WHERE id=$1", [key])
		.then((res) => console.log(res.rows));

});

app.post('/api/language', (req, res) => {

	let id = [req.body[1]];
	console.log(id)
	client.query("SELECT * FROM language WHERE id=$1", id)
		.then(resp => { res.json(resp.rows[0]) })
		.catch(err => { console.log(err) })

});

app.post('/api/languages', (req, res) => {

	let id = [req.body[1]];
	console.log(id)
	client.query("INSERT INTO languages (id, lang), values ('en', $1)", id)
		.then(resp => { console.log(resp) })
		.catch(err => { console.log(err) })

});

app.get('/api/productsList', async (req,res) => {

	let data = {};
	client.query("SELECT * FROM products", function(err, rows) {
	
		for (let row of rows.rows) {
			data[row.id] = row;
		}
		res.json(data);

	}); 

})

app.get('/api/productsListOpt', async (req,res) => {

	let data = {};
	client.query("SELECT * FROM productsOpt", function(err, rows) {
	
		for (let row of rows.rows) {
			data[row.id] = row;
		}
		res.json(data);
		
	}); 

})

app.use(history());

app.use(express.static(path.join(__dirname, './Craft-honey/dist')));

app.listen(port, () => {

	console.log("hellofe world!")

})

