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


if (!devenv){
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-51910441-1', 'axelysolboda.appspot.com');
  ga('send', 'pageview');
}


