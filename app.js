const history = require('connect-history-api-fallback');
const fs = require('fs');
const express = require('express');
const path = require('path');
const dot = require('dotenv');
const pg = require('pg');
const sqlite3 = require('sqlite3').verbose();
const client = new sqlite3.Database('var/data/testdb.db');

dot.config();
/*
let conString = process.env.CON_STRING;
const client = new pg.Client(conString);
client.connect();
*/
const app = express(),
	bodyParser = require("body-parser")
	port = process.env.PORT || 3080;

app.use(bodyParser.json());

app.post('/api/users', (req, res) => {

	console.log(req)
	client.run("INSERT INTO users(id) values(?)", [req.body[1]], function (err) {
	
		console.log(err);
	
	})
	
});

app.post('/api/updateUsers', (req, res) => {

	console.log(req.body);
	
	if (req.body[1] == 'phone') {
	
		client.run("UPDATE users SET phone = ?1 WHERE id = ?2", [req.body[2], req.body[3]]);
	
	} else {
		
		client.run("UPDATE users SET address = ?1 WHERE id = ?2", [req.body[2], req.body[3]]);
	
	}

});

app.post('/api/addOrder', (req, res) => {

	

});

app.post('/api/usersAddCart', (req, res) => {

	console.log(req.body);
	let { '1': key, '2': uid, '3': type, '4': quantity } = req.body;
	let order = { id: key, quantity: quantity }
	
	client.get("SELECT orders FROM users WHERE id=?", [uid], function (err, rows) {
		
			let content = JSON.parse(rows.orders);
			
			try {
			
				content[key].quantity += quantity;
				console.log(JSON.stringify(content));
				client.run("UPDATE users SET orders = ?1 WHERE id = ?2", [`${JSON.stringify(content)}`, uid])
				return
			
			} catch(error) {
			
				console.log(error);
							
			}
		
			if (!content || Object.keys(content).length == 0) {
			
				client.run("UPDATE users SET orders = ?1 WHERE id = ?2", [`{"${key}": ${JSON.stringify(order)}}`, uid])

			} else {
			
				content = JSON.stringify(content).slice(1, JSON.stringify(content).length-1);
				client.run("UPDATE users SET orders = ?1 WHERE id = ?2", [`{${content}, "${key}": ${JSON.stringify(order)}}`, uid])
			
			}
		
	})
		
});

app.post('/api/updateCart', (req, res) => {

	client.get("SELECT orders FROM users WHERE id=?1", [req.body[3]], function (err, rows) {
		
		let data = JSON.parse(rows.orders);
		data[req.body[1]].quantity = req.body[2];
		client.run("UPDATE users SET orders = ?2 WHERE id = ?1", [req.body[3], JSON.stringify(data)]);
			
		
	})

});

app.post('/api/deleteCart', (req, res) => {

	client.get("SELECT orders FROM users WHERE id=?1", [req.body[2]], function (err, rows) {
		
		let data = JSON.parse(rows.orders);
		delete data[req.body[1]]
		console.log(data);
		client.run("UPDATE users SET orders = ?2 WHERE id = ?1", [req.body[2], JSON.stringify(data)]);
		
	})

});

app.post('/api/usersCart', (req, res) => {

	client.get("SELECT orders FROM users WHERE id=?1", [req.body[1]], function (err, rows) {
	
		console.log(rows); 
		res.json(rows);
		
	})

});

app.get('/api/language', (req, res) => {

	console.log(typeof req.query.lang);
	client.get("SELECT * FROM language WHERE id = ?", [req.query.lang], function (err, rows) {
	
		console.log(rows);
		res.json(rows);
	
	})

});
/*
app.post('/api/languages', (req, res) => {

	let id = [req.body[1]];
	console.log(id)
	client.run("INSERT INTO languages (id, lang), values ('en', $1)", id)
		.then(resp => { console.log(resp) })
		.catch(err => { console.log(err) })

});
*/

app.get('/api/productsList', async (req,res) => {

	let data = {};
	client.all("SELECT * FROM products", function(err, rows) {
	
		for (let row of rows) {
			data[row.id] = row;
		}
		res.json(data);

	}); 

});

app.get('/api/productsListOpt', async (req,res) => {

	let data = {};
	client.all("SELECT * FROM productsOpt", function(err, rows) {
	
		for (let row of rows) {
			data[row.id] = row;
		}
		res.json(data);
		
	}); 

});

app.use(history());

app.use(express.static(path.join(__dirname, './Craft-honey/dist')));

app.listen(port, () => {

	console.log("hellofe world!")

})

