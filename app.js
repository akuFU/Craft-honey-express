const history = require('connect-history-api-fallback');
const fs = require('fs');
const express = require('express');
const path = require('path');
const dot = require('dotenv');
const pg = require('pg');
const sqlite3 = require('sqlite3').verbose();
const client = new sqlite3.Database('./var/data/testdb.db');
const nodemailer = require('nodemailer');
const admin = require('express-admin');

dot.config();

let transporter = nodemailer.createTransport({

	service: 'gmail',
	auth: {
	
		user: process.env.EMAIL,
		pass: process.env.PASS,
	
	}

});

/*
let conString = process.env.CON_STRING;
const client = new pg.Client(conString);
client.connect();
*/
const app = express(),
	bodyParser = require("body-parser")
	port = process.env.PORT || 3080;

app.use(bodyParser.json({

	limit: '50mb',

}));
app.use(bodyParser.raw({
  type: 'image/png',
	limit: '50mb',
}));

app.get('/api/blog', (req, res) => {

	client.all('SELECT * FROM blog ORDER BY id DESC', function (err, rows) {

		for (let row of rows) {

			row.title = JSON.parse(row.title);
			row.content = JSON.parse(row.content);
				
		}
		res.json(rows);

	});
	
});

app.post('/api/blogPic', (req, res) => {

	client.run("UPDATE blog SET image = ? WHERE id = 1", [req.body[1]]);

});

app.post('/api/addOrder', (req, res) => {

	console.log(req.body);
	
	let data = req.body;
	
	if (req.body.uid != '') {
	
		client.get("SELECT ordered FROM users WHERE id=?", [req.body.uid], function (err, rows) {
		
			let content;
		
			try {
		
				content = JSON.parse(rows.ordered);
			
			} catch (error) {
			
				content = [];
			
			}
		
			if (!content || content.length == 0) {
			
				client.run("UPDATE users SET ordered = ? WHERE id = ?", [`[${JSON.stringify(data)}]`, req.body.uid])

			} else {
			
				content = JSON.stringify(content).slice(1, JSON.stringify(content).length-1);
				client.run("UPDATE users SET ordered = ? WHERE id = ?", [`[${content}, ${JSON.stringify(data)}]`, req.body.uid])
			
			}
		
		})
	
	} else {
	
		client.get("SELECT ordered FROM users WHERE id=?", ["general"], function (err, rows) {
		
			let content = JSON.parse(rows.ordered);
		
			if (!content || content.length == 0) {
			
				client.run("UPDATE users SET ordered = ? WHERE id = ?", [`[${JSON.stringify(data)}]`, "general"])

			} else {
			
				content = JSON.stringify(content).slice(1, JSON.stringify(content).length-1);
				client.run("UPDATE users SET ordered = ? WHERE id = ?", [`[${content}, ${JSON.stringify(data)}]`, "general"])
			
			}
		
		})
	
	}
	
	let mailOptions = {
	
		from: process.env.EMAIL,
		to: data.email,
		subject: 'Заказ меда',
		text: `Уважаемый покупатель!
		
Ваш заказ на сумму ${data.sum} сом на сайте craft-honey.onrender.com подтвержден! Благодарим Вас за покупку!
 
Если этот заказ был сделан по ошибке - напишите нам об этом. Наш email: ${process.env.EMAIL}`
	
	}
	console.log(mailOptions.text);
	
	transporter.sendMail(mailOptions, function (error, info) {
	
		if (error) {
		
			console.log(error);
		
		} else {
		
			console.log(info.response);
		
		}
	
	});
	

});

app.get('/api/mail', (req, res) => {

	let query = req.query;
	
	let mailOptions = {
	
		from: process.env.EMAIL,
		to: process.env.EMAIL,
		subject: 'Обратная связь',
		text: `Пользователь ${query.name} оставил на сайте следующее сообщение: ${query.message}. 
		
Контактные данные пользователя:
 
	Телефон: ${query.phone}
	Email: ${query.mail}`
	
	}
	console.log(mailOptions.text);
	
	transporter.sendMail(mailOptions, function (error, info) {
	
		if (error) {
		
			console.log(error);
		
		} else {
		
			console.log(info.response);
		
		}
	
	});

});

app.post('/api/users', (req, res) => {

	client.run("INSERT INTO users(id) values(?)", [req.body[1]], function (err) {
	
		console.log(err);
	
	})
	
});

app.get('/api/userInfo', (req, res) => {

	client.get("SELECT * FROM users WHERE id = ?", [req.query.user], function (err, rows) {
	
		console.log(rows);
		res.json(rows);
	
	})
	
});

app.post('/api/updateUsers', (req, res) => {

	console.log(req.body);

	if (req.body[1] == 'phone') {
	
		client.run("UPDATE users SET phone = ?1 WHERE id = ?2", [req.body[2], req.body[3]]);
	
	} else if (req.body[1] == 'address') {
	
		client.run("UPDATE users SET address = ?1 WHERE id = ?2", [req.body[2], req.body[3]]);
	
	} else {
		
		client.run("UPDATE users SET delivery = ?1 WHERE id = ?2", [req.body[2], req.body[3]]);
	
	}

});

app.post('/api/usersAddCart', (req, res) => {

	let { '1': key, '2': uid, '4': quantity } = req.body;
	let order = { id: key, quantity: quantity }
	
	client.get("SELECT orders FROM users WHERE id=?", [uid], function (err, rows) {
		
			try {
		
				content = JSON.parse(rows.ordered);
			
			} catch (error) {
			
				content = {};
			
			}
			
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

app.post('/api/emptyCart', (req, res) => {

	client.run('UPDATE users SET orders = "{}" WHERE id = ?', [req.body[1]]);

})

app.get('/api/getOrders', (req, res) => {

	console.log(req.query)
	
		client.get('SELECT ordered FROM users WHERE id=?', [req.query.user], function (err, rows) {
			
				try {
				
					rows.ordered = JSON.parse(rows.ordered);
					res.json(rows.ordered);
					
				} catch (error) {
				
					res.status(500);
				
				}
			
		});
	
})

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
	
		res.json(rows);
		
	})

});

app.get('/api/language', (req, res) => {

	console.log(typeof req.query.lang);
	client.get("SELECT * FROM language WHERE id = ?", [req.query.lang], function (err, rows) {
	
		client.get("SELECT * FROM languageEasy WHERE id = ?", [req.query.lang], function (err, rows) {
		

		});
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

