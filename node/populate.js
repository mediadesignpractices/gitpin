 //----------------------------------------------
    //set variables

    var colors = [
    {hue: 0.59, saturation:0.8788, brightness:0.9059 },
    {hue: 231, saturation:0.6667, brightness:0.5882 },   
    {hue: 128.03, saturation:0.756, brightness:0.6588 },   
    {hue: 329.54, saturation:0.8603, brightness:0.898 },   
    {hue: 198.82, saturation:0.7824, brightness:0.8771 },   
    {hue:55.29 , saturation:0.8095, brightness:0.9882 }
    ];


    var colorIndex = 0;
    var ratios = [ 1, 0.75, 0.50, 0.25, 0.15 ];

    var currentTime =  function(){ return new Date().getTime(); };

    //----------------------------------------------
    //Reused functions

    Array.prototype.getIndexBy = function (name, value) {
        for (var i = 0; i < this.length; i++) {
            if (this[i][name] == value) {
                return i;
            }
        }
    }


    //generate uid
    var guid = (function() {
      function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
                   .toString(16)
                   .substring(1);
      }
      return function() {
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
               s4() + '-' + s4() + s4() + s4();
      };
    })();


    //generate random point within range;
    var genPos = function(min, max) {      
        var pos =  [randomIntFromInterval(min, max), randomIntFromInterval(min, max)];
        return pos;
    }

    //generate random int
    var randomIntFromInterval = function(min,max) {
        return Math.floor(Math.random()*(max-min+1)+min);
    }

    var getColor = function(){
        colorIndex++;
        if (colorIndex == colors.length-1) colorIndex = 0;     //reset
        return colors[colorIndex];
    };


    /**
     * Randomize array element order in-place.
     * Using Fisher-Yates shuffle algorithm.
     */
    function shuffleArray(array) {
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    }

/* expose to node */

Populate = function() {
    //init mgenome
    this.cultures_length = 4;
    this.colonies_length = 3;

    this.__defineGetter__("object", function(){
        return mgenome;
    });

    var mgenome = {
        "cultures":[
        ],
        "index": {
          "cultures": [],
          "cultures_length" : this.cultures_length
        },
        "time_created": currentTime()
    };

    this.addCulture = function(i, positions, radii){
        var culture = this.generateCulture(i, positions, radii, this.colonies_length);

        return culture;
    }
    this.generateCulture = function(index, positions, radii, total){
        var ratio = ratios[index];
        var uid = guid();
        var pos = positions;

        var colonies = this.addColonies(pos, radii, ratio, uid, total);
        var colonies_uid = [];

        for (var i = colonies.length - 1; i >= 0; i--) {
            colonies_uid.unshift(colonies[i].uid);
        };

        var culture = {
            "type": "culture",
            "uid": uid,
            "color": getColor(),
            "old_color": {},
            "ratio": ratio,
            "layer": index,
            "colonies": colonies,
            "index": {
              "child_cultures": [],
              "parent_cultures": [],
              "colonies": colonies_uid,
              "points": pos.reverse(),
              "radii": radii.reverse(),
              "colonies_length": total
            },
            "time_created": currentTime()
        }
        return culture;
    }
    this.addColonies = function(pos, radii, ratio, uid, total){
        var colonies = [];
        for (var i = total - 1; i >= 0; i--) {
            colonies.push(this.generateColony(pos[i], radii[i], ratio, uid));
        };

        return colonies;
    }
    this.generateColony = function(point, radius, ratio, parent_uid){
        var colony = {
            "type": "colony",
            "uid": guid(),
            "point": point,   //this will be mapped in browser
            "radius": radius*ratio,
            "ratio": ratio,
            "culture": parent_uid
        }
        return colony;
    }
    this.start = function(){
        var positions = [];
        var radii = [];

        for (var i = this.colonies_length-1; i >= 0; i--) {
            radii.push(randomIntFromInterval(100, 250));
            positions.push(genPos(-1000, 1000));
        };

        for (var i = this.cultures_length; i >= 0; i--) {
            var culture = this.addCulture(i, positions, radii);
            mgenome.cultures.unshift(culture);
            mgenome.index.cultures.unshift(culture.uid);
        };

        for (var i = this.cultures_length - 1; i >= 0; i--) {
            var culture = mgenome.cultures[i];
            var n = culture.layer;
            for (var x = this.cultures_length - 1; x >= 0; x--) {
                if (x>n){
                culture.index.child_cultures.unshift(mgenome.cultures[x].uid);
                } else if(x<n) {
                     culture.index.parent_cultures.unshift(mgenome.cultures[x].uid);
                } else {}
            }
        
        };
    }

}

