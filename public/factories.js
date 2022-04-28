function generateLobby()
{
	let markup = `
	  <h1>ACRONYM</h1>
	  <div id="gameList">
	  </div>
	  <button id = "btnCreate">New Game</button>
	  <button id = "btnJoin">Join Game</button>
	  <input type = "text" id = "txtGameId"><br>`;
	return markup;
}

function tile(letter, place)
{
	let markup = `
		<span id="${place}" class="letterTile">
			<div>${letter}</div>
		</span>
	`
	return markup;
}

function generateAcronymContainer(acronym)
{
	let letters = ""

	for (let x = 0; x < acronym.length; x++)
	{
		letters += tile(acronym.charAt(x), x)
	}	

	let markup = `<div class="acronymContainer">
				  	${letters}
				  </div>`
	return markup;			  

}

function generateGame()
{
	let markup = `
	  <div id="divChatWindow"></div>
	  <button id = "btnStart">Start</button>
	  <input type="text" id="txtMessage" placeholder="send a message">  <button id = "btnMessage">Send</button>
	  <div id ="divPlayers"></div>
	`;
	return markup;
}

function updateGameList(games)
{
	//alert(games);
  
  	console.log(JSON.stringify(games));
  	let players = 0;
 // let gamesObj = games.games;
 	clear("gameList");
	Object.keys(games).forEach (c => {
		players = games[c].clients.length;
		$(`<div onclick="join('${c}')" id="${c}" class="gamePuck">${games[c].hostname}     ${players}/10</div>`, {}).appendTo('#gameList');	
	})

  let markup = `

  `;

  //populate("gameList", )
}

function populate (id, markup, callback)
{
	$(`#${id}`).html(markup);
	if (callback)
		callback();
}