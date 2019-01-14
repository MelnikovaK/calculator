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





//
class Calculator {

  constructor( config_data, $container, extraActions ) {
    
    if( !$container.length ) return;

    //
    this.actions_names = {}
    
  	//
  	this.operations_story = '';

  	//
  	this.$container = $container;

  	//
    this.buttons = {};
    this.actions_by_key = {};

    //
  	if( config_data ) this.bindActions( config_data );

    this.initActionsNames(extraActions);

    this.createCalculatorInterface(config_data, $container);
    // this.$screen = $('.screen', $container );
    // this.$screen = $container.find('.screen');    

		// this.initMouseInput( $container );
		this.initKeyboardInput( $container );
  	
  }

  initActionsNames(extraActions) {

    this.actions_names = {
      'remove-last' : this.removeLastSymbol.bind(this),
      'result': this.showResult.bind(this),
      'clear-input': this.clearInput.bind(this),
      'invert-sign': this.invertSign.bind(this),
      'square': this.square.bind(this),
      'reciprocal': this.reciprocal.bind(this),
      'devide': this.printOperationSymbol.bind(this),
      'multiply': this.printOperationSymbol.bind(this),
      'subtraction': this.printOperationSymbol.bind(this),
      'addition': this.printOperationSymbol.bind(this),
    };

    if ( extraActions ) {
      for ( var action_name in extraActions ) {
        this.actions_names[action_name] = extraActions[action_name];
      }
    }

  }

  bindActions( actions_to_bind ) {
  	actions_to_bind.buttons.forEach(function(button) {
  		if ( button.action ) {
	  		var action = {
	  			action: button.action,
	  		}
        this.actions_by_key[button.key] = action;
  		}
  	}.bind(this));
  }





  // >>> INTERFACE >>>
  addButton( button, $container ){

    var $button = $('<button></button')
      .appendTo( $container )
      .text(button.label)
      .css({
        'background': button.background,
        'width': '60px',
        'height': '60px'  
      })
      .click( function(e){
        if( button.action ) {
          if( this.actions_names[ button.action ] ) this.actions_names[ button.action ](e);
        }else this.printSymbol(e);
      }.bind(this))
    ;

  }

  createCalculatorInterface(config_data, $container) {
    
    this.$screen = $('<div class="screen"></div>').appendTo( $container );

    config_data.buttons.forEach(function(button) {
      this.addButton(button, $container);
    }.bind(this));

  }
  // <<< INTERFACE <<<



  // >>> ACTIONS >>>
  printOperationSymbol() {
    var input_symbols = event.key || event.target.innerText;
    if ( input_symbols.match(/[a-z]/g) ) return;
    this.$screen.text(this.$screen.text() + ' ' + input_symbols + ' ');
  }

  printSymbol(){

    var input_symbols = event.key || event.target.innerText;
    if ( input_symbols.match(/[a-z]/g) ) return;
    this.$screen.text(this.$screen.text() + input_symbols);
  }

  showResult(){
    var result_array = this.$screen.text().split(' ');
    var result_string = '';
    for ( var i = 0; i < result_array.length; i += 3 ) {
      if (result_array[i+1] == '/') result_string += parseFloat(result_array[i]) / parseFloat(result_array [i+2]);
      if (result_array[i+1] == '*') result_string += parseFloat(result_array[i]) * parseFloat(result_array [i+2]);
      if (result_array[i+1] == '-') result_string += parseFloat(result_array[i]) - parseFloat(result_array [i+2]);
      if (result_array[i+1] == '+') result_string += parseFloat(result_array[i]) + parseFloat(result_array [i+2]);
    }
    if (result_array.length == 1) result_string = result_array[0];
    this.$screen.text( result_string.toString() );

  }

  clearInput(){
    this.$screen.text('');
  }

  invertSign(){
    this.showResult();
    this.$screen.text((parseFloat(this.$screen.text()) * (-1)).toString());
  }

  square(){
    this.showResult();
    this.$screen.text((Math.sqrt( this.$screen.text() )).toString());
  }

  reciprocal(){
  	this.showResult();
    this.$screen.text((1 / parseFloat(this.$screen.text())).toString());
  }


  removeLastSymbol(){
  	var all_input_array = this.$screen.text().trim().split('');
		all_input_array.pop();
    this.$screen.text(all_input_array.join('').trim());
  }

  setFloatPoint(){
    this.$screen.text(this.$screen.text() + '.');
  }

  // <<< ACTIONS <<<








  // >>> INPUT >>>

  initKeyboardInput( $container ) {
  	if( !this.onKeyPress ){
		  this.onKeyPress = function(event){
		  	var key = event.key;
        if (this.actions_by_key[key]) {
          this.actions_names[this.actions_by_key[key].action]();
        } else {
          this.printSymbol();
        }
		  }.bind(this);
		}
  	$container.on('keydown', this.onKeyPress);
  }
  // <<< INPUT <<<

}
    