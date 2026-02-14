/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  ("use strict");

  const select = {
    templateOf: {
      menuProduct: "#template-menu-product",
      cartProduct: '#template-cart-product',
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
        input: 'input.amount',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: "active",
      imageVisible: "active",
    },

    cart: {
      wrapperActive: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    },

    cart: {
      defaultDeliveryFee: 20,
    },
  };

  const templates = {
    menuProduct: Handlebars.compile(
      document.querySelector(select.templateOf.menuProduct).innerHTML
    ),
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
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
  /*  
  initAccordion(){
    const thisProduct = this;

    const clickableTrigger = thisProduct.dom.wrapper.querySelector(select.menuProduct.clickable);

    clickableTrigger.addEventListener('click', function(event) {

      event.preventDefault();

      const activeProduct = document.querySelector('.product.' + classNames.menuProduct.wrapperActive);
    

      
      if(activeProduct && activeProduct !== thisProduct.dom.wrapper){
      activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
      }

      thisProduct.dom.wrapper.classList.toggle(classNames.menuProduct.wrapperActive);

    });

  }*/
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

  /*
   initOrderForm(){
    const thisProduct = this;
    //console.log('Order:', thisProduct)

    thisProduct.dom.form.addEventListener('submit', function(event){
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

thisProduct.dom.cartButton.addEventListener('click', function(event){
  event.preventDefault();
  thisProduct.processOrder();
});
  }*/
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

   /* multiply price by amount */
  price *= thisProduct.amountWidget.value;

  // update calculated price in the HTML
  //console.log('Calculated price:', price);
  thisProduct.dom.priceElem.innerHTML = price;
  }

 
}

  class AmountWidget{
    constructor(element){
      const thisWidget = this;

      console.log('AmountWidget:', thisWidget);
      console.log('constructor arguments:', element)

      thisWidget.getElements(element);

       // ustawienie wartości startowej
  if(thisWidget.input.value) {             // sprawdzamy, czy input ma wartość
    thisWidget.setValue(thisWidget.input.value);
  } else {                                 // jeśli brak, używamy defaultValue
    thisWidget.setValue(settings.amountWidget.defaultValue);
  }
      /* setting the start value taking into account the default value 
      const initialValue = thisWidget.input.value ? thisWidget.input.value : settings.amountWidget.defaultValue;
      thisWidget.setValue(initialValue);*/
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

  class Cart{
    constructor(element){
      const thisCart = this;

      thisCart.products = [];

      thisCart.getElements(element);

      console.log('new Cart', thisCart);
    }

    getElements(element){
      const thisCart = this;

      thisCart.dom = {};

      thisCart.dom.wrapper = element;
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
      //console.log("settings:", settings);
      //console.log("templates:", templates);

      thisApp.initData();
      thisApp.initMenu();
    },
  };

  app.init();
}
