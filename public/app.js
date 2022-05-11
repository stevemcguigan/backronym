$( document ).ready(function() {   
    loadUser();
    FastClick.attach(document.body);
    /*setTimeout(function(){
      $("#titleScreen").addClass("animate__animated animate__zoomOut hidden")
      populate ("main", generateLobby(), wireLobbyEvents);
    }, 2500)*/
    let btnPlay = id("playbutton"); 
    btnPlay.addEventListener("click", e => {
        $("#titleScreen").addClass("animate__animated animate__zoomOut hidden");
        btnPlay.style.display = "none";
        //soundtrack.play();
        populate ("main", generateLobby(), wireLobbyEvents);

    })
    soundtrack = id("soundtrack");

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
    if (!user.localId)
    {
      user.localId = guid();
      console.log("Found a legacy user with no guid, adding. " + user.localId);
      saveUser();
    } 
	}	
}

function saveUser()
{
  window.localStorage.setItem('user', JSON.stringify(user));
}

function saveNewUser()
{
	let newNick = $('#name').val();
  let now = Date.now();
	user = {
    "localId": guid(), 
		"nick": newNick,
    "clientId": clientId,
    "theme": "light",
    "wins" : 0,
    "created" : now
	}

	saveUser();
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