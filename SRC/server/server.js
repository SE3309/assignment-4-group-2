var mysql = require('mysql');
const express = require('express');
const router = express.Router();
const app = express();
const port = 3000;

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "weathersystem"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

//Setup serving front-end code
app.use('/', express.static('../client'));

//create a user using user input and some predetermined values
//permission level, userRole, and units are predetermined
//currently just sends back text saying that the record was inserted 
router.put('/user', (req, res) => {
    let email = req.query.email;
    let username = req.query.username;
    let password = req.query.password;
    let location = req.query.location;
    let notifications = req.query.notifications;

    var sql = "INSERT INTO userprofile (email, username, userPassword, permissionLevel, units, defaultLocation, notifications, userRole )" + 
    " VALUES ('" + email + "','" + username + "','" + password +"', '0', 'C','" + location + "','" + notifications + "','user')";

    
        con.query(sql, function (err, result) {
          if (err) throw err;
          res.send("1 record inserted");
        });
      });


//deletes user based on their email
router.delete('/delete', (req, res) => {
    let email = req.query.email;

    var sql = "DELETE FROM userprofile WHERE email = '" + email +"'";

        con.query(sql, function (err, result) {
            if (err) throw err;
            res.send("Number of records deleted: " + result.affectedRows);
        });
      });

//gets the current savedsearches value so that it can be updated using the 'put' method just below
router.get('/searches', (req, res) => {
    
    let email = req.query.email;

    var sql = "SELECT savedsearches FROM userprofile where email = '" + email +"'"

    con.query(sql, function (err, result) {
        if (err) throw err;
        res.send(result);
      });
   
});

//updates the saved searches value as a CSV  
router.put('/savedsearches', (req, res) => {
    let search = req.query.search;
    let email = req.query.email;
    var sql = "UPDATE userprofile SET savedsearches = '"+ search +"' where email = " + email + ""

    con.query(sql, function (err, result) {
        if (err) throw err;
        res.send(result);
      });

});

//gets locations from userprofile
router.get('/locations', (req, res) => {
    
    let email = req.query.email;

    var sql = "SELECT locations FROM userprofile where email = '" + email +"'"

    con.query(sql, function (err, result) {
        if (err) throw err;
        res.send(result);
      });
   
});

//saves locations 
router.put('/savedlocations', (req, res) => {
    let location = req.query.location;
    let email = req.query.email;
    var sql = "UPDATE userprofile SET location = '"+ location +"' where email = " + email + ""

    con.query(sql, function (err, result) {
        if (err) throw err;
        res.send(result);
      });

});


//changes the units used, probably should only set this to Celcius (C) or Fahrenheit (F) , could also do Kelvin (K)
router.put('/units', (req, res) => {
    let unit = req.query.unit;
    var sql = "UPDATE userprofile SET units = '"+ unit +"' where email = " + email + ""

    con.query(sql, function (err, result) {
        if (err) throw err;
        res.send(result);
      });

});
// get results from search, returns value of all forecast data for a specific location
router.get('/search', (req, res) => {
    
    let location = req.query.location;

    var sql = "SELECT * FROM forecast where location = '" + location +"'"

    con.query(sql, function (err, result) {
        if (err) throw err;
        res.send(result);
      });
   
});
     
//deletes current forecast data, should be used before updating with new data points
router.delete('/deleteforecast', (req, res) => {
    let location = req.query.location;

    var sql = "DELETE FROM forecast WHERE location = '" + location +"'";

        con.query(sql, function (err, result) {
            if (err) throw err;
            res.send("Number of records deleted: " + result.affectedRows);
        });
      });

      //adds data to forecast from weatherdata
      router.put('/addforecast', (req, res) => {
        let location = req.query.location;



        var sql = "INSERT INTO forecast (recordDateandTime, location, predictedTemp, predictedHumidity, predictedWindSpeed, predictedPrecipitation, predictedPollen)" + 
    " SELECT  recordDateandTime, location, temperature, humidity, windSpeed, precipitation, pollen FROM weatherData" +
    "where location = '"+ location+"'";

    
        con.query(sql, function (err, result) {
            if (err) throw err;
            res.send("1 record inserted");
          });
    
    });


    //adds data to weatherdata
    router.put('/addweatherdata', (req, res) => {
      let recordDateandTime = req.query.recordDateandTime;
      let temperature = req.query.temperature;
      let humidity = req.query.humidity;
      let windSpeed = req.query.windSpeed;
      let precipitation = req.query.precipitation;
      let pollen = req.query.pollen;
      let location = req.query.location;


      var sql = "INSERT INTO weatherdata (recordDateandTime, location, temperature, humidity, windSpeed, precipitation, pollen)" + 
  " values ('" + recordDateandTime + "','" + location +"','" + temperature + "','" + humidity + "','" + windSpeed +"','" + precipitation + "','"  + pollen +"')"; 

  
      con.query(sql, function (err, result) {
          if (err) throw err;
          res.send("1 record inserted");
        });
  
  });


app.use('/api/database', router);

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});













