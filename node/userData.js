var request = require('request');
var _ = require('lodash');
var RequestRedisCache = require('request-redis-cache'); // Uber Redis Cache 


module.exports = {

  user : function(){

    this.getData = function(cache, user, res){  //redis cache, user login, api response object

      cache.get({

        cacheKey: user,
        cacheTtl: 300, // seconds
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

              // check for #mdp remove all without
              var tagged = _.remove(json, function(n) {
                return n.description.indexOf('#mdp') >= 0;
              });

              //*
              // yay stackoverflow: 
              // http://stackoverflow.com/questions/29811147/whitelist-a-set-of-properties-from-a-multidimensional-json-array-and-delete-the
              //*

              // whitelist desired properties to pare down data that is cached.

              tagged = _.map(tagged, function (t) {
                  return _.pick(t, ['id','name','html_url','description','language','size','owner','language']);
              });


              cb(null, tagged);
              console.log('uncached get');

            } else {

              console.log('error');
              console.warn(error);

            }

          });
          
        }
      }, function handleData (err, data) {

        var dtstr = JSON.stringify(data);
        res.end(dtstr); //api response

      });

    }

  }

}

