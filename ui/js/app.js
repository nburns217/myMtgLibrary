define([
	'app/config',
    /*PAGES*/
  'pages/home/home-controller',
  'pages/search/search-controller',
  'pages/progress/progress-controller',
  'pages/card/controller',
    /*COMPONENTS*/
  'component/cardList/controller',
  // 'component/cosmicSigDetails/controller',
  // 'component/newCosmicSignature/controller',
	'angular-cache-buster',
	'angular-resource',
  'angular-ui-router',
  'angular-ui-bootstrap',
  ],
 
  function(
    config, 
    /*PAGES*/
    homeController,
    searchController,
    progressController,
    cardController,
    /*COMPONENTS*/
    cardList
    // cosmicSigList, cosmicSigDetails, newSignature
    ){
    window.serverRoot = "http://127.0.0.1:8080";
    var app = angular.module('mtg', ['ngResource','ui.router','ngCacheBuster','ui.bootstrap']); //,'mgcrea.ngStrap', 'ngAnimate'
    app.config(config);
    // app.factory('ideasDataSvc',ideasDataSvc);

    /*PAGES*/
    app.controller('homeController', homeController);
    app.controller('searchController', searchController);
    app.controller('progressController', progressController);
    app.controller('cardController', cardController);
    // app.controller('mCosmicSignaturesController', mCosmicSignatures);
    // app.controller('mCosmicSignatureDetailsController',mCosmicSignatureDetailsController);
    // app.controller('mNewCosmicSignatureController',mNewCosmicSignatureController);
    // /*COMPONENTS*/
    app.directive("cardList", cardList);
    // app.directive("cosmicSignatureDetails", cosmicSigDetails);
    // app.directive("newCosmicSignature", newSignature);
    // app.controller('ideaDetailsController',ideaDetailsController);
});