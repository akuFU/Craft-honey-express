var http = require('http');
var history = require('connect-history-api-fallback');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('testdb.db');

const express = require('express');
const path = require('path');
const app = express(),
	bodyParser = require("body-parser");
	port = 3080;

app.use(bodyParser.json());
app.use(history());
app.use(express.static(path.join(__dirname, './Craft-honey/dist')));

app.get('/', (req,res) => {
  res.sendFile(path.join(__dirname, './Craft-honey/dist/index.html'));
});

db.run("CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY, name TEXT)");

db = new sqlite3.Database('testdb.db');

function add() {

	db.run("INSERT INTO test (name) VALUES ('john')");

}

app.listen(port, () => {

	console.log("hello world!")

})
