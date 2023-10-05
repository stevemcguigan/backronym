const communication = require('./communication.js')
const gameFunctions = require('./gameFunctions.js')

const server = {
	getGames: (client, games) =>
	{
		let publicGames =  Object.fromEntries(
		  Object.entries(games).filter(([gameKey, game]) => !game.key  && game.joinable && !game.inProgress)
		  		.map(([gameKey, game]) => [gameKey, { id: game.id, clients: game.clients, hostId: game.hostId, hostname: game.hostname }])
		);
		const payload = {
			"method": "getGames",
			"games" : publicGames
		}
		communication.send(client, payload);			
	},
	localId: (clients, clientLocals, games, result) =>
	{
		// this is in case the socket is dropped, which is likely because people will background the 
		// browser to answer texts etc. 
		// the server issues a clientId but the client generates it's own guid as well. As soon as 
		// a connection is made, server will store a relationship so that on reconnect it can find
		// which game you were playing before and reconnect you to it seamlessly
		const clientId = result.clientId; 
		const localId = result.localId;	
		if (clientLocals[localId]) { 
			let oldClient = clients[clientLocals[localId]];
			let newClient = clients[clientId];
			try {
				newClient.currentGameInfo = JSON.parse(JSON.stringify(oldClient.currentGameInfo));
				let gameId = newClient.currentGameInfo.gameId;
				let game = games[gameId];
				if (game.joinable)
				{
					for (let x = 0; x < game.clients.length; x++)
					{
						if (game.clients[x].clientId == clientLocals[localId])
							game.clients.splice(x, 1);
					} 
					game.clients.push({
						"clientId" : clientId,		
					});	
					clientLocals[localId] = clientId;
					if (game.hostId == oldClient.currentGameInfo.clientId)
					{	
						game.hostId = clientId;
						game.hostname = clients[clientId].currentGameInfo.nick
						clients[clientLocals[localId]].currentGameInfo.clientId = clientId;
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
					communication.send(clients[clientId], payload)
				} else {
					clog("Lobby reconnect.", 4)
					clientLocals[localId] = clientId;				
				}						
			} catch {
				clog("Lobby reconnect.", 4)
				clientLocals[localId] = clientId;
			}		
		} else {
			clientLocals[localId] = clientId;
		}		
	},
	closeConnection: (clients, games, connection, keys) =>
	{
		clog("Connection closed.", 4);
		clients[connection.clientId].connected = false;
		//console.log(clients, JSON.stringify(games), connection, keys)
		setTimeout(() => {
			//console.log("TRYING TO CLEAR OUT GAME")
			//console.log("connection.clientid " + connection.clientId)
			//console.log("clients[connection.clientId] " + JSON.stringify(clients[connection.clientId]))
			//console.log("games[clients[connection.clientId].currentGameInfo.gameId] " + JSON.stringify(games[clients[connection.clientId].currentGameInfo.gameId]))
			//gameFunctions.cullDeadClientsFromGame(clientGame, connection.clientId);
			try {
				var clientGame = games[clients[connection.clientId].currentGameInfo.gameId];
				gameFunctions.cullDeadClientsFromGame(clientGame, connection.clientId, games, keys);
				clog("Dead client culled from game " + clients[connection.clientId].currentGameInfo.gameId, 3)
			} catch {
				clog("dead client was not in a game. clean break. (Or try/catch saved from an error, which would be sloppy.)", 3)
			}			
		}, 5000);		
	}
}
module.exports = server