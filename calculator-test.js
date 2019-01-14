$(function() {

	var $element = $(".calculator");
	if(!$element.length) return;

	var config;
	$.getJSON("config.json", function(data) {
		config = data;
		
		var extraActions = {'current-year': function (){ return new Date().getFullYear();}}

		let calculator = new Calculator( config, $element, extraActions );
	});

})