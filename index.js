'use strict';
 

const edamam = {
    baseUrl: 'https://api.edamam.com/search',
    apiKey: 'de706dec233d444b55ebebdbdd5c230c',
    appId: '4a4c4ccb'
}

const nutritionIx = {
    baseUrl: 'https://trackapi.nutritionix.com/v2/search/instant',
    apiKey: 'b16e2207c82b607f8a8eea08a8a05139',
    appId: '24e582af'
}




//format parameters
function formatParams(params){
    const paramString = Object.keys(params).map(key =>`${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
    return paramString.join('&');
}





//make html for each element
function makeHtml(responseJson){
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




//fetch api
function fetchData(food, restriction){
    const params = {
        q: food,
        app_id: edamam.appId,
        app_key: edamam.apiKey,
        health: restriction
    }

    const formatted = formatParams(params);

    const url = edamam.baseUrl + '?' + formatted;

    console.log(url);

    fetch(url)
        .then(response => response.json())
        .then(responseJson => {
            console.log(responseJson);
            makeHtml(responseJson);
        })
        .catch(err => console.log(err));
}






//listen on form
function onSubmit(){
    $('form').on('submit', function(e){
        e.preventDefault();
        const food = $('#js-food').val();
        const restriction = $('#js-health').val();
        fetchData(food, restriction);
    });
}


$(onSubmit);