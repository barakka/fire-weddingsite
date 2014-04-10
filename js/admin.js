/**
 * 
 */
var adminModule = angular.module("admin", [ "ngRoute" ]);

adminModule.config([ '$routeProvider', function($routeProvider) {
	$routeProvider.when('/groups', {
		templateUrl : '/admin/groups-list.html',
		controller : 'GroupListCtrl'
	}).when('/groups/:groupId', {
		templateUrl : '/admin/group-edit.html',
		controller : 'GroupEditCtrl'
	}).when('/group', {
		templateUrl : '/admin/group-edit.html',
		controller : 'GroupAddCtrl'
	}).otherwise({
		redirectTo : '/groups'
	});
} ]);

adminModule.controller("GroupListCtrl", ["$scope", "$http", function($scope, $http) {
	function reload(){
		$http.get('/groups').success(function(data) {
			$scope.groups = data;
		});
	}
	
	$scope.remove = function(id) {
		$http.delete("/groups/" + id)
			.success(function(data){
				$scope.groups = data;
			});
	};
	
	reload();
}]);

adminModule.controller("GroupEditCtrl", [ "$scope", "$routeParams", "$http", "$location", function($scope, $routeParams,$http, $location) {
	$scope.isEditing = true;
	
	$http.get('/groups/' + $routeParams.groupId).success(function(data) {
		$scope.group = data;
	});
	
	$scope.save = function(){
		$http.put("/groups/"+ $routeParams.groupId,$scope.group)
			.success(function(data){
				$location.path("/groups").replace();
			});
	};
}]);

adminModule.controller("GroupAddCtrl", [ "$scope", "$http", "$location", function($scope,$http,$location) {
	$scope.group = {id: 0, name: ""};
	$scope.isEditing = false;
	
	$scope.save = function(){
		$http.post("/groups",$scope.group)
			.success(function(data){
				$location.path("/groups").replace();
			});
	};
}]);

adminModule.controller("UsersListCtrl", ["$scope","$http","$route", function($scope,$http,$route){
	$scope.add = function(){
		$scope.user = {};
	}
	
	$scope.edit = function(user){
		$scope.user = user;
	}
	
	$scope.cancelUser = function(){
		$scope.user = null;
	}
	
	$scope.save = function(){
		if ($scope.user.id){
			$http.put("/groups/"+ $scope.group.id + "/users/" + $scope.user.id,$scope.user)
				.success(function(data){
					$scope.group.users = data;
					$scope.user=null;					
				});
		} else {
			$http.post("/groups/" + $scope.group.id + "/users", $scope.user)
				.success(function(data){
					$scope.group.users = data;
					$scope.user = null;
				});
		}
	};
	
	$scope.remove = function(id) {
		$http.delete("/groups/" + $scope.group.id + "/users/" + id)
			.success(function(data){
				$scope.group.users = data;
			});
	};
}])
