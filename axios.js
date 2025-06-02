import { appendCarousel, clear, createCarouselItem } from "./Carousel.js";

const { Carousel } = bootstrap

// import axios from "axios";

// The breed selection input element.
const breedSelect = document.getElementById("breedSelect");
// The information section div element.
const infoDump = document.getElementById("infoDump");
// The progress bar div element.
const progressBar = document.getElementById("progressBar");
// The get favourites button element.
const getFavouritesBtn = document.getElementById("getFavouritesBtn");
// The body tag element
const body = document.querySelector('body');

/**
 * 3. Fork your own sandbox, creating a new one named "JavaScript Axios Lab."
 */
/**
 * 4. Change all of your fetch() functions to axios!
 * - axios has already been imported for you within index.js.
 * - If you've done everything correctly up to this point, this should be simple.
 * - If it is not simple, take a moment to re-evaluate your original code.
 * - Hint: Axios has the ability to set default headers. Use this to your advantage
 *   by setting a default header with your API key so that you do not have to
 *   send it manually with all of your requests! You can also set a default base URL!
 */
const API_KEY = "live_3oxvCehvrn1ZuaXKUr4eZDlajO3uvJkZcBT6I4nZqArGmcfFEbH4lKGS4a6JA9Bx";
const USER_ID = "my-user-1234";
axios.defaults.headers['x-api-key'] = API_KEY;
axios.defaults.baseURL = 'https://api.thecatapi.com/v1'
axios.defaults.onDownloadProgress = updateProgress;

/**
 * 5. Add axios interceptors to log the time between request and response to the console.
 * - Hint: you already have access to code that does this!
 * - Add a console.log statement to indicate when requests begin.
 * - As an added challenge, try to do this on your own without referencing the lesson material.
 */
/**
 * 7. As a final element of progress indication, add the following to your axios interceptors:
 * - In your request interceptor, set the body element's cursor style to "progress."
 * - In your response interceptor, remove the progress cursor style from the body element.
 */
axios.interceptors.request.use(request => {
    request.metadata = request.metadata || {};
    request.metadata.startTime = new Date();
    progressBar.style.width = '0%';
    body.style.cursor = 'progress';
    return request;
});

axios.interceptors.response.use(response => {
    body.style.removeProperty('cursor');
    console.log(`Request took ${new Date() - response.config.metadata.startTime} ms`);
    return response;
})

/**
 * 6. Next, we'll create a progress bar to indicate the request is in progress.
 * - The progressBar element has already been created for you.
 *  - You need only to modify its "width" style property to align with the request progress.
 * - In your request interceptor, set the width of the progressBar element to 0%.
 *  - This is to reset the progress with each request.
 * - Research the axios onDownloadProgress config option.
 * - Create a function "updateProgress" that receives a ProgressEvent object.
 *  - Pass this function to the axios onDownloadProgress config option in your event handler.
 * - console.log your ProgressEvent object within updateProgess, and familiarize yourself with its structure.
 *  - Update the progress of the request using the properties you are given.
 * - Note that we are not downloading a lot of data, so onDownloadProgress will likely only fire
 *   once or twice per request to this API. This is still a concept worth familiarizing yourself
 *   with for future projects.
 */
function updateProgress(event) {
    progressBar.style.width = `${100}%`;
}

async function initialLoad() {
    const breeds = await axios.get('/breeds')

    for (const breed of breeds.data) {
        const optionEl = document.createElement('option');
        optionEl.textContent = breed.name;
        optionEl.setAttribute('value', breed.id);

        breedSelect.appendChild(optionEl);
    }

    populateBreed();
}
initialLoad();

function populateBreed() {
    breedSelect.addEventListener('change', async event => {
        const breedId = event.target.value;
        const imgLimit = 100;
        const breedImgs = await axios(`/images/search?limit=${imgLimit}&breed_ids=${breedId}`);

        clearData();
        if (!breedImgs.data || breedImgs.data.length === 0) {
            return;
        }

        breedImgs.data.forEach(breedImg => {
            buildCarousel(breedImg.url, event.target.textContent, breedImg.id);
        });
        infoDump.appendChild(mapInfoData(breedImgs.data[0].breeds[0]));
    });
}

