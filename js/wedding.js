/**
 * Created by rserafin on 21/01/2014.
 */
 /// <reference path="config.js" />
 /* global $ */ 
 /* global angular */
 /* global moment */

var weddingModule = angular.module("wedding", ["ngRoute","firebase"]);
var NO_GROUP_ID="AAAA0000";

var fLoaderFunction = function($q,$firebase,$firebaseSimpleLogin,groupId,ref){        
    
    var loadRef = function(){    
        var deferred = $q.defer();						
    	var fire = $firebase(ref);		
        fire.$on("loaded",function(){
    		fire.$off("loaded");
            if (fire.hasOwnProperty("$value") && fire.$value == null){
                deferred.reject("No object found at path: " + fire.$getRef().toString());   
            } else {
                deferred.resolve(fire);
            }
    	});
                        	    
        return deferred.promise;
    }
    
    
    
    var ensureLoggedIn = function(){
        var deferred = $q.defer();
        var loginObj = $firebaseSimpleLogin(fBaseRef);
        
        var login = function(){
            
            return loginObj.$login('password', {
                        email: (groupId + '@barakka.org'),
                        password: groupId.toUpperCase(),
                        debug: true
                    }).then(
                        function(user){
                            deferred.resolve(user);
                        },
                        function(error){
                            deferred.reject("User not logged in.");
                        }
                    );
        }
    
		loginObj.$getCurrentUser().then(
			function(user){                
				if (user){                    
                    if (user.email.toLowerCase() == (groupId + '@barakka.org').toLowerCase()){
                        deferred.resolve(user);
                    } else {
                        loginObj.$logout();
                        deferred.reject("Already logged in with a different user.");        
                    }
				} else {
                    login();	
				}
			}, 
			login
		);

		return deferred.promise;
    }
    
    return ensureLoggedIn().then(loadRef);
}

weddingModule.config([ '$routeProvider', function ($routeProvider) {
    
    var groupLoader = function(){
        return ["$q","$firebase","$firebaseSimpleLogin","$route",function($q,$firebase,$firebaseSimpleLogin,$route){ 
			var groupId = $route.current.params.groupId;
            
            if (groupId!=NO_GROUP_ID){
                return fLoaderFunction($q,$firebase,$firebaseSimpleLogin,groupId,groupsRef.child(groupId));    
            } else {                
                return {
                	id: NO_GROUP_ID,
                    anonymous: true
                };
            }            
		}];
    }
    
    var profileLoader = function(){
        return ["$q","$firebase","$firebaseSimpleLogin","$route",function($q,$firebase,$firebaseSimpleLogin,$route){ 
			var groupId = $route.current.params.groupId;
            
            if (groupId!=NO_GROUP_ID){
                return fLoaderFunction($q,$firebase,$firebaseSimpleLogin,groupId,profilesRef.child(groupId))
                    .then(
                        function(profile){
                            return profile;
                        },
                        function(){
                            var profile= $firebase(profilesRef.child(groupId));
                            profile.complete=false;
                            profile.stage=0;  
                            profile.participationConfirmed=false;
                            profile.inMailingList=true;                          
                            return profile;   
                        });    
            } else {                
                return {
                    complete: true
                };
            }            
		}];
    }
	
    $routeProvider.when('/login', {
        templateUrl: 'partials/login.html',
        controller: 'LoginCtrl',
        resolve: {
            group: function(){return null;},
            profile: function(){return null;}
        }
    }).when('/:groupId/home',{
        templateUrl: 'partials/home.html',
        controller: 'HomeCtrl',
        resolve: {
            group: groupLoader(),
            profile: profileLoader()
        }
    }).when('/:groupId/calendar',{
        templateUrl: 'partials/calendar.html',
        controller: 'CalendarCtrl',
        resolve: {
            group: groupLoader()
        }
    }).when('/:groupId/church',{
        templateUrl: 'partials/church.html',
        controller: 'StaticCtrl',
        resolve: {
            group: groupLoader()
        }
    }).when('/:groupId/dinner',{
        templateUrl: 'partials/dinner.html',
        controller: 'StaticCtrl',
        resolve: {
            group: groupLoader()
        }
    }).when('/:groupId/upload',{
        templateUrl: 'partials/fake.html',
        controller: 'StaticCtrl',
        resolve: {
            group: groupLoader()
        }
    }).when('/:groupId/comment',{
        templateUrl: 'partials/comment.html',
        controller: 'CommentsCtrl',
        resolve: {
            group: groupLoader()
        }
    }).when('/:groupId/accomodation',{
        templateUrl: 'partials/fake.html',
        controller: 'StaticCtrl',
        resolve: {
            group: groupLoader()
        }    
    }).when("/:groupId/survey/:stageId",{
        templateUrl: "partials/survey.html",
        controller: 'SurveyCtrl',
        resolve: {
            group: groupLoader(),
            profile: profileLoader()
        }
    }).when('/:groupId',{
        redirectTo:  function (routeParams, path, search) {            
            return "/" + routeParams.groupId + "/home";
        }
    }).otherwise({
        redirectTo: '/login'
    });
} ]);