var Mutation = function(object) {
    var roll = function(odds) {
        var n = Math.floor(Math.random() * odds) + 1;
        if (n == odds) return true;
    }
    var selectCulture = function() {
        //set lowest to 1 to avoid changing base layer
        var length = object.index.cultures_length;
        var n = randomIntFromInterval(1, length-1);
        var culture = object.cultures[n];
        return culture;
    }
    var selectColony = function(culture) {
        var length = culture.index.colonies_length-1;
        var n = randomIntFromInterval(0, length);
        var colony = culture.index.colonies[n];
        console.log('boop'+n);
        return colony;  //return uid
    }
    var removeValueArray = function(array, value){
        for (var i = array.length - 1; i >= 0; i--) {
            if(array[i] == value){
                array.splice(i);
            }
        }
    }
    var killColony = function() {
        var culture = selectCulture();
        hasParent = culture.index.parent_cultures.length >= 1;
        hasChild = culture.index.child_cultures.length >= 1;
        if(hasParent){

            var colonyUid = selectColony(culture);
            var colonyIndex = culture.colonies.getIndexBy("uid", colonyUid);
            var colonyPoint = culture.colonies[colonyIndex].point;

            if(hasChild){
                for (var i = culture.index.child_cultures.length - 1; i >= 0; i--) {

                    var childUid = culture.index.child_cultures[i];
                    var child_culture_index = object.cultures.getIndexBy("uid", childUid);
                    var child_culture = object.cultures[child_culture_index];
                    var childColonyIndex = child_culture.colonies.getIndexBy("point", colonyPoint);

                    object.cultures[child_culture_index].colonies.splice(childColonyIndex);
                    //console.log(object.cultures[child_culture_index].index.colonies[childColonyIndex]);
                    object.cultures[child_culture_index].index.colonies.splice(childColonyIndex,1);
                    object.cultures[child_culture_index].index.points.splice(childColonyIndex,1);
                    console.log(object.cultures[child_culture_index].index.colonies);
                    object.cultures[child_culture_index].index.colonies_length--;
                    if( object.cultures[child_culture_index].index.colonies_length <= 0){
                        console.log('KILL child');
                        object.cultures.splice(child_culture_index, 1);
                        for (var i = object.cultures.length - 1; i >= 0; i--) {
                            removeValueArray(object.cultures[i].index.child_cultures, childUid);
                            removeValueArray(object.cultures[i].index.parent_cultures, childUid);
                        };
                         object.index.cultures_length--;
                         return;
                    }
                    console.log("child");
                };
            }
            culture.colonies.splice(colonyIndex,1);
            culture.index.colonies.splice(colonyIndex,1);
            culture.index.points.splice(colonyIndex,0);
            culture.index.colonies_length--;

            if(culture.index.colonies_length <= 0){
                console.log('KILL main');
                var index = object.cultures.getIndexBy("uid", culture.uid);
                for (var i = object.cultures.length - 1; i >= 0; i--) {
                    removeValueArray(object.cultures[i].index.child_cultures, culture.uid);
                    removeValueArray(object.cultures[i].index.parent_cultures, culture.uid);
                };
                object.cultures.splice(index, 1);                            //KILL CULTURE IF 0;
                object.index.cultures_length--;
                return;
            }
        }

    }

    var morphCulture = function(){
        var culture = selectCulture();
        culture.color = getColor();
        console.log(culture.uid);
    }
    this.populationControl = function(culture) {
        /** add and remove colonies **/
        if (Math.random()<.5){
            morphCulture();
            console.log('morph');
        } else if(roll(5)) {
            killColony();
            console.log("killColony");
        } else if(roll(20)){
               
        } else {

        }
        return object;
    }
}

module.exports = {

    //----------------------------------------------
    //Populate function

Metagenome : function(){
    var metagenome = new Populate();
    this.__defineGetter__("object", function(){
        return metagenome.object;
    });
    this.spark = function(){
        metagenome.start();
    }
    this.update = function() {
        var mutate = new Mutation(metagenome.object);
        metagenome.object = mutate.populationControl();
    }
}

}

