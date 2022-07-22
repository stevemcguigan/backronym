// incoming responses from the server are parsed here

let ws = new WebSocket("ws://44.204.232.121:9090")
//let ws = new WebSocket("ws://192.168.99.41:9090")
// 
// 192.168.99.41
//10.54.127.171
function send(payload)
{
  try
  {
    ws.send(JSON.stringify(payload));  
  }
  catch 
  {
    console.log("connection error. reloading.")
    location.reload();
  }
  
}

ws.onmessage = message => {
  			
        const response = JSON.parse(message.data);
  			
        if (response.method === "connect")
  			{
  				clientId = response.clientId;
  				//console.log(`client id is ${clientId}`);
            setTimeout(() => {
                getGames();                
            }, 2500); 
          sendLocalId();  
  			}	

        if (response.method === "getGames")
        {
          //console.log("received list of games from server;")
          //console.log(response);
          if (loc == "lobby")
          {
            setTimeout(() => {
                getGames();                
            }, 5000); 
           setTimeout(() => {
               updateGameList(response.games);              
            },  1000);               
          }  
        }         
        
        if (response.method === "create")
  			{
  				console.log(`game succesfully created with id  ${response.game.id}`);
  				gameId = response.game.id;
          host = true;
          join(gameId);
  			}	

        if (response.method === "ping")
        {
//          console.log(`got a ping`);

          idWeGot = response.pongid;
          //pong();
          //soundtrack.play();
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
          setTimeout(function(){
            countdown(warning);
          }, 500)
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
          current.score = "";
          score.forEach(s => {
            current.score += `<div>${s.nick}: ${s.score}</div>`
          });  

            /*clear_modal_by_id("scoreboard")
            create_new_modal({
                  modal_id:"scoreboard_total",
                  modal_type: "generic_confirm",
                  prompt: `scoreboard`,
                  detail_text: current.score
            });*/
        } 
   
        if (response.method === "privateJoinWinFail")
        {
          if (response.privategameId !== false)
          {
            join(response.privategameId)
          } else {
            alert("no game with that key found")
          }
        }

        if (response.method === "endGame")
        {
          let winnerNick = response.nick;
          let score = response.score;
          let winnerClientId = response.clientId;
          let winner = winnerClientId == clientId ? "you" : winnerNick;
          let host = response.hostId == clientId ? true : false;

          //n(winner + " won with " + score + " points!");

           let actionsArray = [];     

           if (host)  
           {
             actionsArray.push(new actionItem({
                label:`play again`,
                action:`clear_modal_by_id('winner');n('new game started!');start('${gameId}');`
              }));
              actionsArray.push(new actionItem({
                label:`no thanks`,
                action:`clear_modal_by_id('winner');`
              }));             
           } 
           else
          {
             actionsArray.push(new actionItem({
                label:`ok`,
                action:`clear_modal_by_id('winner');`
              }));            
          }

           create_new_modal({
                modal_id:"winner",
                modal_type: "generic_confirm",
                prompt: "it's over!",
                detail_text: `${winner} won with ${score} points!`,
                actionsArray: actionsArray,
                deactivate: function () { }
            });


           $('.letterTileLetter').addClass("animate__animated animate__zoomOut");

          /*  
          var element = document.querySelector('.acronymContainer');
          element.classList.add('animate__animated', 'animate__zoomOut');
          element.addEventListener('animationend', () => {
                  $('.acronymContainer').remove();
                  const round = response.round;
                  acronym = response.acronym;
                  let acronymMarkup = generateAcronymContainer(" ");
                  id("main").insertAdjacentHTML("afterbegin", acronymMarkup);
                  animateAcronym();  
          })         */

         // divChatWindow.insertAdjacentHTML("beforeend", markup);
        }









        if (response.method === "reportRoundResult")
        {
          console.log("***")
          console.log("round result received");
          console.log(response); 
          const divChatWindow = id("divChatWindow");

          var resultArray = response.roundResult;
          console.log(resultArray);

          //alert(JSON.stringify(result));

          //var markup = "<div>Voting complete!</div>";
          clear_modal_by_id("vote")
          generateNotification({message: "Voting complete"}) 
          var markup = ""; 
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

            if (result.acronym == "null" || result.acronym == null)
            {
            markup += `<div>
                            <span id="nickScore">${result.nick}</span> did not submit this round ${ caveat ? caveat : ""}
                      </div>`  
            } 
            else
            {
            markup += `<div>
                            <span id="nickScore">${result.nick}&lsquo;s</span> <span id="acronymReport">${result.acronym}</span> got <b>${result.votesReceived}</b> vote${result.votesReceived == 1 ? "" : "s"} (<b>${result.votesReceived * 5}pts</b>) ${ caveat ? caveat : ""}
                      </div>`              
            } 
            

          }  

           let actionsArray = [];       
           actionsArray.push(new actionItem({
              label:`ok`,
              action:`clear_modal_by_id('scoreboard'); showScore();`
            }));
           create_new_modal({
                modal_id:"scoreboard",
                modal_type: "generic_confirm",
                prompt: `results`,
                detail_text: markup,
                actionsArray: actionsArray,
                deactivate: function () { showScore(); }
            });

          

          var element = document.querySelector('.letterTile');

          $('.letterTile').addClass("animate__animated animate__zoomOut")
          //element.classList.add('animate__animated', 'animate__zoomOut');
          element.addEventListener('animationend', () => {
                  $('.acronymContainer').html(generateClock());
          })           



           //$('.letterTileLetter').addClass("animate__animated animate__zoomOut");

          /*  
          var element = document.querySelector('.acronymContainer');
          element.classList.add('animate__animated', 'animate__zoomOut');
          element.addEventListener('animationend', () => {
                  $('.acronymContainer').remove();
                  const round = response.round;
                  acronym = response.acronym;
                  let acronymMarkup = generateAcronymContainer(" ");
                  id("main").insertAdjacentHTML("afterbegin", acronymMarkup);
                  animateAcronym();  
          })         */

         // divChatWindow.insertAdjacentHTML("beforeend", markup);
        }
           
        if (response.method === "getVotes")
        {
            acronym = false;
            generateNotification({message: "Round complete.",
                                type: "dm",
                                color: "green"})          

          //const divChatWindow = id("divChatWindow");
          //var markup = "<div>Round complete! Tap your favorite. Voting will be open for 30 seconds.</div>";

          var actionsArray = [];
          var answers = JSON.parse(response.answers);    
          console.log(answers)      
          for (let x = 0; x < answers.length; x++)
          {  
            var answer = answers[x];
              if (answer.acronym == null || answer.acronym == "null")
              {
                  // skip it, left logic in case I wanna do something later
              } 
              else
              {
                actionsArray.push(new actionItem({
                  label: answer.acronym,
                  action:`castVote('${answer.owner}')`
                 }));
              } 
          } 
           //console.log("full actions array")
           //console.log(actionsArray) 

           if (actionsArray.length)
           {
              prompt = mobileCheck() ? 'tap your favorite acronym' : 'click your favorite acronym';  
              create_new_modal({
                modal_id:"vote",
                modal_type:"vote",
                prompt: prompt,
                actionsArray: actionsArray,
                force:true
              });
           }
           else 
           {
                 actionsArray.push(new actionItem({
                  label: "ok",
                  action:`clear_modal_by_id("emptyround_total")`
                 }));
               create_new_modal({
                  modal_id:"emptyround_total",
                  modal_type: "generic_confirm",
                  prompt: `no submissions this round`,
              });    
           } 




          //divChatWindow.insertAdjacentHTML("beforeend", markup);
        }        

  			if (response.method === "join")
  			{				

          console.log("RECEIVED JOIN RESPONSE...HOPE YOU JUST JOINED A GAME")  
          // server accepted your request to join the game
          gameId = response.game.id; 
  				//const game = response.game;
          //console.log(game);
          loc = "game";
          $("#titleScreen").addClass("animate__animated animate__zoomOut hidden");
          populate ("main", generateGame(), wireGameEvents);
          var game = response.game;
          if (game.inProgress)
          {

                  console.log("**** REJOINING GAME")
                  console.log(game);
                  console.log("****")
                  if (game.hostId == clientId && host == false)
                  {
                    console.log("You were the host, making you the host again");
                    host = true;
                  }
                  else {
                    console.log("you weren't the host");
                  }  
                  $('.acronymContainer').remove();
                  const round = game.currentRound;
                  acronym = game.acronyms[round - 1];
                  let acronymMarkup = generateAcronymContainer(acronym);
                  generateNotification({message: `rejoining game in progress`})
                  id("main").insertAdjacentHTML("afterbegin", acronymMarkup);
                  animateAcronym();  

          }  
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