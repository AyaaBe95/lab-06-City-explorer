'use strict';

const express = require ('express');
const server = express();
const cors = require('cors');
const PORT = process.env.PORT || 3030;




require('dotenv').config();


server.use(cors());




server.listen(PORT, () => {
    console.log(`Listening on PORT${PORT}`);
})

// server.get('/test',(req,res) =>{

//     res.send('your server is working fine')
// })


// get locations

server.get('/location',(req,res) =>{
    const locData = require('./data/location.json');
    // console.log(locData)
    const locationData = new Location (locData);
    res.send(locationData)

})

// Constructors for location

function Location (geoData){
    this.search_query = "city";
    this.formatted_query= geoData[0].display_name;
    this.latitude = geoData[0].lat;
    this.longitude = geoData[0].lon;
}

// get weather

server.get('/weather',(req,res) =>{
    const weatherData = require('./data/weather.json');
    // console.log(weatherData)
    let weatherArr =[]
    for (let i = 0; i < weatherData.data.length; i++) {

        const weatherStatus = new Weather (weatherData,i)
        weatherArr.push(weatherStatus)
        
    }
    res.send(weatherArr)


})

// Constructors for weather

function Weather (weatherInfo,i){
    this.forecast = weatherInfo.data[i].weather.description;
    this.time = weatherInfo.data[i].datetime;

}


server.use("*",(req,res) => {
    res.status(404).send('Not found')
})




