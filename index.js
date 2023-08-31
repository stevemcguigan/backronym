const http 						= require("http");
const express 				= require("express")
const app 						= express();
const dictionary 			= require('./src/dictionary.js')
const butils 					= require('./src/butils.js')
const gameFunctions 	= require('./src/gameFunctions.js')
const communication 	= require('./src/communication.js')
const server 					= require('./src/server.js')
const websocketServer = require("websocket").server
const httpServer 			= http.createServer();
const clients 				= {};
const clientLocals 		= {};
const games 					= {};
const keys 						= {};


app.listen(8000, () => console.log("listening on 8000"));
app.use(express.static('public'))
app.get("/", (req, res) => res.sendFile(__dirname + "/index.html"));

// vvv this one goes in parser.js
httpServer.listen(9090, () => console.log("Listening on port 9090"));
const wsServer = new websocketServer({
	"httpServer": httpServer
});

wsServer.on("request", request => {
	const connection = request.accept(null, request.origin);
	connection.on("open", () => {
	});
	connection.on("close", () => {
		server.closeConnection(clients, games, connection)	
	});
	connection.on("message", message => {
		const result = JSON.parse(message.utf8Data);
		switch (result.method)
		{
			case "getGames":
				server.getGames(clients[clientId], games)
			break;
			case "localId":
				server.localId(clients, clientLocals, games, result)
			break;
			case "chatmsg":
				communication.chat(clients, games[result.gameId], result)
			break;
			case "castVote":
				gameFunctions.castVote(clients, games[result.gameId], result)
			break;
			case "create":
				gameFunctions.create(clients, keys, games, result)
			break;
			case "exit":
				gameFunctions.exit(clients, result.clientId, games[result.gameId], keys)
			break;
			case "play":
				gameFunctions.play(clients, games[result.gameId], result)
			break;
			case "start":
				gameFunctions.start(clients, games[result.gameId], result);
			break;
			case "joinPrivate":
				gameFunctions.privateJoin(clients, keys, result)
			break;
			case "join":
				gameFunctions.join(games[result.gameId], result.gameId, clients, clients[result.clientId], result.clientId, result.nick);
			break;
			default:
				console.log("invalid method: " + result.method)
			break;
		}
	})

	//generate new clientid
	const clientId = butils.guid();
	connection.clientId = clientId;
	clients[clientId] = {
		"connected" : true,
		"connection": connection
	}

	const payload = {
		"method" : "connect",
		"clientId" : clientId
	}
	communication.send(clients[clientId], payload);
	// send back to client
	//connection.send(JSON.stringify(payload));
})






