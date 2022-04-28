// incoming responses from the server are parsed here

let ws = new WebSocket("ws://192.168.99.41:9090")
// 10.0.0.171
// 192.168.99.41
function send(payload)
{
  ws.send(JSON.stringify(payload));
}

ws.onmessage = message => {
  			
        const response = JSON.parse(message.data);
  			
        if (response.method === "connect")
  			{
  				clientId = response.clientId;
  				console.log(`client id is ${clientId}`);
          getGames();
  			}	

        if (response.method === "getGames")
        {
          console.log("received list of games from server;")
          console.log(response);
          if (loc == "lobby")
          {
            updateGameList(response.games);
            setTimeout(function(){
              getGames();
            }, 5000)
          }  
        }         
        

        if (response.method === "create")
  			{
  				console.log(`game succesfully created with id  ${response.game.id}`);
  				gameId = response.game.id;
          host = true;
          join(gameId);
  			}	

        
        if (response.method === "startRound")
        {
          $('.acronymContainer').remove();
          const divChatWindow = id("divChatWindow");
          const d = document.createElement("div");
          const round = response.round;
          acronym = response.acronym;
          let acronymMarkup = generateAcronymContainer(acronym);

          d.textContent = `Round ${round} has begun! 60 seconds, go!`;
          //alert(d.textContent);
          divChatWindow.appendChild(d);   
          id("main").insertAdjacentHTML("afterbegin", acronymMarkup);

        }

        if (response.method === "dm")
        {
          //alert(JSON.stringify(response));
          const dm = response.message;
          const divChatWindow = id("divChatWindow");
          const d = document.createElement("div");
          d.textContent = dm;
          //alert(d.textContent);
          divChatWindow.appendChild(d);              
        } 

  			if (response.method === "chatmsg")
  			{
  				//alert(); 
  				const divChatWindow = id("divChatWindow");
  				const d = document.createElement("div");
				  d.textContent = `${response.nick ? response.nick + ":" : ""} ${response.message}`;
				  //alert(d.textContent);
				  divChatWindow.appendChild(d);
  			}	

        if (response.method === "reportScore")
        {
          //alert(); 
          const divChatWindow = id("divChatWindow");
          const d = document.createElement("div");
          d.textContent = JSON.stringify(response.score);
          //alert(d.textContent);
          divChatWindow.appendChild(d);
        } 
   

        if (response.method === "reportRoundResult")
        {
          console.log("***")
          console.log("round result received");
          console.log(response); 
          const divChatWindow = id("divChatWindow");

          var resultArray = JSON.parse(response.roundResult);

          //alert(JSON.stringify(result));

          var markup = "<div>Voting complete!</div>";
          for (let x = 0; x < resultArray.length; x++)
          {  

            var result = resultArray[x];
            result.votesReceived = parseInt(result.votesReceived, 10);
            result.roundScore = parseInt(result.roundScore, 10);
            var caveat = false;
            if (result.selfVoted)
            {

              caveat = result.votesReceived > 0 ? "but" : "AND";
              caveat += " they voted for themselves, so they lost 6 points"
            } else if (result.didNotVote)
            {
              caveat = result.votesReceived > 0 ? "but" : "AND";
              caveat += " they didn't vote, so they lost 6 points"
            }
            markup += `<div>
                            ${result.acronym} received ${result.votesReceived} vote ${ caveat ? caveat : ""}. Total score for this round is ${result.roundScore}
                      </div>`
          }  
          divChatWindow.insertAdjacentHTML("beforeend", markup);
        }
          
        if (response.method === "getVotes")
        {
          const divChatWindow = id("divChatWindow");
          var answers = JSON.parse(response.answers);
          var markup = "<div>Round complete! Tap your favorite. Voting will be open for 30 seconds.</div>";
          for (let x = 0; x < answers.length; x++)
          {  

            var answer = answers[x];
            markup += `<div onclick="castVote('${answer.owner}')">
                          ${answer.acronym}
                      </div>`
          }  
          divChatWindow.insertAdjacentHTML("beforeend", markup);
        }        

  			if (response.method === "join")
  			{				
          // server accepted your request to join the game
          gameId = response.game.id; 
  				const game = response.game;
          loc = "game";
          populate ("main", generateGame(), wireGameEvents);
  				/*while(divPlayers.firstChild)
  						divPlayers.removeChild(divPlayers.firstChild);
  				game.clients.forEach(c => {
  					const d = document.createElement("div");
  					d.style.width = "200px";
  					d.style.background = c.color;
  					d.textContent = c.clientId;
  					divPlayers.appendChild(d);
  				})*/
  			}	  			
}