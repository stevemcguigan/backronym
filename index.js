// this is where the server manages requests and sends responses

const http = require("http");
const express = require("express")
const app = express();

// vvv this one goes in ngrok & browser
app.listen(8000, () => console.log("listening on 8000"));
app.use(express.static('public'))
app.get("/", (req, res) => res.sendFile(__dirname + "/index.html"));

const websocketServer = require("websocket").server
const httpServer = http.createServer();


// vvv this one goes in parser.js
httpServer.listen(9090, () => console.log("Listening on port 9090"));
const wsServer = new websocketServer({
	"httpServer": httpServer
});
 

const clients = {};
const clientLocals = {};
const games = {};

wsServer.on("request", request => {
	// this is the connect!
	const connection = request.accept(null, request.origin);
	// connected, cool, make an id
	connection.on("open", () => {
		console.log("connection opened");
	});
	connection.on("close", () => {
		console.log("connection closed");
	});
	connection.on("message", message => {
	// could fail if client sends bad JSON
	const result = JSON.parse(message.utf8Data);

		if(result.method === "getGames")
		{
			const payload = {
				"method": "getGames",
				"games" : games
			}

			const con = clients[clientId].connection;
			con.send(JSON.stringify(payload));	
		}	

		if(result.method === "pong")
		{
			console.log("got a pong back");
			console.log(result)
			ping(result.clientId, result.pongid);
		}	

		if(result.method === "create")
		{
			// user requests new game
			const clientId = result.clientId;
			const host = result.host;
			const gameId = guid();
			games[gameId] = {
				"id": gameId,
				"hostId": clientId,
				"hostname": host,
				"inProgress" : false,
				"clients": [],
				"acronyms": [],
				"currentRound": 1,
				"roundTimer" : null,
				"acceptingAnswers" : false,
				"answers": []
			}

			const payload = {
				"method": "create",
				"game" : games[gameId]
			}

			const con = clients[clientId].connection;
			con.send(JSON.stringify(payload));

		}

		if(result.method === "chatmsg")
		{
			const clientId = result.clientId;
			const gameId = result.gameId;
			const game = games[gameId];
			const nick = result.nick;
			chat(game, clientId, nick, result.message)
		}

		if(result.method === "castVote")
		{
			const clientId = result.clientId;
			const ownerId = result.ownerId;
			const gameId = result.gameId;
			const game = games[gameId];
			console.log("**** cast vote");
			console.log(result);
			dm(clientId, "vote received.");
			clients[clientId].currentGameInfo.vote = ownerId;
			//console.log(clients[clientId]);
		}		

		if(result.method === "play")
		{
			const clientId = result.clientId;
			const gameId = result.gameId;
			const game = games[gameId];
			if (game.acceptingAnswers)
			{	
				const play = result.play;
	 			console.log("Play received from " + result.clientId); 
				//console.log(game);
				console.log(clients[clientId].currentGameInfo.play)

				if (clients[clientId].currentGameInfo.play == null) {
					//broadcast(game, clients[clientId].currentGameInfo.nick + " answered.")
					broadcast(game, "someone answered.")
				} else {
					broadcast(game, "someone changed their answer.")
					//broadcast(game, clients[clientId].currentGameInfo.nick + " changed their answer.")
				}

				clients[clientId].currentGameInfo.play = play;
				console.log(clients[clientId].currentGameInfo.play)

			}
			else
			{
				dm(clientId, "too late.");
				//console.log("tried to submit an answer outside of time")
			}	
			//chat(game, clientId, nick, result.message)
		}		

		if(result.method === "localId")
		{
			// this is in case the socket is dropped, which is likely because people will background the 
			// browser to answer texts etc. 
			// the server issues a clientId but the client generates it's own guid as well. As soon as 
			// a connection is made, server will store a relationship so that on reconnect it can find
			// which game you were playing before and reconnect you to it seamlessly
			const clientId = result.clientId; 
			const localId = result.localId;
			
			if (clientLocals[localId]) { // move this (And everything else tbh) into function when it works
				console.log(`looks like the connection was probably interupted!`)
				console.log(`old client id: ${clientLocals[localId]}`)
				console.log(`new client id: ${clientId}`)
				let oldClient = clients[clientLocals[localId]];
				let newClient = clients[clientId];
				newClient.currentGameInfo = JSON.parse(JSON.stringify(oldClient.currentGameInfo));
				let gameId = newClient.currentGameInfo.gameId;
				let game = games[gameId];
				// now lets go pluck out that old dead client outta the game and add this new one
				console.log("")
				console.log(`Trying to find and delete ${clientLocals[localId]} from game.clients using key ${localId}`)
				console.log(`before culling old:`)
				console.log(game.clients);
				for (let x = 0; x < game.clients.length; x++)
				{
					if (game.clients[x].clientId == clientLocals[localId])
						game.clients.splice(x, 1);
				}
				console.log(`after:`)
				console.log(game.clients);				
				//delete game.clients[clientLocals[localId]];
				game.clients.push({
					"clientId" : clientId,		
				});	
				if (game.hostId == clientLocals[localId])
				{	
					game.hostId == clientId;
					game.hostNick = clients[clientId].currentGameInfo.nicl
				}	
				for (let x = 0; x < game.answers.length; x++)
				{
					if (game.answers[x].owner == clientLocals[localId])
						game.answers[x].owner = clientId;
				}
				const payload = {
					"method" : "join",
					"game" : game
				}
				console.log("trying to seamlessly re-insert player into game, cross your fingers")	
				console.log(`after reinsert:`)
				console.log(game.clients);							
				clients[clientId].connection.send(JSON.stringify(payload));	
				clientLocals[localId] = clientId;
			} else {
				console.log(`looks like a fresh connection`);
				clientLocals[localId] = clientId;

			}

			//clientLocals[localId] = clientId;
			//checkForReconnect(localId); 
		}
   
		if(result.method === "start")
		{

			const clientId = result.clientId;
			const gameId = result.gameId;
			setup(games[gameId]);
		}
   
		if(result.method === "join")
		{
			console.log("RESULT")
			console.log(result)
			const clientId = result.clientId;
			const gameId = result.gameId;
			const game = games[gameId];
			console.log("GAME")
			//console.log(game);
			game.clients.push({
				"clientId" : clientId,		
			});
			//game.clients[clientId]
			clients[clientId].currentGameInfo = {
				"gameId" : gameId,
				"nick" : result.nick,
				"clientId" : clientId,
				"roundScore" : 0,
				"scoreTotal" : 0,
				"votesReceived" : 0,
				"won": false,
				"selfVoted" : false,
				"didNotVote" : false,
				"play" : null,
				"vote" : null
			}

			console.log(game)

			const payload = {
				"method" : "join",
				"game" : game
			}

			//console.log(typeof game.clients)
			//console.log(game.clients.length);
			//game.clients.forEach (c => { // i think this is where the multiple pops happen when anyone joins, look later
				//console.log("c")
			//	console.log(JSON.stringify(c));
				clients[clientId].connection.send(JSON.stringify(payload));
				broadcast(game, `${result.nick} joined. say hi!`);
			//})
		}
	})



	//generate new clientid
	const clientId = guid();
	clients[clientId] = {
		"connection": connection
	}

	//console.log("CLIENTS")
	console.log(clients);

	const payload = {
		"method" : "connect",
		"clientId" : clientId
	}
	// send back to client
	connection.send(JSON.stringify(payload));


	/*setInterval(() => {
		ping(clientId)
	}, 60000)*/
	
})


