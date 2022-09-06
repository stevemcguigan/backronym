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
				gameFunctions.cullDeadClientsFromGame(clientGame, connection.clientId);
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
			gameFunctions.create(clients, keys, games, result)
		}

		if(result.method === "chatmsg")
		{
 			communication.chat(clients, games[result.gameId], result)
		}

		if(result.method === "castVote")
		{
			gameFunctions.castVote(clients, games[result.gameId], result)
		}		

		if(result.method === "exit")
		{
			gameFunctions.exit(clients, result.clientId, games[result.gameId], keys)
		}	

		if(result.method === "play")
		{
			gameFunctions.play(clients, games[result.gameId], result)
		}		
   
		if(result.method === "start")
		{
			gameFunctions.start(clients, games[result.gameId], result);
		} 
		if(result.method === "joinPrivate")
		{
			gameFunctions.privateJoin(clients, keys, result)
		}	
		if(result.method === "join")
		{	
			gameFunctions.join(games[result.gameId], result.gameId, clients, clients[result.clientId], result.clientId, result.nick);
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






