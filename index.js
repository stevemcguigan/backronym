// this is where the server manages requests and sends responses

const http = require("http");
const express = require("express")
const app = express();
const dictionary = require('dictionary')
const utils = require('utils')
const parser = require('parser')
const communication = require('communication')

// vvv this one goes in ngrok & browser


/*app.get('/', async function(req, res) {

    // Access the provided 'page' and 'limt' query parameters 
    let autojoin = req.query.gameId;
   console.log(autojoin);
   console.log(connection.clientId);
});*/


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
const keys = {};

wsServer.on("request", request => {
	// this is the connect!
	const connection = request.accept(null, request.origin);
	// connected, cool, make an id
	connection.on("open", () => {
		console.log("connection opened");
	});
	connection.on("close", () => {
		console.log("connection closed");
		//console.log(connection);
		clients[connection.clientId].connected = false;
		setTimeout(() => {
			try {
				var clientGame = games[clients[connection.clientId].currentGameInfo.gameId];
				cullDeadClientsFromGame(clientGame, connection.clientId);
			} catch {
				console.log("dead client was not in a game. clean break.")
			}			
		}, 10000);		
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
			//console.log("got a pong back");
			//console.log(result)
			ping(result.clientId, result.pongid);
		}	

		if(result.method === "create")
		{
			// user requests new game		
			gameId = parser.create(games, result)
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
			communication.chat(clients, game, clientId, nick, result.message)
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

		if(result.method === "exit")
		{
			const clientId = result.clientId;
			const gameId = result.gameId;
			const game = games[gameId];
			const payload = {
				"method" : "exitSuccess"
			}

			cullDeadClientsFromGame(game, clientId);
			clients[clientId].connection.send(JSON.stringify(payload));
			broadcast(game, `${clients[clientId].currentGameInfo.nick} left.`)  
			resetPlayer(clients[clientId]);

			if (game.hostId == clientId)
			{
				game.joinable = false;
				console.log("host exited, aborting game");	
				broadcast(game, "host left. exiting in 10 seconds!")						
				setTimeout(() => {
					for (let x = 0; x < game.clients.length; x++)
					{
						resetPlayer(clients[game.clients[x].clientId]);
					}					
					sendAll(game, payload);
					killGame(game);		
				}, 10000);	
			}	
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
				console.log(`*******************`)
				console.log("");
				console.log(`looks like the connection was probably interupted!`)
				console.log(`old client id: ${clientLocals[localId]}`)
				console.log(`new client id: ${clientId}`)
				let oldClient = clients[clientLocals[localId]];
				let newClient = clients[clientId];
				try {
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
					clientLocals[localId] = clientId;
					if (game.hostId == oldClient.currentGameInfo.clientId)
					{	
						console.log("This client was the host! fixing by changing game.hostId from " + game.hostId + " to " + clientId);
						game.hostId = clientId;
						game.hostNick = clients[clientId].currentGameInfo.nick
						console.log("oldclient game cid: "+ clients[clientLocals[localId]].currentGameInfo.clientId)
						clients[clientLocals[localId]].currentGameInfo.clientId = clientId;
						console.log("oldclient game cid after update: "+ clients[clientLocals[localId]].currentGameInfo.clientId)
						//clients[clientLocals[localId]] = clientId;
					}
					else 
					{
						console.log("this client wasn't the host?")
						console.log(game.hostId);
						console.log(oldClient.currentGameInfo.clientId);
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
					/*console.log("trying to seamlessly re-insert player into game, cross your fingers")	
					console.log(`after reinsert:`)
					console.log(game.clients);*/							
					clients[clientId].connection.send(JSON.stringify(payload));						
				} catch {
					console.log("something went really wrong on a reconnect attempt, trying to recover gracefully")
					clientLocals[localId] = clientId;
				}
				
				
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
   

		if(result.method === "joinPrivate")
		{
			//console.log("received a request to join a private game with key " + result.key);
			/*if (keys[result.key] !== undefined) {
				privategameId = keys[result.key];
				console.log(`${result.key} found with id ${privategameId}`);
			} else {
				console.log("no game found with key " + result.key)
				privategameId = false;
			}
			
			privateJoinWinFail(result.clientId, privategameId)*/
			privateJoin(result)
		}	

		if(result.method === "join")
		{
			//console.log("RESULT")
			//console.log(result)
			const clientId = result.clientId;
			const gameId = result.gameId;
			const game = games[gameId];
			//console.log("GAMEf")
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

			//console.log(game)

			const payload = {
				"method" : "join",
				"game" : game
			}

				clients[clientId].connection.send(JSON.stringify(payload));
				communication.broadcast(game, `${result.nick} joined. say hi!`);
			//})
		}
	})

	//generate new clientid
	const clientId = utils.guid();
	connection.clientId = clientId;
	clients[clientId] = { "connected" : true,
		"connection": connection
	}

	const payload = {
		"method" : "connect",
		"clientId" : clientId
	}
	// send back to client
	connection.send(JSON.stringify(payload));

	
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
    var characters       = 'AAAABBBCCCDDDDEEEEFFFFGGGGHHHIIIIIJKLLLLMMMMMNNNNNNOOOOPPPPPQRRRRRRSSSSSSSTTTTTTUUVVWWWXYYYZ';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      a = characters.charAt(Math.floor(Math.random() * 
 		charactersLength));
      result += a; //characters.charAt(Math.floor(Math.random() * 
 		//charactersLength));
   }
   return result;
}





function setup(game)
{
	game.inProgress = true;
	for (let x = 0; x < 7; x++)
	{
		var min;
		var max;
		let outlier = utils.randomInt(1,100);
		if (outlier < 33) {
			min = 2;
			max = 5;
		} else {
			min = 3;
			max = 4;
		}
		game.acronyms.push(makeAcronym(utils.randomInt(min, max)));	
	}		
	startRound(game)
}

function startRound(game)
{
	//console.log(game);
	if (game.clients.length == 0)
	{
		delete game;
		return;
	}		
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

	if (game.answers.length > 1)
	{
			getVotes(game);
	}	else {
			skipVoting(game)
	}
}

function skipVoting(game)
{

	//broadcast(game, null, "", "30 seconds to vote");
	game.acceptingAnswers = false;	
  
  var answers = [];
  for (var x = 0; x < game.answers.length; x++)
  {
  	answers.push({
  				nick: clients[game.answers[x].owner].currentGameInfo.nick,
  				owner: game.answers[x].owner,
  				acronym: game.answers[x].acronym
  	});
  }	
	const payload = {
		"method" : "skipVoting",
		"answers": JSON.stringify(answers)
	}
	sendAll(game, payload);
	endRound(game);
	if (game.currentRound >= game.acronyms.length)
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
		endGame(game, score[0]);
	}	
	else
	{
		broadcast(game, "next round starts in 30 seconds")
		setTimeout(() => {
			startRound(game);			  			  	
		}, 30000);				
	}	
	/*setTimeout(() => {
		warning(game, "<span id='counter'>5</span>") 
		setTimeout(() => {
			cullVotes(game);	  			  		  			  	 			  		  			  	
		}, 5500);			  			  	
	}, 24500);	*/
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

function resetPlayer(client)
{
		client.currentGameInfo.gameId = null;
		client.currentGameInfo.roundScore = 0;
		client.currentGameInfo.scoreTotal = 0;
		client.currentGameInfo.votesReceived = 0;
		client.currentGameInfo.won = false;
		client.currentGameInfo.selfVoted = false;
		client.currentGameInfo.didNotVote = false;
		client.currentGameInfo.play = null;
		client.currentGameInfo.vote = null;
	/* = {
			"gameId" : null,
			"roundScore" : 0,
			"scoreTotal" : 0,
			"votesReceived" : 0,
			"won": false,
			"selfVoted" : false,
			"didNotVote" : false,
			"play" : null,
			"vote" : null
	}*/
}



function getVotes(game)
{
	broadcast(game, "30 seconds to vote");
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


function privateJoin(result)
{
	if (keys[result.key] !== undefined) {
				privategameId = keys[result.key];
				console.log(`${result.key} found with id ${privategameId}`);
			} else {
				console.log("no game found with key " + result.key)
				privategameId = false;
			}
			
			privateJoinWinFail(result.clientId, privategameId)
}

function privateJoinWinFail(clientId, privategameId)
{

	const payload = {
		"method" : "privateJoinWinFail",
		"privategameId": privategameId
	}
	clients[clientId].connection.send(JSON.stringify(payload));
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


//****** UTILS

function killGame(game)
{
console.log("Trying to kill " + game.id)	
console.log("keys before delete: " + JSON.stringify(keys));	
console.log("games before delete: " + JSON.stringify(games));	

	if (game.key)
		delete keys[game.key];

	delete games[game.id];

console.log("keys after delete: " + JSON.stringify(keys));		
console.log("games after delete: " + JSON.stringify(games));		 
}


function checkIfGameIsDead(game)
{
	//console.log("is game dead? ")
	if (game.clients.length < 1)
		killGame(game);			
}



function cullAllClients(game)
{

	game.clients.length = 0;
}


function cullDeadClientsFromGame(game, clientId)
{
	for (let x = 0; x < game.clients.length; x++)
	{
		if (game.clients[x].clientId == clientId)
		{
			console.log("******")
			console.log(game.clients);
			console.log("found a dead client in the game, culling");	
			game.clients.splice(x, 1);
			console.log("after cull: " + game.clients);
			checkIfGameIsDead(game);
		}	
	}
}	








