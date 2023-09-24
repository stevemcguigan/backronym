// incoming responses from the server are parsed here

//let ws = new WebSocket("ws://localhost:9090")
let ws = new WebSocket("ws://192.168.1.156:9090")
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
    clog("connection error.", 0)
    //location.reload();
  }
  
}

ws.onmessage = message => {
  			
        const response = JSON.parse(message.data);
        clog(`PACKET RECEIVED: ${JSON.stringify(response)}`, 5)
  			
        if (response.method === "connect")
  			{
  				clientId = response.clientId;
  				//console.log(`client id is ${clientId}`);
            setTimeout(() => {
                getGames();                
            }, 500); 
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
            },  500);               
          }  
        }         
        
        if (response.method === "create")
  			{
  				clog(`game succesfully created with id  ${response.game.id}`, 3);
  				gameId = response.game.id;
          host = true;
          if (response.game.key)
          {
            window.history.pushState('', '', '/?pkey=' + response.game.key);  
          }  
          
          join(gameId);
  			}	

        if (response.method === "sendNickList")
        {
          current.nickList = [...response.nicks]
          if ($('#settingsMenu').length) {
            openMenu()
            //$('#settingsMenu .modal_detail_text').html(generateNickList())
          } 
        }        

        if (response.method === "forceChangeNick")
        {
            user.nick = response.nick
            nick = response.nick
            saveUser()
            clog("server rejected nickname", 2)
            if (loc == "lobby") {

               let actionsArray = [];       
               actionsArray.push(new actionItem({
                  label:`ok`,
                  action:`clear_modal_by_id('alert');editNick()`
                }));
                create_new_modal({
                  modal_id:"alert",
                  modal_type: "generic_confirm",
                  prompt: `Unfortunate nickname`,
                  detail_text: "Your nickname was rejected and has been changed to 'Default'. Change your nickname and then try creating a game again. <br> <br> Private games are not subject to the profanity filter in chat but nicknames always are since they're public facing.",
                  actionsArray: actionsArray
                });


            }
        }        

        if (response.method === "exitSuccess")
        {
          let highlight = $('html').hasClass("invert") ? "highlightedTile invert" : "highlightedTile"
          loc = "lobby";
          acronym = false;
          window.history.pushState('', '', '');
          populate ("main", generateLobby(), wireLobbyEvents);
          startInstructionsLoop(highlight);
          getGames();   
          $("#exitContainer").removeClass("reveal")
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
                  $('#titleBar').remove();
                  $('.acronymContainer').remove();
                  const round = response.round;
                  acronym = response.acronym;
                  let acronymMarkup = generateAcronymContainer(acronym, true);
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
				  let markup = `<b>${response.nick ? response.nick + ":" : ""}</b> ${response.message}`;
				  injectChat(markup)
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
            modalAlert("no game with that key found")
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

        }

  if (response.method === "reportRoundResult_tabular")
  {

          const divChatWindow = id("divChatWindow");

          var resultArray = response.roundResult;
          let letters = response.letters

          clear_modal_by_id("vote")
          generateNotification({message: "Voting complete"}) 
         
          let table = ""
          let deadbeats = []
          for (let x = 0; x < resultArray.length; x++)
          {
            let caveat = resultArray[x].selfVoted || resultArray[x].didNotVote ? "6" : "0"            
            table+= `<tr>
                      <td>${resultArray[x].acronym}</td>
                      <td>${resultArray[x].nick}</td>
                      <td>${resultArray[x].votesReceived}</td>
                      <td>${resultArray[x].votesReceived * 5}</td>
                      <td>${caveat}</td>
                    </tr>`                


          }

          let markup = `<table>
                            <tr>
                              <td>Answer</td>
                              <td>Nick</td>
                              <td>Votes</td>
                              <td>Points</td>
                              <td>Penalty</td>
                            </tr>
                            ${table}
                        </table>`

           let actionsArray = [];       
           actionsArray.push(
            new actionItem({
              label:`ok`,
              action:`clear_modal_by_id('scoreboard'); showScore();`
            }), 
           new actionItem({
              label:`<i class="fas fa-share"></i> share`,
              action:`roundShare('scoreboard');`
            })

           );
           create_new_modal({
                modal_id:"scoreboard",
                modal_type: "generic_confirm",
                attachedObject: resultArray,
                prompt: `results`,
                detail_text: markup,
                actionsArray: actionsArray,
                activate: function () { 
                    const scoreboardElement = document.getElementById('scoreboard');
                    scoreboardElement.dataset.letters = letters;
                    scoreboardElement.dataset.resultArray = JSON.stringify(resultArray);

                 },
                deactivate: function () { showScore(); }
            });

           clearToClock()

  }

