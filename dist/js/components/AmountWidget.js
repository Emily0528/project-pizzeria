import { select, settings} from './settings.js';

class AmountWidget{
    constructor(element){
      const thisWidget = this;

      //console.log('AmountWidget:', thisWidget);
      //console.log('constructor arguments:', element)

      thisWidget.getElements(element);

      /* setting the start value */
      if(thisWidget.input.value) {            
         thisWidget.setValue(thisWidget.input.value);
      } else {                                 
        thisWidget.setValue(settings.amountWidget.defaultValue);
      }

      //thisWidget.setValue(thisWidget.input.value);

      thisWidget.initActions();
    }

    getElements(element){
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }
    
    setValue(value) {
        const thisWidget = this;

        const newValue = parseInt(value);

        
        if(thisWidget.value !== newValue && !isNaN(newValue) &&
          newValue >= settings.amountWidget.defaultMin &&
          newValue <= settings.amountWidget.defaultMax) {
            thisWidget.value = newValue;
            thisWidget.announce();
        }

        thisWidget.input.value = thisWidget.value;
      }

    announce(){
      const thisWidget = this;

      //const event = new Event('updated');
      const event = new CustomEvent('updated', {
        bubbles: true
      });

      thisWidget.element.dispatchEvent(event);
    }

    initActions(){
      const thisWidget = this;
  

      if(thisWidget.input){
        thisWidget.input.addEventListener('change', function() {
          thisWidget.setValue(thisWidget.input.value);
         });
      }

      if(thisWidget.linkDecrease){
        thisWidget.linkDecrease.addEventListener('click', function(event) {
          event.preventDefault();
          thisWidget.setValue(thisWidget.value - 1);
        });
      }

      if(thisWidget.linkIncrease){
        thisWidget.linkIncrease.addEventListener('click', function(event) {
          event.preventDefault();
          thisWidget.setValue(thisWidget.value + 1);
        });
      }
    }
  }

  export default AmountWidget;