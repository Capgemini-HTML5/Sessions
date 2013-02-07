/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
   
        listeningElement.setAttribute('style', 'display:none;');
      
        console.log('Received Event: ' + id);
        
        $('.fm').click(function() {
	        $.ajax({
			  dataType: "jsonp",
			  url: "http://www.3fm.nl/data/cache/jsonp/nowonair.json",
			  type : 'get',
			  jsonpCallback: 'driefmJsonNowonair'
			}).then(function(data) {
				console.log(data);
				app.handle3FM(data);
				$('#3fm').show();
			}, function(er) {
				console.log('error');
			});
			
			$.ajax({
			  dataType: "jsonp",
			  url: "http://www.3fm.nl/data/cache/jsonp/nowplaying-laatste5.json",
			  type : 'get',
			  jsonpCallback: 'driefmJsonNowplaying5'
			}).then(function(data) {
				console.log(data);
				app.handleSong(data);
				$('#3fm').show();
			}, function(er) {
				console.log('error');
			});
		});
    },
    
    handle3FM : function(data) {
    	$(".showname").text(data.program[0].name);
    	$(".showimg").attr('src', 'http://www.3fm.nl' + data.program[0].image_dj);
    },
    
    handleSong : function(data) {
    	$(".showsong").text(data.track[0].artist + " - " + data.track[0].title);
    	$(".showsonglink").attr('href', data.track[0].songLink);
    }
};
