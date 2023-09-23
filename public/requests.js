// if you want something from the server, ask here

function getGames()
{
	const payload = {
		"method": "getGames",
		"clientId": clientId
	}
    send(payload);
}

function sendLocalId()
{
	clog("send localID called", 4)
	clog(user, 4)
	if (user == null)
	{
		clog("User object didn't load yet, retrying", 5)
		setTimeout(function(){
			sendLocalId()
		}, 500)
		return
	}
	const payload = {
		"method": "localId",
		"clientId": clientId,
		"localId": user.localId
	}
    send(payload);		
}



function start(gameId)
{
	const payload = {
		"method": "start",
		"clientId": clientId,
		"gameId": gameId
	}
    send(payload);	
}

function requestExit()
{
	const payload = {
		"method": "exit",
		"clientId": clientId,
		"gameId": gameId
	}
    send(payload);	
}

function play(play)
{
	const payload = {
		"method": "play",
		"gameId": gameId,
		"clientId": clientId,
		"play": play
	}
    send(payload);
}

function bypassNickModal(newNick)
{
		requestNickChange(newNick)
		user.nick = newNick
		nick = newNick
		saveUser()
}

function requestNickChange(newNick)
{
		const payload = {
		"method": "nickChange",
		"gameId": gameId,
		"clientId": clientId,
		"newNick": newNick
	}
    send(payload);
}


function checkNick()
{

	let newNick = $('#name').val();
	if (newNick.length > 0)
	{
		clear_modal_by_id('changeNick')
		user.nick = newNick
		nick = newNick
		saveUser()
		loc !== "lobby" ? requestNickChange(newNick) : clog("not in a game, not requesting nickchange yet", 4)
	}
}

function editNick()
{
		let actionsArray = []

		clear_modal_by_id("settingsMenu")
    actionsArray.push(
	    new actionItem({
	      label:`ok`,
	      action: `checkNick();`
	    }),
	    new actionItem({
	      label:`cancel`,
	      action: `clear_modal_by_id('changeNick');openMenu()`
	    })
    );

    create_new_modal({
      modal_id: 'changeNick',
      modal_type: 'generic_confirm',
      prompt: "new nickname",
      textbox: "name",
      actionsArray: actionsArray,
      placeholder: "choose a nickname"
    });
}


function joinPrivatePrompt()
{

	let actionsArray = [];

    actionsArray.push(new actionItem({
      label:`ok`,
      action: `joinPrivate();`
    }));

    actionsArray.push(new actionItem({
      label:`cancel`,
      action: `clear_modal_by_id('joinPrivateGame');`
    }));    

	create_new_modal({
		modal_id: 'joinPrivateGame',
		modal_type: 'generic_confirm',
		prompt: "enter game key",
		textbox: "secretkey",
		actionsArray: actionsArray,
		placeholder: "secret-key-example"
	});

}

function joinPrivate(pkey)
{
   
	if (typeof pkey === 'undefined')
	{	
		const txtKey = id("secretkey");
		pkey = txtKey.value;
//		alert(pkey)
	}

	clog("Joining a private game with " + pkey, 3);

	/*let modal_content = gen_win_icon_markup({prompt: "good job"});

	modal_replace_content({
		modal_id: "joinPrivateGame",
		new_markup: modal_content,
		callback: null
	});*/

	clear_modal_by_id("joinPrivateGame"); // have to handle this a little more elegantly but ok for now

	const payload = {
		"method": "joinPrivate",
		"clientId": clientId,
		"nick": nick,
		"key": pkey
	}
    send(payload);
}


function join(gameId)
{
	/*if (!gameId)
	{
		gameId = txtGameId.value;
	}*/
	//gameId = gameId_candidate

	const payload = {
		"method": "join",
		"clientId": clientId,
		"nick": nick,
		"gameId": gameId
	}
  send(payload);
}

function castVote(ownerId)
{
	clear_modal_by_id("vote")
	const payload = {
		"method": "castVote",
		"gameId": gameId,
		"clientId" : clientId,
		"ownerId": ownerId
	}
	send(payload);		
}


function createGame()
{
	   let actionsArray = [];       
	   
	   actionsArray.push(new actionItem({
	      label:`public`,
	      action:`clear_modal_by_id('createNewGame');create(false)`
	    }));

	   actionsArray.push(new actionItem({
	      label:`private`,
	      action:`clear_modal_by_id('createNewGame');create(true)`
	    }));	

      create_new_modal({
        modal_id:"createNewGame",
        modal_type: "generic_confirm",
        detail_text: "Which kind of game? <span class='bold olive'>Public games</span> are visible from the lobby and anyone can join them.  <span class='bold olive'>Private games</span> need a key or direct link to join and are usually for friends.",
        prompt: `create a new game`,
        actionsArray: actionsArray
  	  });
}

function create(isPrivate)
{

	//let nick = id("txtNick").value;
	//if (!nick) 
		//nick = "Default Host";

	const payload = {
		"method": "create",
		"host" : nick,
		"clientId": clientId,
		"isPrivate": isPrivate
	}
	send(payload);	
}


function chat(message)
{
 	

    	const payload = {
    		"method": "chatmsg",
    		"clientId": clientId,
    		"nick": nick,
    		"message": message,
    		"gameId": gameId
    	}

    	send(payload);
}