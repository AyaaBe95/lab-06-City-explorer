'use strict';

const express = require('express');
const cors = require('cors');
const superagent = require('superagent')
const pg =require('pg');
const PORT = process.env.PORT || 3030;
const server = express();
server.use(cors());


const client=new pg.Client(process.env.DATABASE_URL);
// const client = new pg.Client({ connectionString: process.env.DATABASE_URL,   ssl: { rejectUnauthorized: false } });










// location

server.get('/location', locationHandler);
server.get('/weather', weatherhandler)
server.get('/parks', parkHandler);


function locationHandler(request, response) {
    const city = request.query.city;
    console.log('gggg',request.query)


    getLocation(city)

        .then(locationData => {
            response.status(200).json(locationData);

        }).catch(()=>{
            errorHandler('Error in getting data from LocationIQ')
        })


}


  
function getLocation(city) {
    let key = process.env.LOCATION_KEY;


    let SQL='SELECT * FROM locations WHERE  search_query=$1;';
    let safevalue =[city]
    

     return client.query(SQL,safevalue)
    .then(result =>{
        if (result.rows.length ){
            return result.rows[0]
        }
        else{
            let url = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json`;
             return superagent.get(url)
            .then(locData => {
                var  locationData = new Location(city, locData.body);
                let formatted_query = locationData.formatted_query
                let lat=locationData.latitude;
                let lon=locationData.longitude;
                const SQLIn = 'INSERT INTO locations (search_query,formatted_query,latitude,longitude)VALUES($1,$2,$3,$4) RETURNING *;';
                let safevalues=[city,formatted_query,lat,lon];
                return client.query(SQLIn, safevalues)
                .then(result => {
                    result.rows[0];

            })
            .catch(error=>errorHandler(error));

       

        
    

    
    })
}
})
}




function Location (city, geoData) {
    this.search_query = city;
    this.formatted_query = geoData[0].display_name;
    this.latitude = geoData[0].lat;
    this.longitude = geoData[0].lon;
}

////////////////////////////////////

// get weather

function weatherhandler(request, response){
    const city = request.query.search_query;
    getWeather(city)
    .then(weatherData =>{
        response.status(200).json(weatherData);
    }).catch(()=>{
        errorHandler('Error in getting data from WeatherIQ')
    })


}

function getWeather (city){
    let key = process.env.WEATHER_KEY;
    const url = `https://api.weatherbit.io/v2.0/forecast/daily?city=${city}&key=${key}`;
    let  watherStatus=[];   
    
    return superagent.get(url)
    .then(weatherData =>{
        weatherData.body.data.map((val,i) =>{
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
//////////////////////////////

// get park

function parkHandler(request,response){
    const city = request.query.search_query;
    getPark(city)
    .then(parkData =>{
        response.status(200).json(parkData);
    }).catch(()=>{
        errorHandler('Error in getting data from parkIQ')
    })

  
    

}

function getPark(){
    let key =process.env.PARK_KEY;

    const url =`https://developer.nps.gov/api/v1/parks?parkCode=acad&api_key=${key}`
    let parkArr =[];

    return superagent.get(url)
    .then(parkData => {
        parkData.body.data.map((val,i) =>{
            let parkInfo = new Park (val);
            parkArr.push(parkInfo)
        })
        return parkArr;
    })

}

function Park(info){
    this.name =info.fullName;
    this.addresses =info.addresses;
    this.fee =info.fees;
    this.desc =info.description;
    this.url =info.url

}



function errorHandler(errors) {
    server.use('*',(req,res)=>{
        res.status(500).send(errors);
    })
}


server.listen(PORT, () => {
    console.log(`Listening on PORT ${PORT}`);
})











