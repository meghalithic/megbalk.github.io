/*
 * URL for location where the script is being run
 * 
 * GitHub example - https://vk4ut.github.io/webpic/
 * Local PC - file:///C:/Users/Ben/Documents/GitHub/vk4ut.github.io/webpic/
 */ 

//fetch('').then(function(response)

var imagesURL = "https://megbalk.github.io/webpic/";


// No need to change the stuff below this line. Maybe.
var canvas = this.__canvas = new fabric.Canvas('canvas', {selection: false, hoverCursor:'default'});
var images;

fabric.Object.prototype.hasControls = false;
fabric.Object.prototype.hasBorders = false;

var bgimg;
var scale;
var trigger = 0;
var isDown = false;
var isSet = [];
var img;

var distances = [];
var pointSet = [];
var textSet = [];
var staticx = [];
var staticy = [];

var activeColor = '#ff8100';
var inactiveColor = '#ffcc98';
var textColor = '#FFFFFF';

var pointer;
var isMag = false;
var mag;
var magSpotNew;
var magSpotOld;

var userName = 'NA';

// Get list of images and loads first one 
function getImageListAndLoadFirstImage()
{
	fetch(imagesURL + "images.list")
	.then((response) => response.text())
	.then((responseText) => {
		loadFirstImage(responseText)
	})
}
	
function loadFirstImage(responseText)
{
	// Quick and dirty JSON build
	
	const lines = responseText.split(/\r\n|\n/);
	newJson = "[";

	lines.forEach((line, index, array) => {
		if (index === array.length - 1)
		{ 
			// Last item, don't include comma
			newJson += "{\"name\": \"" + line + "\",";
			newJson += "\"viewed\": false,";
			//newJson += "\"download_url\": \"images/" + line + "\"}";
			newJson += "\"download_url\": \"" + imagesURL + "images/" + line + "\"}";
		} else
		{
			// Not last item, include comma
			newJson += "{\"name\": \"" + line + "\",";
			newJson += "\"viewed\": false,";
			//newJson += "\"download_url\": \"images/" + line + "\"},";
			newJson += "\"download_url\": \"" + imagesURL + "images/" + line + "\"},";
		}
	});

	newJson += "]";
	
	images = JSON.parse(newJson)
	imageToLoad = images.find(getNextImage);
	imgURL = imageToLoad.download_url;
	imgFileName = imageToLoad.name;

	loadImageToCanvas(imgURL);

	document.querySelector('input[name = "Image"]').value = imgFileName;
	
	next = document.getElementById('next');
	next.disabled = (images.find(hasNextImage)) ? false : true;

	return true;
}

// Load image in to canvas and display
function loadImageToCanvas(imageURL)
{
	var center = canvas.getCenter();

	fabric.Image.fromURL(imageURL, function (img)
	{
		scale = Math.min((canvas.height - 10) / img.getHeight(), (canvas.width - 10) / img.getWidth());

		img.set({
			scaleX: scale,
			scaleY: scale,
			top: center.top,
			left: center.left,
			originX: 'center',
			originY: 'center'
		});

		canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
	});
}

function getNextImage(element, index, array)
{
	if (element.viewed === false)
	{
		element.viewed = true;
		return true;
	}
	else
	{
		return false;
	}
}

function hasNextImage(element, index, array)
{
	if (element.viewed === false)
	{
		return true;
	}
	else
	{
		return false;
	}
}

function loadImage()
{

	imageToLoad = images.find(getNextImage);

	imgURL = imageToLoad.download_url;
	imgFileName = imageToLoad.name;

	loadImageToCanvas(imageURL);
	document.querySelector('input[name = "Image"]').value = imgFileName;

	return true;
}

window.onload = function()
{
	// Handle clicking the radio buttons
	$(document).ready(function(){
		$('input[type=radio]').click(function(){
			if (document.querySelector('input[name="Shark_Bite_Type"]:checked').value == "DraggedTooth")
			{
				$('#draggedToothType').show();
			}
				else
			{
			$('#draggedToothType').hide();
			}
			});
	});
		
	getImageListAndLoadFirstImage();
	
	// Catch keypresses
	$("body").on("keydown", function (e)
	{
		if(e.keyCode == 13 && isSet[trigger])
		{
			nextstep();
		} else if(e.keyCode > 48 && e.keyCode < 58)
		{
			if(!isMag)
			{
				mag = e.keyCode - 48;
				mag = (mag == 1) ? 10 : mag;
				
				addMag();
				
				isMag = true;
			}
	}
	});

	$("body").on("keyup", function (e) {
		if(isMag){
			canvas.remove(magSpotNew);
			isMag = false;
		}
		
	});

	var zoomText = new fabric.Text("Hold 1-9 to zoom in.", { 
					fill: 'red',
					fontSize: 12,
					left: 485,
					top: 485,
					lockMovementX: true,
					lockMovementY: true
				});
	canvas.add(zoomText);
	
	$.when($.getJSON("map.json", function(json) {
		map = unnest(json,false);
		mapBuild = unnest(json,true)
		})
	).then(
	 	function(){
			document.title = pageName;
			$('h1').append('<a href="/">' + pageName + '</a>');

			enterer = prompt("What's your name?");

			$('#signedIn').css('visibility','visible');
			$('#signedIn').append('<p> Reviewing as: ' + enterer + '</p>');

			document.querySelector('input[name = "Name"]').value = enterer;

			for(var i=0; i<map.length; i++){
				$('#measurements').append('<input type="text" name="' + map[i].name + '" value="" class="ss-q-short" dir="auto" aria-label="' + map[i].label + '" title="">')
			};

			$('#measurements').attr('action', formName);

			// fill in about tab, contact tab, and project title
			$('#panel1').html('<p>' + about + '</p>');
			$('#panel2').html('<p>' + contact + '</p>');
		}
	)
	
	
}

