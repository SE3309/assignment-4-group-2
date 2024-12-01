const apiBase = '/api/database';

// Utility function to show the selected section
function showSection(sectionId) {
  // Hide all sections
  document.querySelectorAll('section').forEach(section => {
    section.classList.add('hidden');
  });
  // Show the selected section
  document.getElementById(sectionId).classList.remove('hidden');
}

// Utility function to display messages
function displayMessage(elementId, message, isError = false) {
  const messageDiv = document.getElementById(elementId);
  messageDiv.className = `message ${isError ? 'error' : 'success'}`;
  messageDiv.textContent = message; // Set the message as plain text
}

// Utility function to validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Utility function to check if a value is not empty
function isNotEmpty(value) {
  return value.trim() !== '';
}

// === User Management ===

// Create a new user
function createUser() {
  const email = document.getElementById('createUserEmail').value;
  const username = document.getElementById('createUsername').value;
  const password = document.getElementById('createPassword').value;
  const location = document.getElementById('createLocation').value;
  const notifications = document.getElementById('createNotifications').value;

  // Input validation
  if (!isValidEmail(email)) {
    displayMessage('userMessage', 'Invalid email address.', true);
    return;
  }
  if (!isNotEmpty(username) || !isNotEmpty(password) || !isNotEmpty(location)) {
    displayMessage('userMessage', 'All fields are required.', true);
    return;
  }
  if (notifications !== 'yes' && notifications !== 'no') {
    displayMessage('userMessage', 'Notifications must be "yes" or "no".', true);
    return;
  }

  // API call to create user
  fetch(`${apiBase}/user?email=${email}&username=${username}&password=${password}&location=${location}&notifications=${notifications}`, {
    method: 'PUT'
  })
    .then(res => res.text())
    .then(data => displayMessage('userMessage', data))
    .catch(err => displayMessage('userMessage', err.message, true));
}

// Delete an existing user
function deleteUser() {
  const email = document.getElementById('deleteUserEmail').value;

  // Input validation
  if (!isValidEmail(email)) {
    displayMessage('userMessage', 'Invalid email address.', true);
    return;
  }

  // API call to delete user
  fetch(`${apiBase}/delete?email=${email}`, {
    method: 'DELETE'
  })
    .then(res => res.text())
    .then(data => displayMessage('userMessage', data))
    .catch(err => displayMessage('userMessage', err.message, true));
}

// === Saved Searches ===

// Get saved searches for a user
function getSavedSearches() {
  const email = document.getElementById('getSearchEmail').value;

  // Input validation
  if (!isValidEmail(email)) {
    displayMessage('searchMessage', 'Invalid email address.', true);
    return;
  }

  // API call to get saved searches
  fetch(`${apiBase}/searches?email=${email}`)
    .then(res => res.json())
    .then(data => {
      if (data.length > 0) {
        // Display saved searches
        const savedSearches = data.map(item => item.savedsearches).join(', ');
        displayMessage('searchMessage', `Saved Searches: ${savedSearches}`);
      } else {
        displayMessage('searchMessage', 'No saved searches found.', true);
      }
    })
    .catch(err => displayMessage('searchMessage', err.message, true));
}

// Update a user's saved searches
function updateSavedSearches() {
  const email = document.getElementById('updateSearchEmail').value;
  const search = document.getElementById('updateSearch').value;

  // Input validation
  if (!isValidEmail(email)) {
    displayMessage('searchMessage', 'Invalid email address.', true);
    return;
  }
  if (!isNotEmpty(search)) {
    displayMessage('searchMessage', 'Search cannot be empty.', true);
    return;
  }

  // API call to update saved searches
  fetch(`${apiBase}/savedsearches?email=${email}&search=${search}`, {
    method: 'PUT'
  })
    .then(res => res.json())
    .then(data => {
      if (data.affectedRows > 0) {
        displayMessage('searchMessage', `Success! Saved search updated to: "${search}".`);
      } else {
        displayMessage('searchMessage', 'Update failed. Please check the email and try again.', true);
      }
    })
    .catch(err => displayMessage('searchMessage', err.message, true));
}

// === Locations ===

// Get all locations for a user
function getLocations() {
  const email = document.getElementById('getLocationEmail').value;

  // Input validation
  if (!isValidEmail(email)) {
    displayMessage('locationMessage', 'Invalid email address.', true);
    return;
  }

  // API call to get locations
  fetch(`${apiBase}/locations?email=${email}`)
    .then(res => res.json())
    .then(data => {
      if (data.length > 0) {
        const locations = data.map(item => item.location).join(', ');
        displayMessage('locationMessage', `Locations: ${locations}`);
      } else {
        displayMessage('locationMessage', 'No locations found for this email.', true);
      }
    })
    .catch(err => displayMessage('locationMessage', `Error: ${err.message}`, true));
}