function ping(clientId, pongid)
{
	const payload = {
		"method": "ping",
		"pongid": pongid
	}

	const con = clients[clientId].connection;
	con.send(JSON.stringify(payload));	
}

function makeAcronym(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWYZ';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      a = characters.charAt(Math.floor(Math.random() * 
 		charactersLength));
      if (a == "Q" || a == "Z")
      {
      	 if (coinFlip())
      	 {	
	      a = characters.charAt(Math.floor(Math.random() * 
	 		charactersLength));  
	 	 }	    	
      }	
      result += a; //characters.charAt(Math.floor(Math.random() * 
 		//charactersLength));
   }
   return result;
}

function randomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


function setup(game)
{
	game.inProgress = true;
	for (let x = 0; x < 5; x++)
	{
		game.acronyms.push(makeAcronym(randomInt(3, 5)));	
	}		
	startRound(game)
}

function startRound(game)
{

	game.acceptingAnswers = true;
	const payload = {
		"method" : "startRound",
		"round" : game.currentRound,
		"acronym" : game.acronyms[game.currentRound - 1]
	}
	sendAll(game, payload);
	setTimeout(() => {
	  broadcast(game, "30 seconds left.")
		setTimeout(() => {
		  broadcast(game, "15 seconds. it's more than it sounds.")
			setTimeout(() => {
			  warning(game, "<span id='counter'>5</span>") 
			  	setTimeout(() => {
					  cullAnswers(game) 			  	
				}, 5000);			  	
			}, 10000);	 		  
		}, 15000);	  
	}, 30000);
}

