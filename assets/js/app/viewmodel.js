define(['knockout', 'komapping', 'ajax' ], function(ko, komapping, ajax) {

    ko.mapping = komapping;

    var viewModel = function() {
       var self = this;

       this.repos = ko.mapping.fromJS([]);

       this.getRepos = function() {

           ajax({
              url: '/api',
              onSuccess: function(data) {
                console.log('success');

                var parsed = JSON.parse(data);
                
                self.retreivedRepos(parsed);
              },
              onError: function(msg) {
                console.log('error: ' + data)
              }
            });

        }

       this.retreivedRepos = function(models) {
        ko.mapping.fromJS(models, self.repos);  //map json to knockout
       }

       return this.getRepos();

    };

    ko.applyBindings(new viewModel());

});