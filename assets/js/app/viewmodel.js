define(['knockout', 'komapping', 'ajax' ], function(ko, komapping, ajax) {

    ko.mapping = komapping;

    function SomeModel() {
        this.name = ko.observable();
        this.id = ko.observable();
    }

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
        ko.mapping.fromJS(models, self.repos);
       }

       return this.getRepos();

    };

    ko.applyBindings(new viewModel());


});