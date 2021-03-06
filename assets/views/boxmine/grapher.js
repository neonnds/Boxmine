$(document).ready(function() {

	// I translate the coordiantes from a global context to a local context.
	$.globalToLocal = function( context, globalX, globalY ) {
		// Get the position of the context element.
		var position = context.offset();
	
		// Return the X/Y in the local context.
		return({
			x: Math.floor( globalX - position.left ),
			y: Math.floor( globalY - position.top )
		});
	};

	// I translate the coordinates from a local context to a global context.
	$.localToGlobal = function( context, localX, localY ) {
		// Get the position of the context element.
		var position = context.offset();

		// Return the X/Y in the local context.
		return({
			x: Math.floor( localX + position.left ),
			y: Math.floor( localY + position.top )
		});
	};

	//Prevent dragging of svg elements
	$(document).bind("mousedown",function(e){
		return false;
	});
	
	//Prevent context menu from mouse left click
	$(document).bind("contextmenu",function(e){
		return false;
	}); 
			
	$(window).resize(function() {
		console.log("Window resized!");
		updateDimensions();
	});
	
	window.boxmine = {};
	window.boxmine.selected = Array();

	window.boxmine.registerObject = function(name, callback) {

		if(name in joint.shapes.basic) {
			callback();
			return;
		}

		$.get("/images/boxmine/shapes/" + name + ".svg", null, function(data) {

			data = data.toString();
			data = data.replace(/<svg .*>/g, "");
			data = data.replace("</svg>", "");
			data = data.replace(/\s{2,}/g, ' ');
			data = data.replace(/\t/g, ' ');
			data = data.trim().replace(/(\r\n|\n|\r)/g,"");

			joint.shapes.basic[name] = joint.shapes.basic.Generic.extend({

				markup: data,
				
				defaults: joint.util.deepSupplement({
				
					type: 'basic.Boxmine',
					
					attrs: {
						'.class-ying': { 'fill': '#3498db' },
						'.class-yang': { 'fill': '#000' }
					}
					
				}, joint.shapes.basic.Generic.prototype.defaults)
			});

			callback();

		},  'text');
	};

	window.boxmine.addToPaper = function(name, x, y) {

		var rect = new joint.shapes.basic[name]({
			position: { x: x, y: y },
			size: { width: 100, height: 100 },
			attrs: {
				'.class-ying': { fill: 'black' },
				'.class-yang': { fill: 'white' }
			}
		});

		console.log("ADDING");	

		console.log(window.boxmine.graph);

		window.boxmine.graph.addCell(rect);
	};

	window.boxmine.select = function(object) {
		console.log(object);	
		object.highlight();
		window.boxmine.selected.push(object);
	};
	
	window.boxmine.deselect = function(object) {
		
		object.unhighlight();
	}

	window.boxmine.deselectAll = function() {
		
		while(window.boxmine.selected.length > 0) {
			window.boxmine.selected.pop().unhighlight();
		}
	};
	
	window.boxmine.deleteSelected = function() {
	
		while(window.boxmine.selected.length > 0) {
			window.boxmine.selected.pop().remove();
		}
	};
	
	window.boxmine.selectAll = function() {
	
		console.log(window.boxmine.paper);
			
		var cells = window.boxmine.paper;
	
		for(var i = 0; i < cells.length; i++) {
			console.log(cells);
			window.boxmine.select(cells[i].model);
		}
	};
	
	window.boxmine.groupSelected = function() {
	
		if(window.boxmine.selected.length < 2) {
			return;
		}
		
		var first = window.boxmine.selected.shift();
		
		window.boxmine.deselect(first);
		
		while(window.boxmine.selected.length > 0) {
			
			var second = window.boxmine.selected.pop();
			
			window.boxmine.deselect(second);
			
			first.model.embed(second.model);
		}
	};
	
	window.boxmine.ungroupSelected = function() {
	
		console.log(window.boxmine.selected.length);
		
		if(window.boxmine.selected.length < 2) {
			return;
		}
		
		var first = window.boxmine.selected.shift();
		
		window.boxmine.deselect(first);
		
		while(window.boxmine.selected.length > 0) {
		
			var second = window.boxmine.selected.pop();
			
			window.boxmine.deselect(second);
			
			first.model.unembed(second.model);
			
			second.model.unembed(first.model);
		}
	};
	
	window.boxmine.graph = new joint.dia.Graph;

	window.boxmine.paper = new joint.dia.Paper({
		el: $('#paper'),
		width: 100,
		height: 100,
		gridSize: 1,
		perpendicularLinks: false,
		model: window.boxmine.graph
	});

	function updateDimensions() {
		var width = $('#paper-container').width();
		var height = $('#paper-container').height() - 80;

		$("#paper").height(height);
		$("#paper").width(width);

		window.boxmine.paper.setDimensions(width, height); 
	}

	updateDimensions();
	
	var link = new joint.dia.Link({
		source: { x: 10, y: 20 },
		target: { x: 350, y: 20 },
		attrs: {
			'.connection': { stroke: 'blue' },
			'.marker-source': { fill: 'red', d: 'M 10 0 L 0 5 L 10 10 z' },
			'.marker-target': { fill: 'yellow', d: 'M 10 0 L 0 5 L 10 10 z' }
		}
	});

	window.boxmine.graph.addCell(link);
	

	var text = new joint.shapes.basic.Text({
		position: { x: 170, y: 50 },
		size: { width: 40, height: 30 },
		attrs: { text: { text: 'Text' } }
	});
	
	window.boxmine.graph.addCell(text);

	$(window).load(function () {	

		newDocumentButton.mouseupCallback = function() {
			console.log("YOU CLICKED ME");
		};

		logoutButton.mouseupCallback = function() {
			window.location.replace("/logout");
		};

		toggleGridButton.mouseupCallback = function() {
		
			if(window.boxmine.activeWindow != null) {
				return;
			}
			
			if($("#paper").hasClass("show-grid") == true) {

				$("#paper").removeClass("show-grid");
				
				$("#paper").addClass("hide-grid");
				
			} else {

				$("#paper").removeClass("hide-grid");
				
				$("#paper").addClass("show-grid");
			}
		};

		zoompanel.inMouseupCallback = function() {
			window.boxmine.paper.options.width += 50;
			window.boxmine.paper.options.height += 50;
			
			window.boxmine.paper.setDimensions(window.boxmine.paper.options.width, window.boxmine.paper.options.height);
			window.boxmine.paper.scale(window.boxmine.paper.options.width / 1000, window.boxmine.paper.options.height / 1000);
			
			$("#paper").width(window.boxmine.paper.options.width);
			$("#paper").height(window.boxmine.paper.options.height);
		};

		zoompanel.resetMouseupCallback = function() {	
			window.boxmine.paper.options.width = 1000;
			window.boxmine.paper.options.height = 1000;
			
			window.boxmine.paper.setDimensions(window.boxmine.paper.options.width, window.boxmine.paper.options.height);
			window.boxmine.paper.scale(window.boxmine.paper.options.width / 1000, window.boxmine.paper.options.height / 1000);
			
			$("#paper").width(window.boxmine.paper.options.width);
			$("#paper").height(window.boxmine.paper.options.height);
		};
		
		zoompanel.outMouseupCallback = function() {	
			window.boxmine.paper.options.width -= 50;
			window.boxmine.paper.options.height -= 50;
			
			window.boxmine.paper.setDimensions(window.boxmine.paper.options.width, window.boxmine.paper.options.height);
			window.boxmine.paper.scale(window.boxmine.paper.options.width / 1000, window.boxmine.paper.options.height / 1000);
			
			$("#paper").width(window.boxmine.paper.options.width);
			$("#paper").height(window.boxmine.paper.options.height);
		};

		moveUpButton.mouseupCallback = function() {
			
			if(window.boxmine.activeWindow != null) {
				return;
			}
			
			if(window.boxmine.selected.length == 1) {
				
				var selected = window.boxmine.selected[0];
		
				console.log(selected);
				
				selected.model.moveUp();
			}
		};
		
		moveDownButton.mouseupCallback = function() {
			
			if(window.boxmine.activeWindow != null) {
				return;
			}
			
			if(window.boxmine.selected.length == 1) {
				
				var selected = window.boxmine.selected[0];
		
				console.log(selected);
				
				selected.model.moveDown();
			}
		};
		
		moveTopButton.mouseupCallback = function() {
			
			if(window.boxmine.activeWindow != null) {
				return;
			}
			
			if(window.boxmine.selected.length == 1) {
				
				var selected = window.boxmine.selected[0];
		
				console.log(selected);
				
				selected.model.toFront();
			}
		};
		
		moveBottomButton.mouseupCallback = function() {
			
			if(window.boxmine.activeWindow != null) {
				return;
			}
			
			if(window.boxmine.selected.length == 1) {
				
				var selected = window.boxmine.selected[0];
		
				console.log(selected);
				
				selected.model.toBack();
			}
		};
		
		deleteButton.mouseupCallback = function() {
		
			if(window.boxmine.activeWindow != null) {
				return;
			}
			
			window.boxmine.deleteSelected();
		};
		
		selectAllButton.mouseupCallback = function() {
		
			if(window.boxmine.activeWindow != null) {
				return;
			}
			
			window.boxmine.selectAll();
		};
		
		groupButton.mouseupCallback = function() {
		
			if(window.boxmine.activeWindow != null) {
				return;
			}
			
			window.boxmine.groupSelected();
		};
		
		ungroupButton.mouseupCallback = function() {
		
			if(window.boxmine.activeWindow != null) {
				return;
			}
			
			window.boxmine.ungroupSelected();
		};
	});
	
	/*
	window.boxmine.graph.on('all', function(eventName, cell)
	{
	    console.log(arguments);
	});
	*/
	
	window.boxmine.paper.on('cell', function(v, evt, x, y) {
	
		console.log(arguments);
	});

	window.boxmine.paper.on('blank:pointerdown', function(evt, x, y) {
	
		console.log("pointerdown on " + x + "," + y);

		window.boxmine.deselectAll();
	});

	window.boxmine.paper.on('cell:pointerdown', function(v, evt, x, y) {
	
		console.log("mousedown on " + x + "," + y);
		
		window.boxmine.select(v);
	});

	window.boxmine.paper.on('cell:pointerup', function(v, evt, x, y) {
	
		console.log("mouseup on " + x + "," + y);
	});
	
	window.boxmine.paper.on('cell:pointermove', function(v, evt, x, y) {
	
		console.log("mousemove on " + x + "," + y);
	});

	window.boxmine.paper.on('blank:pointerdown', function(evt) {
		if(evt.shiftKey) {
			console.log("HERE");
		}
	});
		
	//Allow default-window divs to be moved around as windows
	$('.default-window').each(function(i) {
		
		var win = this;

		// …find the title bar inside it and do something onmousedown
		$(win).find('.default-window-title').on('mousedown', function(evt) {

			// Record where the window started
			var real = $(win).offset();
			var itemTLX = real.left;
			var itemTLY = real.top;

			// Record where the mouse started
			var firstMX = evt.clientX;
			var firstMY = evt.clientY;

			// When moving anywhere on the page, drag the window …until the mouse button comes up
			$(document).bind('mousemove', drag);

			$(document).bind('mouseup', function() {
				$(document).unbind('mousemove', drag);
			});

			// Every time the mouse moves, we do the following 
			function drag(evt) {
				// Add difference between where the mouse is now versus where it was last to the original positions
				$(win).offset({
					left: itemTLX + evt.clientX - firstMX,
					top: itemTLY + evt.clientY - firstMY
				});
			};
		});
	});
});
