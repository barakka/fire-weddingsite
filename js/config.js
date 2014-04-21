/* global Firebase */

var devenv = (window.location.hostname.indexOf('axelysolboda')<0);  

var firebaseLocation = devenv ? "https://bodaaxelysol-dev.firebaseio.com" : "https://axelysolboda.firebaseio.com"; 
//var firebaseLocation = "https://axelysolboda.firebaseio.com"; 
var fBaseRef = new Firebase(firebaseLocation);
var groupsRef = fBaseRef.child("groups");
var groupsIndexRef = fBaseRef.child("groupsIndex");
var usersRef = fBaseRef.child("users");
var profilesRef = fBaseRef.child("profiles");
var mailingListRef = fBaseRef.child("mailingList");
var commentsRef = fBaseRef.child("comments");
var photosRef = fBaseRef.child("photos");