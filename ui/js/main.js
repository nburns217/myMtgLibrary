/**
 * Example of Require.js boostrap javascript
 */


requirejs.config({
    // Path mappings for the logical module names
    paths: {
        'jquery'				: '../node_modules/jquery/dist/jquery.min',
        'angular'               : '../node_modules/angular/angular',
        'angular-resource'      : '../node_modules/angular-resource/angular-resource.min',
        'angular-cache-buster'  : '../node_modules/angular-cache-buster/angular-cache-buster',
        'angular-ui-router'     : '../node_modules/angular-ui-router/release/angular-ui-router.min',
        'angular-strap'         : '../node_modules/angular-strap/dist/angular-strap.min',
        'angular-strap-tpl'     : '../node_modules/angular-strap/dist/angular-strap.tpl.min',
        'tether'                : '../node_modules/tether/dist/js/tether.min',
        'angular-ui-bootstrap'  : '../thirdparty/angular-ui-bootstrap',
        'angular-animate'       : '../thirdparty/angular-animate',
        'text'					: '../node_modules/requirejs-text/text',
        'bootstrap'              : '../node_modules/bootstrap/dist/js/bootstrap.min',
        'pages' 				: '../js/pages',
        'component' 			: '../js/components',
        'app' 					: "."

    },
    // Shim configurations for modules that do not expose AMD
    shim: {
        'jquery': {
            exports: ['jQuery', '$']
        },
        "angular": {
            exports: "angular"
        },
        "angular-resource": {
            deps: ["angular"]
        },
        "angular-ui-router": {
            deps: ["angular"]
        },
        "angular-cache-buster": {
            deps: ["angular"]
        },
        "bootstrap" : {
            deps: ["tether"]
        },
        "angular-ui-bootstrap": {
            deps: ["angular"]
        },
        // "angular-animate": {
        //     deps: ["angular"]
        // },
        // "angular-strap" : {
        //     deps: ["angular-strap-tpl"]
        // }
    },
    config: {
    }
});

require([
    'jquery',
    'bootstrap',
    'angular',
    'app/app'
],
        function ($)
        {
            angular.bootstrap(document, ['mtg']);
        }
);


