
=======
# gitpin

A knowledge repository of mdp git repos tagged with #mdp.

Plans to build in filtering, sorting and extended tagging using isotope.
https://github.com/metafizzy/isotope

Just getting started... as you can see it is still pretty rough.

hosted api
http://redis-mdptests.rhcloud.com/api

hosted view
http://redis-mdptests.rhcloud.com/

project is:  GNU GPL license v3 (license chosen because it will use isotope)

will add license file soon.

## Whats' it built with

This is my first time working with some of these, noteably require and knockout.

- node.js
- redis
- knockout.js
- lodash
- require.js
- grunt
- and others...



## What's done so far

 - cacheing git requests using redis with a ttl
 - filtering and pushing out own api
 - start of one page app using knockout.js
 - displaying json properties to view using ko.mapping


## Should be obvious

load dependencies: 
`` npm install
`` bower install

build files
`` grunt