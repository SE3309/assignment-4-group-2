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

// Retrieve predicted temperature and humidity from forecast for users located in a specified city
router.get('/predictedTempHumidity', (req, res) => {
  const location = req.query.location;

  const sql = `
    SELECT F.predictedTemp, F.predictedHumidity
    FROM Forecast F, UserProfile U
    WHERE F.email = U.email AND U.location = ?`;

  con.query(sql, [location], (err, result) => {
    if (err) throw err;
    res.send(result);
  });
})

// Find usernames of users associated with forecasts predicting precipitation greater or less than a value
router.get('/usernamesByPrecipitation', (req, res) => {
  const precipitationValue = req.query.value;
  const comparator = req.query.comparator; // Accept '>' or '<'

  const sql = `
    SELECT username
    FROM UserProfile
    WHERE email IN (
      SELECT email
      FROM Forecast
      WHERE predictedPrecipitation ${comparator} ?
    )`;

  con.query(sql, [precipitationValue], (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

// Retrieve names of forecast models with an accuracy greater than or equal to a value
router.get('/modelsByAccuracy', (req, res) => {
  const accuracy = req.query.accuracy;

  const sql = `
    SELECT modelName
    FROM ForecastModel FM
    WHERE EXISTS (
      SELECT 1
      FROM Forecast F
      WHERE F.modelType = FM.modelName AND FM.accuracy >= ?
    )`;

  con.query(sql, [accuracy], (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

// Caluculate the average predicted temperature for a given location
router.get('/averageTempByLocation', (req, res) => {
  const sql = `
    SELECT location, AVG(predictedTemp) AS avgTemp
    FROM Forecast
    GROUP BY location`;

  con.query(sql, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

// Retrieve temperature and humidity for observation points with the latitude and longitude
router.get('/weatherDataByLatLong', (req, res) => {
  const latMin = req.query.latMin;
  const latMax = req.query.latMax;
  const longMin = req.query.longMin;
  const longMax = req.query.longMax;

  const sql = `
    SELECT O.locationName, W.temperature, W.humidity
    FROM ObservationPoint O, WeatherData W
    WHERE O.locationName = W.location
      AND O.latitude BETWEEN ? AND ?
      AND O.longitude BETWEEN ? AND ?`;

  con.query(sql, [latMin, latMax, longMin, longMax], (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

// Identify the top 5 users with the highest number of associated forecasts
router.get('/topUsersByForecasts', (req, res) => {
  const sql = `
    SELECT U.username, COUNT(F.email) AS forecastCount
    FROM UserProfile U, Forecast F
    WHERE U.email = F.email
    GROUP BY U.username
    ORDER BY forecastCount DESC
    LIMIT 5`;

  con.query(sql, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

// Count observation points for each location type
router.get('/observationPointsByType', (req, res) => {
  const sql = `
    SELECT locationType, COUNT(*) AS observationCount
    FROM ObservationPoint
    GROUP BY locationType
    HAVING locationType IN ('Urban', 'Suburban', 'Rural')`;

  con.query(sql, (err, result) => {
    if (err) throw err;
    res.send(result);
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
