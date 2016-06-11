define([], function() {
	function controller($scope, $http) {
		$scope.setCount = function(card, inc) {
			card.count += inc;
			if(card.count < 0) {
				card.count = 0;
			}
			$http.post(serverRoot + "/cards/" + card.id + "/setCount", {count: card.count})
				.then(function() {

				});
		}
		$scope.mode = "list";
	}
 
	controller.$inject=['$scope', '$http'];
 
	return function() {
		return {
			restrict: "E",
			replace: true,
			scope: {
				cards: "=",
				searchString: "="
			},
			templateUrl : "js/components/cardList/template.html",
			controller: controller
		};
	}
});