const https 			= require('https');
const fs 				= require('fs');
const express 			= require("express")
const app 				= express();
const dictionary 		= require('./src/dictionary.js')
const butils 			= require('./src/butils.js')
const gameFunctions 	= require('./src/gameFunctions.js')
const communication 	= require('./src/communication.js')
const server 			= require('./src/server.js')
const WebSocket 		= require('ws');
//const websocketServer 	= require("websocket").server
const certPath = '/etc/letsencrypt/live/backronym.app/fullchain.pem';
const keyPath = '/etc/letsencrypt/live/backronym.app/privkey.pem';
const httpServer 		= https.createServer({
  cert: fs.readFileSync(certPath), // Replace with the path to your SSL certificate
  key: fs.readFileSync(keyPath), // Replace with the path to your SSL private key
}, app);
const clients 			= {};
const clientLocals 		= {};
const games 			= {};
const keys 				= {};
const devlevel			= 6;
const TERMINALWIDTH		= 80;
console.clear();

global.colorizeText = function(text, foregroundColor, backgroundColor) {
  const foregroundCode = `\x1b[${foregroundColor}m`;
  const backgroundCode = `\x1b[${backgroundColor}m`;
  const resetCode = '\x1b[0m';
  return `${foregroundCode}${backgroundCode}${text}${resetCode}`;
}


global.formatStringToLength = function (inputString, length) {
  if (inputString.length < length) {
    // Pad the string with spaces to reach the desired length
    return inputString.padEnd(length);
  } else if (inputString.length > length) {
    // Truncate the string to the desired length
    return inputString.slice(0, length);
  } else {
    // The string is already the desired length
    return inputString;
  }
}


global.clog = function(message, mlevel)
{
	if (mlevel > devlevel) {
		return 
	}
	if (typeof mlevel == "undefined") mlevel = 0	
	
	let leader = ""
	leader += ".".repeat(mlevel == 0 ? 0 : mlevel * 1)
	let leaderLength = leader.length
	//console.log(leaderLength)
	//leader += "∙"
	leader = colorizeText(leader, 37, 44)
	let suffix = `${colorizeText('   (' + clog.caller.name + ')  ', 36, 44)}`
	let suffixLength = clog.caller.name.length + 7
	let messageLength = message.length
	let padLength = TERMINALWIDTH - (messageLength + suffixLength + leaderLength)
	if (padLength < 0) {
		let diff = padLength * -1
		padLength = 0
		message = message.slice(0, -diff);
	}
	let pad = " ".repeat(padLength)
	pad = colorizeText(pad, 37, 44)
	message = colorizeText(" " + message, 37, 44)
	console.log(`${leader}${message}${pad}${suffix}`)			

	
}




clog("                                                 ", 0)
clog("╭╮╱╱╱╱╱╭╮", 0)
clog("┃╰┳━╮╭━┫┣┳┳┳━┳━┳┳┳┳━━╮", 0)
clog("┃╋┃╋╰┫━┫━┫╭┫╋┃┃┃┃┃┃┃┃┃", 0)
clog("╰━┻━━┻━┻┻┻╯╰━┻┻━╋╮┣┻┻╯", 0)
clog("╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╰━╯         ver .01α    ", 0)
clog("                            © 2023 sbm   ", 0)
clog(" ")
clog(" ") 

clog(" ")
clog(" ")
clog(" ")
app.listen(8000, () => clog("express listening on 8000", 0));
app.use(express.static('public'))
app.get("/", (req, res) => res.sendFile(__dirname + "/index.html"));

// parser.js
httpServer.listen(9090, () => clog("websocket listening on 9090", 0));
const wsServer = new WebSocket.Server({ httpServer });

clog("log level is "+ devlevel)

wsServer.on("request", request => {
	const connection = request.accept(null, request.origin);
	connection.on("open", () => {
	});
	connection.on("close", () => {
		server.closeConnection(clients, games, connection, keys)	
	});
	connection.on("message", message => {

		const result = JSON.parse(message.utf8Data);
		clog("request received: " + result.method, 6)
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
				gameFunctions.exit(clients, result.clientId, games[result.gameId], games, keys)
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
			case "nickChange":
				communication.nickChange(games[result.gameId], result.gameId, clients, clients[result.clientId], result.clientId, result.newNick)
			break;
			default:
				clog("invalid method: " + result.method, 0)
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






