const api = 'https://www.omdbapi.com/?apikey=65a20ada&';

let currentPageNumber = 1;
let totalPageNumber = 1;

let userRating = 0;

searchMovies();

function searchMovies(page = 1) {
    let search = 's=harry';

    const title = document.getElementById('titleInput');
    const year = parseInt(document.getElementById('yearInput').value);

    if (title.value === "") {
        title.value = "Harry Potter";
    }

    let titleArray = title.value.split(' ').map(e => e.trim());
    titleArray = titleArray.filter(e => e !== '');

    if (titleArray !== []) search = 's=' + titleArray.join('+');
    if (year >= 1970 && year <= 2099) search = search + '&y=' + year.toString();
    search += `&page=${page}`;

    let retObj;
    fetch(api + search)
        .then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not OK');
            }
            return response.json();
        })
        .then((data) => {

            // Process the received data
            console.log(data);
            showMovies(data);
            let totalPages = data.totalResults;
            if (totalPages % 10 == 0) totalPages /= 10;
            else totalPages = parseInt(totalPages / 10) + 1;
            totalPageNumber = totalPages;
            updatePageNumber();

            return data;
        })
        .catch(error => {
            // Handle any errors that occurred during the fetch request
            console.log('Error:', error.message);
            showMovies(-1);
            return -1;
        });
}

function showMovies(obj) {
    console.log(obj);
    if (obj === -1) {
        document.getElementById("moviesListContainer").innerText = "Nothing to show!";
        currentPageNumber = 1;
        totalPageNumber = 1;
        updatePageNumber();
        return;
    }

    function htmlCode(movie) {
        // console.log(movie.imdbID);
        return `<div id="${movie.imdbID}" class="movieCard">
                <img src="${movie.Poster}" alt="img">
                <a href="" onclick="showPopup(${movie.imdbID})"><h4>${movie.Title}</h4></a>
            </div>
            `;
    }

    let html = "";

    for (let i = 0; i < Array.from(obj.Search).length; i++) html += htmlCode(obj.Search[i]);
    document.getElementById("moviesListContainer").innerHTML = html;
}

function updatePageNumber() {
    const currentPageElement = document.getElementById('currentPage');
    currentPageElement.textContent = " " + currentPageNumber.toString() + " / " + totalPageNumber.toString() + " ";
}

function goToPreviousPage() {
    if (currentPageNumber > 1) {
        currentPageNumber--;
        searchMovies(currentPageNumber);
        updatePageNumber();
    }
}

function goToNextPage() {
    if (currentPageNumber < totalPageNumber) {
        currentPageNumber++;
        searchMovies(currentPageNumber);
        updatePageNumber();
    }
}

function validateYearInput(event) {
    const input = event.target;
    input.value = input.value.replace(/\D/g, ''); // Remove all non-numeric characters
}

function showPopup(imdbID) {
    event.preventDefault();
    // console.log(imdbID);

    let search = 'i=' + imdbID.id.toString();
    fetch(api + search)
        .then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not OK');
            }
            return response.json();
        })
        .then((data) => {
            // Process the received data
            console.log(data);

            let storageArray = {};
            let storage = localStorage.getItem("comments");
            if (storage != null) storageArray = JSON.parse(storage);

            // console.log(storageArray[data.imdbID].Ratings);
            let userComments = "";
            if (storageArray[data.imdbID] !== undefined) {
                userComments = storageArray[data.imdbID].Comments;
            }


            let html = `
                    <div class="infoCard">
                    <div style="margin: 10px; display: flex; flex-direction: column; align-items: center;">
                    <img src="${data.Poster}" alt="img">
                    <h2>${data.Title}</h2>
                    </div>
                    <div style="width: 100%; margin: 0px 40px 0px 10px;">
                    <h3>Released on ${data.Released}</h3>
                    <h3>Runtime : ${data.Runtime}</h3>
                    <h3>Genre : ${data.Genre}</h3>
                    <h3>Director : ${data.Director}</h3>
                    <h3>Writer : ${data.Writer}</h3>
                    <h3>Actors : ${data.Actors}</h3>
                    <h3>Plot : ${data.Plot}</h3>
                    <h3>IMDB Rating : ${data.Ratings[0].Value}</h3>
                    <div class="rating-container" id="ratingContainer">
                    <span style="font-size: 16px; font-weight: bold;">Give your Ratings : </span>
                    <span class="star" onclick="setRating(1)">&#9733;</span>
                    <span class="star" onclick="setRating(2)">&#9733;</span>
                    <span class="star" onclick="setRating(3)">&#9733;</span>
                    <span class="star" onclick="setRating(4)">&#9733;</span>
                    <span class="star" onclick="setRating(5)">&#9733;</span>
                    <span class="star" onclick="setRating(6)">&#9733;</span>
                    <span class="star" onclick="setRating(7)">&#9733;</span>
                    <span class="star" onclick="setRating(8)">&#9733;</span>
                    <span class="star" onclick="setRating(9)">&#9733;</span>
                    <span class="star" onclick="setRating(10)">&#9733;</span>
                    </div>
                    <div class="comment-container" id="${data.imdbID}">
                    <span style="font-size: 16px; font-weight: bold;">Give your Comments : </span>
                    <textarea id="commentInput" placeholder="Type your comment here...">${userComments}</textarea>
                    <button id="saveButton" onclick="saveComments()">Save</button>
                    </div>
                    </div>
                    
                    <button id="closeButton" onclick="infoCloseContainer()">X</button>
                    
                    </div>`;


            document.getElementById('infoCardContainer').innerHTML = html;
            if (storageArray[data.imdbID] !== undefined) setRating(parseInt(storageArray[data.imdbID].Ratings));

            return data;
        })
        .catch(error => {
            // Handle any errors that occurred during the fetch request
            console.log('Error:', error.message);
            return -1;
        });

    document.getElementById('infoCardContainer').style.display = 'flex';
}


function infoCloseContainer() {
    document.getElementById('infoCardContainer').style.display = 'none';
    userRating = 0;
    document.getElementById('infoCardContainer').innerHTML = "";
}

function setRating(rating) {
    userRating = rating;
    updateStars();
}

function updateStars() {
    const stars = document.querySelectorAll('.star');

    stars.forEach((star, index) => {
        if (index < userRating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

function saveComments() {
    let comment = document.getElementById("commentInput").value.trim();

    let storageArray = {};
    let storage = localStorage.getItem("comments");
    if (storage != null) storageArray = JSON.parse(storage);

    storageArray[event.target.parentNode.id] = {
        Ratings: userRating,
        Comments: comment
    };
    localStorage.setItem("comments", JSON.stringify(storageArray));
}