function buildCarousel(url, alt, imgId) {
    const carouselEl = createCarouselItem(url, alt, imgId);
    appendCarousel(carouselEl);
}

function mapInfoData(info) {
    const frag = document.createDocumentFragment();
    const ul = document.createElement('ul');
    ul.append(
        objectAssign('li', `Adaptability: ${info.adaptability}`),
        objectAssign('li', `Affection level: ${info.affection_level}`),
        objectAssign('li', `Child Friendly: ${info.child_friendly}`),
        objectAssign('li', `Dog Friendly: ${info.dog_friendly}`),
        objectAssign('li', `Energy Level: ${info.energy_level}`),
        objectAssign('li', `Intelligence: ${info.intelligence}`)
    )

    frag.append(
        objectAssign('h1', 'Description'),
        objectAssign('p', info.description),
        objectAssign('h3', 'Key Characteristics (1-5 scale):'),
        ul
    )

    return frag;
}

function objectAssign(tag, val) {
    return Object.assign(document.createElement(tag), { textContent: val });
}

function clearData() {
    while (infoDump.firstChild) {
        infoDump.removeChild(infoDump.firstChild);
    }
    clear();
}

/**
 * 8. To practice posting data, we'll create a system to "favourite" certain images.
 * - The skeleton of this function has already been created for you.
 * - This function is used within Carousel.js to add the event listener as items are created.
 *  - This is why we use the export keyword for this function.
 * - Post to the cat API's favourites endpoint with the given ID.
 * - The API documentation gives examples of this functionality using fetch(); use Axios!
 * - Add additional logic to this function such that if the image is already favourited,
 *   you delete that favourite using the API, giving this function "toggle" functionality.
 * - You can call this function by clicking on the heart at the top right of any image.
 */
export async function favourite(imgId) {
    if (localStorage.getItem(imgId) === null) {
        const favoriteId = await axios.post('/favourites', {
            image_id: imgId,
            sub_id: USER_ID
        })
            .catch(err => console.log(err));
        localStorage.setItem(imgId, favoriteId.data.id);
        console.log(favoriteId.data)
    } else {
        const favId = localStorage.getItem(imgId);
        const resp = await axios.delete(`/favourites/${favId}`)
            .catch(err => console.log(err));
        console.log(`response: ${resp}, favId: ${favId}`);
        localStorage.removeItem(imgId);
        getFavourites();
    }
}

/**
 * 9. Test your favourite() function by creating a getFavourites() function.
 * - Use Axios to get all of your favourites from the cat API.
 * - Clear the carousel and display your favourites when the button is clicked.
 *  - You will have to bind this event listener to getFavouritesBtn yourself.
 *  - Hint: you already have all of the logic built for building a carousel.
 *    If that isn't in its own function, maybe it should be so you don't have to
 *    repeat yourself in this section.
 */
getFavouritesBtn.addEventListener('click', getFavourites);

async function getFavourites() {
    const favourites = await axios.get('/favourites');
    
    clearData();
    favourites.data.forEach(fav => {
        // To handle missing data (for development purposes only).
        // if (!localStorage.getItem(fav.image_id)) {
        //     localStorage.setItem(fav.image_id, fav.id)
        // }
        buildCarousel(fav.image.url, fav.alt, fav.image_id);
    });
}

/**
 * 10. Test your site, thoroughly!
 * - What happens when you try to load the Malayan breed?
 *  - If this is working, good job! If not, look for the reason why and fix it!
 * - Test other breeds as well. Not every breed has the same data available, so
 *   your code should account for this.
 */
// added this condition to handle problems with fetch
// if (!breedImgs.data || breedImgs.data.length === 0) {
//     return;
// }
