import history from 'connect-history-api-fallback';
import { createSSRApp } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import express from 'express';
import path from 'path';
import dot from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url))

console.log(__dirname);

dot.config();
let conString = process.env.CON_STRING;
import pg from 'pg';
const client = new pg.Client(conString);
client.connect();

import bodyParser from 'body-parser'
const app = express(),
	port = process.env.PORT || 3080;

app.use(bodyParser.json());

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

app.get('/', (req, res) => {


});

app.listen(port, () => {

	console.log("hellofe world!")

})
