'use strict';

const express = require('express');
const server = express();
const cors = require('cors');
const PORT = process.env.PORT || 3030;

const superagent = require('superagent')




require('dotenv').config();


server.use(cors());




server.listen(PORT, () => {
    console.log(`Listening on PORT ${PORT}`);
})

//testing
// server.get('/test',(req,res) =>{
//     res.send('your server is working fine')
// })



// server.get('/location', (req, res) => {
//     const locData = require('./data/location.json');
//     // console.log(locData)
//     const locationData = new Location(locData);
//     res.send(locationData)

// })


// location

server.get('/location', locationHandler);
server.get('/weather', weatherhandler)


function locationHandler(request, response) {
    const city = request.query.city;
    // console.log(city)

    getLocation(city)
        .then(locationData => {
            response.status(200).json(locationData);

        })


}

function getLocation(city) {
    let key = process.env.LOCATION_KEY;

    let url = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json`;

    return superagent.get(url)
        .then(locData => {

            const locationData = new Location(city, locData.body);
            return locationData;

        })

}

// Constructors for location

function Location (city, geoData) {
    this.search_query = city;
    this.formatted_query = geoData[0].display_name;
    this.latitude = geoData[0].lat;
    this.longitude = geoData[0].lon;
}

// get weather


function weatherhandler(request, response){
    const city = request.query.search_query;
    getWeather(city)
    .then(weatherData =>{
        response.status(200).json(weatherData);
    })


}

function getWeather (city){
    let key = process.env.WEATHER_KEY;
    const url = `https://api.weatherbit.io/v2.0/forecast/daily?city=${city}&key=${key}`;
    let  watherStatus=[];   
    
    return superagent.get(url)
    .then(weatherData =>{
        weatherData.body.data.map(val =>{
            let weatherInfo = new  Weather (val);
            watherStatus.push(weatherInfo)
        })
        return watherStatus;
    })


}

function Weather(i) {
    this.forecast = i.weather.description;
    this.time = i.datetime;

}





// errors
server.use("*", (req, res) => {
    res.status(404).send('Not found')
})
server.use('*', (req, res) => {
    res.status(500).send('Sorry, something went wrong')
})




