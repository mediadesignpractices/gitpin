
var redis = require('redis');

module.exports = {


    RedisConnect : function(){

      var cnct = this;

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

        return client;

      }

      cnct.clientAuth = function(){

        if (typeof cnct.pass != "undefined") {
            console.warn('NO AUTH REQUIRED');
            client.auth(cnct.pass);
        };

      }

      cnct.testClient = function(client){
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

}

