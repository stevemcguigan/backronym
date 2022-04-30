$( document ).ready(function() {
    

    //console.log( "ready!" );
    FastClick.attach(document.body);
    populate ("main", generateLobby(), wireLobbyEvents);
    //Navigator.vibrate(2000)
});


// TO DO
/*

Finish keyboard handler

*/