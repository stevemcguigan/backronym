
    	let name = "Default Name";
    	function id (id)
    	{
    		return document.getElementById(id);
    	}

		let clientId = null;
		let gameId = null;
  		//let ws = new WebSocket("ws://localhost:9090")
let ws = new WebSocket("ws://backronym.app:9090")
    	const btnCreate = id("btnCreate");
    	const btnJoin = id("btnJoin");
    	const txtGameId = id("txtGameId");
    	const txtNick = id("txtNick");
    	const txtMessage = id("txtMessage");
    	const divPlayers = id("divPlayers");
    	const divChatWindow = id("divChatWindow");


    	btnJoin.addEventListener("click", e => {
    		if (gameId === null)
    		{
    			gameId = txtGameId.value;
    		}

    		const payload = {
    			"method": "join",
    			"clientId": clientId,
    			"gameId": gameId
    		}
    		ws.send(JSON.stringify(payload));
    	})


    	btnMessage.addEventListener("click", e => {
    		if (gameId === null)
    		{
    			return;
    		}

    		const nick = id("txtNick").value;
    		const message = id("txtMessage").value;

    		const payload = {
    			"method": "chatmsg",
    			"clientId": clientId,
    			"nick": nick,
    			"message": message,
    			"gameId": gameId
    		}

    		ws.send(JSON.stringify(payload));
    		id("txtMessage").value = "";
    	})
 
     	btnCreate.addEventListener("click", e => {
    		const payload = {
    			"method": "create",
    			"clientId": clientId
    		}
    		ws.send(JSON.stringify(payload));
    	}) 
  		ws.onmessage = message => {
  			//message.data
  			const response = JSON.parse(message.data);
  			console.log(response);
  			//alert(JSON.stringify(response));
  			if (response.method === "connect")
  			{
  				clientId = response.clientId;
  				console.log(`client id is ${clientId}`);
  			}	

			if (response.method === "create")
  			{
  				console.log(`game succesfully created with id  ${response.game.id}`);
  				gameId = response.game.id;
  			}	

  			if (response.method === "chatmsg")
  			{
  				const divChatWindow = id("divChatWindow");
  				const d = document.createElement("div");
				d.textContent = `<div>${response.nick}: ${response.message}</div>`;
				alert(d.textContent);
				divChatWindow.appendChild(d);
  			}	

  			if (response.method === "join")
  			{
  				
  				const game = response.game;
  				while(divPlayers.firstChild)
  						divPlayers.removeChild(divPlayers.firstChild);
  				game.clients.forEach(c => {
  					const d = document.createElement("div");
  					d.style.width = "200px";
  					d.style.background = c.color;
  					d.textContent = c.clientId;
  					divPlayers.appendChild(d);
  				})
  				//console.log(`game succesfully created with id  ${response.game.id}`);
  				//gameId = response.game.id;
  			}	

  			
  		}