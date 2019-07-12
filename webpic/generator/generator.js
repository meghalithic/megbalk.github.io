// JavaScript Document

var loadItems = function(){
	$('.dd-list').empty();
	var formSource = $("#formSource").val();
	var regexpLabel = /aria-label="([^"]+)"/g;
	var matchLabel, labels = [];
	
	while ((matchLabel = regexpLabel.exec(formSource)) != null) {
	  labels.push(matchLabel[1]);
	}
	labels.pop();
	
	var regexpName = /name="(entry[^"]+)"/g;
	var matchName, names = [];
	
	while ((matchName = regexpName.exec(formSource)) != null) {
	  names.push(matchName[1]);
	}
	
	if(names.length < labels.length){
		labels.shift();
	}
	
	var formAction = /form action="([^"]+)"/;
	$('<li>', {
		class: 'dd-item dd3-item'
	}).data({
		'form':formAction.exec(formSource)[1],
		'page':'Project Title',
		'about':'About Tab',
		'contact':'Contact Tab',
		'repeat':'repeat'
	}).append($('<div>', {
		class: 'dd3-content',
		text: 'These fields are used to populate descriptive sections of the site (e.g. the page name, the "About" tab, etc.)'
	})).appendTo('#items ol');
	
	
	$('.dd3-content:first').append(
		$('<label for="page">The Title of Your Project</label>')
	).append(
		$('<input>',{
			placeholder:'Project Title',
			value:'Project Title',
			type:'text',
			id:'page',
			class:'page'
		})
	).append(
		$('<label for="about">About Tab (takes HTML)</label>')
	).append(
		$('<textarea>',{
			rows:5,
			columns:400,
			placeholder:'About Tab',
			value:'About Tab',
			id:'about',
			class:'about'
		})
	).append(
		$('<label for="contact">Contact Tab (takes HTML)</label>')
	).append(
		$('<textarea>',{
			rows:5,
			columns:400,
			placeholder:'Contact Tab',
			value:'Contact Tab',
			id:'contact',
			class:'contact'
		})
	).append(
		$('<label for="repeat">In what order will images be processed?</label>')
	).append(
		$('<select>',{
			id:'repeat',
			class:'repeat'
		}).html('<option value="repeat" selected>Repeat all in sequence</option>' +
			'<option value="norepeat" disabled>Show once in sequence (coming soon)</option>' +
			'<option value="random" disabled>Repeat shuffle (coming soon)</option>'
		)
	)
	
	var distOpts = '';	
	
	for(i=0;i<names.length;i++){
		var newItem = $('<li>', {
			class: 'dd-item dd3-item'
		}).data({
			'description':'', //* textarea
			'title':labels[i], //* text, placeholder is title
			'distance':'false', //* dropdown
			'type':'', //* dropdown
			'label':labels[i],
			'name':names[i],
		});
		
		newItem.appendTo('.dd-list');
		
		var itemDrag = $('<div>', {
			class: 'dd-handle dd3-handle',
			text: 'Drag'
		})
		
		var itemContent = $('<div>', {
			class: 'dd3-content'
		})
		
		newItem.append(itemDrag,itemContent);
		
		var itemTitle = $('<input>',{
			placeholder:labels[i],
			value:labels[i],
			type:'text',
			id:'title-'+i,
			class:'title'
		})
		
		var itemType = $('<select>',{ //* entererGoogle, entererText, bgimg, resize, line, point, count
			id:'type-'+i,
			class:'type'
		}).html('<option value="" selected> -- select an option -- </option>' +
			'<option value="bgimg">*Image Filename</option>' +
			'<option value="resize">*Resize Factor</option>' +
			'<option value="line">Type</option>' +
			'<option value="point">Certainty</option>' +
			'<option value="count">Diagensis</option>'
		)
		
		var itemDesc = $('<textarea>',{
			rows:5,
			columns:200,
			id:'desc-'+i,
			class:'description'
		})
		
		var itemDist = $('<input>',{ //* generate all other points, false, true (if line), point name (if point)
			type:'checkbox',
			id:'dist-'+i,
			class:'distance'
		}).css('display','none')
		
		var itemDistOpt = $('<select>',{
			id:'distOpt-'+i,
			class:'distOpt'
		}).html('<option value="false" selected> -- other endpoint -- </option>')
		.css('display','none')
		
		distOpts = distOpts + '<option id="OPT' + names[i] + '" style="display:none" value="'+ names[i] +'">' + labels[i] + '</option>';
		
		//* note to self: change name attr to .data()
		itemContent.append(itemTitle,itemType,itemDesc,itemDist,itemDistOpt)
		
	}
	
	$('.distOpt').append(distOpts)
	
	$('.title').each(function(){
		$('<label for="'+ this.id +'">Title:</label>').insertBefore(this);
	})
	
	$('.type').each(function(){
		$('<label for="'+ this.id +'">Type of data: (required)</label>').insertBefore(this);
	})
	
	$('.description').each(function(){
		$('<label for="'+ this.id +'">Description or instructions for this step:</label>').insertBefore(this);
	})
	
	$('.distance').each(function(){
		$('<label for="'+ this.id +'">Would you like a distance returned using this?</label>').insertBefore(this).hide();
	})
	
	$('.page, .about, .contact, .title, .type, .description, .distance, .distOpt').change(function(e){
		updateItem(this);
	});
	
	updateOutput($('#items'));
};

