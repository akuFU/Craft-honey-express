const history = require('connect-history-api-fallback');

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

app.listen(port, () => {

	console.log("hello world!")

})
