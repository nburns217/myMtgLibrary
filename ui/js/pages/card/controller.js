define([], function() {
	function cardController($scope, $http, $stateParams) {
		$scope.card = null;
		$http.get(serverRoot + "/cards/"+$stateParams.cardId)
			.then(function(resp) {
				$scope.card = resp.data;
			});
	}


	cardController.$inject = ['$scope', '$http', '$stateParams'];

	return cardController;
});