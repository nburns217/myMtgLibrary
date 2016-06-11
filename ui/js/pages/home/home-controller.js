define([], function() {
	function homeController($scope, $http) {
		// debugger;
		$http.get(serverRoot + "/sets?type=core,expansion")
			.then(function(resp) {
				$scope.sets = resp.data;

				for (var i in resp.data) {
					if (resp.data[i].code === "SOI") {
						$scope.set = resp.data[i];
					}
				}
			});
		$scope.showOwned = 'all';
		$scope.cards = [];
		$scope.colors = [];

		function loadColors() {
			var set = $scope.set;
			if (set == undefined) return;
			$http.get(serverRoot+"/sets/"+set.id+"/colors")
			.then (function(resp) {
				$scope.colors = [];
				for(var i in resp.data) {
					$scope.colors.push({
						key: resp.data[i].col,
						count : resp.data[i].cnt,
						codes: (resp.data[i].col != null) ? resp.data[i].col.split(",") : [],
						on: false//,
						// label: resp.data[i].label,
					})
				}
			});	
		}

		$("body").on("keypress", function(e) {
			if($(e.target).attr("id") == "cardNameSearch") return;
			console.log(String.fromCharCode(e.keyCode), $scope.searchText);
			$scope.searchText += String.fromCharCode(e.keyCode);
			$scope.$apply();
			$("#cardNameSearch").focus();
			return false;
		});
		$("body").on("keydown", function(e) {
			if($(e.target).attr("id") == "cardNameSearch") return;
			console.log(e.keyCode);
			switch(e.keyCode) {
				case 8 :
					$scope.searchText = $scope.searchText.slice(0,-1);
					$scope.$apply();
					return false;
				case 27 :
					$scope.searchText = "";
					$scope.$apply();
					return false;
			}
		});
		
		
		$scope.selectedColor = "";
		// $scope.toggleColor = function(color) {
			// color.on = !color.on;
			// loadCards();
		// }
		$scope.$watch("selectedColor", loadCards);
		$scope.resetColors = function() {
			$scope.selectedColor = "";
			// loadCards();
		}

		function getColorString() {
			var c = [];
			for (var i in $scope.colors) {
				var color = $scope.colors[i];
				if (color.on === true) {
					c.push(color.key);
				}
			}
			return c.join(",");
		}
		$scope.searchText = "";

		$scope.rarity = [
			{
				key: 0,
				on: false,
				label: "Mythic"
			}, {
				key: 1,
				on: false,
				label: "Rare"
			}, {
				key: 2,
				on: false,
				label: "Uncommon"
			}, {
				key: 3,
				on: false,
				label: "Common"
			}
		];
		$scope.toggleRarity = function(rarity) {
			rarity.on = !rarity.on;
			loadCards();
		}

		$scope.resetRarity = function() {
			for (var i in $scope.rarity) {
				$scope.rarity[i].on = false;
			}

			loadCards();
		}
		function getRarityString() {
			var c = [];
			for (var i in $scope.rarity) {
				var rarity = $scope.rarity[i];
				if (rarity.on === true) {
					c.push(rarity.key);
				}
			}
			return c.join(",");
		}

		//Instant, Sorcery, Artifact, Creature, Enchantment, Land, Planeswalker
		$scope.types = [
			{
				key: "Instant",
				on: false,
				label: "Instant"
			}, {
				key: "Sorcery",
				on: false,
				label: "Sorcery"
			}, {
				key: "Artifact",
				on: false,
				label: "Artifact"
			}, {
				key: "Creature",
				on: false,
				label: "Creature"
			}, {
				key: "Enchantment",
				on: false,
				label: "Enchantment"
			}, {
				key: "Land",
				on: false,
				label: "Land"
			}, {
				key: "Planeswalker",
				on: false,
				label: "Planeswalker"
			}
		];
		$scope.toggleType = function(type) {
			if(type.on) {
				type.on = false;
			}
			else {
				for (var i in $scope.types) {
					$scope.types[i].on = false;
				}
				type.on = true;
			}
			loadCards();
		}

		$scope.resetTypes = function() {
			for (var i in $scope.types) {
				$scope.types[i].on = false;
			}

			loadCards();
		}


		$scope.$watch('set', function() {
			loadColors();
			loadCards();
		});
		$scope.$watch('showOwned', function() {
			loadCards();
		});
		function getTypeString() {
			var c = [];
			for (var i in $scope.types) {
				var type = $scope.types[i];
				if (type.on === true) {
					c.push(type.key);
				}
			}
			return c.join(",");
		}

		function loadCards() {
			var set = $scope.set;
			if (set == undefined) return;

			$http.get(serverRoot + "/sets/" + set.id + "/cards?color=" + $scope.selectedColor + "&rarity=" + getRarityString()+ "&type=" + getTypeString()+ ($scope.showOwned== "all" ? "" : "&owned="+ ($scope.showOwned == "owned" ? "true" : "false")))
				.then(function(resp) {
					$scope.cards = resp.data;
				});
		}


	}


	homeController.$inject = ['$scope', '$http'];

	return homeController;
});