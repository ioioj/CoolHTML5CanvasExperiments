var context, canvas, HEIGHT, WIDTH
var isCanvasValid = false
var interval = 30
var boxWidth, boxHeight
boxWidth = boxHeight = 42
//Mouse moving events
var mouseDown = false, dragBox, dragX, dragY, boxMove = 1, boxShift = 5
var black = "rgb(0,0,0)" , green="#00ff00", blue = "#0000ff"
var terminalWidth, terminalHeight
terminalWidth = terminalHeight = 4

//
var direction = {input:0, output: 1}

var boxes = []

/* Terminl class, represent a point on the edge of a box.
 * Currently, not being used. 
 */
function Terminal(box, direction, index){
	this.box = box
	this.index = index
	this.direction = direction
	this.x
	this.y
	this.fill = green
}
Terminal.prototype.init = function(){
	if(this.index){
	}
	else{
		this.y = this.box.y + this.box.h/2
		this.x = this.box.x
		if(this.direction == direction.output)
			this.x += boxWidth
	}
	
}
Terminal.prototype.draw = function(){
	context.fillStyle = this.fill
	context.fillRect(this.x-terminalWidth/2, this.y-terminalHeight/2, terminalWidth, terminalHeight)
}


/* Box class, represents the square box on the canvas!
 * These are the moveabe elements on the canvas
 */
function Box(x,y,w,h, fill,stroke){
	this.x = x
	this.y = y
	this.w = w
	this.h = h
	this.fill = fill	
	if(stroke === 'undefined')
		this.stroke = null
	else
		this.stroke = stroke
	this.terminals = []
	this.inputTerminalsCount = 0
	this.outputTerminalsCount = 0
	this.terminalReInit = true
}
Box.prototype.draw = function(){
	context.fillStyle = this.fill
	context.fillRect(this.x,this.y,this.w,this.h)
	if(this.stroke != null){
		context.strokeStyle = this.stroke
		context.lineWidth = 3
		context.strokeRect(this.x,this.y,this.w,this.h)
	}
	if(this.terminalReInit){
		this.terminalReInit =false
		this.initTerminals()
	}//now make a call to init terminal positions
	for(var i=0;i<this.terminals.length;i+=1){
		this.terminals[i].draw()
	}
}
Box.prototype.initTerminals = function(){
	inputTermSpacing = boxHeight/(this.inputTerminalsCount+1)
	outputTermSpacing = boxHeight/(this.outputTerminalsCount+1)
	//go through inputterminals
	for(var i = 0; i<this.inputTerminalsCount;i+=1){
		this.terminals[i].x = this.x
		this.terminals[i].y = this.y + inputTermSpacing*(i+1)		
	}
	//output terminals
	for(var i =this.inputTerminalsCount;i<this.terminals.length;i+=1){
		this.terminals[i].x = this.x+boxWidth
		this.terminals[i].y = this.y+outputTermSpacing*(i-this.inputTerminalsCount+1)
	}		

}
Box.prototype.addTerminal = function(terminal){
	this.terminals.push(terminal)
	if(terminal.direction == direction.input)
		this.inputTerminalsCount +=1
	else
		this.outputTerminalsCount +=1
}
Box.prototype.updateCoordinates = function(x,y){
	this.x = x
	this.y = y
	for(var i =0;i<this.terminals.length;i+=1)
		this.terminalReInit = true
	invalidate()
}
Box.prototype.changeStroke = function(strokeColor){
	this.stroke = strokeColor
}

$(document).ready(function(){
	initListeners();
	initGlobals()
	setInterval(draw, interval)
});
function clearCanvas(){
	context.clearRect(0,0,WIDTH, HEIGHT)
}
function draw(){
	if(!isCanvasValid){
		clearCanvas()
		for(var i=0;i<boxes.length;i +=1){
			boxes[i].draw()
		}
		isCanvasValid = true
	}
}
function doesXYLieInRect(x,y,b){
	if(x>b.x && x<b.x+b.w && y> b.y && y<b.y+b.h)
		return true
	else
		return false
}

function initListeners(){
	$(document).keydown(function(event){
		if(event.shiftKey)
			drag = boxShift
		else
			drag = boxMove
		if(dragBox){
			switch(event.keyCode){
				case 37: dragBox.updateCoordinates(dragBox.x-drag, dragBox.y); break;
				case 37: dragBox.updateCoordinates(dragBox.x-drag, dragBox.y); break;
				case 38: dragBox.updateCoordinates(dragBox.x, dragBox.y - drag); break;
				case 39: dragBox.updateCoordinates(dragBox.x + drag, dragBox.y) ; break;
				case 40: dragBox.updateCoordinates(dragBox.x, dragBox.y + drag); break
			}
		}
	})
	$("canvas").mousedown(function(event){
		mouseDown = true
		xpos = event.pageX - event.currentTarget.offsetLeft
		ypos = event.pageY - event.currentTarget.offsetTop
		//check if xpos and ypos lie in any of the box, go from last to first
		dragBox = null
		dragX = xpos
		dragY = ypos
		removeStrokeFlag = false
		for(i=boxes.length-1;i>=0;i-=1){
			if(!removeStrokeFlag && doesXYLieInRect(xpos, ypos, boxes[i])){
				dragBox = boxes[i]
				removeStrokeFlag = true
			}
			boxes[i].stroke = black
		}
		if(dragBox != null){
			dragBox.changeStroke(green)
		}		
		invalidate()		
	})
	$("canvas").mouseup(function(event){
		mouseDown = false
	})
	$("canvas").mousemove(function(event){
		if(mouseDown && dragBox){
			xpos = event.pageX - event.currentTarget.offsetLeft
			ypos = event.pageY - event.currentTarget.offsetTop
			xShift = xpos - dragX
			yShift = ypos - dragY
			dragX = xpos
			dragY = ypos
			dragBox.updateCoordinates(dragBox.x + xShift, dragBox.y + yShift)
		}
	})
	$("canvas").dblclick(function(event){
		xpos = event.pageX - event.currentTarget.offsetLeft
		ypos = event.pageY - event.currentTarget.offsetTop
		//if(xpos > boxWidth/2)
			xpos = xpos - boxWidth/2
		//else
			//xpos = 0
		//if(ypos > boxHeight/2)
			ypos = ypos - boxHeight/2
		//else
			//ypos = 0
		b = new Box(xpos, ypos, boxWidth, boxHeight, "rgb(255,0,0)", black)
		inT = $("#inT").val()
		for(i=0;i<inT;i+=1){
			t = new Terminal(b, direction.input, i)
			b.addTerminal(t)
		}
		outT = $("#outT").val()
		for(i=0;i<outT;i+=1){
			t = new Terminal(b, direction.output,i)
			b.addTerminal(t)
		}
		boxes.push(b)
		invalidate()
	})
	
}
function invalidate(){
	isCanvasValid = false
}

function initGlobals(){
	context = $("#canvas").get(0).getContext("2d")
	canvas = $("#canvas")
	HEIGHT = canvas.height()
	WIDTH = canvas.width()
}
