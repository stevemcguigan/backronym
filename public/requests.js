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
		console.log("round tripped a guid, heart is beating")
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


function create()
{
	//let nick = id("txtNick").value;
	//if (!nick) 
		//nick = "Default Host";

	const payload = {
		"method": "create",
		"host" : nick,
		"clientId": clientId
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