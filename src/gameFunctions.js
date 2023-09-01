const butils = require('./butils.js')
const communication = require('./communication.js')
const dictionary = require('./dictionary.js')
const gameFunctions = {
	create: (clients, keys, games, result) =>
	{
		const clientId = result.clientId;
		const host = result.host;
		const isPrivate = result.isPrivate;
		let key = "";
		const gameId = butils.guid();
		if (isPrivate)
		{	
			for (let x = 0; x < 3; x++)
			{
				x ? key += "-" + dictionary.getRandomWord() : key = dictionary.getRandomWord();
			}	
			keys[key] = gameId; 

		} else {
			key = false
		}	
		console.log(`the game is private? ${isPrivate}. the KEY is ${key}`);

		games[gameId] = {
			"id": gameId,
			"hostId": clientId,
			"hostname": host,
			"key": key,
			"inProgress" : false,
			"clients": [],
			"acronyms": [],
			"currentRound": 1,
			"roundTimer" : null,
			"acceptingAnswers" : false,
			"answers": [],
			"joinable": true
		}

		const payload = {
			"method": "create",
			"game" : games[gameId]
		}

		communication.send(clients[clientId], payload)
		/*const con = clients[clientId].connection;
		con.send(JSON.stringify(payload));*/
	},
	join: (game, gameId, clients, client, clientId, nick) =>
	{
		game.clients.push({
			"clientId" : clientId,		
		});
		clients[clientId].currentGameInfo = {
			"gameId" : gameId,
			"nick" : nick,
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
		const payload = {
			"method" : "join",
			"game" : game
		}
		communication.send(client, payload);
		communication.broadcast(clients, game, `${nick} joined. say hi!`);
	},
	privateJoin: (clients, keys, result) =>
	{
		if (keys[result.key] !== undefined) {
			privategameId = keys[result.key];
			console.log(`${result.key} found with id ${privategameId}`);
		} else {
			console.log("no game found with key " + result.key)
			privategameId = false;
		}
			
		gameFunctions.privateJoinWinFail(clients[result.clientId], privategameId)
	},
	privateJoinWinFail: (client, gameId) =>
	{
		const payload = {
			"method" : "privateJoinWinFail",
			"privategameId": gameId
		}
		communication.send(client, payload)
	},
	makeAcronym: (length) =>
	{
	    let result           = '';
	    let characters       = 'AAAABBBCCCDDDDEEEEFFFFGGGGHHHIIIIIJKLLLLMMMMMNNNNNNOOOOPPPPPQRRRRRRSSSSSSSTTTTTTUUVVWWWXYYYZ';
	    let charactersLength = characters.length;
		    for ( var i = 0; i < length; i++ ) {
		      a = characters.charAt(Math.floor(Math.random() * 
		 		charactersLength));
		      result += a; //characters.charAt(Math.floor(Math.random() * 
		 		//charactersLength));
			}
		return result;  
	},
	castVote: (clients, game, result) =>
	{
		const clientId = result.clientId;
		const ownerId = result.ownerId;
		const gameId = result.gameId;
		console.log("**** cast vote");
		console.log(result);
		communication.dm(clients, clientId, "vote received.");
		clients[clientId].currentGameInfo.vote = ownerId;		
	},
	play: (clients, game, result) =>
	{
		const clientId = result.clientId;
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
			communication.dm(clientId, "sorry, round is over!");
		}	
	},
	start: (clients, game, result) =>
	{
		gameFunctions.setup(game);
		gameFunctions.startRound(clients, game);
	},
	setup: (game) => 
	{
		game.inProgress = true;
		for (let x = 0; x < 7; x++)
		{
			var min, max;
			let outlier = butils.randomInt(1,100);
			if (outlier < 33) {
				min = 2;
				max = 5;
			} else {
				min = 3;
				max = 4;
			}
			game.acronyms.push(gameFunctions.makeAcronym(butils.randomInt(min, max)));	
		}				
	},
	startRound: (clients, game) =>
	{
		let long = 100
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
				  communication.warning(clients, game, "<span id='counter'>5</span>") 
				  	setTimeout(() => {
						  gameFunctions.cullAnswers(clients, game) 			  	
					}, 50 * long);			  	
				}, 100 * long);	 		  
			}, 150 * long);	  
		}, 300 * long);
	},
	cullAnswers: (clients, game) =>
	{
		console.log("here's all the answers");
		let totalAnswers = 0;
		game.clients.forEach (c => {
			if (clients[c.clientId].currentGameInfo.play)
				totalAnswers++;
			var answer = {
				owner: c.clientId,
				acronym: clients[c.clientId].currentGameInfo.play
			};
			game.answers.push(answer);
			
		});
		console.log(game.answers)

		if (totalAnswers > 1)
		{
			gameFunctions.getVotes(clients, game);
		} else {
			gameFunctions.skipVoting(clients, game)
		}
	},
	getVotes: (clients, game) =>
	{
		let long = 10
		communication.broadcast(clients, game, "30 seconds to vote");
		game.acceptingAnswers = false;								 
		const payload = {
			"method" : "getVotes",
			"answers": JSON.stringify(game.answers)
		}
		communication.sendAll(clients, game, payload);
		setTimeout(() => {
			communication.warning(clients, game, "<span id='counter'>5</span>") 
			setTimeout(() => {
				gameFunctions.cullVotes(clients, game);	  			  		  			  	 			  		  			  	
			}, 550 * long);			  			  	
		}, 2450 * long);	
	},
	skipVoting: (clients, game) =>
	{
		game.acceptingAnswers = false;	
	  
		let answers = [];
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
		gameFunctions.endRound(clients, game);
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
			gameFunctions.endGame(clients, game, score[0]);
		}	
		else
		{
			communication.broadcast(clients, game, "next round starts in 30 seconds")
			setTimeout(() => {
				gameFunctions.startRound(clients, game);			  			  	
			}, 30000);				
		}		
	},
	cullVotes: (clients, game) =>
	{
		game.clients.forEach (c => {
			if (c.clientId === clients[c.clientId].currentGameInfo.vote)
			{
				clients[c.clientId].currentGameInfo.selfVoted = true;
			}	
			else if (clients[c.clientId].currentGameInfo.vote === null)
			{
				clients[c.clientId].currentGameInfo.didNotVote = true;
			}
			else
			{
				let voter = clients[c.clientId];
				let votee = clients[voter.currentGameInfo.vote]
				votee.currentGameInfo.votesReceived += 1;
			}	
		});
		gameFunctions.calculateRoundResult(clients, game);
		gameFunctions.reportRoundResult(clients, game); 
		gameFunctions.endRound(clients, game);
		let score = gameFunctions.reportScore(clients, game);
		gameFunctions.advanceOrEnd(clients, game, score);		
	},
	calculateRoundResult: (clients, game) =>
	{
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
	},
	reportRoundResult: (clients, game) =>
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
	},	
	endRound: (clients, game) =>
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
	},
	reportScore: (clients, game) =>
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
		console.log("score before sort")
		console.log(score);
		score.sort((a, b) => (parseInt(a.score,10) < parseInt(b.score, 10)) ? 1 : -1);
		console.log("score after sort")
		console.log(score);			
		const payload = {
			"method" : "reportScore",
			"score": JSON.stringify(score)
		}
		communication.sendAll(clients, game, payload);	
		return score;	
	},	
	advanceOrEnd: (clients, game, score) =>
	{
		if (game.currentRound >= game.acronyms.length)
		{
			gameFunctions.endGame(clients, game, score[0]);
		}	
		else
		{
			communication.broadcast(clients, game, "next round starts in 30 seconds")
			setTimeout(() => {
				gameFunctions.startRound(clients, game);			  			  	
			}, 30000);				
		}
	},
	endGame: (clients, game, winner) =>
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
		game.joinable = false;
		game.currentRound = 1;
		game.acronyms = [];		
	},
	checkIfGameIsDead: (game, games, keys) =>
	{
		if (game.clients.length < 1)
			gameFunctions.killGame(game, games, keys);			
	},
	killGame: (games, game, keys) =>
	{
		if (game.key)
			delete keys[game.key];    // if the game is private, find its entry in the master list of private keys and kill it

		delete games[game.id];       // then kill the game itself
	},
	exit: (clients, clientId, game, games, keys) =>
	{
		const client = clients[clientId];
		const payload = {
			"method" : "exitSuccess"
		}
		gameFunctions.cullDeadClientsFromGame(game, clientId, games, keys);
		communication.send(client, payload);
		communication.broadcast(clients, game, `${client.currentGameInfo.nick} left.`)  
		gameFunctions.resetPlayer(clients[clientId]);

		if (game.hostId == clientId)
		{
			game.joinable = false;
			console.log("host exited, aborting game");	
			communication.broadcast(clients, game, "host left. exiting in 5 seconds!")	
			communication.warning(clients, game, "5")						
			setTimeout(() => {
				for (let x = 0; x < game.clients.length; x++)
				{
					gameFunctions.resetPlayer(clients[game.clients[x].clientId]);
				}					
				communication.sendAll(clients, game, payload);
				gameFunctions.killGame(game, games, keys);		
			}, 5000 );	
		}	
	},
	cullAllClients: (game) =>
	{
		game.clients.length = 0;
	},
	cullDeadClientsFromGame: (game, clientId, games, keys) =>
	{
		for (let x = 0; x < game.clients.length; x++)
		{
			if (game.clients[x].clientId == clientId)
			{
				game.clients.splice(x, 1); // found the client to cull
				gameFunctions.checkIfGameIsDead(game, games, keys); // check to see if they were the only one left, and the game needs to die
			}	
		}
	},
	resetPlayer: (client) =>
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
	}
}

module.exports = gameFunctions