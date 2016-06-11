define([], function() {
	function progressController($scope, $http) {
		// debugger;
		$http.get(serverRoot + "/sets/progress")
			.then(function(resp) {
				$scope.sets = resp.data;
			});

		$scope.loadSetProgress = function(set) {
			$http.get(serverRoot + "/sets/"+set.id+"/progress")
				.then(function(resp) {
					set.colors = resp.data;
				});
		}

	}


	progressController.$inject = ['$scope', '$http'];

	return progressController;
});