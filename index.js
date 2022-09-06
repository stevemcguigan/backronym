// this is where the server manages requests and sends responses

const http 					= require("http");
const express 			= require("express")
const app 					= express();
const dictionary 		= require('dictionary')
const utils 				= require('utils')
const gameFunctions = require('gameFunctions')
const communication = require('communication')
const server 				= require('server')

app.listen(8000, () => console.log("listening on 8000"));
app.use(express.static('public'))
app.get("/", (req, res) => res.sendFile(__dirname + "/index.html"));

const websocketServer = require("websocket").server
const httpServer 			= http.createServer();

// vvv this one goes in parser.js
httpServer.listen(9090, () => console.log("Listening on port 9090"));
const wsServer = new websocketServer({
	"httpServer": httpServer
});

const clients 			= {};
const clientLocals 	= {};
const games 				= {};
const keys 					= {};

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
			server.getGames(clients[clientId], games)
		}	

		if(result.method === "localId")
		{
			server.localId(clients, clientLocals, games, result)
		}

		if(result.method === "create")
		{
			// user requests new game		
			gameFunctions.create(clients, games, result)
		}

		if(result.method === "chatmsg")
		{
 			communication.chat(clients, games[result.gameId], result)
		}

		if(result.method === "castVote")
		{
			gameFunctions.castVote(clients, games[result.gameId], result)
			/*
			const clientId = result.clientId;
			const ownerId = result.ownerId;
			const gameId = result.gameId;
			const game = games[gameId];
			console.log("**** cast vote");
			console.log(result);
			communication.dm(clients, clientId, "vote received.");
			clients[clientId].currentGameInfo.vote = ownerId;
			//console.log(clients[clientId]);*/
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
			communication.broadcast(clients, game, `${clients[clientId].currentGameInfo.nick} left.`)  
			resetPlayer(clients[clientId]);

			if (game.hostId == clientId)
			{
				game.joinable = false;
				console.log("host exited, aborting game");	
				communication.broadcast(clients, game, "host left. exiting in 10 seconds!")						
				setTimeout(() => {
					for (let x = 0; x < game.clients.length; x++)
					{
						resetPlayer(clients[game.clients[x].clientId]);
					}					
					communication.sendAll(clients, game, payload);
					killGame(game);		
				}, 10000);	
			}	
		}	

		if(result.method === "play")
		{
			gameFunctions.play(clients, games[result.gameId], result)
			/*const clientId = result.clientId;
			const gameId = result.gameId;
			const game = games[gameId];
			if (game.acceptingAnswers)
			{	
				const play = result.play;
				if (clients[clientId].currentGameInfo.play == null) {
					communication.broadcast(clients, game, "someone answered.")
				} else {
					communication.broadcast(clients, game, "someone changed their answer.")
				}
				clients[clientId].currentGameInfo.play = play;
			}
			else
			{
				dm(clientId, "too late.");
				//console.log("tried to submit an answer outside of time")
			}	
			//chat(game, clientId, nick, result.message)
			*/
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
				communication.broadcast(clients, game, `${result.nick} joined. say hi!`);
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


/*
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
*/


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
		game.acronyms.push(gameFunctions.makeAcronym(utils.randomInt(min, max)));	
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
	communication.sendAll(clients, game, payload);
	setTimeout(() => {
	  communication.broadcast(clients, game, "30 seconds left.")
		setTimeout(() => {
		  communication.broadcast(clients, game, "15 seconds. it's more than it sounds.")
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
	communication.sendAll(clients, game, payload);
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
		communication.broadcast(clients, game, "next round starts in 30 seconds")
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
	communication.sendAll(clients, game, payload);	
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

	communication.sendAll(clients, game, payload);	

	if (game.currentRound >= game.acronyms.length)
	{
		endGame(game, score[0]);
	}	
	else
	{
		communication.broadcast(clients, game, "next round starts in 30 seconds")
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

	communication.sendAll(clients, game, payload);	

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
	communication.broadcast(clients, game, "30 seconds to vote");
	game.acceptingAnswers = false;								 
	const payload = {
		"method" : "getVotes",
		"answers": JSON.stringify(game.answers)
	}
	communication.sendAll(clients, game, payload);
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
	communication.sendAll(clients, game, payload)
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








