const http = require("http");
const express = require("express")
const app = express();
app.listen(9091, () => console.log("listening on 9091"));
app.use(express.static('public'))
app.get("/", (req, res) => res.sendFile(__dirname + "/index.html"));

const websocketServer = require("websocket").server
const httpServer = http.createServer();

httpServer.listen(9090, () => console.log("Listening on port 9090"));
const wsServer = new websocketServer({
	"httpServer": httpServer
});
 

const clients = {};
const games = {};



wsServer.on("request", request => {
	// this is the connect!
	const connection = request.accept(null, request.origin);
	// connected, cool, make an id
	connection.on("open", () => console.log("connection opened"));
	connection.on("close", () => console.log("connection closed"));
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
			dm(clientId, "VOTE RECORDED");
			game.clients[clientId].vote = ownerId;
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
				console.log(game.clients[clientId].play)			
				game.clients[clientId].play = play;
				console.log(game.clients[clientId].play)
				dm(clientId, "ANSWER RECEIVED")
			}
			else
			{
				dm(clientId, "lol too late");
				//console.log("tried to submit an answer outside of time")
			}	
			//chat(game, clientId, nick, result.message)
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
				"clientId" : clientId,
				"scoreRound" : 0,
				"scoreTotal" : 0,
				"votesReceived" : 0,
				"won": false,
				"selfVoted" : false,
				"didNotVote" : false,
				"play" : null,
				"vote" : null
			}*/

			console.log(game)

			const payload = {
				"method" : "join",
				"game" : game
			}

			console.log(typeof game.clients)
			//console.log(game.clients.length);
			game.clients.forEach (c => {
				//console.log("c")
				console.log(JSON.stringify(c));
				clients[c.clientId].connection.send(JSON.stringify(payload));
			})
		}
	})

	//generate new clientid
	const clientId = guid();
	clients[clientId] = {
		"connection": connection
	}

	//console.log("CLIENTS")
	//console.log(clients);

	const payload = {
		"method" : "connect",
		"clientId" : clientId
	}
	// send back to client
	connection.send(JSON.stringify(payload));
	
})

function makeAcronym(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWY';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 		charactersLength));
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
	for (let x = 0; x < 10; x++)
	{
		game.acronyms.push(makeAcronym(randomInt(3, 5)));	
	}		
	game.acceptingAnswers = true;
	startRound(game)
}

function startRound(game)
{

	const payload = {
		"method" : "startRound",
		"round" : game.currentRound,
		"acronym" : game.acronyms[game.currentRound - 1]
	}
	sendAll(game, payload);
	setTimeout(() => {
	  chat(game, null, "", "20 SECONDS LEFT")
		setTimeout(() => {
		  chat(game, null, "", "10 SECONDS LEFT")
			setTimeout(() => {
			  chat(game, null, "", "5")
				setTimeout(() => {
				  chat(game, null, "", "4")	
					setTimeout(() => {
					  chat(game, null, "", "3")
					  	setTimeout(() => {
						  chat(game, null, "", "2")
						  	setTimeout(() => {
							  chat(game, null, "", "1")	  	
								setTimeout(() => {
								  cullAnswers(game);				  			  	
								}, 1000);							  		  	
							}, 1000);	  			  	
						}, 1000);					  			  	
					}, 1000);				  			  	
				}, 1000);	 			  	
			}, 10000);	 		  
		}, 10000);	  
	}, 20000);
}

function cullAnswers(game)
{
	console.log("here's all the answers");
	game.clients.forEach (c => {
		var answer = {};
		answer.owner = c.clientId;
		answer.acronym = c.play;
		game.answers.push(answer);
		//console.log(clients[c.clientId].play);
	});
	getVotes(game);
}

function cullVotes(game)
{
	console.log("here's all the votes");
	console.log(game);
	game.clients.forEach (c => {
			//console.log(c);
			if (c.clientId === c.vote)
			{
				console.log("ITS A MATCH");
				//chat(game, null, "", "SELF VOTE BY " + clientId + ", -3 points lol");
				c.selfVoted = true;
				//c.score -= 3;
			}	
			else if (c.vote === null)
			{
				
				console.log("Didn't vote");
				c.didNotVote = true;
				//chat(game, null, "", clientId + "didn't vote, -3 points lol");
				//c.score -= 3;
			}
			else
			{
				game.clients[c.vote].votesReceived += 1;
			}	
	});
	calculateRoundResult(game);
	reportRoundResult(game); 
	reportScore(game);
	endRound(game);
}

function calculateRoundResult(game)
{

	game.clients.forEach (c => {
		let adjuster = c.selfVoted || c.didNotVote ? -6 : 0;
		c.roundScore = (c.votesReceived * 5) - adjuster;
	});

}

function reportRoundResult(game)
{
	let result = [];
	game.clients.forEach (c => {
		if (result.length == 0)
		{
			result.push({
				"acronym": c.play,
				"votesReceived" : c.votesReceived,
				"didNotVote" : c.didNotVote,
				"selfVoted" : c.selfVoted,
				"roundScore" : c.roundScore
			})
		}
		else
		{
			if (c.votesReceived > result[0].votesReceived)
			{
				result.unshift({
					"acronym": c.play,
					"votesReceived" : c.votesReceived,
					"didNotVote" : c.didNotVote,
					"selfVoted" : c.selfVoted,
					"roundScore" : c.roundScore
				})
			} else
			{
				result.push({
					"acronym": c.play,
					"votesReceived" : c.votesReceived,
					"didNotVote" : c.didNotVote,
					"selfVoted" : c.selfVoted,
					"roundScore" : c.roundScore
				})
			}	
		}	
	});
	const payload = {
		"method" : "reportRoundResult",
		"roundResult": JSON.stringify(result)
	}	
	sendAll(game, payload);	
}

function reportScore()
{
	
}

function endRound()
{
	
}


function getVotes(game)
{
	//chat(game, null, "", "ROUND FINISHED. YOU HAVE 30 seconds to vote for the best one")
	game.acceptingAnswers = false;								 
	const payload = {
		"method" : "getVotes",
		"answers": JSON.stringify(game.answers)
	}
	sendAll(game, payload);
	setTimeout(() => {
		chat(game, null, "", "10 SECONDS LEFT")
		setTimeout(() => {
			chat(game, null, "", "5")
			setTimeout(() => {
				chat(game, null, "", "4")	
				setTimeout(() => {
					chat(game, null, "", "3")	
					setTimeout(() => {
						chat(game, null, "", "2")
						setTimeout(() => {
							chat(game, null, "", "1")
							setTimeout(() => {
								cullVotes(game);	  			  	
							}, 1000);		  			  	
						}, 1000);		  			  	
					}, 1000);						  			  	
				}, 1000);	  			  	
			}, 1000);		  			  	
		}, 5000);			  			  	
	}, 20000);	
}

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
	game.clients.forEach (c => {
		clients[c.clientId].connection.send(JSON.stringify(payload));
	})
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