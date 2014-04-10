/**
 * Created by rserafin on 21/01/2014.
 */

var weddingModule = angular.module("wedding", ["ngRoute"]);

weddingModule.config([ '$routeProvider', function ($routeProvider) {
	
	groupLoaderFunction = ["$route","groupService", function($route,groupService){
	    return groupService.loadGroup($route.current.params.groupId);
	}];
	
    $routeProvider.when('/login', {
        templateUrl: '/partials/login.html',
        controller: 'LoginCtrl',
        resolve: {
            group: function(){return null;}
        }
    }).when('/:groupId/home',{
        templateUrl: '/partials/home.html',
        controller: 'HomeCtrl',
        resolve: {
            group: groupLoaderFunction
        }
    }).when('/:groupId/calendar',{
        templateUrl: '/partials/calendar.html',
        controller: 'CalendarCtrl',
        resolve: {
            group: groupLoaderFunction
        }
    }).when('/:groupId/church',{
        templateUrl: '/partials/church.html',
        controller: 'HomeCtrl',
        resolve: {
            group: groupLoaderFunction
        }
    }).when('/:groupId/dinner',{
        templateUrl: '/partials/dinner.html',
        controller: 'HomeCtrl',
        resolve: {
            group: groupLoaderFunction
        }
    }).when('/:groupId/upload',{
        templateUrl: '/partials/fake.html',
        controller: 'HomeCtrl',
        resolve: {
            group: groupLoaderFunction
        }
    }).when('/:groupId/comment',{
        templateUrl: '/partials/comment.html',
        controller: 'CommentCtrl',
        resolve: {
            group: groupLoaderFunction
        }
    }).when('/:groupId/accomodation',{
        templateUrl: '/partials/fake.html',
        controller: 'HomeCtrl',
        resolve: {
            group: groupLoaderFunction
        }
    }).when('/:groupId/questionnaire',{
        templateUrl: '/partials/fake.html',
        controller: 'HomeCtrl',
        resolve: {
            group: groupLoaderFunction
        }
    }).when("/:groupId/survey/:stageId",{
        templateUrl: "/partials/survey.html",
        controller: 'SurveyCtrl',
        resolve: {
            group: groupLoaderFunction
        }
    }).otherwise({
        redirectTo: '/login'
    });
} ]);

weddingModule.factory("groupService", ["$http","$q", function($http,$q){
    var service = {}
    service.group = null;

    service.loadGroup= function(groupId){
        if (service.group==null || service.group.id != parseInt(groupId)){
            return service.loadGroupFromServer(groupId);
        } else {
            return service.group;
        }
    };

    service.loadGroupFromServer= function(groupId){
        if (parseInt(groupId)!=0){
            return $http.get('/groups/' + groupId)
                .then(function(response){
                    service.group = response.data;
                    return response.data;
                });
        } else {
        	var deferred = $q.defer();
        	
            service.group = {
            	id: 0,
                profile : {
                    id: 0,
                    complete: true
                }
            };
            
            deferred.resolve(service.group);
            return deferred.promise;
        }
    };

    service.saveGroup= function(group){
        return $http.put("/groups/"+ group.id,group)
            .success(function(data){
                service.group = data;
            });
    };

    service.removeUser= function(group,user){
        if (user.id){
            $http.delete("/groups/" + group.id + "/users/" + user.id);
//                .success(function(data){
//                    $scope.group.users = data;
//                });
        }
    }


    return service;
}]);

weddingModule.controller("IndexCtrl",["$scope", "$location","$route", function($scope,$location,$route){	
	$scope.bodyStyle = "";
	
	computeStyle=function(){
		var parts=$location.path().split('/');
		if (parts.length>2){
			var style = parts[2];
			
			if (parts[2] == "church" || parts[2] == "dinner" || parts[2] == "calendar" || parts[2] == "comment"){
				style += " static-inner";
			}
			
			return style;
		} else {
			return parts[parts.length-1];
		}
	};
	
	$scope.$on("$viewContentLoaded", function(){
		$scope.bodyStyle = computeStyle();
	});
}]);

weddingModule.controller("LoginCtrl",["$scope", "$location", "groupService", function($scope,$location,groupService){
	$scope.loading = false;
	
	$scope.access = function(){		
		if ($scope.signinForm.group.$valid){
			$scope.loading = true;
			groupService
				.loadGroup($scope.groupId)
				.then(function(group){
					if (group.profile){
						if (group.profile.complete){
							$location.path("/" + $scope.groupId + "/home");
						} else {
							$location.path("/" + group.id + "/survey/" + group.profile.stage);
						}
					} else {
						$scope.loading=false;
						$scope.signinForm.group.$setValidity("pattern",false);
					}
				});
		}
	}
		
}]);

