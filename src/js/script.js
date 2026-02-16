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

    db: {
      url: '//localhost:3131',
      products: 'products',
      orders: 'orders',
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

      const productSummary = thisProduct.prepareCartProduct();

      app.cart.add(productSummary);
      //app.cart.add(thisProduct);
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

  class Cart{
    constructor(element){
      const thisCart = this;

      thisCart.products = [];

      thisCart.getElements(element);

      thisCart.initActions();

      //console.log('new Cart', thisCart);
    }

    getElements(element){
      const thisCart = this;

      thisCart.dom = {};

      thisCart.dom.wrapper = element;

      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(
        select.cart.toggleTrigger
      );

      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(
        select.cart.productList
      );

      thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(
        select.cart.deliveryFee
      );

      thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(
        select.cart.subtotalPrice
      );

      thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(
        select.cart.totalPrice
      );

      thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(
        select.cart.totalNumber
      );
    }

    initActions(){
      const thisCart = this;

      thisCart.dom.toggleTrigger.addEventListener('click', function(event){

        event.preventDefault();

        thisCart.dom.wrapper.classList.toggle(
          classNames.cart.wrapperActive
        );

      });

      thisCart.dom.productList.addEventListener('updated', function(){
        thisCart.update();
      });

      thisCart.dom.productList.addEventListener('remove', function(event){
        thisCart.remove(event.detail.cartProduct);
      });
    }

    update(){
      const thisCart = this;

      /* delivery fee from settings */
      const deliveryFee = settings.cart.defaultDeliveryFee;

      let totalNumber = 0;
      let subtotalPrice = 0;

      /* loop through products */
      for(let product of thisCart.products){
        totalNumber += product.amount;
        subtotalPrice += product.price;
      }

      /* calculate total price */
      if(totalNumber > 0){
        thisCart.totalPrice = subtotalPrice + deliveryFee;
      } else {
        thisCart.totalPrice = 0;
      }

      thisCart.dom.totalNumber.innerHTML = totalNumber;

      thisCart.dom.subtotalPrice.innerHTML = subtotalPrice;

      /* delivery fee = 0 when cart empty */
      if(totalNumber > 0){
        thisCart.dom.deliveryFee.innerHTML = deliveryFee;
      } else {
        thisCart.dom.deliveryFee.innerHTML = 0;
      }

      /* update total price (2 elements) */
      for(let elem of thisCart.dom.totalPrice){
        elem.innerHTML = thisCart.totalPrice;
      }

      //console.log('deliveryFee:', deliveryFee);
      //console.log('totalNumber:', totalNumber);
      //console.log('subtotalPrice:', subtotalPrice);
      //console.log('totalPrice:', thisCart.totalPrice);
    }

    remove(cartProduct){
      const thisCart = this;

      const index = thisCart.products.indexOf(cartProduct);
      if(index !== -1){
        thisCart.products.splice(index, 1);
      }

      cartProduct.dom.wrapper.remove();

      thisCart.update();
    }

    add(menuProduct){
      const thisCart = this;

      /* generate HTML based on template */
      const generatedHTML = templates.cartProduct(menuProduct);

      /* replace HTML with DOM element */
      const generatedDOM = utils.createDOMFromHTML(generatedHTML);

      /* add an item to the product list in your cart */
      thisCart.dom.productList.appendChild(generatedDOM);

      //console.log('adding product', menuProduct);

      const cartProduct = new CartProduct(menuProduct, generatedDOM);
        thisCart.products.push(cartProduct);
  
      console.log('thisCart.products', thisCart.products);

      thisCart.update();
    }

  }

  class CartProduct{
    constructor(menuProduct, element){
      const thisCartProduct = this;

      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.params = menuProduct.params;

      thisCartProduct.getElements(element);

      thisCartProduct.initAmountWidget();

      thisCartProduct.initActions();

      //console.log('thisCartProduct:', thisCartProduct);
    }

    getElements(element) {
      const thisCartProduct = this;

      thisCartProduct.dom = {};

      thisCartProduct.dom.wrapper = element;

      thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
      thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);
    }

    initAmountWidget() {
      const thisCartProduct = this;

      /* create new instance of AmountWidget */
      thisCartProduct.amountWidget = new AmountWidget(
        thisCartProduct.dom.amountWidget
      );

      /* add event listener */
      thisCartProduct.dom.amountWidget.addEventListener('updated', function() {

        /* update amount */
        thisCartProduct.amount = thisCartProduct.amountWidget.value;

        /* update price */
         thisCartProduct.price =
        thisCartProduct.priceSingle * thisCartProduct.amount;

        /* update price in DOM */
        thisCartProduct.dom.price.innerHTML = thisCartProduct.price;

      });
    }

    remove(){
      const thisCartProduct = this;

      const event = new CustomEvent('remove', {
        bubbles: true,
        detail: {
          cartProduct: thisCartProduct,
        },
      });

      console.log('remove called for:', thisCartProduct);
      thisCartProduct.dom.wrapper.dispatchEvent(event);
    }

    initActions(){
      const thisCartProduct = this;

      thisCartProduct.dom.edit.addEventListener('click', function(event) {
        event.preventDefault();
        console.log('Edit button clicked');
      });

      thisCartProduct.dom.remove.addEventListener('click', function(event) {
        event.preventDefault();
        console.log('Remove button clicked'); 
        thisCartProduct.remove(); 
      });

    }

  }

  const app = {
    initMenu: function () {
      const thisApp = this;

      //console.log("thisApp.data:", thisApp.data);
      for (let productData in thisApp.data.products) {
        new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
      }
    },

    initData: function () {
      const thisApp = this;

      thisApp.data = {};

      const url = settings.db.url + '/' + settings.db.products;

      fetch(url)
        .then(function(rawResponse){
          return rawResponse.json();
        })
        .then(function(parsedResponse){
          console.log('parsedResponse:', parsedResponse);

          /* save parsedResponse as thisApp.data.products */
          thisApp.data.products = parsedResponse;

          /* execute initMenu method */
          thisApp.initMenu();

        });

      console.log('thisApp.data', JSON.stringify(thisApp.data));
    },

    initCart: function(){
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },

    init: function () {
      const thisApp = this;
      //console.log("*** App starting ***");
      //console.log("thisApp:", thisApp);
      //console.log("classNames:", classNames);
      //console.log("settings:", settings);
      //console.log("templates:", templates);

      thisApp.initData();
      thisApp.initCart();
    },
  };

  app.init();
}
