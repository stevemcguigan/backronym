// incoming responses from the server are parsed here

let ws = new WebSocket("ws://192.168.99.41:9090")
// 
// 192.168.99.41
//10.54.127.171
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
          clear_modal_by_id("scoreboard");
          const element = document.querySelector('.acronymContainer');
          element.classList.add('animate__animated', 'animate__zoomOut');
          element.addEventListener('animationend', () => {
                  $('.acronymContainer').remove();
                  const round = response.round;
                  acronym = response.acronym;
                  let acronymMarkup = generateAcronymContainer(acronym);
                  generateNotification({message: `Round ${round} has begun! 60 seconds, go!`})
                  id("main").insertAdjacentHTML("afterbegin", acronymMarkup);
                  animateAcronym();   
          });
        }


        if (response.method === "broadcast")
        {
          generateNotification({message: response.message,
                                type: "dm",
                                color: "green"})           
        }         

        if (response.method === "warning")
        {
          let warning = generateNotification({message: response.message,
                                              type: "dm",
                                              color: "green"});
          countdown(warning);

        }

        if (response.method === "dm")
        {
          generateNotification({message: response.message,
                                type: "dm",
                                color: "green"})           
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

          let score = JSON.parse(response.score);
          console.log(score);
          var markup = "";
          for (let x = 0; x < score.length; x++)
          {
            markup += `<div>${score.nick}: ${score.score}</div>`
          }  

           /* create_new_modal({
                modal_id:"scoreboard",
                modal_type: "generic_confirm",
                prompt: `SCOREBOARD`,
                detail_text: markup,
            });*/

        } 
   

        if (response.method === "reportRoundResult")
        {
          console.log("***")
          console.log("round result received");
          console.log(response); 
          const divChatWindow = id("divChatWindow");

          var resultArray = JSON.parse(response.roundResult);

          //alert(JSON.stringify(result));

          //var markup = "<div>Voting complete!</div>";
          clear_modal_by_id("vote")
          generateNotification({message: "Voting complete"}) 
          for (let x = 0; x < resultArray.length; x++)
          {  
            var result = resultArray[x];
            result.votesReceived = parseInt(result.votesReceived, 10);
            result.roundScore = parseInt(result.roundScore, 10);
            var caveat = false;
            if (result.selfVoted)
            {
              caveat = result.votesReceived > 0 ? "but" : "and";
              caveat += " they <span id='caveat'>voted for themselves</span> (<b>-6pts</b>)"
            } else if (result.didNotVote)
            {
              caveat = result.votesReceived > 0 ? "but" : "and";
              caveat += " they <span id='caveat'>didn't vote</span> (<b>-6pts</b>)"
            }
            var markup = ""; 
            markup += `<div>
                            <span id="nickScore">${result.nick}&lsquo;s</span> <span id="acronymReport">${result.acronym}</span> got <b>${result.votesReceived}</b> vote${result.votesReceived == 1 ? "" : "s"} (<b>${result.votesReceived * 5}pts</b>) ${ caveat ? caveat : ""}.
                      </div>`
          }  
             create_new_modal({
                modal_id:"scoreboard",
                modal_type: "generic_confirm",
                prompt: `ROUND RESULT`,
                detail_text: markup
            });

         // divChatWindow.insertAdjacentHTML("beforeend", markup);
        }
          
        if (response.method === "getVotes")
        {

            generateNotification({message: "Round complete.",
                                type: "dm",
                                color: "green"})          

          //const divChatWindow = id("divChatWindow");
          //var markup = "<div>Round complete! Tap your favorite. Voting will be open for 30 seconds.</div>";

            var actionsArray = [];


          var answers = JSON.parse(response.answers);          
          for (let x = 0; x < answers.length; x++)
          {  
            var answer = answers[x];
               actionsArray.push(new actionItem({
                  label: answer.acronym,
                  action:`castVote('${answer.owner}')`
                 }));
          } 

            create_new_modal({
                modal_id:"vote",
                modal_type:"connect_attempt",
                prompt: `VOTE`,
                detail_text: "pick your favorite",
                actionsArray: actionsArray,
                force:true
              });


          //divChatWindow.insertAdjacentHTML("beforeend", markup);
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