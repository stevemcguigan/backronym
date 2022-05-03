$( document ).ready(function() {
    
    loadUser();

    FastClick.attach(document.body);
    setTimeout(function(){
      $("#titleScreen").addClass("animate__animated animate__zoomOut hidden")
      populate ("main", generateLobby(), wireLobbyEvents);
    }, 2500)

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
  let now = Date.now();
	user = {
		"nick": newNick,
    "clientId": clientId,
    "theme": "light",
    "wins" : 0,
    "created" : now
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