// ******* WORKS, A LITTLE LESS WORDY:

  if (response.method === "reportRoundResult")
        {

          const divChatWindow = id("divChatWindow");

          var resultArray = response.roundResult;
          let letters = response.letters
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
              caveat = result.votesReceived > 0 ? "(but " : "(and ";
              caveat += "<span class='caveat'>-6 points for self-voting)</span>"
            } else if (result.didNotVote)
            {
              caveat = result.votesReceived > 0 ? "(but" : "(and";
              caveat += "<span class='caveat'>-6 points for not voting)</span>"
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
                            <span id="acronymReport">${result.acronym}</span>: <b>${result.votesReceived}</b> vote${result.votesReceived == 1 ? "" : "s"}
                            <br>
                            <b>+${result.votesReceived * 5}pts</b> to ${result.nick} ${ caveat ? caveat : ""}
                      </div>`              
            } 
            

          }  
           let actionsArray = [];       
           actionsArray.push(
            new actionItem({
              label:`ok`,
              action:`showScore();`
            }), 
           new actionItem({
              label:`<i class="fas fa-share"></i> share`,
              action:`roundShare('scoreboard');`
            })

           );
           create_new_modal({
                modal_id:"scoreboard",
                modal_type: "generic_confirm",
                attachedObject: resultArray,
                prompt: `results`,
                detail_text: markup,
                actionsArray: actionsArray,
                activate: function () { 
                    const scoreboardElement = document.getElementById('scoreboard');
                    scoreboardElement.dataset.letters = letters;
                    scoreboardElement.dataset.resultArray = JSON.stringify(resultArray);

                 },
                deactivate: function () { showScore(); }
            });

          
           clearToClock()


        }



        /*if (response.method === "reportRoundResult")
        {
          //console.log("***")
          //console.log("round result received");
          //console.log(response); 
          const divChatWindow = id("divChatWindow");

          var resultArray = response.roundResult;
          let letters = response.letters
          //console.log(resultArray);

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
           actionsArray.push(
            new actionItem({
              label:`ok`,
              action:`clear_modal_by_id('scoreboard'); showScore();`
            }), 
           new actionItem({
              label:`<i class="fas fa-share"></i> share`,
              action:`roundShare('scoreboard');`
            })

           );
           create_new_modal({
                modal_id:"scoreboard",
                modal_type: "generic_confirm",
                attachedObject: resultArray,
                prompt: `results`,
                detail_text: markup,
                actionsArray: actionsArray,
                activate: function () { 
                    const scoreboardElement = document.getElementById('scoreboard');
                    scoreboardElement.dataset.letters = letters;
                    scoreboardElement.dataset.resultArray = JSON.stringify(resultArray);

                 },
                deactivate: function () { showScore(); }
            });

          
           clearToClock()


        }*/

           
        if (response.method === "getVotes")
        {
            acronym = false;
            generateNotification({message: "Round complete.",
                                type: "dm",
                                color: "green"})          

          var actionsArray = [];
          var answers = JSON.parse(response.answers);    
          clog(answers, 5)      
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
                  action:`castVote('${answer.owner}')`,
                  owner: answer.owner
                 }));
              } 
          } 

          create_new_modal({
            modal_id:"vote",
            modal_type:"vote",
            prompt: "vote for your favorite!",
            actionsArray: actionsArray,
            force:true
          });

        }        

        if (response.method === "skipVoting")
        {
          acronym = false;
            /*generateNotification({message: "Round complete.",
                                type: "dm",
                                color: "green"})*/       


          var actionsArray = [];
          var answers = JSON.parse(response.answers); 
          clog(answers, 5);

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
                  label: {"acronym" : answer.acronym, "nick" : answer.nick},
                  action:`clear_modal_by_id('emptyround_total')`,
                  owner: answer.owner,
                 }));
              } 
          } 
           if (actionsArray.length == 1)
           {
              //console.log("too few")
              //console.log(actionsArray);
              let detail = actionsArray[0]
              actionsArray = []
              actionsArray.push(new actionItem({
                  label: "ok",
                  action:`clear_modal_by_id('emptyround_total')`
             }));


           create_new_modal({
                modal_id:"emptyround_total",
                modal_type: "generic_confirm",
                  prompt: `too few submissions`,
                  detail_text: detail,
                actionsArray: actionsArray,
                detail_text: `<div style="padding: 15px 0px;">${detail.label.nick}: ${detail.label.acronym}</div>`,
                activate: function () {  clearToClock() }
            });
               
           } else {
                actionsArray = []
                 actionsArray.push(new actionItem({
                  label: "ok",
                  action:`clear_modal_by_id('emptyround_total');`
                 }));
               create_new_modal({
                  modal_id:"emptyround_total",
                  modal_type: "generic_confirm",
                  prompt: `no submissions this round`,
                  actionsArray: actionsArray,
                  activate: function () {  clearToClock() }
              });    
           } 


        }


  			if (response.method === "join")
  			{				

          clog("Server accepted your join", 4)  
          // server accepted your request to join the game
          gameId = response.game.id; 
          loc = "game";
          var game = response.game;

          if (game.hostId == clientId)
          {
            clog("You're are the host.", 3);
            host = true;
            
          }
          else {
            clog("you reconnected and weren't the host", 5);
          }    

          $("#titleScreen").addClass("animate__animated animate__zoomOut hidden");
          populate ("main", generateGame(), wireGameEvents);
          
          if (game.inProgress)
          {
            clog("**** REJOINING GAME", 4)
            clog(game, 4);
            clog("****", 4)

            $('#titleBar').remove();                  
            $('.acronymContainer').remove();
            const round = game.currentRound;
            acronym = game.acronyms[round - 1];
            let acronymMarkup = generateAcronymContainer(acronym);
            
            id("main").insertAdjacentHTML("afterbegin", acronymMarkup);
            if (game.betweenRounds)
            {
               generateNotification({message: `rejoining. round ${game.currentRound} will start soon.`})
              $('.acronymContainer').html(generateClock());
            } else {
              generateNotification({message: `rejoining round ${game.currentRound} in progress.`})
              animateAcronym()   
            } 
             
          }  
          if (game.key)
          {
            gameKey = game.key;
            create_new_modal({
                  modal_id:"key_teller",
                  modal_type: "generic_confirm",
                  prompt: `secret key`,
                  detail_text: `<div style="margin:8px;display:flex;flex-direction:column;justify-content:center;align-items:center;"><div style="margin:8px;">the secret key for this game is</div><div style="font-size:24px;margin:8px;color:olivedrab;"> ${game.key}</div><div style="margin:8px;"> (tap <i class="fas fa-info-circle"></i> to see it again)</div></div>`
            });
          } else {
            gameKey = false;
          }  


            let markup = `<span style="font-style:italic;opacity:.4"> Welcome! This game is hosted by <b>${host ? "you." : game.hostname + "."}</b> <br><br>
                              Below, type in an answers to the acronyms above. Anything else you type will appear here, in the group chat. Say hi!
                            </span>`;

            injectChat(markup)                

            //alert(d.textContent);
           
  			}	 // end join 			
}