var context, canvas, HEIGHT, WIDTH
var isCanvasValid = false
var interval = 30
var boxWidth, boxHeight
boxWidth = boxHeight = 50
//Mouse moving events
var mouseDown = false, dragBox, dragX, dragY, boxMove = 1, boxShift = 5
var black = "rgb(0,0,0)"

//
var direction = {input:0, output: 1}

var boxes = []
function addBoxToCanvas(box){
	context.fillStyle = box.fill
	context.fillRect(box.x,box.y,box.w,box.h)
	if(box.stroke != null){
		context.strokeStyle = box.stroke
		context.lineWidth = 3
		context.strokeRect(box.x,box.y,box.w,box.h)
	}
	invalidate()
}

function Terminal(box, direction, index){
	this.box = box
	this.index = index
	this.direction = direction
	this.x
	this.y
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
	context.beginPath()
	context.arc(this.x, this.y,3, 0, 2*Math.PI, false)
	context.closePath()
}


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
	this.inputTerminals = 0
	this.outputTerminals = 0
}
Box.prototype.draw = function(){
	context.fillStyle = this.fill
	context.fillRect(this.x,this.y,this.w,this.h)
	if(this.stroke != null){
		context.strokeStyle = this.stroke
		context.lineWidth = 3
		context.strokeRect(this.x,this.y,this.w,this.h)
	}
	for(i=0;i<this.terminals.length;i+=1){
		this.terminals[i].draw()
	}
	invalidate()
}
Box.prototype.addTerminal = function(terminal){
	this.terminals.push(terminal)
	if(terminal.direction == direction.input)
		this.inputTerminals +=1
	else
		this.outputTerminals +=1
	terminal.init()
}
Box.prototype.updateCoordinates = function(x,y){
	this.x = x
	this.y = y
	//update all terminals coordinates
	invalidate()
}
//function Terminal(direction)

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
		for(i=0;i<boxes.length;i+=1){
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
function strokeBox(box){
	box.stroke = "rgb(0,255,0)"
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
			strokeBox(dragBox)
			invalidate()
		}
		else
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
		b.draw()
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
