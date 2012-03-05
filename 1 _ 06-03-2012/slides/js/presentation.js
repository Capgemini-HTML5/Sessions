// Presentation class
function Presentation(canvas, elements) {
	var canvas = $(canvas);
	if (canvas.size() == 0) {
		alert('geen geldige canvas opgegeven');
		return;
	}
	canvasZoomFactor = 1;
	var elements = elements; // Array of elements to show, in order
	/*
		elements = [];
		elements[] = { 
			onBeforeEnterFromPrev : function() {},
			onAfterEnterFromPrev : function() {},
			
			onBeforeLeaveToNext : function() {},
			onAfterLeaveToNext : function() {},
			
			onBeforeEnterFromNext : function() {},
			onAfterEnterFromNext : function() {},
			
			onBeforeLeaveToPrev : function() {},
			onAfterLeaveToPrev : function() {},
			
			onBeforeEnter : function() {},
			onBeforeLeave : function() {},
			onAfterEnter : function() {},
			onAfterLeave : function() {}
			
			element : "#hallo" // Can be element or element-selector
		}
	*/
	var currentIndex = -1;
	
	function show(elm) {
		var e = $(elm.element);
		// Calculate base-position (i.e. with zoomFactor 1) for Webkit
		if ($.browser.webkit) {
			var baseLeft = ((e.offset().left  - canvas.offset().left) / canvasZoomFactor);
			var baseTop = ((e.offset().top  - canvas.offset().top) / canvasZoomFactor);
		} else {
			var baseLeft = e.offset().left  - canvas.offset().left;
			var baseTop = e.offset().top  - canvas.offset().top;
		}					
		// zoom so that the element fits on screen
		var proportionalWidth = e.outerWidth() / canvas.outerWidth(); // e.g. 200/1000 = 0.2
		var proportionalHeight = e.outerHeight() / canvas.outerHeight();
		var scaleFactor = Math.max(proportionalWidth, proportionalHeight);
		canvasZoomFactor = (1 / scaleFactor); // e.g. zoom to (1 / (0.2)) = 5
		zoom(canvas, canvasZoomFactor);
		// Move element. Always move the element to the center of the screen
		var newLeft = (baseLeft * canvasZoomFactor * -1);
		var newTop = (baseTop * canvasZoomFactor * -1);
		if (proportionalWidth > proportionalHeight) {
			// Element will take full Width, leaving space at top and bottom
			// Calculate rest-space
			var rest = canvas.outerHeight() - e.outerHeight();
			//newTop = (rest / 2 * canvasZoomFactor);
		} else {
			// Element will take full Height, leaving space left and right
			var rest = canvas.outerWidth() - e.outerWidth();
			newLeft += (rest / 2 * canvasZoomFactor);
		}
		// If canvas is smaller than its container, then center the canvas in its parent
		/*
		if ((canvas.outerHeight() * canvasZoomFactor) < canvas.parent().outerHeight()) {
			newTop = (canvas.parent().outerHeight() - (canvas.outerHeight() * canvasZoomFactor)) / 2;
		}*/
		if ((canvas.outerWidth() * canvasZoomFactor)  < canvas.parent().outerWidth()) {
			newLeft = (canvas.parent().outerWidth() - (canvas.outerWidth() * canvasZoomFactor)) / 2;
		}
		move(canvas, newLeft, newTop);
	}
	
	function zoom(elm, zoomLevel) {
		$(elm).get(0).style.MozTransform = 'scale('+zoomLevel+')';
		$(elm).get(0).style.WebkitTransform = 'scale('+zoomLevel+')';
	}
	
	function move(elm, left, top) {
		$(elm).css("left", left);
		$(elm).css("top", top);
	}
	
	return {
		start : function() {
			currentIndex = 0;
			this.showCurrent();
		},
		restart : function() {
			var currentIndex = 0;
			this.showCurrent();
		},
		show : function(index) {
			var currentIndex = index;
			this.showCurrent();
		},
		next : function() {
			var prevIndex = currentIndex;
			currentIndex++;
			if (currentIndex > elements.length-1) {
				currentIndex = 0;
			}
			if (elements[prevIndex] && typeof(elements[prevIndex].onBeforeLeaveToNext) == "function") {
				elements[prevIndex].onBeforeLeaveToNext();
			}
			if (typeof(elements[currentIndex].onBeforeEnterFromPrev) == "function") {
				elements[currentIndex].onBeforeEnterFromPrev();
			}
			this.showCurrent();
			if (elements[prevIndex] && typeof(elements[prevIndex].onAfterLeaveToNext) == "function") {
				elements[prevIndex].onAfterLeaveToNext();
			}
			if (typeof(elements[currentIndex].onAfterEnterFromPrev) == "function") {
				elements[currentIndex].onAfterEnterFromPrev();
			}
		},
		prev : function() {
			var prevIndex = currentIndex;
			currentIndex--;
			if (currentIndex < 0) {
				currentIndex = elements.length-1;
			}
			if (typeof(elements[prevIndex].onBeforeLeaveToPrev) == "function") {
				elements[prevIndex].onBeforeLeaveToPrev();
			}
			if (typeof(elements[currentIndex].onBeforeEnterFromNext) == "function") {
				elements[currentIndex].onBeforeEnterFromNext();
			}
			this.showCurrent();
			if (typeof(elements[prevIndex].onAfterLeaveToPrev) == "function") {
				elements[prevIndex].onAfterLeaveToPrev();
			}
			if (typeof(elements[currentIndex].onAfterEnterFromNext) == "function") {
				elements[currentIndex].onAfterEnterFromNext();
			}
		},
		previous : function() {
			this.prev();
		},
		showCurrent : function() {
			show(elements[currentIndex]);
		}
	};
}