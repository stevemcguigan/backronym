$( document ).ready(function() {
    

    //console.log( "ready!" );


    loadUser();

    FastClick.attach(document.body);
    populate ("main", generateLobby(), wireLobbyEvents);
    //Navigator.vibrate(2000)
});

function loadUser()
{
	user = JSON.parse(window.localStorage.getItem('user'));
	if (user == null)
	{
		console.log("no user found")
		createNewUser();
	} else {
		console.log("found an old user!")
		nick = user.nick;
	}	
}

function saveNewUser()
{
	let newNick = $('#name').val();
	user = {
		"nick": newNick
	}

	window.localStorage.setItem('user', JSON.stringify(user));
	clear_modal_by_id("createNewUser");
}

function createNewUser()
{

       var actionsArray = [];


    actionsArray.push(new actionItem({
      label:`ok`,
      action: `saveNewUser();`
    }));



      create_new_modal({
        modal_id: 'createNewUser',
        modal_type: 'generic_confirm',
        prompt: "welcome!",
        textbox: "name",
        actionsArray: actionsArray,
        placeholder: "choose a nickname"
      });


}


// TO DO
/*

Finish keyboard handler

*/