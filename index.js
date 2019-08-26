//fix error message display bug
//add other diet filters




'use strict';
 
//GLOBAL VARIABLES
//======================================
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



//FORMAT QUERY/PARAMETERS
//======================================

//format query parameters
function formatParams(params){
    const paramString = Object.keys(params).map(key =>`${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
    return paramString.join('&');
}


function formatQuery(food){

}





//MAKE HTML ELEMENTS FOR DATA
//======================================

//capitalize first letter and make html for page title
function makeTitleHtml(food){
    $('#js-searched-food').empty();

    const firstLetter = food.charAt(0).toUpperCase();
    const restOfTitle = food.slice(1);
    const title = firstLetter + restOfTitle;

    $('#js-searched-food').text(title);
}


//make html for wiki histroy information
function makeWikiHtml(responseJson){
    $('#js-results-info').empty();
    $('.error-info').addClass('hidden');

    const pageId = responseJson.query.pageids[0];
    const data = responseJson.query.pages[pageId];
  
    $('#js-results-info').append(`
    <img class="wiki-img" src=${data.thumbnail.source}>
    <p>${data.extract}</p>
    <a class="wiki-link" href="https://en.wikipedia.org/wiki/${data.title}" target="_blank">Read More</a>
    `);
    $('.info').removeClass('hidden');
}


//make html for nutrition information
function makeNutrientHtml(responseJson){
    $('#js-results-nutrition').empty();
    $('.error-nutrition').addClass('hidden');

    const nutrient = responseJson.report.food.nutrients;

    $('#js-nut-title').text(`${responseJson.report.food.name}`);

    $('#js-results-nutrition').append(`
        <tr>
            <th>Nutrient per ${nutrient[0].measures[0].label}</th>
            <th>Amount</th>
        </tr>
        `);

    for (let i = 0; i < nutrient.length; i++){
        $('#js-results-nutrition').append(`
            <tr>
                <td>${nutrient[i].name}</td>
                <td><span>${nutrient[i].measures[0].value}</span> <span>${nutrient[i].unit}</span></td>
            </tr>
        `);
    }
    $('.nutrition-facts').removeClass('hidden');
}


//make html for recipes
function makeRecipeHtml(responseJson){
    $('#js-results-list').empty();
    $('.error-recipe').addClass('hidden');

    const food = responseJson.hits;


    for (let i = 0; i < 10; i++){
        $('#js-results-list').append(`<li class="recipe">
        <img class="image" src="${food[i].recipe.image}">
        <div class="recipe-content">
        <h4 class="title h4"><a href="${food[i].recipe.url}" target="_blank">${food[i].recipe.label}</a></h4>
        <p class="source">${food[i].recipe.source}</p>
        <p class="labels">${food[i].recipe.healthLabels}</p>
        <div>
        </li>`);
    }


    $('.recipes').removeClass('hidden');
}



//FETCH DATA FROM APIS
//======================================

//fetch food origin data from Wikipaedia API
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
        .catch(err => {
            $('.error-info').text('Error: unable to retrieve food information').removeClass('hidden');
            $('.info').addClass('hidden');
            console.log(err);
        });
}


//fetch food number (ndbno) from NDB API
function fetchNutrientNumber(food){
    const params = {
        format: 'json',
        q: `${food}, raw`,
        api_key: ndb.apiKey
    }

    const formatted = formatParams(params);
    const url = ndb.baseUrl + '?' + formatted;

    fetch(url)
        .then(response => response.json())
        .then(responseJson => {
            const ndbno = responseJson.list.item[0].ndbno;
            fetchNutrientData(ndbno);
        })
        .catch(err => {
            $('.error-nutrition').text('Error: unable to retrieve nutrient data').removeClass('hidden');
            $('.nutrition-facts').addClass('hidden');
            console.log(err);
        });
}

//fetch food nutrition data from NDB API using NDB number
function fetchNutrientData(ndbno){
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
        .catch(err => {
            $('.error-nutrition').text('Error: unable to retrieve nutrient data').removeClass('hidden');
            $('.nutrition-facts').addClass('hidden');
            console.log(err);
        });
}


//fetch recipe data from edamam API
function fetchRecipeData(food, restriction, diet){
    const params = {
        q: food,
        app_id: edamam.appId,
        app_key: edamam.apiKey
    }

    if (restriction) {
        params.health = restriction;
    }

    if (diet) {
        params.diet = diet;
    }
    
    const formatted = formatParams(params);
    const url = edamam.baseUrl + '?' + formatted;
 
    fetch(url)
        .then(response => response.json())
        .then(responseJson => {
            makeRecipeHtml(responseJson);
        })
        .catch(err => {
            $('.error-recipe').text('Error: unable to retrieve recipes').removeClass('hidden');
            $('.recipes').addClass('hidden');
            console.log(err)
        });
}



//LISTEN ON FORM AND EXECUTE CODE
//======================================

//listen on main form
function onMainSubmit(){
    $('#js-food-search').on('submit', function(e){
        e.preventDefault();
        const food = $('#js-food').val();
        makeTitleHtml(food);
        fetchRecipeData(food);
        fetchWikiData(food);
        fetchNutrientNumber(food);
    });
}

//listen on dietary restriction form
function onRecipeSubmit(){
    $('#js-recipe-submit').on('submit', function(e){
        e.preventDefault();
        const food = $('#js-food').val();
        const restriction = $('#js-health').val();
        const diet = $('#js-diet').val();
        fetchRecipeData(food, restriction, diet);
    });
}

//call all form submission functions
function submitForms(){
    onMainSubmit();
    onRecipeSubmit();
}



//CALL ALL FUNCTIONS
//======================================
$(submitForms);






