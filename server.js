#!/bin/env node
var express = require('express');
var app = express();
var http = require('http').Server(app);
var redisConnect = require('./node/redisConnect.js');
var userData = require('./node/userData.js');
var RequestRedisCache = require('request-redis-cache');

app.disable('x-powered-by');


var RedisConnect = new redisConnect.RedisConnect;   //start setup
RedisConnect.setupVariables();                      //set connection for loacl or openshift remote
redisClient = RedisConnect.createClient();          //create new client connection
RedisConnect.testClient(client);                    //test to see if working



var cache = new RequestRedisCache({
  redis: redisClient
});

var server = function(){

  var strt = this;

  strt.setHeaders = function(){

    app.use(function (req, res, next) {
      res.setHeader('Access-Control-Allow-Origin', 'http://redis-mdptest.rhcloud.com:8000');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
      res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
      next();
    });

  }

  strt.setupVariables = function() {                  // most of this is required to check for the rhc server
    strt.ipaddress = process.env.OPENSHIFT_NODEJS_IP; // e.g. rhc server variable
    strt.port      = process.env.OPENSHIFT_NODEJS_PORT || 3000;

    if (typeof strt.ipaddress === "undefined") {

        console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
        strt.ipaddress = "127.0.0.1";
    };
  }

  strt.createRoutes = function() {

    app.use("/", express.static(__dirname + "/static"));
    app.use("/assets", express.static(__dirname + "/assets"));
    app.get('/api',function(req,res){
      var user = 'unsalted';
      var UserData = new userData.user;   //request data on user from github server
      UserData.getData(cache, user, res); // this will be beefed up soon to handle a list of users
    });

  }

  strt.initializeServer = function() {

    http.listen(strt.port, strt.ipaddress, function(){
      console.log('listening on *:3000');
    });
  }

}

var Start = new server();
Start.setHeaders();
Start.setupVariables();
Start.createRoutes();
Start.initializeServer();
