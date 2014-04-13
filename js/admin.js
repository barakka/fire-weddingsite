/**
 * 
 */
var adminModule = angular.module("admin", [ "ngRoute", "firebase" ]);

adminModule.config([ '$routeProvider', function($routeProvider) {
	
	var fLoader =function (ref,pathId){
		return ["$q","$firebase","$route",function($q,$firebase,$route){ 
			var deferred = $q.defer();
			
			var fire;
			if (pathId){
				fire = $firebase(ref.child($route.current.params[pathId]));
			} else {
				fire = $firebase(ref);
			}
						
	        fire.$on("loaded",function(){
				fire.$off("loaded");
				deferred.resolve(fire);
			});
	                        	    
		    return deferred.promise;
		}];
	}
	
	$routeProvider.when('/groups', {
		templateUrl : 'groups-list.html',
		controller : 'GroupListCtrl'
	}).when('/groups/:groupId', {
		templateUrl : 'group-edit.html',
		controller : 'GroupEditCtrl',
		resolve: {
			group: fLoader(groupsRef,'groupId'),
			users: fLoader(usersRef,'groupId') 
		}
	}).when('/group', {
		templateUrl : 'group-edit.html',
		controller : 'GroupAddCtrl',
		resolve: {
            groupsIndex: fLoader(groupsIndexRef)
        }
	}).otherwise({
		redirectTo : '/groups'
	});
} ]);

adminModule.controller("GroupListCtrl", ["$scope", "$firebase", function($scope, $firebase) {	
	
	$scope.remove = function(id) {
		groupsIndexRef.child(id).remove();
		commentsRef.child(id).remove();
		usersRef.child(id).remove();
		profilesRef.child(id).remove();
		mailingListRef.child(id).remove();
		// we should probably remove comments as well
		$scope.groups.$remove(id);
	};
	
	$scope.groups = $firebase(groupsRef);
}]);

adminModule.controller("GroupEditCtrl", [ "$scope", "$location", "group","users", function($scope, $location,group,users) {
	$scope.isEditing = true;
		
	$scope.group = group;
	$scope.users = users;
	
	$scope.save = function(){
		$scope.group.$save().then(function(ref){
			$location.path("/groups").replace();			
		});
	};
}]);

adminModule.controller("GroupAddCtrl", [ "$scope", "$location", "$firebase","groupsIndex", function($scope,$location,$firebase,groupsIndex) {
	
	function randomString(len)
	{
	    var possible ="ABCDEFGHIJKLMNOPQRSTUVWXYZ";
		var text = '';
	    for( var i=0; i < len; i++ )
        	text += possible.charAt(Math.floor(Math.random() * possible.length));

    	return text;
	}
	
	var groupId = randomString(4) + ("0000" + groupsIndex.$getIndex().length).slice(-4);	
	
	$scope.group = {name: "", id: groupId};
	$scope.isEditing = false;	
		
	$scope.save = function(){
		$scope.group.id = $scope.group.id.toUpperCase();
		
		if (groupsIndex[$scope.group.id]){
			$scope.groupForm.groupIdtxt.$setValidity("minlength",false);
		} else {
			var group = $firebase(groupsRef.child($scope.group.id));		
			// add to index
			groupsIndex.$child($scope.group.id).$set(true);
			// add to collection
			group.$set($scope.group).then(function(ref){
				$location.path("/groups").replace();	
			});
		}		
	};
}]);

adminModule.controller("UsersListCtrl", ["$scope","$route","$firebase", function($scope,$route,$firebase){
	
	$scope.add = function(){
		$scope.user = {};
	}
	
	$scope.edit = function(userId){
		$scope.user = $scope.users.$child(userId);
	}
	
	$scope.cancelUser = function(){
		$scope.user = null;
	}
	
	$scope.save = function(){
		if ($scope.user.$id){
			$scope.user.$save().then(function(){
				$scope.user = null;
			});
		} else {
			$scope.users.$add($scope.user).then(function(){
				$scope.user = null;
			});			
		}
	};
	
	$scope.remove = function(id) {
		$scope.users.$remove(id);
	};
}])
