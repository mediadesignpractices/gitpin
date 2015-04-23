#!/bin/env node
var express = require('express');
var app = express();
var http = require('http').Server(app);
var request = require('request');
var redisConnect = require('./node/redisConnect.js');
var RequestRedisCache = require('request-redis-cache');
var _ = require('lodash');


app.disable('x-powered-by');

var gitUser = function(){
  var req= this;

  req.repos = function(user){

    var options = {
      url: 'https://api.github.com/users/'+user+'/repos?page=1&per_page=1',
      headers: {
        'User-Agent': 'unsalted'
      }
    }

    request(options, function (error, response, body) {

      if (!error) {

        var info = JSON.parse(body);
        console.log(info);
        return info;

      } else {
        console.log('error');
        console.warn(error);
      }

    });

  }
}


var RedisConnect = new redisConnect.RedisConnect;  //start setup
RedisConnect.setupVariables();                  //set connection for loacl or openshift remote
redisClient = RedisConnect.createClient();           //create new client connection
RedisConnect.testClient(client);                //test to see if working



var cache = new RequestRedisCache({
  redis: redisClient
});

var log = function(data){
  console.log(data);
}

var getUserData = function(user, res){
  var GitUser = new gitUser();

  cache.get({

    cacheKey: user,
    cacheTtl: 10, // seconds
    // Dynamic `options` to pass to our `uncachedGet` call
    requestOptions: {
      url: 'https://api.github.com/users/unsalted/repos?page=1&per_page=2',
      headers: {
        'User-Agent': 'unsalted'
      }
    },
    // Action to use when we cannot retrieve data from cache
    uncachedGet: function (options, cb) {
      request(options, function (error, response, body) {

        if (!error) {

          var json = JSON.parse(body);

          var tagged = _.remove(json, function(n) {
            return n.description.indexOf('#mdp') >= 0;
          });

          for (var i = tagged.length - 1; i >= 0; i--) {
              delete tagged[i].private;
              delete tagged[i].owner.gravatar_id;
              delete tagged[i].owner.url;
              delete tagged[i].owner.followers_url;
              delete tagged[i].owner.following_url;
              delete tagged[i].owner.gravatar_id;

          };


          cb(null, tagged);
          console.log('uncached get');

        } else {

          console.log('error');
          console.warn(error);

        }

      });
      
    }
  }, function handleData (err, data) {
    // Look at the data in our cache, '{"hello":"world"}'
    var dtstr = JSON.stringify(data);
    res.end(dtstr);
    //redisClient.get(user, res.end(JSON.stringify(data)));
  });

}

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
    app.use("/assets", express.static(__dirname + "/assets"));
    app.get('/api',function(req,res){
      var user = 'unsalted';
      getUserData(user, res);
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
//Start.ioServer();
Start.initializeServer();