// Save a new location for a user
function saveLocation() {
  const email = document.getElementById('saveLocationEmail').value;
  const location = document.getElementById('saveLocation').value;

  // Input validation
  if (!isValidEmail(email)) {
    displayMessage('locationMessage', 'Invalid email address.', true);
    return;
  }
  if (!isNotEmpty(location)) {
    displayMessage('locationMessage', 'Location cannot be empty.', true);
    return;
  }

  // API call to save location
  fetch(`${apiBase}/savedlocations?email=${email}&location=${location}`, {
    method: 'PUT'
  })
    .then(res => res.json())
    .then(data => {
      if (data.affectedRows > 0) {
        displayMessage('locationMessage', `Success! Location updated to: "${location}".`);
      } else {
        displayMessage('locationMessage', 'Update failed. No user found with this email.', true);
      }
    })
    .catch(err => displayMessage('locationMessage', `Error: ${err.message}`, true));
}

// === Forecast ===

// Search forecast for a location
function searchForecast() {
  const location = document.getElementById('searchForecastLocation').value;

  // Input validation
  if (!isNotEmpty(location)) {
    displayMessage('forecastMessage', 'Location cannot be empty.', true);
    return;
  }

  // API call to search forecast
  fetch(`${apiBase}/search?location=${location}`)
    .then(res => res.json())
    .then(data => {
      if (data.length > 0) {
        const formattedData = data
          .map(forecast => `
            Date & Time: ${forecast.recordDateandTime}
            Location: ${forecast.location}
            Predicted Temperature: ${forecast.predictedTemp}°C
            Predicted Humidity: ${forecast.predictedHumidity}%
            Predicted Wind Speed: ${forecast.predictedWindSpeed} km/h
            Predicted Precipitation: ${parseFloat(forecast.predictedPrecipitation).toFixed(2)} mm
            Predicted UV Index: ${forecast.predictedUV}
            Predicted Pollen Level: ${forecast.predictedPollen}
            Model Type: ${forecast.modelType}
            Email Associated: ${forecast.email}
          `).join('\n');
        displayMessage('forecastMessage', formattedData);
      } else {
        displayMessage('forecastMessage', 'No forecast data available for this location.', true);
      }
    })
    .catch(err => displayMessage('forecastMessage', `Error: ${err.message}`, true));
}

// Delete a forecast for a location
function deleteForecast() {
  const location = document.getElementById('deleteForecastLocation').value;

  // Input validation
  if (!isNotEmpty(location)) {
    displayMessage('forecastMessage', 'Location cannot be empty.', true);
    return;
  }

  // API call to delete forecast
  fetch(`${apiBase}/deleteforecast?location=${location}`, {
    method: 'DELETE'
  })
    .then(res => res.text())
    .then(data => displayMessage('forecastMessage', data))
    .catch(err => displayMessage('forecastMessage', err.message, true));
}

// Add a new forecast for a location
function addForecast() {
  const location = document.getElementById('addForecastLocation').value;

  // Input validation
  if (!isNotEmpty(location)) {
    displayMessage('forecastMessage', 'Location cannot be empty.', true);
    return;
  }

  // API call to add forecast
  fetch(`${apiBase}/addforecast?location=${location}`, {
    method: 'PUT'
  })
    .then(res => res.text())
    .then(data => displayMessage('forecastMessage', data))
    .catch(err => displayMessage('forecastMessage', err.message, true));
}

// === Weather Data ===

// Add weather data
function addWeatherData() {
  const location = document.getElementById('dataLocation').value;
  const dateTime = document.getElementById('dataDateTime').value;
  const temperature = document.getElementById('dataTemperature').value;
  const humidity = document.getElementById('dataHumidity').value;
  const windSpeed = document.getElementById('dataWindSpeed').value;
  const precipitation = document.getElementById('dataPrecipitation').value;
  const pollen = document.getElementById('dataPollen').value;

  // Input validation
  if (!isNotEmpty(location) || !isNotEmpty(dateTime)) {
    displayMessage('weatherMessage', 'Location and Date & Time are required.', true);
    return;
  }
  if (!isNotEmpty(temperature) || !isNotEmpty(humidity) || !isNotEmpty(windSpeed) ||
      !isNotEmpty(precipitation) || !isNotEmpty(pollen)) {
    displayMessage('weatherMessage', 'All weather data fields are required.', true);
    return;
  }

  // API call to add weather data
  fetch(`${apiBase}/addweatherdata?recordDateandTime=${dateTime}&location=${location}&temperature=${temperature}&humidity=${humidity}&windSpeed=${windSpeed}&precipitation=${precipitation}&pollen=${pollen}`, {
    method: 'PUT'
  })
    .then(res => res.text())
    .then(data => {
      displayMessage('weatherMessage', data);

      // Clear input fields if the record is inserted
      if (data.toLowerCase().includes('record inserted')) {
        document.getElementById('dataLocation').value = '';
        document.getElementById('dataDateTime').value = '';
        document.getElementById('dataTemperature').value = '';
        document.getElementById('dataHumidity').value = '';
        document.getElementById('dataWindSpeed').value = '';
        document.getElementById('dataPrecipitation').value = '';
        document.getElementById('dataPollen').value = '';
      }
    })
    .catch(err => displayMessage('weatherMessage', err.message, true));
}


