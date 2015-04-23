
require.config({
    paths: {
        knockout: "vendor/knockout",
        komapping: "vendor/knockout.mapping",
        postal: "vendor/postal.min",
        lodash: "vendor/lodash.min",
        ajax: "vendor/microajax",
        viewmodel: "app/viewmodel",
        getrepos: "app/getrepos"
    },
    shim: {
        lodash: {
            exports: "_"
        },
        ajax: {
            exports: "ajax"
        },
        komapping: {
            deps: ['knockout'],
            exports: 'komapping'
        }
    },
    baseUrl: "/assets/js"
});

require( [ "knockout", "viewmodel" ], function(ko, viewModel ) {
    

})
