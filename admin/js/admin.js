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

	var uLoader = function(){
		return ["$q","$firebaseSimpleLogin",function($q,$firebaseSimpleLogin){
			var deferred = $q.defer();

			$firebaseSimpleLogin(fBaseRef).$getCurrentUser().then(
				function(user){
					if (user){
						deferred.resolve(user);
					} else {
						deferred.reject("User not logged in.");	
					}
				}, 
				function(){
					deferred.reject("User not logged in.");
				}
			);

			return deferred.promise;
		}];
	}
	
	$routeProvider.when('/groups', {
		templateUrl : 'groups-list.html',
		controller : 'GroupListCtrl',
		resolve : {
			login: uLoader()
		}
	}).when('/groups/:groupId', {
		templateUrl : 'group-edit.html',
		controller : 'GroupEditCtrl',
		resolve: {
			login: uLoader(),
			group: fLoader(groupsRef,'groupId'),
			users: fLoader(usersRef,'groupId'),
			profile: fLoader(profilesRef,'groupId')
		}
	}).when('/group', {
		templateUrl : 'group-edit.html',
		controller : 'GroupAddCtrl',
		resolve: {
			login: uLoader(),
            groupsIndex: fLoader(groupsIndexRef)
        }
    }).when('/export', {
		templateUrl : 'export.html',
		controller : 'ExportCtrl',
		resolve: {
			login: uLoader(),
            groups: fLoader(groupsRef)
        }
    }).when('/login', {
		templateUrl : 'login.html',
		controller : 'LoginCtrl',		
	}).otherwise({
		redirectTo : '/login'
	});
} ]);

adminModule.controller("AdminCtrl",["$scope","$location","$firebaseSimpleLogin",function($scope,$location,$firebaseSimpleLogin){	
	$scope.loginObj = $firebaseSimpleLogin(fBaseRef);

	$scope.section = function(){
		return $location.path().split("/")[1];
	}

	$scope.$on("$routeChangeError",function(){
        $location.path("/login").replace();
    });
}]);

adminModule.controller("LoginCtrl",["$scope","$location","$firebaseSimpleLogin",function($scope,$location,$firebaseSimpleLogin){	
	$scope.email = "";
	$scope.passwrod = "";
	
	$scope.login = function(){
		$scope.loginObj.$login('password', {
			   email: $scope.email,
			   password: $scope.password
			}).then(function(user) {
			   $location.path('/groups');
			}, function(error) {
			   $scope.email="";
			   $scope.password="";
		});
	}
}]);

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
	
	$scope.loading = true;
	$firebase(groupsRef).$on("loaded",function(data){
		$scope.loading = false;
		$scope.groups = data;
	})

	$scope.createAccounts = function(){
		angular.forEach($scope.groups,function(element){
			$scope.loginObj.$createUser(element.id + "@barakka.org", element.id, true).then(
				function(){
					console.log("Account " + element.id + "@barakka.org created.");		
				}, 
				function(error){
					console.log("Error creating accoutn " + element.id + "@barakka.org created. " + error);
				}
			);			
		});
	}

}]);

adminModule.controller("GroupEditCtrl", [ "$scope", "$location", "group","users","profile", function($scope, $location,group,users,profile) {
	$scope.isEditing = true;
		
	$scope.group = group;
	$scope.users = users;
	$scope.profile = profile;
	
	$scope.save = function(){
		$scope.users.$save().then(function(){
			$scope.profile.$save().then(function(){
				$scope.group.$save().then(function(ref){
					$location.path("/groups").replace();
				});	
			});
		});		
	};

	$scope.cancel = function(){
		$location.path("/groups").replace();
	}
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
				// Create account
				$scope.loginObj.$createUser($scope.group.id + "@barakka.org", $scope.group.id, true).then(
					function(){
						console.log("Account " + $scope.group.id + "@barakka.org created.");		
					}, 
					function(error){
						console.error("Error creating accoutn " + $scope.group.id + "@barakka.org created. " + error);
					}
				);	

				$location.path("/groups/" + $scope.group.id).replace();	
			});
		}		
	};

	$scope.cancel = function(){
		$location.path("/groups").replace();
	}
}]);

adminModule.controller("UsersListCtrl", ["$scope","$route","$firebase", function($scope,$route,$firebase){
	
	$scope.add = function(){
		$scope.users.$add({name:""});
	}
	
	$scope.remove = function(id) {
		$scope.users.$remove(id);
	};
}])

adminModule.controller("ExportCtrl",["$scope","groups",function($scope,groups){
	$scope.groups = groups;	
}]);
