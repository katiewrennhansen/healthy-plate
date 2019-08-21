'use strict';
 
//GLOBAL VARIABLE
const wiki = {
    baseUrl: 'https://en.wikipedia.org/w/api.php'
}


const edamam = {
    baseUrl: 'https://api.edamam.com/search',
    apiKey: 'de706dec233d444b55ebebdbdd5c230c',
    appId: '4a4c4ccb'
}

const ndb = {
    baseUrl: 'https://api.nal.usda.gov/ndb/search',
    foodSearchUrl: 'https://api.nal.usda.gov/ndb/reports',
    apiKey: 'Cl2AGWhT8LjHokAVdGRjQBMufFIaLgOqfOUPAXsy'
}




//FORMAT PARAMETERS
function formatParams(params){
    const paramString = Object.keys(params).map(key =>`${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
    return paramString.join('&');
}





//MAKE HTML ELEMENTS FOR DATA

//make html for title
function makeTitleHtml(food){
    $('#js-searched-food').empty();

    const firstLetter = food.charAt(0).toUpperCase();
    const restOfTitle = food.slice(1);
    const title = firstLetter + restOfTitle;

    $('#js-searched-food').append(`
    <h2>${title}</h2>
        `);
}


//make html for wiki data
function makeWikiHtml(responseJson){
    $('#js-results-info').empty();

    const pageId = responseJson.query.pageids[0];
    const data = responseJson.query.pages[pageId];
  
    $('#js-results-info').append(`
    <img src=${data.thumbnail.source}>
    <p>${data.extract}</p>
    <a href="https://en.wikipedia.org/wiki/${data.title}" target="_blank">Read More</a>
    `);
}


//make html for nutrient data
function makeNutrientHtml(responseJson){
    $('#js-results-nutrition').empty();

    const nutrient = responseJson.report.food.nutrients;

    $('#js-results-nutrition').append(`
        <tr>
            <th>Nutrient</th>
            <th>Amount</th>
        </tr>
        `);

    for (let i = 0; i < nutrient.length; i++){
        $('#js-results-nutrition').append(`
            <tr>
                <td>${nutrient[i].name}</td>
                <td><span>${nutrient[i].value}</span> <span>${nutrient[i].unit}</span></td>
            </tr>
        `);
    }
}



//make html for recipe data
function makeRecipeHtml(responseJson){
    $('#js-results-list').empty();

    const food = responseJson.hits;

    for (let i = 0; i < 10; i++){
        $('#js-results-list').append(`<li class="recipe">
        <img class="image" src="${food[i].recipe.image}">
        <div class="recipe-content">
        <p class="title"><a href="${food[i].recipe.url}" target="_blank">${food[i].recipe.label}</a></p>
        <p class="source">${food[i].recipe.source}</p>
        <p class="labels">${food[i].recipe.healthLabels}</p>
        <div>
        </li>`);
    }
}






//FETCH DATA FROM APIS

//fetch wiki food origin data
function fetchWikiData(food){
    const params = {
        origin: '*',
        action: 'query',
        format: 'json',
        prop: 'extracts|pageimages',
        indexpageids: 1,
        redirects: 1,
        exchars: 1200,
        exsectionformat: 'plain',
        piprop: 'name|thumbnail|original',
        pithumbsize: 250,
        titles: food
    }

    const formatted = formatParams(params);
    const url = wiki.baseUrl + '?' + formatted;

    fetch(url)
        .then(response => response.json())
        .then(responseJson => {
            makeWikiHtml(responseJson);
        })
        .catch(err => console.log(err));
}


//fetch food number (ndbno)
function fetchNutrientNumber(food){
    const params = {
        format: 'json',
        q: `${food}, raw`,
        api_key: ndb.apiKey
    }

    const formatted = formatParams(params);
    const url = ndb.baseUrl + '?' + formatted;

    console.log(url);

    fetch(url)
        .then(response => response.json())
        .then(responseJson => {
            console.log(responseJson);
            const ndbno = responseJson.list.item[0].ndbno;
            console.log(ndbno);
            fetchNutrientData(ndbno);
        })
        .catch(err => console.log(err));
}

//fetch nutrient data
function fetchNutrientData(ndbno){

    console.log(ndbno);
    const params = {
        ndbno: ndbno,
        format: 'json',
        type: 'b',
        api_key: ndb.apiKey
    }

    const formatted = formatParams(params);
    const url = ndb.foodSearchUrl + '?' + formatted;

    fetch(url)
        .then(response => response.json())
        .then(responseJson => {
            makeNutrientHtml(responseJson);
        })
        .catch(err => console.log(err));
}



//fetch recipe data
function fetchData(food, restriction){
    const params = {
        q: food,
        app_id: edamam.appId,
        app_key: edamam.apiKey,
        health: restriction
    }

    const formatted = formatParams(params);
    const url = edamam.baseUrl + '?' + formatted;

    fetch(url)
        .then(response => response.json())
        .then(responseJson => {
            makeRecipeHtml(responseJson);
        })
        .catch(err => console.log(err));
}






//LISTEN ON FORM AND EXECUTE CODE

//listen on form
function onSubmit(){
    $('form').on('submit', function(e){
        e.preventDefault();
        const food = $('#js-food').val();
        const restriction = $('#js-health').val();
        makeTitleHtml(food);
        fetchData(food, restriction);
        fetchWikiData(food);
        fetchNutrientNumber(food);
    });
}


$(onSubmit);