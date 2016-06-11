define([
	],function(){
  function config($stateProvider, $urlRouterProvider) {
  	$urlRouterProvider.otherwise("/");

	$stateProvider
		.state("home", {
			url: "/",
			controller: "homeController",
			templateUrl: "js/pages/home/home.html"
		})
		.state("search", {
			url: "/search",
			controller: "searchController",
			templateUrl: "js/pages/search/search.html"
		})
		.state("progress", {
			url: "/progress",
			controller: "progressController",
			templateUrl: "js/pages/progress/progress.html"
		})
		.state("card", {
			url: "/cards/{cardId:int}",
			controller: "cardController",
			templateUrl: "js/pages/card/template.html"
		})
		// .state("mCosmicSig", {
		// 	url: "/m/cosmicSig",
		// 	controller: "mCosmicSignaturesController",
		// 	templateUrl: "js/pages/mcosmicSignatures/template.html"
		// })
		// .state("mCosmicSigDetails", {
		// 	url: "/m/cosmicSignatureDetails/:id",
		// 	controller: "mCosmicSignatureDetailsController",
		// 	templateUrl: "js/pages/mcosmicSignatureDetails/template.html"
		// })
		// .state("mNewCosmicSig", {
		// 	url: "/m/newCosmicSignature",
		// 	controller: "mNewCosmicSignatureController",
		// 	templateUrl: "js/pages/mNewCosmicSignature/template.html"
		// })
		;
  }
  config.$inject=['$stateProvider','$urlRouterProvider'];
 
  return config;
});