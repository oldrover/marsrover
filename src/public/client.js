let store = {
    user: { name: "Student" },
    apod: '',
    rovers: ['Curiosity', 'Opportunity', 'Spirit'],
    selected: '',
    images: ''    
};

// add our markup to the page
const root = document.getElementById('root');

const updateStore = (store, newState) => {
    store = Object.assign(store, newState);
    render(root, store);
}

const render = async (root, state) => {
    root.innerHTML = App(state);
    addClickListener(state);
}


// create content
const App = (state) => {
    let { rovers, apod, selected, images } = state;

    if(selected !="") {  

        return `
        <header>${createHeader(rovers)}</header>
        <main>
            <submenu>${createSubMenu(selected)}</submenu>
            <section> 
            ${showImagesByRover(state)}   
            </section>
        </main>
        <footer>${createFooter()}</footer>
    `
    }else{

        return `
        <header>${createHeader(rovers)}</header>
        <main>
            <section>                
                ${ImageOfTheDay(apod)}
                
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
    const photodate = new Date();
    console.log(photodate.getDate(), today.getDate());

    console.log(photodate.getDate() === today.getDate());
    if (!apod || apod.image.date === today.getDate() ) {
        getImageOfTheDay(store);
    }

    // check if the photo of the day is actually type video!
    if (apod.image.media_type === "video") {
        return (`
            <h3>Astronomic Video of the day</h3>
            <p>See today's featured video <a href="${apod.url}">here</a></p>
            <p>${apod.image.title}</p>
            <p>${apod.image.explanation}</p>
        `)
    } else {
        return (`
            <h3>Astronomic Picture of the day</h3>
            <img src="${apod.image.url}" height="350px" width="100%" />
            <p>${apod.image.explanation}</p>
        `)
    }
}

// ------------------------------------------------------  API CALLS

// Example API call
const getImageOfTheDay = (state) => {
    let { apod } = state;

    fetch(`http://localhost:3000/apod`)
        .then(res => res.json())
        .then(apod => updateStore(store, { apod }));

};

// get Images by selected Rover
const getImagesByRover = (state) => {
    let selectedRover = state.selected.toLowerCase();
    let { images } = state.images;    
    
    fetch(`http://localhost:3000/${selectedRover}/images`)
        .then(res => res.json())
        .then(images => updateStore(store, { images }));

};

// show images of selected Rover
const showImagesByRover = (state) => {

    if(!state.images){
        getImagesByRover(state);

    }else{
        if(state.images.images.error){
            return state.images.images.error.code;
        }
        else{
            //show images
            let src = state.images.images.latest_photos;
            const photoArray = src.map(item => item).slice(0, 8);
            
            let retString = '';
            photoArray.forEach(photo => {
                retString += `<img src=${photo.img_src} style='width:400px; margin:10px;'></img>`;
                //add date to pics

            });
            
            let information = 
                `
                <div> Rover: ${photoArray[0].rover.name}</div>
                <div> Landing date: ${photoArray[0].rover.landing_date}</div>
                <div> Launch date: ${photoArray[0].rover.launch_date}</div>
                <div> Status: ${photoArray[0].rover.status}</div>
                `
            return retString + information;
            

        }        
    }


};

// create Header content
const createHeader = (rovers) => {
    let menu = '<div>';
    rovers.forEach(element => {
        menu += `<element id='${element}'>${element}</element>`;

    });

    return menu + '</div>';
};

// create Footer content
const createFooter = () => {
    return "<div>this is the Footer</div>";

};

// add ClickListener to menu items
const addClickListener =(state) => {
    let rovers = state.rovers;

    rovers.forEach(element => {
        document.getElementById(element).addEventListener('click', () => {
            updateStore(store, { selected: element, images: '' })
        });

    });

};
const createSubMenu = (state) => {
        
    return state;

}



