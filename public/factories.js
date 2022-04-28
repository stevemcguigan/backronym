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

function key(symbol, live)
{
	let mappedSymbol = "";
	var map = {
		"_" : {"id" : "space", "label" : "space"},
		"↑" : {"id" : "shift", "label" : "↑"},
		"←" : {"id" : "backspace", "label" : "←"},
		"%" : {"id" : "symbols", "label" : "123"},
		"✓" : {"id" : "return", "label" : "return"},

	}

	if (map[symbol] !== undefined)
	{
		mappedSymbol = map[symbol]
	}	
	else
	{
		mappedSymbol = {"id" : symbol, "label" : symbol}
	}	

	let markup = `
		<button id="${live ? "key" : "dead"}_${mappedSymbol.id}" data-key="${live ? mappedSymbol.id : ''}">
			${mappedSymbol.label}
		</button>
	`
	return markup;
}

function generateKeyboard(m)
{
	let live = m.live ? m.live : false;

	//let kb = []
	//kb.push("qwertyuiop")
	let layout1 = "qwertyuiop"
	let layout2 = "asdfghjkl"
	let layout3 = "↑zxcvbnm←"
	let layout4 = "%_✓"
	//asdfghjklzxcvbnm,.?!_:;'"
	let row1 = "";
	let row2 = "";
	let row3 = "";
	let row4 = ""
	for (let row = 0; row < 10; row++)
	{
		row1 += key(layout1.charAt(row), live)
	}	
	for (let row = 0; row < 9; row++)
	{
		row2 += key(layout2.charAt(row), live)
	}	
	for (let row = 0; row < 9; row++)
	{
		row3 += key(layout3.charAt(row), live)
	}
	for (let row = 0; row < 3; row++)
	{
		row4 += key(layout4.charAt(row), live)
	}					

	row1 = `<div id="row1" class="row">${row1}</div>`;
	row2 = `<div id="row2" class="row">${row2}</div>`;
	row3 = `<div id="row3" class="row">${row3}</div>`;
	row4 = `<div id="row4" class="row">${row4}</div>`;

	let markup = `
			<div id="keyboard${live ? '' : '_ghost'}" class="${live ? '' : 'ghost'}">
				${row1}
				${row2}
				${row3}
				${row4}
			</div>
	`
	return markup
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

function disableInputStuff()
{

const inputs = document.querySelectorAll('input');
inputs.forEach(input => {
        input.setAttribute('autocomplete', 'off')
	input.setAttribute('autocorrect', 'off')
	input.setAttribute('autocapitalize', 'off')
	input.setAttribute('spellcheck', false)
});  

}


function generateGame()
{
	let markup = `
	  <div id="divChatWindow"></div>
	  <button id = "btnStart">Start</button>
	   <input disabled type="text" id="txtMessage" placeholder="send a message">  <button id = "btnMessage">Send</button>
				
		 <div id="game-keyboard">
		 	   ${generateKeyboard({live: false})}	
			   ${generateKeyboard({live: true})}
		</div>		  
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