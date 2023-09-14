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
		const clientId = result.clientId;
		const nick = result.nick;
		const message = result.message
		const payload = {
			"method" : "chatmsg",
			"clientId": clientId, 
			"nick": nick,
			"message": message
		}
		communication.sendAll(clients, game, payload)
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
			"nicks": JSON.stringify(nicks)
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