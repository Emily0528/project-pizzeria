import {templates} from '../settings.js';

/* global Flickity */

class Home {
  constructor(wrapper, onNavigate){
    const thisHome = this;
  //console.log('Home element:', thisHome);

    thisHome.dom = {};
    thisHome.dom.wrapper = wrapper;
    //thisHome.dom.wrapper = document.getElementById('tilesContainer');
    thisHome.onNavigate = onNavigate;
  }

  render() {
    const thisHome = this;

    console.log('Render Home');

    const tiles = [
      {
        type: 'half', 
        img: "assets/pizza-1.jpg",
        title: "Order online",
        quote: "Delicious food delivered to your door.",
        link: "order"
      },
      {
        type: 'half',
        img: "assets/pizza-2.jpg",
        title: "Book a table",
        quote: "Reserve your table now",
        link: "booking"
      },
      {
        type: 'full', 
        full: true,
        title: "Opening hours:",
        quote: "MON - SUN, 12PM - 11PM"
      }
      ];

    const reviews = [

    {
      img: "assets/pizza-1.jpg",
      title: "Great venue",
      quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      author: "John Smith"
    },

    {
      img: "assets/pizza-2.jpg",
      title: "Good snacks",
      quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      author: "Anna Kowalski"
    },

    {
      img: "assets/pizza-3.jpg",
      title: "Best srevice",
      quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      author: "Michael Lee"
    }

    ];

    const images = [
      'assets/pizza-4.jpg',
      'assets/pizza-5.jpg',
      'assets/pizza-6.jpg',
      'assets/pizza-7.jpg',
      'assets/pizza-8.jpg',
      'assets/pizza-9.jpg'
    ];


    const generatedHTML = templates.homePage({

      tiles: tiles,
      reviews,
      images: images

    });

    //const generatedHTML = templates.homePage({ tiles });
    thisHome.dom.wrapper.innerHTML = generatedHTML;

    thisHome.initCarousel();

    thisHome.dom.wrapper.querySelectorAll('.home-tile').forEach((tile, index) => {
      const tileData = tiles[index];
      if (tileData.link && typeof thisHome.onNavigate === 'function') {
        tile.style.cursor = 'pointer';
        //tile.addEventListener('click', () => thisHome.onNavigate(tileData.link));
        tile.addEventListener('click', () => {
        //console.log('Kliknięto kafelek, pageId =', tileData.link);
        thisHome.onNavigate(tileData.link);
        });
      }
    });
  }

  initCarousel() {

  const elem = document.querySelector('.carousel');

  new Flickity(elem, {

    cellAlign: 'left',
    contain: true,
    wrapAround: true,
    autoPlay: 3000,
    pageDots: true,
    prevNextButtons: false

  });

}

  setActiveNav(id) {
    document.querySelectorAll('.main-nav a').forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
    });
  }
}

export default Home;