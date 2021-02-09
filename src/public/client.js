const store = Immutable.Map({
    apod: '',
    rovers: ['Curiosity', 'Opportunity', 'Spirit'],
    selected: '',
    images: '',
    rover: ''   
});

let slideIndex = 1;

// add our markup to the page
const root = document.getElementById('root');

//update store
const updateStore = (store, newState) => {
    store = store.merge(newState);
    render(root, store);
};

//render the page
const render = async(root, state) => {   
    root.innerHTML = App(state);
    showRoverInformation(state.get('rover'));   
    addClickListener(); 
    if(state.get('images')!= '') {
        showDivs(slideIndex);
    }
    
    
     
};

// create App content
const App = (state) => {
       
    if(state.get('selected') != '') { 
        return `
        <header>${createHeader(state.get('rovers'))}</header>
        <main>                         
            <section> 
            ${showImagesByRover(state)}   
            </section>
        </main>                   
    `
    }else{

        return `
        <header>${createHeader(state.get('rovers'))}</header>
        <main>
            <section>               
                ${ImageOfTheDay(state.get('apod'))}
                
            </section>
        </main>        
    `   
    }

};

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {   
    render(root, store);   
});

// ------------------------------------------------------  COMPONENTS

// Example of a pure function that renders infomation requested from the backend
const ImageOfTheDay = (apod) => {

    // If image does not already exist, or it is not from today -- request it again
    const today = new Date();
    const photodate = new Date(apod.date);
    
    if (!apod || apod.get('image').get('date') === today.getDate() ) {
        getImageOfTheDay(store);
    }else {
        // check if the photo of the day is actually type video!
        if (apod.get('image').get('media_type') === "video") {
            return (`
                <div>
                <h3>Astronomic Video of the day</h3>
                <p>See today's featured video <a href="${apod.get('image').get('url')}">here</a></p>
                <p>${apod.get('image').get('title')}</p>
                <p>${apod.get('image').get('explanation')}</p>
                </div>
            `);
        } else {
            return (`
                <div>
                <h3>Astronomic Picture of the day</h3>
                <img id="apod" src="${apod.get('image').get('url')}" />
                <p>${apod.get('image').get('explanation')}</p>
                </div>
            `);
        };

    };

    
};

// show images of selected Rover
const showImagesByRover = (state) => {
            
    if(!state.get('images')){
        getImagesByRover(state);       

    }else{                
        const photos = state
            .get('images')
            .get('images')
            .get('latest_photos')
            .slice(0,10);        
       
        const rover = state
            .get('images')
            .get('images')
            .get('latest_photos')
            .get('0')
            .get('rover');

        if(state.get('rover') === '' || state.get('selected') != state.get('rover').get('name')){
            updateStore(store, { rover , images : state.get('images'), selected: state.get('selected')});
        };
            
        let retString = '<div id="slideshow">';
        
        retString += photos.map(photo => {
            return `
            <img class= "slides" src=${photo.get('img_src')}>
            <div class= "caption">${photo.get('earth_date')}</div> 
            `

        }).join('');
        
        retString +=`
        <button id="buttonleft" onclick="plusDivs(-1)">&#10094;</button>
        <button id="buttonright" onclick="plusDivs(1)">&#10095;</button>
        <div id="number">1</div> 
        </div>`;   

        return retString;                
    };
};


// create Header content
const createHeader = (state) => {    
    let menu = '<div><element id="home"><a href= "./index.html">APOD</a></element>';
    
    menu += state.map(element => createRoverButton(element)).join('');

    return menu + '</div>';
};

// create the header buttons
const createRoverButton = (element) => {
    return `<element id="${element}">${element}</element>`;

};

// add ClickListener to menu items
const addClickListener = async() => {
    let rovers = store.get('rovers');
        
    rovers.forEach(element => {
        document.getElementById(element).addEventListener('click', () => {
            updateStore(store, { selected: element })
        });

    });

};

// fill Infobar with rover info and show ir
const showRoverInformation = (state) => {

    if(state != ''){
        let roverInfo = document.getElementById('rover');
        roverInfo.innerHTML = `
            <div style: width: 150px;>
            <h2>&#128712;  ${state.get('name')}</h2>
            <ul>
            <li>ID: ${state.get('id')}</li>
            <li>Status: ${state.get('status')}</li>
            <li>Launch: ${state.get('launch_date')}</li>
            <li>Landing: ${state.get('landing_date')}</li>          
            </ul>
            </div>
            
            `;
        roverInfo.style.display = "block";       
    };
};

//slideshow arrows plus
const plusDivs = (n) => {
  showDivs(slideIndex += n);
  const number = document.getElementById('number');
  const slides = document.getElementsByClassName('slides');
  number.innerHTML = `${slideIndex}/${slides.length}`;
};

//slideshow function
const showDivs = (n) => {
  let i;
  const slides = document.getElementsByClassName('slides');
  const number = document.getElementById('number');
  
  if (n > slides.length) {slideIndex = 1}
  if (n < 1) {slideIndex = slides.length} 

  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = 'none';  
  }  
  slides[slideIndex-1].style.display = 'block';
  number.innerHTML = `1 /${slides.length}`;
};

// ------------------------------------------------------  API CALLS

// API call for image of the day
const getImageOfTheDay = (state) => {    
    fetch(`http://localhost:3000/apod`)
        .then(res => res.json())
        .then(apod => updateStore(store, { apod }));

};

// API call for recent imagesw by rover
const getImagesByRover = (state) => {
    let selectedRover = state.get('selected').toLowerCase();
    let { images } = state.get('images');    
    
    fetch(`http://localhost:3000/${selectedRover}/images`)
        .then(res => res.json())
        .then(images => updateStore(store, { images, selected: state.get('selected') }));

};






