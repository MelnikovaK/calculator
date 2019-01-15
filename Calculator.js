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
    this.input_symbols = ['0'];

  	//
  	this.$container = $container;

  	//
    this.buttons = {};
    this.actions_by_key = {};

    //
  	if( config_data ) this.bindActions( config_data );

    this.initActionsNames(extraActions);

    this.createCalculatorInterface(config_data, $container);
    this.bindScreenActions();
    
		this.initKeyboardInput( $container );

  	
  }

  initActionsNames(extraActions) {

    this.actions_names = {
      'remove-last' : this.removeLastSymbol.bind(this),
      'result': this.showResult.bind(this),
      'clear-input': this.clearInput.bind(this),
      'invert-sign': this.invertSign.bind(this),
      'set-float-point': this.setFloatPoint.bind(this),
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
  addButton( button, button_width, button_height, $container ){
    if ( button.width ) button_width *= button.width;
    if ( button.height ) button_height *= button.height;
    var $button = $('<button class="calculator_button"></button')
      .appendTo( $container )
      .text(button.label)
      .css({
        'background': button.background,
        'width': button_width + 'px',
        'height': button_height + 'px',
      })
      .click( function(e){
        if( button.action ) {
          if( this.actions_names[ button.action ] ) this.actions_names[ button.action ](e);
        } else this.printSymbol(e);
      }.bind(this))
    ;
    // $button.offset({top:5,left:5})

  }

  createCalculatorInterface(config_data, $container) {
    var button_width = parseInt($container.css( "width" ).slice(0, -2)) / config_data.columns;
    this.$screen = $('<div class="screen"></div>').appendTo( $container );
    this.$screen.text('0');
    config_data.buttons.forEach(function(button) {
      this.addButton(button, button_width, config_data.column_height, $container);
    }.bind(this));

  }

  bindScreenActions() {
    var buffer = '';
    $(window).bind( {
      copy : function(){
        buffer = this.$screen.text();
      }.bind(this),
      paste : function(){
        this.$screen.text(buffer);
      }.bind(this),
      cut : function(){
        buffer = this.$screen.text();
        this.$screen.text('0');
      }.bind(this),
    });
  }
  // <<< INTERFACE <<<



  // >>> ACTIONS >>>
  printOperationSymbol() {
    var last_index = this.input_symbols.length - 1;
    var input_symbol = event.key || event.target.innerText;

    if ( !this.input_symbols[last_index].match(/\d+/g) ) this.input_symbols.pop();
    this.input_symbols.push(input_symbol);

    this.$screen.text(this.input_symbols.join(''));
  }

  printSymbol(event){
    var input_symbol = event.key || event.target.innerText;
    var last_index = this.input_symbols.length - 1;

    if ( !input_symbol ) return;
    if ( isNaN(parseInt(input_symbol)) ) return;

    if ( this.input_symbols[last_index].match(/\d/g) ) {
      var last_element = this.input_symbols.pop();
      if ( this.input_symbols.length == 0 && last_element == '0') this.input_symbols.push( input_symbol );
      else this.input_symbols.push( last_element + input_symbol);
    } else this.input_symbols.push(input_symbol);

    this.$screen.text(this.input_symbols.join(''));
    this.checkInputLength();
  }

  showResult(){

    var result = parseFloat(this.input_symbols[0]);
    var last_index = this.input_symbols.length - 1;

    if (this.input_symbols[last_index].match(/\d/g)){

      for ( var i = 1; i < this.input_symbols.length - 1; i += 2 ) {
        var second_operand = this.input_symbols[i+1];
        var operation = this.input_symbols[i];

        if (operation == '/') result = result / parseFloat(second_operand);
        if (operation == '*') result = result * parseFloat(second_operand);
        if (operation == '-') result = result - parseFloat(second_operand);
        if (operation == '+') result = result + parseFloat(second_operand);
      }

      this.input_symbols = [result.toString()];
      this.$screen.text( this.input_symbols.join('') );
    }

  }

  clearInput(){
    this.input_symbols = ['0'];
    this.$screen.text(this.input_symbols.join(''));
    this.checkInputLength();
  }

  invertSign(){
    if (this.checkInput()) return;

    var transform_value = this.input_symbols.pop();
    this.input_symbols.push((parseFloat(transform_value) * (-1)).toString());
    this.$screen.text(this.input_symbols.join(''));
  }

  square(){
    if (this.checkInput()) return;

    var transform_value = parseFloat(this.input_symbols.pop());
    if ( transform_value < 0 ) return;
    this.input_symbols.push(Math.sqrt( transform_value ).toString());
    this.$screen.text(this.input_symbols.join(''));
    this.checkInputLength();
  }

  reciprocal(){
    if (this.checkInput()) return;
    
    var transform_value = this.input_symbols.pop();
    this.input_symbols.push((1 / parseFloat(transform_value)).toString());
    this.$screen.text(this.input_symbols.join(''));
    this.checkInputLength();
  }

  removeLastSymbol(){
    var transform_element = this.input_symbols.pop();

    if (transform_element.length > 1) this.input_symbols.push(transform_element.slice(0, -1));
    else this.clearInput();
    this.$screen.text(this.input_symbols.join(''));
    this.checkInputLength();
  }

  setFloatPoint(){
    if (this.checkInput()) return;

    var last_element = this.input_symbols.pop();
    this.input_symbols.push( last_element + '.');

    this.$screen.text(this.input_symbols.join(''));
  }

  checkInput() {
    var last_index = this.input_symbols.length - 1;
    if ( !this.input_symbols[last_index].match(/\d+/g) ) return true;
    else return false;
  }

  checkInputLength() {
    this.$screen.toggleClass('small_font_size', this.$screen.text().length > 10);
  }

  // <<< ACTIONS <<<








  // >>> INPUT >>>

  initKeyboardInput( $container ) {

    /*
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
    */
    var scope = this;

    $container.on('keydown', function(event){
      event.preventDefault(); 
      var key = event.key;
      var action = scope.actions_by_key[key];
      if ( action ) {
        scope.actions_names[ action.action ]();
      } else {
        scope.printSymbol(event);
      }
    });

  }
  // <<< INPUT <<<

}
    