weddingModule.factory("fireLoader",["$q","$firebase","$firebaseSimpleLogin",function($q,$firebase,$firebaseSimpleLogin){
    return function(groupId,ref){
        return fLoaderFunction($q,$firebase,$firebaseSimpleLogin,groupId,ref);
    }
}]);

weddingModule.controller("IndexCtrl",["$scope", "$location","$route", function($scope,$location,$route){	
	$scope.bodyStyle = "";
	
	var computeStyle=function(){
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
    
    $scope.$on("$routeChangeError",function(){
        $location.path("/login").replace();
    });
}]);

weddingModule.controller("LoginCtrl",["$scope", "$location", "fireLoader","$firebaseSimpleLogin", function($scope,$location,fireLoader,$firebaseSimpleLogin){
	$scope.loading = false;
	
	$scope.access = function(){		
		if ($scope.signinForm.group.$valid){
			$scope.loading = true;
            
            var groupId = $scope.groupId.toUpperCase();
            fireLoader(groupId, groupsRef.child(groupId)).then(
                function(group){
                    $location.path("/" + groupId + "/home");
                },
                function(){
                    $scope.loading=false;
                    $scope.signinForm.group.$setValidity("pattern",false);
                }
            );                           			
		}
	}
		
    $firebaseSimpleLogin(fBaseRef).$logout();
}]);

weddingModule.controller("HomeCtrl",["$scope", "$location", "group","profile", function($scope,$location,group,profile){
    $scope.group = group;

    if (!profile.complete){
        if (!profile.lastModified || moment().isAfter(moment(profile.lastModified).add('hours',4))){
            if (profile.stage){
                $location.path("/" + group.id + "/survey/" + profile.stage).replace();
            } else {
                $location.path("/" + group.id + "/survey/0").replace();
            }
        }
    }

    $scope.goTo = function(page){
    	if (page!="questionnaire"){
    		$location.path("/" + $scope.group.id + "/" + page);
    	} else {
    		$location.path("/" + $scope.group.id + "/survey/1");
    	}
	}
    
}]);

weddingModule.controller("StaticCtrl",["$scope",  function($scope){    
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

weddingModule.controller("SurveyCtrl",["$scope","group","$routeParams","$location","profile","$firebase" ,
    function($scope, group,$routeParams, $location, profile,$firebase){
    
    
    var STAGES = {
    	intro: 0,
    	participation: 1,
    	participants: 2,
    	dinnerRequirements: 3,
    	transportation: 4,
    	accomodation: 5,
    	other: 6,
    	participantsDetails: 7
    }

    var touchProfile = function(){
        profile.stage = $scope.stage;
        profile.lastModified = new Date();
    }
    
    $scope.group = group;
    $scope.stage = parseInt($routeParams.stageId);
    $scope.profile = profile;
    $scope.users = $firebase(usersRef.child($routeParams.groupId));
    
    if (!profile.stage){
        profile.complete=false;
        profile.stage=0;  
        profile.participationConfirmed=false;
        profile.inMailingList=true;
    }
    
    touchProfile();
    $scope.profile.$save();

    $scope.next = function(){
    	if ($scope.stage==STAGES.participation && profile.participationConfirmed == false){
    		$scope.stage = STAGES.participantsDetails;
    	}else if ($scope.stage==STAGES.transportation && profile.origin == 'Valencia'){
    		// Skip accomodation if from valencia
    		$scope.stage = STAGES.participantsDetails;        
    	} else {    		
    		$scope.stage += 1;
    	}
    	
        touchProfile();
        profile.$save().then(function(){
    	   $location.path("/" + group.id + "/survey/" + $scope.stage);            
        });
        
    };

    $scope.remove = function(id){
        $scope.users.$remove(id);
    };
    
    var getPredefinedEmails = function(){
        var emails = [];
        
        if ($scope.users){            
             angular.forEach($scope.users.$getIndex(),function(element) {
                 var user = $scope.users[element];
                 if (user.predefined && user.email){
                     emails.push(user.email);
                 }                
            }, this);
        }
        return emails;
    }
    
    $scope.hasPredefined = function(){
        return getPredefinedEmails().length > 0;
    }

    $scope.save = function(){
        touchProfile();
        profile.complete = true;
                        
        $scope.users.$save().then(function(){
            // Remove every one from the mailing list
            $firebase(mailingListRef.child(group.$id)).$remove();
            
            // Add the new pred if any
            if (profile.inMailingList){
                var mailingList = getPredefinedEmails();
                if (mailingList.length>0){
                    angular.forEach(mailingList,function(email){
                        $firebase(mailingListRef.child(group.$id)).$add(email);
                    });
                }
            }
            
            profile.$save().then(function(data){
                if (profile.needsAccommodation){
                    $('#accommodationAlert').on('hidden.bs.modal', function (e) {  
                        $scope.$apply(function(){
                            $location.path("/" + group.id + "/home").replace();    
                        });
                    }).modal();    
                } else {
                    $location.path("/" + group.id + "/home").replace();
                }                
            });    
        });        
    };
    
    $scope.cancel = function(){
    	$location.path("/" + group.id + "/home").replace();
    }    
    
    $scope.editableUser = null;
    $scope.editableIndex = null;
    
    $scope.editEditableUser = function (index){
    	$scope.editableUser = angular.copy($scope.users[index]);
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
    		$scope.users[$scope.editableIndex] = $scope.editableUser;    		
    	} else {
    		$scope.users.$add($scope.editableUser);
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
			events: 'https://www.google.com/calendar/feeds/barakka.org_8g6smdg6nt1ge257qk26o1ekg8%40group.calendar.google.com/public/basic',
			
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

weddingModule.controller("CommentsCtrl",["$scope","$firebase","group","fireLoader", function($scope,$firebase,group,fireLoader){
	$scope.sending = false;
    $scope.composing= false;    
    $scope.comments = $firebase(commentsRef.child("public").endAt().limit(20));    
    
	
    var resetComment = function(){
		$scope.comment = { 
			to: "Wall",
            from: group.name
		};
	}
	
    $scope.addComment = function(){
        $scope.composing = true;
    }
    
    $scope.cancelComment = function(){
        $scope.composing = false;
        resetComment();
    }
    
	$scope.saveComment = function(){
		$scope.sending = true;
		$scope.comment.date = new Date();
        $scope.comment.group = group.$id;
        
        var ref = $scope.comment.to == "Wall" ? commentsRef.child("public") : commentsRef.child("private"); 
        
        $firebase(ref).$add($scope.comment)
            .then(
                function(){        		
            		resetComment();
            		$scope.sending = false;
                    $scope.composing = false;
            	},
            	function(){
            		alert("Ha ocurrido un error al enviar el mensaje. Intentalo de nuevo.")
            		$scope.sending = false;
            	}
            );
	};
		
	resetComment();
}]);

weddingModule.controller("CommentCtrl",["$scope",function($scope){
    $scope.date = moment($scope.comment.date).format("lll");
}]);