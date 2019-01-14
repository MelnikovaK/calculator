class Calculator {

  constructor( config_data, calculator, extraActions ) {
    //
    this.actions_names = {}
    
  	//
  	this.operations_story = '';
    this.screen = $('.screen');

  	//
  	this.calculator = calculator;

  	//
    this.buttons = {};
    this.actions_by_key = {};

    //
  	if( config_data ) this.bindActions( config_data );
  	if ( calculator ) {
      this.createCalculatorInterface(config_data, calculator)
      this.initActionsNames(extraActions);
  		this.initMouseInput( calculator );
  		this.initKeyboardInput( calculator );
  	}
  }

  initActionsNames(extraActions) {
    this.actions_names['remove-last'] = this.removeLastSymbol.bind(this);
    this.actions_names['result'] = this.showResult.bind(this);
    this.actions_names['clear-input'] = this.clearInput.bind(this);
    this.actions_names['invert-sign'] = this.invertSign.bind(this);
    this.actions_names['square'] = this.square.bind(this);
    this.actions_names['reciprocal'] = this.reciprocal.bind(this);
    this.actions_names['devide'] = this.printOperationSymbol.bind(this);
    this.actions_names['multiply'] = this.printOperationSymbol.bind(this);
    this.actions_names['subtraction'] = this.printOperationSymbol.bind(this);
    this.actions_names['addition'] = this.printOperationSymbol.bind(this);
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

  addButton( button, container ){
    var $button = $('<button></button');
    container.append($button);
    $button.text(button.label);
    $button.css({
      'background': button.background,
      'width': '60px',
      'height': '60px'  
    });
    var button_options = {
        button: $button,
        action: button.action,
        value: button.value,
        key: button.key
      }
    this.buttons[button.label] = button_options
  }

  createCalculatorInterface(config_data, calculator) {
    calculator.append('<div class="screen"></div>');
    config_data.buttons.forEach(function(button) {
      this.addButton(button, calculator);
    }.bind(this));
  }

  printOperationSymbol() {
    var input_symbols = event.key || event.target.innerText;
    if ( input_symbols.match(/[a-z]/g) ) return;
    this.screen.text(this.screen.text() + ' ' + input_symbols + ' ');
  }

  printSymbol(){
    this.screen = $('.screen');
    var input_symbols = event.key || event.target.innerText;
    if ( input_symbols.match(/[a-z]/g) ) return;
    this.screen.text(this.screen.text() + input_symbols);
  }

  showResult(){
    var result_array = this.screen.text().split(' ');
    var result_string = '';
    for ( var i = 0; i < result_array.length; i += 3 ) {
      if (result_array[i+1] == '/') result_string += parseFloat(result_array[i]) / parseFloat(result_array [i+2]);
      if (result_array[i+1] == '*') result_string += parseFloat(result_array[i]) * parseFloat(result_array [i+2]);
      if (result_array[i+1] == '-') result_string += parseFloat(result_array[i]) - parseFloat(result_array [i+2]);
      if (result_array[i+1] == '+') result_string += parseFloat(result_array[i]) + parseFloat(result_array [i+2]);
    }
    if (result_array.length == 1) result_string = result_array[0];
    this.screen.text( result_string.toString() );

  }

  clearInput(){
    this.screen.text('');
  }

  invertSign(){
    this.showResult();
    this.screen.text((parseFloat(this.screen.text()) * (-1)).toString());
  }

  square(){
    this.showResult();
    this.screen.text((Math.sqrt( this.screen.text() )).toString());
  }

  reciprocal(){
  	this.showResult();
    this.screen.text((1 / parseFloat(this.screen.text())).toString());
  }


  removeLastSymbol(){
  	var all_input_array = this.screen.text().trim().split('');
		all_input_array.pop();
    this.screen.text(all_input_array.join('').trim());
  }

  setFloatPoint(){
    this.screen.text(this.screen.text() + '.');
  }

  initMouseInput( calculator ) {
    for (var button in this.buttons) {
      if ( this.buttons[button].action ) this.buttons[button].button.on('click', this.actions_names[this.buttons[button].action]);
      else this.buttons[button].button.on('click', this.printSymbol.bind(this));
    }
  }

  initKeyboardInput( calculator ) {
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
  	calculator.on('keydown', this.onKeyPress);
  }
}
    