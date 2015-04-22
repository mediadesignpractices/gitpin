#!/bin/env node
var express = require('express');
var app = express();
var http = require('http').Server(app);
var request = require('request');
var io = require('socket.io')(http);
var redis = require('redis');
var RequestRedisCache = require('request-redis-cache');


app.disable('x-powered-by');

var gitRequest = function(){
  var req= this;

  req.userRepos = function(user, db, callback){

    var options = {
      url: 'https://api.github.com/users/'+user+'/repos?page=1&per_page=1',
      headers: {
        'User-Agent': 'unsalted'
      }
    }

    request(options, function (error, response, body) {

      if (!error) {
        var info = JSON.parse(body);
        return info;
      } else {
        console.warn(error);
      }

    });

  }
}

var getData = function(cache){

  var gd = this;

  gd.userRepos = function(user){

    cache.get({

      cacheKey: user,

      cacheTtl: 100, // seconds 

      // Dynamic `options` to pass to our `uncachedGet` call 
      requestOptions: {gitRequest.userRepos(user)},
      // Action to use when we cannot retrieve data from cache 
      uncachedGet: function (options, cb) {
        // Simulate data coming back from an API client (should be already parsed) 
        cb(null, {hello: 'world'});
      }
    }, function handleData (err, data) {
      // Look at the data in our cache, '{"hello":"world"}' 
      redisClient.get(user, console.log);
     
      // Re-retrieve the data 
      cache.get({
        cacheKey: user,
        cacheTtl: 100,
        requestOptions: requestOptions: {gitRequest.userRepos(user)},,
        uncachedGet: function (options, cb) {
          cb(new Error('This will not be reached since the data is cached'));
        }
      }, console.log); // {hello: 'world'} 
    });
  }
}

var database = function(){

  var cnct = this;
  var client;
  var GitRequest = new gitRequest();

  cnct.clientVariables = function(){

    cnct.host = process.env.OPENSHIFT_REDIS_HOST;
    cnct.port = process.env.OPENSHIFT_REDIS_PORT || 6379;
    cnct.pass = process.env.REDIS_PASSWORD;

    if (typeof cnct.host === "undefined") {
        console.warn('No OPENSHIFT_REDIS_DB_HOST var, using 127.0.0.1');
        cnct.host = "127.0.0.1";
    };

  }

  cnct.createClient = function(){

    client = redis.createClient(cnct.port, cnct.host);

    client.on('connect', function() {
      console.log('connected');
    });

    client.on("error", function (err) {
        console.log("Error " + err);
    });

    if (typeof cnct.pass != "undefined") {
        client.auth(cnct.pass);
    } else {
        console.warn('NO AUTH REQUIRED');
    }

  }

  cnct.clientAuth = function(){

    if (typeof cnct.pass != "undefined") {
        console.warn('NO AUTH REQUIRED');
        client.auth(cnct.pass);
    };

  }

  cnct.testClient = function(){
    var rep;

    client.set("test", "true", function(err, reply) {

      console.log(reply);

    });

    client.get("test", function(err, reply) {

      console.log(reply);
      rep = reply;

      if(rep === "true"){
        console.warn("positive test");
      }

    });

    client.del("test", function(err, reply) {

      console.log(reply);
      console.warn("deleted test entry");

    });

  }
  //setup redisCache
  cnct.cache = function(){
    var cache = new RequestRedisCache({
      redis: client
    });
  }

}

var server = function(){

  var strt = this;

  strt.setHeaders = function(){

    app.use(function (req, res, next) {
      res.setHeader('Access-Control-Allow-Origin', 'http://www.metagenome.club:8000, http://metagenome.club:8000, http://node-metagenome.rhcloud.com:8000');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
      res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
      next();
    });

  }

  strt.setupVariables = function() {
    strt.ipaddress = process.env.OPENSHIFT_NODEJS_IP;
    strt.port      = process.env.OPENSHIFT_NODEJS_PORT || 3000;

    if (typeof strt.ipaddress === "undefined") {

        console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
        strt.ipaddress = "127.0.0.1";
    };
  }

  strt.createRoutes = function() {

    app.use("/", express.static(__dirname + "/static"));
    app.use("/styles", express.static(__dirname + "/styles"));

  }

  strt.initializeServer = function() {

    http.listen(strt.port, strt.ipaddress, function(){
      console.log('listening on *:3000');
    });
  }

}

var Start = new server();
Start.setHeaders();
Start.clientVariables();
Start.createRoutes();
Start.initializeServer();

var Database = new database();
Database.setupVariables();
Database.createClient();

var GetData = new getData(Database.cache());
GetData.userRepos('unsalted');



