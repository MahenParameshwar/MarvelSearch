import md5 from "./md5.js";

let card = null;
let comicsContainer = null;
let loader = null;
let sucess = null;

window.onload = () => {
  document.querySelector("form").addEventListener("submit", handleSearch);
  card = document.querySelector(".charector-card");
  comicsContainer = document.querySelector(".comics");
  // comicsContainer.addEventListener('click',getComic)
  loader = document.querySelector(".loader");
  sucess = document.querySelector(".text-success");
};

function handleSearch() {
  event.preventDefault();
  const form = new FormData(event.target);
  const toSearch = form.get("name");
  getData(toSearch);
}

function getComic() {
  let current = event.target.parentNode;
  while (!current.classList.contains("comic")) {
    current = current.parentNode;
  }
  const id = current.getAttribute("data-id");
  location.assign(`/comic.html?id=${id}`);
}

function getData(search) {
  if (!card.classList.contains("visible")) {
    card.classList.toggle("visible");
  }

  if (!sucess.classList.contains("visible")) {
    sucess.classList.toggle("visible");
  }

  loader.classList.toggle("visible");

  comicsContainer.innerHTML = "";

  document.getElementById("character-container").style.display = "block";
  card.innerHTML = "";
  var publickey = "6322bbceb4428f8e8127a616b0ebbbc2";
  var privatekey = "f0313644d63b23bebde9f4f480e91b5fc70b2804";
  var ts = new Date().getTime();
  var stringToHash = ts + privatekey + publickey;
  var hash = md5(stringToHash);

  var url = `https://gateway.marvel.com:443/v1/public/characters?name=${search}&ts=${ts}&apikey=${publickey}&hash=${hash}`;

  let xhr = new XMLHttpRequest();
  xhr.open("GET", url);
  xhr.send();
  xhr.onload = function () {
    if (this.status === 200) {
      localStorage.setItem("character", this.response);
      renderDom(JSON.parse(this.response));
    }
  };
}

//renders the charactor
function renderDom(response) {
  const data = response.data.results[0];

  getComics(data.id);
  card.innerHTML = `<div class="charector-image">
                        <img class="card-img-right flex-auto d-md-block img-fluid" src="${data.thumbnail.path}/detail.jpg" alt="">
                    </div>
                    <div class="charector-info card-body d-flex flex-column align-items-start">
                        <div class="name mb-0 text-dark">
                            ${data.name}
                        </div>
                        <div class="description card-text mb-3">
                            ${data.description}
                        </div>
                        <div class="aditional-info text-muted mb-3">
                            <span>Comics:${data.comics.available} | </span>
                            <span>Series:${data.series.available} | </span>
                            <span>Stories:${data.stories.available} | </span>
                            <span>Events:${data.events.available} | </span>
                        </div>
                        <div class="copyright mb-1 text-muted">
                            ${response.attributionText}
                        </div>`;

  card.classList.toggle("visible");
}

function getComics(id) {
  var publickey = "6322bbceb4428f8e8127a616b0ebbbc2";
  var privatekey = "f0313644d63b23bebde9f4f480e91b5fc70b2804";
  var ts = new Date().getTime();
  var stringToHash = ts + privatekey + publickey;
  var hash = md5(stringToHash);

  var url = `https://gateway.marvel.com:443/v1/public/characters/${id}/comics?limit=100&ts=${ts}&apikey=${publickey}&hash=${hash}`;

  let xhr = new XMLHttpRequest();
  xhr.open("GET", url);
  xhr.send();
  xhr.onload = function () {
    if (this.status === 200) {
      localStorage.setItem("comics", this.response);
      renderComics(JSON.parse(this.response));
    }
  };
}

function renderComics(response) {
  const data = response.data.results;
  const comicsContainer = document.querySelector(".comics");
  const fragment = new DocumentFragment();
  let count = 1;
  for (let i = 0; i < data.length; i++) {
    // console.log(data[i].creators.items);
    if (data[i].description === null) continue;
    let characters = "";
    let creators = "";
    let charactersArr = data[i].characters.items;
    let creatorsArr = data[i].creators.items;

    for (let j = 0; j < charactersArr.length; j++) {
      characters += charactersArr[j].name + ", ";
    }

    for (let j = 0; j < creatorsArr.length; j++) {
      creators += creatorsArr[j].name + ", ";
    }

    const comic = document.createElement("div");
    comic.classList.add("card");
    comic.classList.add("comic");
    comic.setAttribute("data-id", data[i].id);

    comic.innerHTML = `
                            <img class="card-img-top img-responsive" src="${data[i].thumbnail.path}/detail.jpg" alt="">
                            
                            <div class="card-body">
                                <h2 class='card-title'>${data[i].title}</h2>
                                <div class="card-text">
                                    ${data[i].description}
                                </div>
                                <div class="card-text">
                                    Characters : ${characters}
                                </div>
                                <div class="card-text">
                                    Creators : ${creators}
                                </div>
                            </div>
                            <div class="card-footer">${response.attributionText}</div>`;

    fragment.append(comic);
  }
  loader.classList.toggle("visible");
  sucess.classList.toggle("visible");
  comicsContainer.append(fragment);
}
