#!/bin/env node
var express = require('express');
var app = express();
var http = require('http').Server(app);
var request = require('request');
var io = require('socket.io')(http);
var organism = require('./node/populate.js');
var redis = require('redis');


app.disable('x-powered-by');

var pull = function(){
  var req= this;
  req.getData = function(){

    var options = {
      url: 'https://api.github.com/users/unsalted/repos?page=1&per_page=100',
      headers: {
        'User-Agent': 'unsalted'
      }
    }

    request(options, function (error, response, body) {
      if (!error) {
        var info = JSON.parse(body);
        console.log(info); // Show the HTML for the Google homepage.
      } else {
        console.log('error');
        console.warn(error);
      }
    });
  }
}

var database = function(){

  var cnct = this;
  var client;

  cnct.setupVariables = function(){

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

  strt.ioServer = function() {
  /*  var metagenome = new organism.Metagenome();
    metagenome.spark();
    var change = false;

  setInterval(function(){
    metagenome.update();
    change = true;
  }, 1000);

    io.on('connection', function(socket){
      socket.emit('change state', metagenome.object);
      setInterval(function(){
        if (change){
          io.sockets.emit('change state', metagenome.object);
          change = false;
        }
      }, 100);

    });*/
  }

  strt.initializeServer = function() {

    http.listen(strt.port, strt.ipaddress, function(){
      console.log('listening on *:3000');
    });
  }

}

var Start = new server();
//Start.setHeaders();
Start.setupVariables();
Start.createRoutes();
Start.ioServer();
Start.initializeServer();

var Connect = new database();
Connect.setupVariables();
Connect.createClient();
Connect.testClient();

var Pull = new pull();
Pull.getData();



