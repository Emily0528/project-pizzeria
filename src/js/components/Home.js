import {templates} from '../settings.js';

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

    const generatedHTML = templates.homePage({ tiles });
    thisHome.dom.wrapper.innerHTML = generatedHTML;

    thisHome.dom.wrapper.querySelectorAll('.home-tile').forEach((tile, index) => {
      const tileData = tiles[index];
      if (tileData.link && typeof thisHome.onNavigate === 'function') {
        tile.style.cursor = 'pointer';
        //tile.addEventListener('click', () => thisHome.onNavigate(tileData.link));
        tile.addEventListener('click', () => {
  console.log('Kliknięto kafelek, pageId =', tileData.link);
  thisHome.onNavigate(tileData.link);
});
      }
    });
  }

  setActiveNav(id) {
    document.querySelectorAll('.main-nav a').forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
    });
  }
}

export default Home;