function prevstep()
{
	// No going back!
}

function nextstep()
{
	// Validate form

	document.querySelector('input[name = "' + map[0].name + '"]').value = document.querySelector('input[name="' + map[0].title + '"]').value || "Unknown image";

	for(var i=1; i<map.length; i++)
	{
		value1 = $('input[name="' + map[i].title + '"]:checked').val() || "No response provided";
		$('input[name="' + map[i].name + '"]').val(value1);
		//document.querySelector('input[name = "' + map[i].name + '"]').value = value1;
		$('input[name=' + map[i].title + ']').attr('checked',false);

	};

	document.measurements.submit();

	nextImage = images.find(getNextImage);

	loadImageToCanvas(nextImage.download_url);	
	document.querySelector('input[name = "image"]').value = nextImage.name;

	next = document.getElementById('next');
	next.disabled = (images.find(hasNextImage)) ? false : true;

}

function skipstep()
{
	// May  have to set skipped image viewed = true before going to the next step
		nextstep();
}

function submitForm()
{
	var anySet = 0;

	for(var i=0; i<isSet.length; i++){
		anySet = (isSet[i]==true) ? anySet+1 : anySet;
	}

	if(anySet > 0){
		document.measurements.submit();
	};
}

function startOver()
{
	canvas.clear().renderAll();
	getImageList();
	next.onclick = nextstep;
	next.disabled = prev.disabled = true;
	next.style.fontWeight = 'normal';
	next.innerHTML = 'next >';
	$('#buttons > p').css('visibility','visible');
	$('.count').remove();
	trigger = 0;
	isSet = [];
	document.getElementsByClassName('ss-q-short').value = "";
}

function removeChildren(trigger){
	for(var i=0; i<mapBuild.length; i++){
		if(mapBuild[i].parent == mapBuild[trigger].name){
			canvas.remove(pointSet[i]);
			canvas.remove(textSet[i]);
			isSet[i] = false;
		}
	}
}

// Add or remove magnification
function addMag(e)
{
	var center = canvas.getCenter();
	img = canvas.getActiveObject(); 

	pointer = canvas.getPointer();

	//fabric.Image.fromURL('images/' + bgimg,function(img)
	//{
		var offsetX = (pointer.x-center.left)*mag;
		var offsetY = (pointer.y-center.top)*mag;

		scale = Math.min((canvas.height - 10) / img.getHeight(), (canvas.width - 10) / img.getWidth());

		img.set({
			scaleX:scale*mag,
			scaleY:scale*mag,
			top: center.top-offsetY+(pointer.y-center.top),
			left: center.left-offsetX+(pointer.x-center.left),
			originX: 'center',
			originY: 'center',
			lockMovementX: true,
			lockMovementY: true,
			clipTo: function (ctx) 
			{
				ctx.save();
				ctx.setTransform(1,0,0,1,0,0);
				ctx.arc(pointer.x,pointer.y, 70, 0, Math.PI * 2);
				ctx.restore();
			}
			});

		magSpotNew = img;

		canvas.add(magSpotNew);
		canvas.remove(magSpotOld); // makes the movement smoother
		canvas.sendToBack(magSpotNew);

		magSpotOld = magSpotNew;

	//});
}

/* build structural objects */
$('nav > span').click(function(){
	var index = $('nav > span').index(this) + 1;
	var nav = this;
	$(nav).siblings().removeClass('active');
	$('.panel').not('#panel' + index).slideUp('slow');
	($(nav).hasClass('active')) ? (
		$('#panel' + index).slideUp('slow','swing',function(){
			$(nav).removeClass('active');
		})
	) : (
		$(nav).addClass('active'),
		$('#panel' + index).slideDown('slow')
	);
});

function renderButton()
{
	gapi.signin2.render('my-signin2', {
		'width': 200,
		'longtitle': true,
		'theme': 'dark',
		'onsuccess': onSuccess
	});
};