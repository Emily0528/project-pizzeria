import { settings, select, classNames, templates } from '../settings.js';
import utils from '../utils.js';
import CartProduct from './CartProduct.js';

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

      thisCart.dom.form = thisCart.dom.wrapper.querySelector(
        select.cart.form
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

      thisCart.dom.form.addEventListener('submit', function(event){

        event.preventDefault();

        thisCart.sendOrder();

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

    sendOrder() {
      const thisCart = this;

      const url = settings.db.url + '/' + settings.db.orders;

      console.log('Sending order to:', url);

      const payload = {
        address: thisCart.dom.form.querySelector(select.cart.address).value,
        phone: thisCart.dom.form.querySelector(select.cart.phone).value,
        totalPrice: thisCart.totalPrice,
        subtotalPrice: thisCart.totalPrice - settings.cart.defaultDeliveryFee,
        totalNumber: parseInt(thisCart.dom.totalNumber.innerHTML),
        deliveryFee: settings.cart.defaultDeliveryFee,
        products: []
      };

      console.log('payload:', payload);

      payload.products = [];

      for (let prod of thisCart.products) {
        payload.products.push(prod.getData());
      }

      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      };

      fetch(url, options);
    }

  }

  export default Cart;