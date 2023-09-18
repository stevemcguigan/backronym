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
		if (!communication.sanitize(result.message))
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
	},
	sanitize: (message) =>
	{
	  // Define an array of disallowed words
	  const disallowedWords = ["shit", "fuck", "bitch", "cunt", "nigger", "kike", "fag", "chink", "jigaboo", "faggot", "fagot", "faget", "nigga", "cock", "penis"]

	  // Create a regular expression pattern to match variations of disallowed words
	  const pattern = new RegExp(
	    disallowedWords.map((word) => {
	      // Create character substitution patterns for common workarounds
	      const substitutions = {
	        i: "[i1!*]",
	        s: "[s$5*]",
	        o: "[o0*]",
	        a: "[a@*]",
	        e: "[e3*]",
	      };

	      // Create a pattern that matches the word and its variations
	      const wordPattern = word
	        .split("")
	        .map((char) => {
	          return substitutions[char] || char;
	        })
	        .join(".*?");

	      return `(${wordPattern})`;
	    }).join("|"),
	    "i" // "i" flag for case-insensitive matching
	  );

	  // Check if the inputString contains any disallowed words
		return pattern.test(message) ? false : message;		
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
		console.log("sending " + msg + " to " + clientId);
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