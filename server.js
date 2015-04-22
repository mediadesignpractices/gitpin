#!/bin/env node
var express = require('express');
var app = express();
var http = require('http').Server(app);
var request = require('request');
var io = require('socket.io')(http);
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

// Fetch some data from a fake client

var getUserData = function(user, opt){
  var GitUser = new gitUser();

  cache.get({

    cacheKey: user,
    cacheTtl: 10, // seconds
    // Dynamic `options` to pass to our `uncachedGet` call
    requestOptions: {
      url: 'https://api.github.com/users/unsalted/repos?page=1&per_page=2',
      headers: {
        'User-Agent': 'unsalted'
      }},
    // Action to use when we cannot retrieve data from cache
    uncachedGet: function (options, cb) {
      request(options, function (error, response, body) {

        if (!error) {

          var json = JSON.parse(body);

          var evens = _.remove(json, function(n) {
            return n.description.indexOf('#mdp') >= 0;
          });
          cb(null, evens);

        } else {

          console.log('error');
          console.warn(error);

        }

      });
      
    }
  }, function handleData (err, data) {
    // Look at the data in our cache, '{"hello":"world"}'
    redisClient.get(user, log(data));
  });

}

//getUserData('unsalted');

var GitUser = new gitUser();
var options = {
  url: 'https://api.github.com/users/unsalted/repos?page=1&per_page=1',
  headers: {
    'User-Agent': 'unsalted'
  }
}

getUserData('unsalted', options);
//GitUser.repos('unsalted');
