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
    	$(function(){
    	
		navigator.camera.getPicture(onSuccess, onFail, { quality: 50,
	  		destinationType: Camera.DestinationType.DATA_URL
	 	}); 
		
		function onSuccess(imageData) {
		    var image = document.getElementById('myImage');
		    image.src = "data:image/jpeg;base64," + imageData;
		    
		    // 
		    function onSuccess(heading) {
		    	$("#myImage").css("-webkit-transform", "rotate(-"+Math.round(heading.magneticHeading)+"deg);");
			};
			
			function onError(error) {
			    alert('CompassError: ' + error.code);
			};
			
			setInterval(function() {
				navigator.compass.getCurrentHeading(onSuccess, onError);
			}, 50);
			
			var touchHandler = function(event) {
				var pos = event.changedTouches[0];
				event.preventDefault();
				if (pos.screenX && pos.screenY) {
					$("#myImage").css("left", pos.screenX).css("top", pos.screenY);
				}
			};
			
			document.addEventListener("touchmove", touchHandler, true);
		}
		
		function onFail(message) {
		    alert('Failed because: ' + message);
		}

        $('body').css("background-color","red");
        });
    }
};
