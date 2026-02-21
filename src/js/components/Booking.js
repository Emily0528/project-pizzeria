import { select, templates } from '../settings.js';
import AmountWidget from './AmountWidget.js';

class Booking {
    constructor(element) {
    const thisBooking = this;

    thisBooking.render(element);
    thisBooking.initWidgets();
  }

  render(element) {
    const thisBooking = this;

    /* generate HTML based on template */
    const generatedHTML = templates.bookingWidget();

    /* create DOM object */
    thisBooking.dom = {};

    /* save reference to wrapper */
    thisBooking.dom.wrapper = element;

    /* insert HTML into wrapper */
    thisBooking.dom.wrapper.innerHTML = generatedHTML;

    /* booking inputs */
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
  }

  initWidgets() {
    const thisBooking = this;

    /* People amount */
    thisBooking.peopleAmountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
     thisBooking.dom.peopleAmount.addEventListener('updated', function(){

    });

    /* Hours amount - nie działa */
    thisBooking.hoursAmountWidget = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.dom.hoursAmount.addEventListener('updated', function(){
    });

  }

}

export default Booking;