// Retrieve predicted temperature and humidity
function getPredictedTempHumidity() {
  const location = document.getElementById('tempHumidityLocation').value;

  if (!isNotEmpty(location)) {
    displayMessage('tempHumidityMessage', 'Location cannot be empty.', true);
    return;
  }

  fetch(`${apiBase}/predictedTempHumidity?location=${location}`)
    .then(res => res.json())
    .then(data => {
      if (data.length > 0) {
        const details = data.map(item => `Temperature: ${item.predictedTemp}°C, Humidity: ${item.predictedHumidity}%`).join('\n');
        displayMessage('tempHumidityMessage', details);
      } else {
        displayMessage('tempHumidityMessage', 'No data found for the specified location.', true);
      }
    })
    .catch(err => displayMessage('tempHumidityMessage', err.message, true));
}

// Retrieve usernames by precipitation
function getUsernamesByPrecipitation() {
  const value = document.getElementById('precipitationValue').value;
  const comparator = document.getElementById('precipitationComparator').value;

  if (!isNotEmpty(value)) {
    displayMessage('precipitationMessage', 'Value cannot be empty.', true);
    return;
  }

  fetch(`${apiBase}/usernamesByPrecipitation?value=${value}&comparator=${comparator}`)
    .then(res => res.json())
    .then(data => {
      if (data.length > 0) {
        const usernames = data.map(item => item.username).join(', ');
        displayMessage('precipitationMessage', `Usernames: ${usernames}`);
      } else {
        displayMessage('precipitationMessage', 'No users found.', true);
      }
    })
    .catch(err => displayMessage('precipitationMessage', err.message, true));
}

// Retrieve models by accuracy
function getModelsByAccuracy() {
  const accuracy = document.getElementById('modelAccuracy').value;

  if (!isNotEmpty(accuracy)) {
    displayMessage('accuracyMessage', 'Accuracy cannot be empty.', true);
    return;
  }

  fetch(`${apiBase}/modelsByAccuracy?accuracy=${accuracy}`)
    .then(res => res.json())
    .then(data => {
      if (data.length > 0) {
        const models = data.map(item => item.modelName).join(', ');
        displayMessage('accuracyMessage', `Models: ${models}`);
      } else {
        displayMessage('accuracyMessage', 'No models found.', true);
      }
    })
    .catch(err => displayMessage('accuracyMessage', err.message, true));
}

// Retrieve average temperature by location
function getAverageTempByLocation() {
  fetch(`${apiBase}/averageTempByLocation`)
    .then(res => res.json())
    .then(data => {
      const averages = data.map(item => `${item.location}: ${item.avgTemp.toFixed(2)}°C`).join('\n');
      displayMessage('averageTempMessage', averages);
    })
    .catch(err => displayMessage('averageTempMessage', err.message, true));
}

// Retrieve weather data by latitude and longitude
function getWeatherDataByLatLong() {
  const latMin = document.getElementById('latMin').value;
  const latMax = document.getElementById('latMax').value;
  const longMin = document.getElementById('longMin').value;
  const longMax = document.getElementById('longMax').value;

  if (!isNotEmpty(latMin) || !isNotEmpty(latMax) || !isNotEmpty(longMin) || !isNotEmpty(longMax)) {
    displayMessage('latLongMessage', 'All fields are required.', true);
    return;
  }

  fetch(`${apiBase}/weatherDataByLatLong?latMin=${latMin}&latMax=${latMax}&longMin=${longMin}&longMax=${longMax}`)
    .then(res => res.json())
    .then(data => {
      const weatherData = data.map(item => `Location: ${item.locationName}, Temperature: ${item.temperature}°C, Humidity: ${item.humidity}%`).join('\n');
      displayMessage('latLongMessage', weatherData);
    })
    .catch(err => displayMessage('latLongMessage', err.message, true));
}

// Retrieve top users by forecasts
function getTopUsersByForecasts() {
  fetch(`${apiBase}/topUsersByForecasts`)
    .then(res => res.json())
    .then(data => {
      const topUsers = data.map(user => `${user.username} (${user.forecastCount} forecasts)`).join('\n');
      displayMessage('topUsersMessage', topUsers);
    })
    .catch(err => displayMessage('topUsersMessage', err.message, true));
}

// Retrieve observation points by type
function getObservationPointsByType() {
  fetch(`${apiBase}/observationPointsByType`)
    .then(res => res.json())
    .then(data => {
      const points = data.map(item => `${item.locationType}: ${item.observationCount} points`).join('\n');
      displayMessage('observationPointsMessage', points);
    })
    .catch(err => displayMessage('observationPointsMessage', err.message, true));
}
