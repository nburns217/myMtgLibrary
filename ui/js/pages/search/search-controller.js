define([], function() {
	function searchController($scope, $http) {
		$scope.cards = [];
		$scope.name = "";

		$scope.$watch('name', function() {
			loadCard();
		});

		function loadCard() {
			if($scope.name.length < 3) { return; }
			$http.get(serverRoot + "/cards/search/?name="+$scope.name)
				.then(function(resp) {
					$scope.cards = resp.data;
				});
		}

		$scope.setCount = function(card, inc) {
			card.count += inc;
			if(card.count < 0) {
				card.count = 0;
			}
			$http.post(serverRoot + "/cards/" + card.id + "/setCount", {count: card.count})
				.then(function() {

				});
		}

	}


	searchController.$inject = ['$scope', '$http'];

	return searchController;
});