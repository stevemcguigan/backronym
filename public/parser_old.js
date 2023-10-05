//let ws = new WebSocket("ws://localhost:9090")
let ws = new WebSocket("wss://backronym.app:9090")
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

const methodHandlers = {
  connect: (response) => {
    clientId = response.clientId;
    setTimeout(getGames, 500);
    sendLocalId();  
  },

  getGames: function (response) {
    if (loc === "lobby") {
      setTimeout(getGames, 5000);
      setTimeout(() => updateGameList(response.games), 500);
    }
  },

  create: (response) => {
    clog(`Game successfully created with id ${response.game.id}`, 3);
    gameId = response.game.id;
    host = true;
    if (response.game.key) {
      window.history.pushState('', '', `/?pkey=${response.game.key}`);
    }
    join(gameId);    
  },

  sendNickList: (response) => {
    current.nickList = [...response.nicks];
    $('#settingsMenu').length && openMenu();
  },

  forceChangeNick: (response) => {
    user.nick = nick = response.nick;
    saveUser();
    clog("server rejected nickname", 2)
      if (loc == "lobby") {
        create_new_modal({
            modal_id: "alert",
            modal_type: "generic_confirm",
            prompt: "Unfortunate nickname",
            detail_text:
              "Your nickname was rejected and has been changed to 'Default'. Change your nickname and then try creating a game again. <br> <br> Private games are not subject to the profanity filter in chat but nicknames always are since they're public facing.",
            actionsArray: [new actionItem(
              {
                label: "ok",
                action: "clear_modal_by_id('alert');editNick()"
              }
            )]
          });
      }
  },

  exitSuccess: (response) => {
    const highlight = $('html').hasClass('invert') ? 'highlightedTile invert' : 'highlightedTile';
    loc = 'lobby';
    acronym = false;
    window.history.pushState('', '', '');
    populate('main', generateLobby(), wireLobbyEvents);
    startInstructionsLoop(highlight);
    getGames();
    $('#exitContainer').removeClass('reveal');
  },



  startRound: (response) => {
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
  },  

  broadcast: (response) => {
    generateNotification({message: response.message})     
  },  

  warning: (response) => {
    const warning = generateNotification({ message: response.message });
    setTimeout(() => countdown(warning), 500);
  },

  dm: (response) => {
    generateNotification({message: response.message})      
  },  

  chatmsg: (response) => {
    const markup = `<span class="bold">${response.nick ? response.nick + ":" : ""}</span> ${response.message}`;
    injectChat(markup)
  },  

  reportScore: (response) => {
    const score = JSON.parse(response.score);
    current.score = score.map(s => `<div>${s.nick}: ${s.score}</div>`).join('');
  },  

  privateJoinWinFail: (response) => {
    response.privategameId !== false ? join(response.privategameId) : modalAlert("no game with that key found")
  },  

  endGame: (response) => {
    const { nick: winnerNick, score, clientId: winnerClientId, hostId } = response;
    const winner = winnerClientId === clientId ? "you" : winnerNick;
    const host = hostId === clientId;
    const actionsArray = [];

    const playAgainAction = new actionItem({
      label: "play again",
      action: "clear_modal_by_id('winner');n('new game started!');start('${gameId}');"
    });

    const noThanksAction = new actionItem({
      label: "no thanks",
      action: "clear_modal_by_id('winner');"
    });

    const okAction = new actionItem({
      label: "ok",
      action: "clear_modal_by_id('winner');"
    });

    host
      ? actionsArray.push(playAgainAction, noThanksAction)
      : actionsArray.push(okAction);

     create_new_modal({
          modal_id: "winner",
          modal_type: "generic_confirm",
          prompt: "it's over!",
          detail_text: `${winner} won with ${score} points!`,
          actionsArray,
          deactivate: () => {}
      });


     $('.letterTileLetter').addClass("animate__animated animate__zoomOut");
  },  
  getVotes: (response) => {
    
    acronym = false;
    
    generateNotification({message: "Round complete."});

    const answers = JSON.parse(response.answers);
    clog(answers, 5);

    const actionsArray = answers
      .filter(answer => answer.acronym !== null && answer.acronym !== "null")
      .map(answer => new actionItem({
        label: answer.acronym,
        action: `castVote('${answer.owner}')`,
        owner: answer.owner
      }));

    create_new_modal({
      modal_id: "vote",
      modal_type: "vote",
      prompt: "Vote for your favorite!",
      actionsArray,
      force: true
    });
  }, 

  skipVoting: (response) => {
    const actionsArray = [];
    const answers = JSON.parse(response.answers);
    clog(answers, 5);

    answers.forEach(answer => {
      if (answer.acronym !== null && answer.acronym !== "null") {
        actionsArray.push(new actionItem({
          label: { "acronym": answer.acronym, "nick": answer.nick },
          action: `clear_modal_by_id('emptyround_total')`,
          owner: answer.owner,
        }));
      }
    });

    if (actionsArray.length === 1) {
      const detail = actionsArray[0];
      actionsArray.length = 0;
      actionsArray.push(new actionItem({
        label: "ok",
        action: `clear_modal_by_id('emptyround_total')`
      }));

      create_new_modal({
        modal_id: "emptyround_total",
        modal_type: "generic_confirm",
        prompt: "too few submissions",
        detail_text: `<div style="padding: 15px 0px;">${detail.label.nick}: ${detail.label.acronym}</div>`,
        actionsArray: actionsArray,
        activate: clearToClock
      });
    } else {
      actionsArray.length = 0;
      actionsArray.push(new actionItem({
        label: "ok",
        action: `clear_modal_by_id('emptyround_total');`
      }));

      create_new_modal({
        modal_id: "emptyround_total",
        modal_type: "generic_confirm",
        prompt: "no submissions this round",
        actionsArray: actionsArray,
        activate: clearToClock
      });
    }
  }, 

  join: (response) => {
    clog("Server accepted your join", 4);

    gameId = response.game.id;
    loc = "game";
    const game = response.game;
    host = game.hostId === clientId;

    if (host) {
      clog("You're the host.", 3);
    } else {
      clog("You reconnected and weren't the host", 5);
    }

    $("#titleScreen").addClass("animate__animated animate__zoomOut hidden");
    populate("main", generateGame(), wireGameEvents);

    if (game.inProgress) {
      clog("**** REJOINING GAME", 4);
      clog(game, 4);
      clog("****", 4);

      $('#titleBar, .acronymContainer').remove();
      const round = game.currentRound;
      acronym = game.acronyms[round - 1];
      const acronymMarkup = generateAcronymContainer(acronym);

      id("main").insertAdjacentHTML("afterbegin", acronymMarkup);

      if (game.betweenRounds) {
        generateNotification({ message: `rejoining. round ${game.currentRound} will start soon.` });
        $('.acronymContainer').html(generateClock());
      } else {
        generateNotification({ message: `rejoining round ${game.currentRound} in progress.` });
        animateAcronym();
      }
    }

    if (game.key) {
      gameKey = game.key;
      create_new_modal({
        modal_id: "key_teller",
        modal_type: "generic_confirm",
        prompt: `secret key`,
        detail_text: `<div style="margin:8px;display:flex;flex-direction:column;justify-content:center;align-items:center;"><div style="margin:8px;">the secret key for this game is</div><div style="font-size:24px;margin:8px;color:olivedrab;"> ${game.key}</div><div style="margin:8px;"> (tap <i class="fas fa-info-circle"></i> to see it again)</div></div>`
      });
    } else {
      gameKey = false;
    }

    const hostMessage = host ? "you." : `${game.hostname}.`;
    const markup = `<span style="font-style:italic;opacity:.4"> Welcome! This game is hosted by <b>${hostMessage}</b> <br><br>
                    Below, type in answers to the acronyms above. Anything else you type will appear here in the group chat. Say hi!
                  </span>`;

    injectChat(markup);

  },
  reportRoundResult: (response) => {
 const divChatWindow = id("divChatWindow");

          var resultArray = response.roundResult;
          let letters = response.letters
          clear_modal_by_id("vote")
          generateNotification({message: "Voting complete"}) 
          var markup = ""; 
          for (let x = 0; x < resultArray.length; x++)
          {  
            const result = resultArray[x];
            result.votesReceived = parseInt(result.votesReceived, 10);
            result.roundScore = parseInt(result.roundScore, 10);
            let caveat = false;
           
            if (result.selfVoted || result.didNotVote) {
              caveat = result.votesReceived > 0 ? "(but " : "(and ";
              caveat += `<span class='caveat'>-6 points for ${
                result.selfVoted ? "self-voting" : "not voting"
              })</span>`;
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
           
           const actionsArray = [];       
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
};

ws.onmessage = message => {
  			
  const response = JSON.parse(message.data);
  clog(`PACKET RECEIVED: ${JSON.stringify(response)}`, 5)
  
  const method = response.method;
  if (methodHandlers.hasOwnProperty(method)) {
    methodHandlers[method](response);
  } else {
    console.error(`Unknown method: ${method}`);
  }
   
}