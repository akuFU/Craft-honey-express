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

	console.log(req)
	client.query("INSERT INTO users(id) values($1)", [req.body[1]])
		.then(resp => { console.log(resp) })
		.catch(err => { console.log(err) })
	
});

app.post('/app/updateUsers', (req, res) => {

	if (req.body[1] == 'phone') {
	
		client.query("UPDATE users SET phone = $1 WHERE id = $2", [req.body[2], req.body[3]]);
	
	} else {
		
		client.query("UPDATE users SET address = $1 WHERE id = $2", [req.body[2], req.body[3]]);
	
	}

});

app.post('/api/addOrder', (req, res) => {

	

});

app.post('/api/usersAddCart', (req, res) => {

	console.log(req.body);
	let { '1': key, '2': uid, '3': type, '4': quantity } = req.body;
	let order = { id: key, quantity: quantity }
	
	client.query("SELECT orders FROM users WHERE id=$1", [uid])
		.then((resp) => {
		
			let content = JSON.parse(resp.rows[0].orders);
			
			try {
			
				content[key].quantity += quantity;
				console.log(JSON.stringify(content));
				client.query("UPDATE users SET orders = $1 WHERE id = $2", [`${JSON.stringify(content)}`, uid])
				return
			
			} catch(error) {
			
				console.log(error);
							
			}
		
			if (resp.rows[0].orders == undefined || resp.rows[0].orders == null) {
			
				client.query("UPDATE users SET orders = $1 WHERE id = $2", [`{"${key}": ${JSON.stringify(order)}}`, uid])

			} else {
			
				content = JSON.stringify(content).slice(1, JSON.stringify(content).length-1);
				client.query("UPDATE users SET orders = $1 WHERE id = $2", [`{${content}, "${key}": ${JSON.stringify(order)}}`, uid])
			
			}

		})
		
});

app.post('/api/updateCart', (req, res) => {

	client.query("SELECT orders FROM users WHERE id=$1", [req.body[3]])
		.then((resp) => {
		
			let data = JSON.parse(resp.rows[0].orders);
			data[req.body[1]].quantity = req.body[2];
			client.query("UPDATE users SET orders = $1", [JSON.stringify(data)]);
			
		})
		.catch((err) => console.log(err));

});

app.post('/api/deleteCart', (req, res) => {

	client.query("SELECT orders FROM users WHERE id=$1", [req.body[2]])
		.then((resp) => {
		
			let data = JSON.parse(resp.rows[0].orders);
			delete data[req.body[1]]
			client.query("UPDATE users SET orders = $1", [JSON.stringify(data)])
			
		})
		.catch((err) => console.log(err));

});

app.post('/api/usersCart', (req, res) => {

	client.query("SELECT orders FROM users WHERE id=$1", [req.body[1]])
		.then(resp => { console.log(resp.rows[0]); res.json(resp.rows[0]) })
		.catch(err => console.log(err))

});

app.get('/api/language', (req, res) => {

	console.log(req.query.lang);
	client.query("SELECT * FROM language WHERE id=$1", [req.query.lang])
		.then(resp => { res.json(resp.rows[0]) })
		.catch(err => { console.log(err) })

});
/*
app.post('/api/languages', (req, res) => {

	let id = [req.body[1]];
	console.log(id)
	client.query("INSERT INTO languages (id, lang), values ('en', $1)", id)
		.then(resp => { console.log(resp) })
		.catch(err => { console.log(err) })

});
*/

app.get('/api/productsList', async (req,res) => {

	let data = {};
	client.query("SELECT * FROM products", function(err, rows) {
	
		for (let row of rows.rows) {
			data[row.id] = row;
		}
		res.json(data);

	}); 

});

app.get('/api/productsListOpt', async (req,res) => {

	let data = {};
	client.query("SELECT * FROM productsOpt", function(err, rows) {
	
		for (let row of rows.rows) {
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

