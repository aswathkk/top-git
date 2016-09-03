var app = angular.module('TopGit', ['ngMaterial']);

app.controller('MainCtrl', function($scope, $rootScope, Repo, $mdToast) {
	$scope.stars = 500;

	$scope.openRepo = function() {
		window.open(this.repo.html_url, '_blank');
	};

	$scope.$watch('stars', loadRepo);
	$rootScope.$watch('language', loadRepo);

	function loadRepo() {
		$scope.loading = true;
		Repo.get($scope.stars, $rootScope.language).success(function(res) {
			if(res.items)
				$scope.repos = res.items;
			$scope.loading = false;
			if(res.total_count)
			$mdToast.show(
				$mdToast.simple()
				.textContent('Found '+ res.total_count +' repositories ..')
				.position("bottom left")
				.hideDelay(5000)
			);
		}).then(function(data){
			$scope.limit = data.headers('X-ratelimit-limit');
			$scope.remaining = data.headers('X-ratelimit-remaining');
			$scope.resetAt = data.headers('X-ratelimit-reset');
		});
	}

});

app.controller('SearchCtrl', function($scope, $rootScope, Language) {
	
	Language
	.success(function(res) {
		self.languages = res.map(function(language){
			return {
				value: language.toLowerCase(),
				display: language
			}	
		});
	})
	.error(function(e) {
		console.log(e);
	});
	
	var self = this;

	$scope.selected = function(language) {
		if(language.value)
			$rootScope.language = language.value;
		else
			$rootScope.language = undefined;
	}
	
});

app.factory('Repo', function($http) {
	return {
		get: function(stars, language) {
			// return $http.get("data.js");
			if(language)
				return $http.get('https://api.github.com/search/repositories?q=stars:%3E='+stars+'%20language:'+language);
			else
				return $http.get('https://api.github.com/search/repositories?q=stars:%3E='+stars);
		}
	};
});

app.factory('Language', function($http) {
	return $http.get('https://gist.githubusercontent.com/mayurah/5a4d45d12615d52afc4d1c126e04c796/raw/ccbba9bb09312ae66cf85b037bafc670356cf2c9/languages.json');
});