var updateItem = function(e){
	var whereTo = $(e).attr('class')
	var newVal = $(e).val()
	var parentItem = $(e).closest('.dd-item')
	var parentName = $(parentItem).data('name')
	var parentLabel = $(parentItem).data('label')
	if(whereTo == 'title'){
		if(newVal == ''){
			newVal = parentLabel
		}
	}
	if(whereTo == 'distance'){ //* if line, true; if point, false until endpoint given
		newVal = ($(parentItem).find('.type').val() == 'line') ? $(e).is(':checked').toString() : 'false'
		updateDists(parentItem,parentName)
	}
	if(whereTo == 'distOpt'){
		whereTo = 'distance'
	}
	if(whereTo == 'type'){
		updateDists(parentItem,parentName)
	}
	
	$(parentItem).data(whereTo,newVal)
	
	var parentTitle = $(parentItem).data('title')
	if($(parentItem).data('type') == 'line'){
		$('option[id="OPT' + parentName + '"]').val(parentName + ' a').text(parentTitle + ' START')
		$('option[id="OPT' + parentName + '"].clone').val(parentName + ' b').text(parentTitle + ' END')
	}else{
		$('option[id="OPT' + parentName + '"]').val(parentName).text(parentTitle)
	}
	
	if(!$(parentItem).find('.distance').is(':checked')){
		$(parentItem).find('.distOpt').prop('selectedIndex',0);
	}
	
	// happens while being dragged, not while being typed in:	
	// if hierarchically lower, only allow data type point
	// if has children, only allow data type line
	
	updateOutput($('.dd'));
}

var updateDists = function(parentItem,parentName){
	var parentTitle = $(parentItem).data('title')
	
	//* if going from line to point or if option is hidden, set distance to false (or true if line and checked)
	
	switch ($(parentItem).find('.type').val()){
		case 'point':
			$(parentItem).find('.distance').show()
			$('label[for="'+ $(parentItem).find('.distance').attr('id') +'"]').show();
			if($(parentItem).find('.distance').is(':checked')){
				$(parentItem).find('.distOpt').show()
			}else{
				$(parentItem).find('.distOpt').hide()
			}
			$('option[value="' + parentName + '"]').show()
			$(parentItem).find('option[id="OPT' + parentName + '"]').hide()
			//* remove clone
			$('option[id="OPT' + parentName + '"].clone').remove()
			break;
		case 'line':
			$(parentItem).find('.distance').show()
			$('label[for="'+ $(parentItem).find('.distance').attr('id') +'"]').show();
			$(parentItem).find('.distOpt').hide()
			$('option[id="OPT' + parentName + '"].clone').remove()
			$('option[id="OPT' + parentName + '"]').show().each(function(index,element){
				$(this).clone().addClass('clone').insertAfter(this)
			})
			$(parentItem).find('option[id="OPT' + parentName + '"]').hide()
			if($(parentItem).find('.distance').is(':checked')){
				$(parentItem).data('distance','true');
			}else{
				$(parentItem).data('distance','false');
			}
			break;
		default:
			$(parentItem).find('.distance').hide()
			$('label[for="'+ $(parentItem).find('.distance').attr('id') +'"]').hide();
			$(parentItem).find('.distOpt').hide()
			$('option[id="OPT' + parentName + '"]').hide()
			$('option[id="OPT' + parentName + '"].clone').remove()
			$(parentItem).data('distance','false')
			$(parentItem).find('.distance').prop('checked',false)
			//* make sure option is also replaced with default in output
			$('.dd-item').each(function(index,element){
				if($(this).find('.distOpt option[id="OPT' + parentName + '"]:selected').length){
					$(this).find('.distOpt').prop('selectedIndex',0);
					$(this).data('distance','false');
				}
			})
			break;
	}

}