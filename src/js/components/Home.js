//import {templates} from '../settings.js';

class Home {
  constructor() {
    const thisHome = this;
    //this.homeContainer = document.querySelector(select.containerOf.homePage);
    console.log('Home element:', thisHome);
  }

render() {
  const thisHome = this;

  thisHome.dom = {};

  //const generatedHTML = templates.homePage();

}

  setActiveNav(id) {
    document.querySelectorAll('.main-nav a').forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
    });
  }
}

export default Home;