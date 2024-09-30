/*
 * URL for image storage (https://bites.weber.id.au/)
 */ 

// var imagesURL = "https://meghalithic.github.io/megbalk.github.io/webpic/images/";
var imagesURL = "https://github.com/meghalithic/megbalk.github.io/tree/master/webpic/images/";
// Another comment 2
var canvas = new fabric.Canvas('canvas', {selection: false, hoverCursor:'default'});
var images;
var bgimg;
var scale;
var trigger = 0;
var isDown = false;
var isSet = [];
var img;
var currentImage;
var angle = 0;

var activeColor = '#ff8100';
var inactiveColor = '#ffcc98';
var textColor = '#FFFFFF';

var pointer;
var mag;
var center;
var panning = false;

var userName = 'NA';

// Get list of images and loads first one 
function getImageListAndLoadFirstImage()
{
	fetch("https://meghalithic.github.io/megbalk.github.io/webpic/images.list")
	.then((response) => response.text())
	.then((responseText) => {
		loadFirstImage(responseText)
	})
}
	
function loadFirstImage(responseText)
{
	// Quick and dirty JSON build
	
	const lines = responseText.split(/\r\n|\n/);
	shuffledLines = shuffle(lines);

	newJson = "[";

	shuffledLines.forEach((line, index, array) => {
		if (index === array.length - 1)
		{ 
			// Last item, don't include comma
			newJson += "{\"name\": \"" + line + "\",";
			newJson += "\"viewed\": false,";
			//newJson += "\"download_url\": \"images/" + line + "\"}";
			newJson += "\"download_url\": \"" + imagesURL + line.trim() + "\"}";
		} else
		{
			// Not last item, include comma
			newJson += "{\"name\": \"" + line + "\",";
			newJson += "\"viewed\": false,";
			//newJson += "\"download_url\": \"images/" + line + "\"},";
			newJson += "\"download_url\": \"" + imagesURL + line.trim() + "\"},";
		}
	});

	newJson += "]";
	
	images = JSON.parse(newJson)
	imageToLoad = images.find(getNextImage);
	imgURL = imageToLoad.download_url;
	imgFileName = imageToLoad.name;
	bgimg = imgURL;

	loadImageToCanvas(imgURL);

	document.querySelector('input[name = "Image"]').value = imgFileName;
	
	next = document.getElementById('next');
	next.disabled = (images.find(hasNextImage)) ? false : true;

	return true;
}

// Load image in to canvas and display
function loadImageToCanvas(imageURL)
{
	center = canvas.getCenter();

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

		currentImage = img;
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

canvas.on('mouse:up', function (e) {
	panning = false;
});

canvas.on('mouse:down', function (e) {
    panning = true;
});
canvas.on('mouse:move', function (e) {
    if (panning && e && e.e) {
        var units = 10;
        var delta = new fabric.Point(e.e.movementX, e.e.movementY);
        canvas.relativePan(delta);
    }
});

$(document).on('keypress', function(e){
	console.log("keypress");
	if(e.keyCode > 48 && e.keyCode < 58)
	{
		mag = e.keyCode - 48;
		canvas.setZoom(mag);
	}
});	

// Handle clicking the radio buttons
$(document).ready(function(){
	$('input[type=radio]').click(function(){
		if($('input[name="Shark_Bite_Type"]:checked').val() == "DraggedTooth")
		{
			$('#draggedToothType').show();
		}
			else
		{
		$('#draggedToothType').hide();
		}
		});
});

window.onload = function()
{
	enterer = prompt("What's your name?");

	$('#signedIn').css('visibility','visible');
	$('#signedIn').append('<p> Reviewing as: ' + enterer + '</p>');

	document.querySelector('input[name = "Name"]').value = enterer;

	getImageListAndLoadFirstImage();
	
	$.when($.getJSON("map.json", function(json) {
		map = unnest(json,false);
		mapBuild = unnest(json,true)
		})
	).then(
	 	function(){
			document.title = pageName;
			$('h1').append('<a href="/">' + pageName + '</a>');

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
	// Assumes image is always at index 0, not ideal
	document.querySelector('input[name = "' + map[0].name + '"]').value = document.querySelector('input[name="' + map[0].title + '"]').value || "Unknown image";

	for(var i=1; i<map.length; i++)
	{
		if (map[i].title == "Name")
		{
			// Bit dirty, name isn't a radio button
			document.querySelector('input[name = "' + map[i].name + '"]').value = document.querySelector('input[name="' + map[i].title + '"]').value || "Unknown name";
		} 
		else if (map[i].title == "Comments")
		{
			// Bit dirty, name isn't a radio button
			document.querySelector('input[name = "' + map[i].name + '"]').value = document.querySelector('textarea[name="' + map[i].title + '"]').value || "Unknown name";
			document.querySelector('textarea[name="' + map[i].title + '"]').value = "";
		} else 
		{
			value1 = $('input[name="' + map[i].title + '"]:checked').val() || "No response provided";
			$('input[name="' + map[i].name + '"]').val(value1);
			//document.querySelector('input[name = "' + map[i].name + '"]').value = value1;
			$('input[name=' + map[i].title + ']').attr('checked',false);
		}
	};

	$('#draggedToothType').hide();

	document.measurements.submit();

	nextImage = images.find(getNextImage);

	loadImageToCanvas(nextImage.download_url);	
	document.querySelector('input[name = "Image"]').value = nextImage.name;
	canvas.setViewportTransform([1,0,0,1,0,0]);

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

function rotate()
{
	angle += 90;

	canvas.backgroundImage.setAngle(angle);
	canvas.renderAll();
}

function shuffle(array) {
	var currentIndex = array.length, temporaryValue, randomIndex;
  
	// While there remain elements to shuffle...
	while (0 !== currentIndex) {
  
	  // Pick a remaining element...
	  randomIndex = Math.floor(Math.random() * currentIndex);
	  currentIndex -= 1;
  
	  // And swap it with the current element.
	  temporaryValue = array[currentIndex];
	  array[currentIndex] = array[randomIndex];
	  array[randomIndex] = temporaryValue;
	}
  
	return array;
  }
