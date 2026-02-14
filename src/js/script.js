/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  ("use strict");

  const select = {
    templateOf: {
      menuProduct: "#template-menu-product",
    },
    containerOf: {
      menu: "#product-list",
      cart: "#cart",
    },
    all: {
      menuProducts: "#product-list > .product",
      menuProductsActive: "#product-list > .product.active",
      formInputs: "input, select",
    },
    menuProduct: {
      clickable: ".product__header",
      form: ".product__order",
      priceElem: ".product__total-price .price",
      imageWrapper: ".product__images",
      amountWidget: ".widget-amount",
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: "active",
      imageVisible: "active",
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 0,
      defaultMax: 10,
    },
  };

  const templates = {
    menuProduct: Handlebars.compile(
      document.querySelector(select.templateOf.menuProduct).innerHTML
    ),
  };

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

      /* create element using utils.createElementFromHTML */
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);

      /* find menu container */
      const menuContainer = document.querySelector(select.containerOf.menu);

      /* add element to menu */
      menuContainer.appendChild(thisProduct.element);
    }

    getElements(){
      const thisProduct = this;

      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);

      //console.log('accordionTrigger:', thisProduct.accordionTrigger);
      //console.log('form:', thisProduct.form);
      //console.log('formInputs:', thisProduct.formInputs);
      //console.log('cartButton:', thisProduct.cartButton);
      //console.log('priceElem:', thisProduct.priceElem);
    }

  initAccordion(){
    const thisProduct = this;

    /* find the clickable trigger (the element that should react to clicking) */
    const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);

    /* START: add event listener to clickable trigger on event click */
    clickableTrigger.addEventListener('click', function(event) {
      /* prevent default action for event */
      event.preventDefault();

      /* find active product (product that has active class) */
      const activeProduct = document.querySelector('.product.' + classNames.menuProduct.wrapperActive);
    
      //console.log('activeProduct:', activeProduct);

      /* if there is active product and it's not thisProduct.element, remove class active from it */
      if(activeProduct && activeProduct !== thisProduct.element){
      activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
      }

      /* toggle active class on thisProduct.element */
      thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);

      
      //console.log('--- CLICK ---');
      //console.log('Kliknięty produkt:', thisProduct.element);
      //console.log('Aktywny produkt:', activeProduct);
      //console.log('Czy to ten sam?', activeProduct === thisProduct.element);
    });

  }

   initOrderForm(){
    const thisProduct = this;
    //console.log('Order:', thisProduct)

    thisProduct.form.addEventListener('submit', function(event){
    event.preventDefault();
    //console.log('Form submitted!');
    thisProduct.processOrder();
    });

    for(let input of thisProduct.formInputs){
       input.addEventListener('change', function(){
        //console.log('Input changed:', input.value);
        thisProduct.processOrder();
  });
}

thisProduct.cartButton.addEventListener('click', function(event){
  event.preventDefault();
  thisProduct.processOrder();
});
  }

  initAmountWidget(){
      const thisProduct = this;

      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
      //console.log('thisProduct:', thisProduct);

      /* listening for the 'updated' event emitted from the widget */
      thisProduct.amountWidgetElem.addEventListener('updated', function() {
        thisProduct.processOrder(); // wywołanie metody przeliczającej produkt
      });
    }

  processOrder(){
    const thisProduct = this;
    //console.log('OrderForm:', thisProduct);

    // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
    const formData = utils.serializeFormToObject(thisProduct.form);
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
      const optionImage = thisProduct.element.querySelector(
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

   /* multiply price by amount */
  price *= thisProduct.amountWidget.value;

  // update calculated price in the HTML
  //console.log('Calculated price:', price);
  thisProduct.priceElem.innerHTML = price;
  }

 
}

  //nowa klasa
  class AmountWidget{
    constructor(element){
      const thisWidget = this;

      console.log('AmountWidget:', thisWidget);
      console.log('constructor arguments:', element)

      thisWidget.getElements(element);
      thisWidget.setValue(thisWidget.input.value);
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
            thisWidget.input.value = thisWidget.value;
            thisWidget.announce();
        }
      }

    announce(){
      const thisWidget = this;

      const event = new Event('updated');
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

  const app = {
    initMenu: function () {
      const thisApp = this;

      //console.log("thisApp.data:", thisApp.data);
      for (let productData in thisApp.data.products) {
        new Product(productData, thisApp.data.products[productData]);
      }
    },

    initData: function () {
      const thisApp = this;

      thisApp.data = dataSource;
    },

    init: function () {
      const thisApp = this;
      //console.log("*** App starting ***");
      //console.log("thisApp:", thisApp);
      //console.log("classNames:", classNames);
      console.log("settings:", settings);
      //console.log("templates:", templates);

      thisApp.initData();
      thisApp.initMenu();
    },
  };

  app.init();
}