weddingModule.controller("HomeCtrl",["$scope", "$location", "group", function($scope,$location,group){
    $scope.group = group;

    if (!group.profile.complete){
        $location.path("/" + group.id + "/survey/" + group.profile.stage).replace();
    }

    $scope.goTo = function(page){
    	if (page!="questionnaire"){
    		$location.path("/" + $scope.group.id + "/" + page);
    	} else {
    		$location.path("/" + $scope.group.id + "/survey/1");
    	}
	}
    
    $scope.openChurchMap = function(){
    	var os = $.ua.os.name;
    	
    	if (os == 'iOS' || os == 'Mac OS X'){
    		return "http://maps.apple.com/?q=Iglesia+de+San+Juan+del+Hospital";
    	} else if (os == "Android") {
    		return "geo:0,0?q=Iglesia+de+San+Juan+del+Hospital";
    	} else {
    		return "http://maps.google.com/?q=Iglesia+de+San+Juan+del+Hospital";
    	}
    }
    
    $scope.openDinnerMap = function(){
    	var os = $.ua.os.name;
    	
    	if (os == 'iOS' || os == 'Mac OS X'){
    		return "http://maps.apple.com/?q=Calle+102+37+Ribarroja+Valencia";
    	} else if (os == "Android") {
    		return "geo:39.550424,-0.538643";
    	} else {
    		return "http://maps.google.com/?q=Calle+103,+37,+ribarroja";
    	}
    }
    
    $scope.openBusMap = function(){
    	alert("¡Hemos dicho próximamente!");
    }
}]);

weddingModule.controller("SurveyCtrl",["$scope","group","$routeParams","$location","groupService",function($scope, group,$routeParams, $location, groupService){
    $scope.group = group;
    $scope.stage = parseInt($routeParams.stageId);
    STAGES = {
    	intro: 0,
    	participation: 1,
    	participants: 2,
    	dinnerRequirements: 3,
    	transportation: 4,
    	accomodation: 5,
    	other: 6,
    	participantsDetails: 7
    }

    $scope.next = function(){
    	if ($scope.stage==STAGES.participation && group.profile.participationConfirmed == false){
    		$scope.stage = STAGES.participantsDetails;
    	}else if ($scope.stage==STAGES.transportation && group.profile.origin == 'Valencia'){
    		// Skip accomodation if from valencia
    		$scope.stage = STAGES.participantsDetails;        
    	} else {    		
    		$scope.stage += 1;
    	}
    	
    	$location.path("/" + group.id + "/survey/" + $scope.stage);
    };

    $scope.add = function(){
        group.users.push({
           name: null,
           email: null
        });
    };

    $scope.canAdd = function(){
        if (group.users.length){
            return group.users[group.users.length -1].name;
        } else {
            return true;
        }
    };

    $scope.remove = function(index){
        var user = group.users.splice(index,1)[0];
        groupService.removeUser(group,user);
    };

    $scope.save = function(){
        group.profile.stage = $scope.stage;
        group.profile.complete = true;

        groupService.saveGroup(group).then(function(data){
            $location.path("/" + group.id + "/home").replace();
        });
    };
    
    $scope.cancel = function(){
    	$location.path("/" + group.id + "/home").replace();
    }
    
    $scope.editableUser = null;
    $scope.editableIndex = null;
    
    $scope.editEditableUser = function (index){
    	$scope.editableUser = angular.copy(group.users[index]);
    	$scope.editableIndex = index;
    }
    
    $scope.addEditableUser = function(){
    	$scope.editableUser = {
	       name: null,
	       email: null
	    };
    	$scope.editableIndex = null;
    }
    
    $scope.cancelEditableUser = function(){
    	$scope.editableUser = null;
    	$scope.editableIndex = null;
    }
    
    $scope.saveEditableUser = function(){
    	if ($scope.editableIndex){
    		group.users.splice($scope.editableIndex,1,$scope.editableUser);    		
    	} else {
    		group.users.push($scope.editableUser);
    	}
    	
    	$scope.editableUser = null;
    	$scope.editableIndex = null;
    }
}]);

weddingModule.controller("CalendarCtrl",["$scope","group",function($scope,group){
	
	$scope.event = null;
	
	$scope.$on("$viewContentLoaded",function(){
		$("#scheduler").fullCalendar({
			defaultDate : '2014-09-06',
			events: 'http://www.google.com/calendar/feeds/barakka.org_8g6smdg6nt1ge257qk26o1ekg8%40group.calendar.google.com/public/basic',
			
			eventClick: function(calEvent, jsEvent, view) {
				$scope.event = calEvent;
				$scope.$digest();
		        return false;
		    }
		    
		});
	});
	
	$scope.closeEvent = function(){
		$scope.event = null;
	}
	
}]);

weddingModule.controller("CommentCtrl",["$scope","$http","group",function($scope,$http,group){
	$scope.sending = false;
	resetComment = function(){
		$scope.comment = { 
				to: "AxelYSol"
			};
	}
	
	$scope.saveComment = function(){
		$scope.sending = true;
		$scope.comment.date = new Date();
		return $http.post("/groups/"+ group.id + "/comments",$scope.comment)
        	.success(function(data){        		
        		resetComment();
        		$scope.sending = false;
        	})
        	.error(function(){
        		alert("Ha ocurrido un error al enviar el mensaje. Intentalo de nuevo.")
        		$scope.sending = false;
        	});
	};
		
	resetComment();
}]);