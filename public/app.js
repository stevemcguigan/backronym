$( document ).ready(function() {
    

    //console.log( "ready!" );
    FastClick.attach(document.body);
    populate ("main", generateLobby(), wireLobbyEvents);

//alert(phrase2acronym("WHY ARE YOU THE WAY YOU ARE"))
    /*
    setTimeout(function () {
      wireLobbyEvents();
    }, 1000)*/

});


// TO DO
/*

Finish keyboard handler

*/