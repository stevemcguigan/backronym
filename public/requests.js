// if you want something from the server, ask here

function getGames()
{
	const payload = {
		"method": "getGames",
		"clientId": clientId
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