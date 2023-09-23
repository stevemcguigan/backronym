const gameFunctions = require('./gameFunctions.js')
const communication = {
	sendAll: (clients, game, payload) =>
	{
		// this is to send the same thing to all clients in the game - whether it's a broadcasted message or
		// score results or whatever. Most of the functions in this module filter back to this one.
		game.clients.forEach (c => {
			clients[c.clientId].connection.send(JSON.stringify(payload));
		})
	},
	send: (client, payload) =>
	{
		const con = client.connection;
		con.send(JSON.stringify(payload));
	},
	chat: (clients, game, result) =>
	{

		if (!communication.sanitize(result.message) && game.key === false)
			return
		const clientId = result.clientId;
		const nick = result.nick;
		const payload = {
				"method" : "chatmsg",
				"clientId": clientId, 
				"nick": nick,
				"message": result.message
		}
		communication.sendAll(clients, game, payload)			
	// const disallowedWords = ["retard", "shit", "fuck", "bitch", "cunt", "nigger", "kike", "fag", "chink", "jigaboo", "faggot", "fagot", "faget", "nigga", "cock", "penis"]
//  const disallowedWords = ["retard", "shit", "fuck", "bitch", "cunt", "nigger", "kike", "fag", "chink", "jigaboo", "faggot", "fagot", "faget", "nigga", "cock", "penis"]

	},
	sanitize: (message) => {



	const disallowedWords = ["retard", "shit", "fuck", "bitch", "cunt", "nigger", "kike", "fag", "chink", "jigaboo", "faggot", "fagot", "faget", "nigga", "cock", "penis"]

	  const substitutions = {
	    i: "[i1!*_íìîïīįÍÌÎÏĪĮ]",
	    s: "[s$5*_]",
	    o: "[o0*_óòôöōøõÓÒÔÖŌØÕ]",
	    a: "[a@*_áàâäāåãÁÀÂÄĀÅÃ]",
	    e: "[e3*_éèêëēėęÉÈÊËĒĖĘ]",
	    u: "[uúùûüūųÚÙÛÜŪŲ]",
	    c: "[c¢©Ↄ]"
	  };

	  // Helper function to create a regex pattern for a word with substitutions
	  function createPattern(word) {
	    const pattern = word
	      .split("")
	      .map((char) => {
	        return substitutions[char.toLowerCase()] || char;
	      })
	      .join("");
	    return new RegExp(`\\b${pattern}\\b`, "i");
	  }

	  // Check if the message contains any disallowed words or substitutions
	  for (const word of disallowedWords) {
	    const pattern = createPattern(word);
	    if (pattern.test(message)) {
	   	  clog(`${message} failed sanitizing`, 5) 	
	      return false; // Message contains a disallowed word or substitution
	    }
	  }

	  return message; // Message is clean
	},
	nickChange: (game, gameId, clients, client, clientId, newNick) =>
	{
		let oldNick = client.currentGameInfo.nick
		if (!communication.sanitize(newNick))
		{
			communication.dm(clients, clientId, "Nick change rejected. Get a grip.");
			communication.forceChangeNick(game, client, clientId, oldNick)
		} else {
			
			client.currentGameInfo.nick = newNick
			if (game.hostId == clientId) {
				game.hostname = client.currentGameInfo.nick
			}
			communication.broadcast(clients, game, `${oldNick} is now known as ${client.currentGameInfo.nick}`)
			let nicks = communication.nicksFromGame(game, clients, clientId)
			communication.sendNickList(clients, game, nicks)			
		}	

	},
	forceChangeNick: (game, client, clientId, oldNick) =>
	{
		let payload = {
			method: "forceChangeNick",
			nick: oldNick
		}
		communication.send(client, payload);
	},	
	nicksFromGame: (game, clients, clientId) =>
	{
		let clientsArray = []
		let nicks = []
		for (let y = 0; y < game.clients.length; y++)
		{
			clientsArray.push(game.clients[y].clientId)
		}		
		//clog(clientsArray, 4)
		for (let z = 0; z < clientsArray.length; z++)
		{
			let nick = {nick: clients[clientsArray[z]].currentGameInfo.nick, id: clientsArray[z]} 
			nicks.push(nick)
			//clog(clients[clientsArray[z]], 4)
		}				
		//clog(nicks, 4)
		//const clientIDs = game.clients;
		//const nicks = clientIDs.map((clientId) => clients[clientId].currentGameInfo.nick);
		return nicks
	},	
	broadcast: (clients, game, message) =>
	{
		const payload = {
			"method" : "broadcast",
			"message": message
		}
		communication.sendAll(clients, game, payload)
	},
	sendNickList: (clients, game, nicks) =>
	{
		const payload = {
			"method" : "sendNickList",
			"nicks": nicks
		}
		communication.sendAll(clients, game, payload);	
	},
	dm: (clients, clientId, msg) =>
	{
		const payload = {
			"method" : "dm",
			"message": msg
		}
		clog("sending '" + msg + "'' to " + clientId, 5);
		clients[clientId].connection.send(JSON.stringify(payload));
	},
	warning: (clients, game, message) =>
	{
		const payload = {
			"method" : "warning",
			"message": message
		}
		communication.sendAll(clients, game, payload)		
	}

}	
module.exports = communication