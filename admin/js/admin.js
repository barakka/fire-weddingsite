/**
 * 
 */

/* global saveAs */
/* global angular */
/* global $ */

/// <reference path="../../js/config.js" />


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
            groups: fLoader(groupsRef),
			mailingList: fLoader(mailingListRef)
        }
	}).when('/cards', {
		templateUrl : 'cards.html',
		controller : 'CardsCtrl',
		resolve: {
			login: uLoader(),
            groups: fLoader(groupsRef),
			mailingList: fLoader(mailingListRef)
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
	$scope.email = null;
	$scope.passwrod = null;
	
	$scope.login = function(){
		
		$scope.loginObj.$login('password', {
			   email: $scope.email + '@barakka.org',
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
	$scope.groups = $firebase(groupsRef)
	$scope.groups.$on("loaded",function(data){
		$scope.loading = false;		
	})

//	var createAccount = function(index){
//		if (index < $scope.groups.$getIndex().length){
//			var group = $scope.groups[$scope.groups.$getIndex()[index]];
//			console.log("Creating password for group: " + group.id);
//			$scope.loginObj.$createUser(group.id + "@barakka.org", group.id, true).then(
//				function(){
//					console.log("Account " + group.id + "@barakka.org created.");
//					createAccount(index+1);		
//				}, 
//				function(error){
//					console.log("Error creating accoutn " + group.id + "@barakka.org created. " + error);
//					createAccount(index+1);
//				}
//			);				
//		}
//	}
//
//	$scope.createAccounts = function(){
//		createAccount(0);
//	}

}]);

adminModule.controller("GroupEditCtrl", [ "$scope", "$location", "group","users","profile", function($scope, $location,group,users,profile) {
	$scope.isEditing = true;
		
	$scope.group = group;
	$scope.users = users;
	$scope.profile = profile;
	
	if (!profile.stage){
		profile.complete=false;
        profile.stage=0;  
        profile.participationConfirmed=false;
        profile.inMailingList=true;    
	}
	
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
	
	$scope.group = {name: "", id: ""};
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
		setTimeout(function() { $("[name='userName']").last().focus() }, 500);		
	}
	
	$scope.remove = function(id) {
		$scope.users.$remove(id);
	};
}])

adminModule.controller("ExportCtrl",["$scope","groups","mailingList", function($scope,groups, mailingList){
	
	
	$scope.exportGuestList = function(){
		var guestList = [];
		guestList.push("Clave,Nombre,Url");
		
		angular.forEach(groups.$getIndex(), function(key){
			var group = groups[key];
			guestList.push(group.id + "," + group.name + ",http://axelysolboda.appspot.com/#/" + group.id + "\r\n");
		});
		
		var blob = new Blob(guestList, {type: "text/plain;charset=utf-8"});
		saveAs(blob, "guestList.csv");
	}
	
	$scope.exportMailingList = function(){
		var mails = [];
				
		angular.forEach(mailingList.$getIndex(), function(key){
			var groupMails = mailingList[key];
			angular.forEach(groupMails,function(mail){
				mails.push(mail + "\r\n");	
			});				
		});
		
		var blob = new Blob(mails, {type: "text/plain;charset=utf-8"});
		saveAs(blob, "mailingList.txt");
	}
}]);

adminModule.controller("CardsCtrl",["$scope","groups","mailingList", function($scope,groups, mailingList){
	
	$scope.groups = groups;
	
	$scope.codeStart = function(code){
		return code.slice(0,4).toLowerCase();
	}
	
	$scope.codeEnd = function(code){
		return code.slice(4,8);
	}
	
}]);

adminModule.directive('qrCode', function() {
    return function(scope, element, attr) {
		console.log(attr.qrCode);
		new QRCode(element[0], {
		    text: attr.qrCode,
		    width: 108,
		    height: 108		    
		})
	};
  });
