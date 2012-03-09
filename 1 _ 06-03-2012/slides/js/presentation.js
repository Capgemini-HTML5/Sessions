// Presentation class
function Presentation(canvas, elements) {
	var canvas = $(canvas);
	if (canvas.size() == 0) {
		alert('geen geldige canvas opgegeven');
		return;
	}
	var canvasZoomFactor = 1;
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
	var options = { showOriginalMargins : false, showCustomMargin : false, customMarginWidth : 20 };
	
	function show(elm) {
		var e = $(elm.element);
		resetTransformations();
		// Calculate base-position (i.e. with zoomFactor 1) for Webkit
		// TODO: get left while taking margin into account
		if ($.browser.webkit || $.browser.opera) {
			var baseLeft = ((e.offset().left  - canvas.offset().left) / canvasZoomFactor);
			var baseTop = ((e.offset().top  - canvas.offset().top) / canvasZoomFactor);
		} else {
			var baseLeft = e.offset().left  - canvas.offset().left;
			var baseTop = e.offset().top  - canvas.offset().top;
		}					
		// zoom so that the element fits on screen
		var canvasContainerWidth = canvas.outerWidth(options.showOriginalMargins);
		var canvasContainerHeight = canvas.outerHeight(options.showOriginalMargins);
		var proportionalWidth = e.outerWidth(options.showOriginalMargins) / canvasContainerWidth; // e.g. 200/1000 = 0.2
		var proportionalHeight = e.outerHeight(options.showOriginalMargins) / canvasContainerHeight;
		var scaleFactor = Math.max(proportionalWidth, proportionalHeight);
		canvasZoomFactor = (1 / scaleFactor); // e.g. zoom to (1 / (0.2)) = 5
		// Move element. Always move the element to the center of the screen
		var newLeft = (baseLeft * canvasZoomFactor * -1);
		var newTop = (baseTop * canvasZoomFactor * -1);
		if (proportionalWidth > proportionalHeight) {
			// Element will take full Width, leaving space at top and bottom
			// Calculate rest-space
			var openSpace = canvasContainerHeight - (e.outerHeight(options.showOriginalMargins)*canvasZoomFactor);
			newTop += (openSpace / 2);
		} else {
			// Element will take full Height, leaving space left and right
			var openSpace = canvasContainerWidth - (e.outerWidth(options.showOriginalMargins)*canvasZoomFactor);
			newLeft += (openSpace / 2);
		}
		// If canvas is smaller than its container, then center the canvas in its parent
		if ((outerScrollHeight(canvas, options.showOriginalMargins) * canvasZoomFactor) < canvas.parent().outerHeight(options.showOriginalMargins)) {
			newTop = (canvas.parent().outerHeight(options.showOriginalMargins) - (outerScrollHeight(canvas, options.showOriginalMargins) * canvasZoomFactor)) / 2;
		}
		if ((outerScrollWidth(canvas, options.showOriginalMargins) * canvasZoomFactor)  < canvas.parent().outerWidth(options.showOriginalMargins)) {
			newLeft = (canvas.parent().outerWidth(options.showOriginalMargins) - (outerScrollWidth(canvas, options.showOriginalMargins) * canvasZoomFactor)) / 2;
		}
		move(newLeft, newTop);
		zoom(canvasZoomFactor);
	}
	
	function resetTransformations() {
		$(canvas).get(0).style.MozTransform = "";
		$(canvas).get(0).style.WebkitTransform = "";
		$(canvas).get(0).style.OTransform = "";
	}
	
	function zoom(zoomLevel) {
		$(canvas).get(0).style.MozTransform += 'scale('+zoomLevel+')';
		$(canvas).get(0).style.WebkitTransform += 'scale('+zoomLevel+')';
		$(canvas).get(0).style.OTransform += 'scale('+zoomLevel+')';
	}
	
	function move(left, top) {
		$(canvas).get(0).style.MozTransform += 'translate('+left+'px,'+top+'px)';
		$(canvas).get(0).style.WebkitTransform += ' translate('+left+'px,'+top+'px)';
		$(canvas).get(0).style.OTransform += 'translate('+left+','+top+')';
	}
	
	function outerScrollHeight(elm, includeMargin) {
		// When an element's content does not generate a vertical scrollbar, then its scrollHeight property is equal to its clientHeight property.
        // https://developer.mozilla.org/en/DOM/element.scrollHeight
		if ($.browser.mozilla || $.browser.opera) {
			var originalOverflowStyle = $(elm).get(0).style.overflow;
			$(elm).get(0).style.overflow = "scroll";
		}
		var totalHeight = $(elm).get(0).scrollHeight; //includes padding.
		if ($.browser.mozilla || $.browser.opera) {
			$(elm).get(0).style.overflow = originalOverflowStyle;
		}
		totalHeight += $(elm).outerHeight(includeMargin) - $(elm).innerHeight();
		return totalHeight;
	}
	
	function outerScrollWidth(elm, includeMargin) {
		// When an element's content does not generate a horizontal scrollbar, then its scrollWidth property is equal to its clientWidth property.
        // https://developer.mozilla.org/en/DOM/element.scrollWidth
		if ($.browser.mozilla || $.browser.opera) {
			var originalOverflowStyle = $(elm).get(0).style.overflow;
			$(elm).get(0).style.overflow = "scroll";
		}
		var totalWidth = $(elm).get(0).scrollWidth; //includes padding
		if ($.browser.mozilla || $.browser.opera) {
			$(elm).get(0).style.overflow = originalOverflowStyle;
		}
		totalWidth += $(elm).outerWidth(includeMargin) - $(elm).innerWidth();
		return totalWidth;
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