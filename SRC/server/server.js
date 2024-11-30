const express = require('express');
const mysql = require('mysql');
const path = require('path');

const app = express();
const router = express.Router();
const port = 3000;

// MySQL Connection
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "weathersystem"
});

con.connect(function (err) {
  if (err) throw err;
  console.log("Connected to MySQL!");
});

// Setup serving front-end code
app.use(express.static(path.join(__dirname, '../client')));

// API routes
// Create a user
router.put('/user', (req, res) => {
  let email = req.query.email;
  let username = req.query.username;
  let password = req.query.password;
  let location = req.query.location;
  let notifications = req.query.notifications;

  var sql = "INSERT INTO userprofile (email, username, userPassword, permissionLevel, units, defaultLocation, notifications, userRole)" +
    " VALUES ('" + email + "','" + username + "','" + password + "', '0', 'C','" + location + "','" + notifications + "','user')";

  con.query(sql, function (err, result) {
    if (err) throw err;
    res.send("1 record inserted");
  });
});

// Delete user
router.delete('/delete', (req, res) => {
  let email = req.query.email;

  var sql = "DELETE FROM userprofile WHERE email = '" + email + "'";

  con.query(sql, function (err, result) {
    if (err) throw err;
    res.send("Number of records deleted: " + result.affectedRows);
  });
});

// Get saved searches
router.get('/searches', (req, res) => {
  let email = req.query.email;

  var sql = "SELECT savedsearches FROM userprofile WHERE email = '" + email + "'";

  con.query(sql, function (err, result) {
    if (err) throw err;
    res.send(result);
  });
});

// Update saved searches
router.put('/savedsearches', (req, res) => {
  let search = req.query.search;
  let email = req.query.email;

  var sql = "UPDATE userprofile SET savedsearches = '" + search + "' WHERE email = '" + email + "'";

  con.query(sql, function (err, result) {
    if (err) throw err;
    res.send(result);
  });
});

// Get locations
router.get('/locations', (req, res) => {
  let email = req.query.email;

  var sql = "SELECT location FROM userprofile WHERE email = '" + email + "'";

  con.query(sql, function (err, result) {
    if (err) throw err;
    res.send(result);
  });
});

// Save location
router.put('/savedlocations', (req, res) => {
  let location = req.query.location;
  let email = req.query.email;

  var sql = "UPDATE userprofile SET location = '" + location + "' WHERE email = '" + email + "'";

  con.query(sql, function (err, result) {
    if (err) throw err;
    res.send(result);
  });
});

// Change units
router.put('/units', (req, res) => {
  let unit = req.query.unit;
  let email = req.query.email;

  var sql = "UPDATE userprofile SET units = '" + unit + "' WHERE email = '" + email + "'";

  con.query(sql, function (err, result) {
    if (err) throw err;
    res.send(result);
  });
});

// Get forecast data
router.get('/search', (req, res) => {
  let location = req.query.location;

  var sql = "SELECT * FROM forecast WHERE location = '" + location + "'";

  con.query(sql, function (err, result) {
    if (err) throw err;
    res.send(result);
  });
});

// Delete forecast data
router.delete('/deleteforecast', (req, res) => {
  let location = req.query.location;

  var sql = "DELETE FROM forecast WHERE location = '" + location + "'";

  con.query(sql, function (err, result) {
    if (err) throw err;
    res.send("Number of records deleted: " + result.affectedRows);
  });
});

// Add forecast data
router.put('/addforecast', (req, res) => {
  let location = req.query.location;

  var sql = "INSERT INTO forecast (recordDateandTime, location, predictedTemp, predictedHumidity, predictedWindSpeed, predictedPrecipitation, predictedPollen)" +
    " SELECT recordDateandTime, location, temperature, humidity, windSpeed, precipitation, pollen FROM weatherData" +
    " WHERE location = '" + location + "'";

  con.query(sql, function (err, result) {
    if (err) throw err;
    res.send("1 record inserted");
  });
});

// Add weather data
router.put('/addweatherdata', (req, res) => {
  let recordDateandTime = req.query.recordDateandTime;
  let temperature = req.query.temperature;
  let humidity = req.query.humidity;
  let windSpeed = req.query.windSpeed;
  let precipitation = req.query.precipitation;
  let pollen = req.query.pollen;
  let location = req.query.location;

  var sql = "INSERT INTO weatherdata (recordDateandTime, location, temperature, humidity, windSpeed, precipitation, pollen)" +
    " VALUES ('" + recordDateandTime + "','" + location + "','" + temperature + "','" + humidity + "','" + windSpeed + "','" + precipitation + "','" + pollen + "')";

  con.query(sql, function (err, result) {
    if (err) throw err;
    res.send("1 record inserted");
  });
});

// Apply the router
app.use('/api/database', router);

// Serve index.html as default
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