function cullAnswers(game)
{
	console.log("here's all the answers");
	game.clients.forEach (c => {
		var answer = {
			owner: c.clientId,
			acronym: clients[c.clientId].currentGameInfo.play
		};
		game.answers.push(answer);
		
	});
	console.log(game.answers)
	getVotes(game);
}

function cullVotes(game)
{
	//console.log("here's all the votes before");
	//console.log(game);
	//console.log(clients);
	game.clients.forEach (c => {
			//console.log(c);
			if (c.clientId === clients[c.clientId].currentGameInfo.vote)
			{
				console.log("ITS A MATCH");
				//chat(game, null, "", "SELF VOTE BY " + clientId + ", -3 points lol");
				clients[c.clientId].currentGameInfo.selfVoted = true;
				//c.score -= 3;
			}	
			else if (clients[c.clientId].currentGameInfo.vote === null)
			{
				
				console.log("Didn't vote");
				clients[c.clientId].currentGameInfo.didNotVote = true;
				//chat(game, null, "", clientId + "didn't vote, -3 points lol");
				//c.score -= 3;
			}
			else
			{
				let voter = clients[c.clientId];
				let votee = clients[voter.currentGameInfo.vote]
				votee.currentGameInfo.votesReceived += 1;
			}	
	});

	console.log(`*****

    `)

	calculateRoundResult(game);
	reportRoundResult(game); 
	endRound(game);
	reportScore(game);
}

function checkForReconnect(localId)
{

}

function calculateRoundResult(game)
{
	console.log("calculating round result")
	game.clients.forEach (c => {
		let player = clients[c.clientId];
		let adjuster = player.currentGameInfo.selfVoted || player.currentGameInfo.didNotVote ? 6 : 0;
		player.currentGameInfo.roundScore = (player.currentGameInfo.votesReceived * 5) - adjuster;
		if (player.currentGameInfo.roundScore < 0)
		{
			player.currentGameInfo.roundScore = 0;	
		}	
		console.log(player.currentGameInfo)
	});

}

function reportRoundResult(game)
{
	let result = [];


	game.clients.forEach (c => {
		let player = clients[c.clientId];
		result.push({
			"nick":             player.currentGameInfo.nick,
			"acronym": 			player.currentGameInfo.play,
			"votesReceived" : 	player.currentGameInfo.votesReceived,
			"didNotVote" : 		player.currentGameInfo.didNotVote,
			"selfVoted" : 		player.currentGameInfo.selfVoted,
			"roundScore" : 		player.currentGameInfo.roundScore
		})
	});	

	const payload = {
		"method" : "reportRoundResult",
		"roundResult": result
	}	
	sendAll(game, payload);	
}


