const store = Immutable.Map({
    apod: '',
    rovers: ['Curiosity', 'Opportunity', 'Spirit'],
    selected: '',
    images: '',
    rover: ''   
});

// add our markup to the page
const root = document.getElementById('root');


//update store
const updateStore = (store, newState) => {
    store = store.merge(newState);
    //console.log(store.toJS());
    render(root, store);
};


//render the page
const render = async (root, state) => {   
    root.innerHTML = App(state); 
    showRoverInformation(state.get('rover'));   
    addClickListener(); 

};


// create content
const App = (state) => {

    //<rover>${showRoverInformation(state.get('rover'))}</rover>
    
    if(state.get('selected') != '') { 
        return `
        <header>${createHeader(state.get('rovers'))}</header>
        <main> 
        <rover id= 'rover'></rover>                  
            <section> 
            ${showImagesByRover(state)}   
            </section>
        </main>
        <footer>${createFooter()}</footer>
    `
    }else{

        return `
        <header>${createHeader(state.get('rovers'))}</header>
        <main>
            <section>                
                ${ImageOfTheDay(state.get('apod'))}
                
            </section>
        </main>
        <footer>${createFooter()}</footer>
    `   
    }

}


// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {   
    render(root, store);   
})


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
            <h3>Astronomic Video of the day</h3>
            <p>See today's featured video <a href="${apod.url}">here</a></p>
            <p>${apod.image.title}</p>
            <p>${apod.image.explanation}</p>
        `)
    } else {
        return (`
            <h3>Astronomic Picture of the day</h3>
            <img src="${apod.get('image').get('url')}" height="350px" width="100%" />
            <p>${apod.get('image').get('explanation')}</p>
        `)
    }

    }

    
}

// ------------------------------------------------------  API CALLS

// Example API call
const getImageOfTheDay = (state) => {    
    fetch(`http://localhost:3000/apod`)
        .then(res => res.json())
        .then(apod => updateStore(store, { apod }));

};


// get Images by selected Rover
const getImagesByRover = (state) => {
    let selectedRover = state.get('selected').toLowerCase();
    let { images } = state.get('images');    
    
    fetch(`http://localhost:3000/${selectedRover}/images`)
        .then(res => res.json())
        .then(images => updateStore(store, { images, selected: state.get('selected') }));

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
            .slice(0,4);

        const rover = state
            .get('images')
            .get('images')
            .get('latest_photos')
            .get('0')
            .get('rover');

        if(state.get('rover') === '' || state.get('selected') != state.get('rover').get('name')){
            updateStore(store, { rover , images : state.get('images'), selected: state.get('selected')});
        } 
        
                         
            
        let retString = '';
        photos.forEach(photo => {
            retString += `
            <figure>
            <img src=${photo.get('img_src')} style='width:400px; margin:10px;'>
            <figcaption>${photo.get('earth_date')}</figcaption>
            </figure>                
            `;               

        });            
                            
        return retString;
            

                
    }


};


// create Header content
const createHeader = (state) => {    
    let menu = '<div>';
    state.forEach(element => {
        menu += `<element id='${element}'>${element}</element>`;        

    });

    return menu + '</div>';
};


// create Footer content
const createFooter = () => {
    return "";

};


// add ClickListener to menu items
const addClickListener =() => {
    let rovers = store.get('rovers');
        
    rovers.forEach(element => {
        document.getElementById(element).addEventListener('click', () => {
            updateStore(store, { selected: element })
        });

    });

};

const showRoverInformation = (state) => {

    if(state != ''){
        console.log(state.get('name'));
        let t = document.getElementById('rover');
        t.innerHTML = `
            Name: ${state.get('name')}
            Status: ${state.get('status')}
            `;
    }
}




