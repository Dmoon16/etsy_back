const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql2/promise");
const axios = require("axios");
const PORT = 8000;

const { v4: uuidv4 } = require("uuid");

function createClientSignature() {
	const signature = uuidv4(); // Generate a version 4 UUID
	return `CS:${signature}`; // Return the signature in the required format
}

app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.use(express.json());

// Set up MySQL connection pool
const pool = mysql.createPool({
	host: "localhost",
	port: "3306",
	user: "root",
	password: "",
	database: "product_list",
});

app.get("/fetchContent", async (req, res) => {
	const productUrl = req.query.product_url;
	try {
		const response = await axios.get(productUrl);
		res.send(response.data);
	} catch (error) {
		console.error(`Error: ${error}`);
		res.status(500).send({ message: "There was an error." });
	}
});

app.post("/save", (req, res) => {
	const { origin, create } = req.body;

	//store origin_image and created_image
	pool.execute(
		`INSERT INTO photos (origin_image, created_image) VALUES (?, ?)`,
		[origin, create],
	)
		.then(([rows, fields]) => {
			console.log("Inserted successfully");
		})
		.catch((err) => {
			console.error("Error inserting values into database:", err);
		});
});

app.listen(PORT, '0.0.0.0', function () {
	console.log("Server is running on Port: " + PORT);

	const clientSignature = createClientSignature();
	console.log(clientSignature);
});
