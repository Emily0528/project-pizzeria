import {select, classNames, templates} from './settings.js';
import utils from './utils.js';
import AmountWidget from './components/AmountWidget.js';
import app from './app.js';

class Product {
    constructor(id, data) {
      const thisProduct = this;

      thisProduct.id = id;
      thisProduct.data = data;

      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();

      //console.log("new Product:", thisProduct);
    }

    renderInMenu() {
      const thisProduct = this;

      /* generate HTML based on template */
      const generatedHTML = templates.menuProduct(thisProduct.data);

      thisProduct.dom = {};

      /* create element using utils.createElementFromHTML */
      thisProduct.dom.wrapper = utils.createDOMFromHTML(generatedHTML);

      /* find menu container */
      const menuContainer = document.querySelector(select.containerOf.menu);

      /* add element to menu */
      menuContainer.appendChild(thisProduct.dom.wrapper);
    }

    getElements(){
      const thisProduct = this;

      thisProduct.dom.accordionTrigger = thisProduct.dom.wrapper.querySelector(select.menuProduct.clickable);
      thisProduct.dom.form = thisProduct.dom.wrapper.querySelector(select.menuProduct.form);
      thisProduct.dom.formInputs = thisProduct.dom.form.querySelectorAll(select.all.formInputs);
      thisProduct.dom.cartButton = thisProduct.dom.wrapper.querySelector(select.menuProduct.cartButton);
      thisProduct.dom.priceElem = thisProduct.dom.wrapper.querySelector(select.menuProduct.priceElem);
      thisProduct.dom.imageWrapper = thisProduct.dom.wrapper.querySelector(select.menuProduct.imageWrapper);
      thisProduct.dom.amountWidgetElem = thisProduct.dom.wrapper.querySelector(select.menuProduct.amountWidget);

      //console.log('accordionTrigger:', thisProduct.dom.accordionTrigger);
      //console.log('form:', thisProduct.dom.form);
      //console.log('formInputs:', thisProduct.dom.formInputs);
      //console.log('cartButton:', thisProduct.dom.cartButton);
      //console.log('priceElem:', thisProduct.dom.priceElem);
    }
  
    initAccordion(){
      const thisProduct = this;

      thisProduct.dom.accordionTrigger.addEventListener('click', function(event) {

        event.preventDefault();

        const activeProduct = document.querySelector(
        '.product.' + classNames.menuProduct.wrapperActive
      );

      if(activeProduct && activeProduct !== thisProduct.dom.wrapper){
        activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
      }

      thisProduct.dom.wrapper.classList.toggle(
        classNames.menuProduct.wrapperActive
      );
      });
    }

    initOrderForm(){
      const thisProduct = this;

      thisProduct.dom.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });

      for(let input of thisProduct.dom.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }

      thisProduct.dom.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });
    }

    initAmountWidget(){
      const thisProduct = this;

      thisProduct.amountWidget = new AmountWidget(thisProduct.dom.amountWidgetElem);
      //console.log('thisProduct:', thisProduct);

      /* listening for the 'updated' event emitted from the widget */
      thisProduct.dom.amountWidgetElem.addEventListener('updated', function() {
        thisProduct.processOrder(); // wywołanie metody przeliczającej produkt
      });
    }

    processOrder(){
      const thisProduct = this;
      //console.log('OrderForm:', thisProduct);

      // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.dom.form);
      //console.log('formData', formData);

      // set price to default price
      let price = thisProduct.data.price;

      // for every category (param)...
      for(let paramId in thisProduct.data.params) {
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];
        //console.log(paramId, param);

        // for every option in this category
        for(let optionId in param.options) {
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];
          //console.log(optionId, option);

          // We check whether the option is selected in formData
          const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
          //console.log('Option selected?', optionSelected);

          // If the option is selected and is not default - we add the option price
          if(optionSelected && !option.default) {
            //console.log('Adding option price:', option.price);
            price += option.price;
          }
          // If the option is not selected and is default - we subtract the option price
          else if(!optionSelected && option.default) {
           //console.log('Subtracting option price:', option.price);
            price -= option.price;
          }

          // find matching image
          const optionImage = thisProduct.dom.wrapper.querySelector(
          '.' + paramId + '-' + optionId
          );

          // check if image exists
          if(optionImage){

          // show or hide image
          if(optionSelected){
          optionImage.classList.add(classNames.menuProduct.imageVisible);
          //console.log('Image shown for:', paramId + '-' + optionId);
          } else {
          optionImage.classList.remove(classNames.menuProduct.imageVisible);
          //console.log('Image hidden for:', paramId + '-' + optionId);
          } 
          }

        }
      }

      thisProduct.priceSingle = price;

      /* multiply price by amount */
      price *= thisProduct.amountWidget.value;

      // update calculated price in the HTML
      //console.log('Calculated price:', price);
      thisProduct.dom.priceElem.innerHTML = price;
    }

    addToCart(){
      const thisProduct = this;
        /*
      const productSummary = thisProduct.prepareCartProduct();

      app.cart.add(productSummary);
      //app.cart.add(thisProduct);

      const event = new CustomEvent('add-to-cart', {
        bubbles: true,
        detail: {
            product: thisProduct,
        }
      });

      thisProduct.getElements.dispatchEvent(event);*/
       //  app.cart.add(thisProduct.prepareCartProduct());
   const event = new CustomEvent('add-to-cart', {
     bubbles: true,
     detail: {
       product: thisProduct.prepareCartProduct(),
     },
   }
   );
   thisProduct.element.dispatchEvent(event);
    }
 
    prepareCartProduct(){
      const thisProduct = this;

      const productSummary = {};

      productSummary.id = thisProduct.id;

      productSummary.name = thisProduct.data.name;

      productSummary.amount = thisProduct.amountWidget.value;

      productSummary.priceSingle = thisProduct.priceSingle;

      productSummary.price = productSummary.priceSingle * productSummary.amount;

      //productSummary.params = {};
      productSummary.params = thisProduct.prepareCartProductParams();


      return productSummary;
    }

    prepareCartProductParams(){
      const thisProduct = this;

      const paramsSummary = {};

      /* traversal of all categories (params) in thisProduct.data.params */
      for(let paramId in thisProduct.data.params){
        const param = thisProduct.data.params[paramId];

        /* new object for the category */
        paramsSummary[paramId] = {
          label: param.label, 
          options: {}
        };

        /* navigate through all options in this category */
        for(let optionId in param.options){
          const option = param.options[optionId];

          const optionElem = thisProduct.dom.form.querySelector(`[name="${paramId}"][value="${optionId}"]`);

          const optionSelected = optionElem && (optionElem.checked || optionElem.selected);
                   
          /* if checked, we add it to the options object s*/
          if(optionSelected){
            paramsSummary[paramId].options[optionId] = option.label;
          }
        }
      }

      return paramsSummary;
    }

  }

  export default Product;