function reportScore(game)
{

	let score = []

	game.clients.forEach (c => {
		let player = clients[c.clientId];
		score.push({
			"clientId": c.clientId,
			"nick" : clients[c.clientId].currentGameInfo.nick,
			"score": clients[c.clientId].currentGameInfo.scoreTotal
		})
	});	
	//score.sort(compare);

	const payload = {
		"method" : "reportScore",
		"score": JSON.stringify(score)
	}

	sendAll(game, payload);	

	if (game.currentRound >= game.acronyms.length)
	{
		endGame(game, score[0]);
	}	
	else
	{
		broadcast(game, "next round starts in 30 seconds")
		setTimeout(() => {
			startRound(game);			  			  	
		}, 30000);			
			
	}	


}

function endRound(game)
{

	game.clients.forEach (c => {
		console.log("ENDING ROUND, ADDING SCORES")
		clients[c.clientId].currentGameInfo.scoreTotal += clients[c.clientId].currentGameInfo.roundScore; 
		clients[c.clientId].currentGameInfo.roundScore = 0;
		clients[c.clientId].currentGameInfo.votesReceived = 0;
		clients[c.clientId].currentGameInfo.didNotVote = false;
		clients[c.clientId].currentGameInfo.selfVoted = false;
		clients[c.clientId].currentGameInfo.play = null;
		clients[c.clientId].currentGameInfo.vote = null;
	});

	game.answers = [];
	game.currentRound++;

}

function endGame(game, winner)
{

	let payload = {
		"method":   "endGame",
		"hostId":   game.hostId,
		"clientId": winner.clientId,
		"nick"  :   clients[winner.clientId].currentGameInfo.nick,
		"score" :   winner.score
	}

	sendAll(game, payload);	

	game.clients.forEach (c => {
			clients[c.clientId].currentGameInfo.scoreTotal = 0;
	});

	game.currentRound = 1;
	game.acronyms = [];		

}


function getVotes(game)
{
	broadcast(game, null, "", "30 seconds to vote");
	game.acceptingAnswers = false;								 
	const payload = {
		"method" : "getVotes",
		"answers": JSON.stringify(game.answers)
	}
	sendAll(game, payload);
	setTimeout(() => {
		warning(game, "<span id='counter'>5</span>") 
		setTimeout(() => {
			cullVotes(game);	  			  		  			  	 			  		  			  	
		}, 5500);			  			  	
	}, 24500);	
}


// **** COMMS

function chat(game, clientId, nick, message)
{
	const payload = {
		"method" : "chatmsg",
		"clientId": clientId, 
		"nick": nick,
		"message": message
	}
	sendAll(game, payload)
}

function broadcast(game, message)
{
	const payload = {
		"method" : "broadcast",
		"message": message
	}
	sendAll(game, payload)
}

function warning(game, message)
{
	const payload = {
		"method" : "warning",
		"message": message
	}
	sendAll(game, payload)
}

function dm(clientId, msg)
{
	const payload = {
		"method" : "dm",
		"message": msg
	}
	console.log("sending " + msg + " to " + clientId);
	clients[clientId].connection.send(JSON.stringify(payload));
}

function sendAll(game, payload)
{
	console.log(game);
	game.clients.forEach (c => {
		clients[c.clientId].connection.send(JSON.stringify(payload));
	})
}


//****** UTILS


function compare( a, b ) {
  if ( a.score< b.score ){
    return -1;
  }
  if ( a.score > b.score ){
    return 1;
  }
  return 0;
}

function coinFlip() {
    return (Math.floor(Math.random() * 2) == 0);
}

function guid() { // Public Domain/MIT
    var d = new Date().getTime();//Timestamp
    var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now()*1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16;//random number between 0 and 16
        if(d > 0){//Use timestamp until depleted
            r = (d + r)%16 | 0;
            d = Math.floor(d/16);
        } else {//Use microseconds since page-load if supported
            r = (d2 + r)%16 | 0;
            d2 = Math.floor(d2/16);
        }
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}