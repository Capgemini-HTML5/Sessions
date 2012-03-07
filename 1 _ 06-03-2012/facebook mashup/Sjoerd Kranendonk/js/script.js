/* Author: Willem Mulder

*/

/* Config */
// Access token
// Generate one at https://developers.facebook.com/tools/explorer
var accessToken = "AAACEdEose0cBACzQB8COiyujWj1pJeRfvZCAuyYgEqvoZA7XIgOm8DIGRkjvcZBbh8hd6wTOjNqMpyLEevtnRxW1r2ChlDTx7nA8FRDIQZDZD";

// TODO: Check for auth errors and alert the user to get a new access token
/*
if (data["error"] != undefined) {
	element.html("<p>You need a new accessToken. Please go to <a href='https://developers.facebook.com/tools/explorer'>https://developers.facebook.com/tools/explorer</a> to create one.</p>");
}
// Or
jQuery(document).ajaxError(function(event, request, settings){
   alert("Error");
});
*/

// Function to fill some DOM element with a friend-list
function fillFriendList(element, userId, accessToken) {
	// Ensure that we have a JQuery representation of the DOM element
	element = $(element);
	element.html("<div class='spinner'><div class='bar1'></div><div class='bar2'></div><div class='bar3'></div></div><p>");
	// Fetch friends info
	$.getJSON('https://graph.facebook.com/' + userId + '/friends?access_token=' + accessToken, function(data) {
		var friends = data["data"];
		// Render the friends-list
		element.html("");
		for(index in friends) {
			var frienddata = friends[index];
			element.append(
				"<div>"
				+ "<div class='imagewrapper'><img src='https://graph.facebook.com/" + frienddata.id + "/picture'/></div>"
				+ "<a href='javascript:void(0)' onClick='fillFriendList($(\"#friends\"), \"" + frienddata.id + "\");'>" + frienddata.name + "</a> "
				+ "<a href='javascript:void(0)' onClick='loadPhotos($(this).next(),\"" + frienddata.id + "\");'>(load photos)</a>"
				+ "<a href='javascript:void(0)' onClick='loadLikes($(this).next(),\"" + frienddata.id + "\");'>(load likes)</a>"				
				+ "<div></div>"
				+ "</div>"
			);
		}
	}).fail(function() { element.html("<p>Loading your friends didn't work. You probably need a new accessToken. Please go to <a href='https://developers.facebook.com/tools/explorer'>https://developers.facebook.com/tools/explorer</a> to get one. Store it in the accessToken variable at the top of script.js.</p>");
 });
}

function loadLikes(element, userId) {
	// Ensure that we have a JQuery representation of the DOM element
	element = $(element);
	element.html("<div class='spinner'><div class='bar1'></div><div class='bar2'></div><div class='bar3'></div></div>");
	// Fetch friends info
	$.getJSON('https://graph.facebook.com/' + userId + '/likes?access_token=' + accessToken, function(data) {
		var likes = data["data"];
		// Render likes
		element.children('.spinner').fadeToggle(function(){
			
			for(index in likes) {
				var like = likes[index];
				console.log(like);
				element.append("<a href='http://facebook.com/" + like.id + "' target='_blank'>" + like.name + "</a> - ");
			}
			element.children('.spinner').remove();
		
		});
	});
}

function loadPhotos(element, userId) {
	// Ensure that we have a JQuery representation of the DOM element
	element = $(element);
	element.html("<div class='spinner'><div class='bar1'></div><div class='bar2'></div><div class='bar3'></div></div>");
	// Fetch friends info
	$.getJSON('https://graph.facebook.com/' + userId + '/photos?access_token=' + accessToken, function(data) {
		var photos = data["data"];
		// Render photos
		element.children('.spinner').fadeToggle(function(){
			
			for(index in photos) {
				var photo = photos[index];
				element.append("<a href='" + photo.source + "' target='_blank'><img src='" + photo.picture + "'/></a>");
			}
			element.children('.spinner').remove();
		
		});
	});
}

// Execute this function when the DOM is ready
$(function() {
	$("#startbutton").on("click", function() {
		// Load friends of user that has generated the token
		fillFriendList($("#friends"), "me", accessToken); 
	});

});