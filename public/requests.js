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
	const payload = {
		"method": "localId",
		"clientId": clientId,
		"localId": user.localId
	}
    send(payload);		
}

function pong()
{
	let newid = guid();
	const payload = {
		"method": "pong",
		"clientId": clientId,
		"pongid" : newid
	}
    send(payload);	
    idToExpect = newid;
}

function checkPingResponse()
{
	if (idWeGot == idToExpect)
	{
		console.log("Ping? Pong!")
	} else {
		console.log("lost socket, browser was prob backgrounded. Refreshing.")
		location.reload();
	}	
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




function joinPrivatePrompt()
{

	let actionsArray = [];

    actionsArray.push(new actionItem({
      label:`ok`,
      action: `joinPrivate();`
    }));

    actionsArray.push(new actionItem({
      label:`cancel`,
      action: `clear_modal_by_id("joinPrivateGame");`
    }));    

	create_new_modal({
		modal_id: 'joinPrivateGame',
		modal_type: 'generic_confirm',
		prompt: "game key",
		detail_text: "enter the three word key for the private game you're trying to join",
		textbox: "secretkey",
		actionsArray: actionsArray,
		placeholder: "secret-key-example"
	});

}

function joinPrivate()
{

	const txtKey = id("secretkey");
	let key = txtKey.value;

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
		"key": key
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
        prompt: `create new game`,
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
    	/*if (gameId === null)
    	{
    		alert("no game joined, can't send chat")
    		return;
    	}*/

    	//const nick = id("txtNick").value;
    	

    	const payload = {
    		"method": "chatmsg",
    		"clientId": clientId,
    		"nick": nick,
    		"message": message,
    		"gameId": gameId
    	}

    	send(payload);
}