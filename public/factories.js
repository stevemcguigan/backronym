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


function removeAcronym()
{


}

function animateAcronym()
{

	let delay = 200;
	setTimeout(function() {
		$('#0').removeClass("hidden")
		setTimeout(function() {
			$('#1').removeClass("hidden")
			setTimeout(function() {
				$('#2').removeClass("hidden")
				setTimeout(function() {
					$('#3').removeClass("hidden")
					setTimeout(function() {
						$('#4').removeClass("hidden")
					}, delay);					
				}, delay);				
			}, delay);			
		}, delay);		
	}, delay);
	
}

function tile(letter, place)
{
	let markup = `
		<span id="${place}" class="letterTile animate__animated animate__rubberBand hidden">
			<div>${letter}</div>
		</span>
	`
	return markup;
}

function key(symbol, live, layout)
{
	//let suffix = (layout == "symbols") ? "_2" : "";
	let suffix = ""
	if (layout == "symbols")
	{	
		suffix = "_2";	
	}	

	let mappedSymbol = "";
	var map = {
		"_" : {"id" : "space",		"label" : "space"},
		"↑" : {"id" : "shift", 		"label" : "↑"},
		"←" : {"id" : "backspace",	"label" : "←"},
		"%" : {"id" : "symbols",	"label" : "123"},
		"✓" : {"id" : "return",		"label" : "return"},
		"-" : {"id" : "hyphen",		"label" : "-"},	
		"/" : {"id" : "slash",		"label" : "/"},
		":" : {"id" : "colon",		"label" : ":"},	
		";" : {"id" : "semicolon",	"label" : ";"},
		"(" : {"id" : "lp",			"label" : "("},
		")" : {"id" : "rp",			"label" : ")"},
		"$" : {"id" : "dollar",		"label" : "$"},
		"&" : {"id" : "amp",		"label" : "&"},	
		"@" : {"id" : "at",			"label" : "@"},
		")" : {"id" : "rp",			"label" : ")"},	
		'"' : {"id" : "doublequote","label" : '"'},
		")" : {"id" : "rp",			"label" : ")"},																	
	}

	if (map[symbol] !== undefined)
	{
		mappedSymbol = map[symbol]
	}	
	else
	{
		mappedSymbol = {"id" : symbol, "label" : symbol}
	}	

	let data = layout == "qwerty" ? mappedSymbol.id : mappedSymbol.label

	let markup = `
		<button id="${live ? "key" : "dead"}${suffix}_${mappedSymbol.id}" data-key="${live ? data : ''}">
			${mappedSymbol.label}
		</button>`
	return markup;
}

function generateKeyboard(m)
{
	let live = m.live ? m.live : false;
	let layout = m.layout ? m.layout : "qwerty";
	let layout1 = null
	let layout2 = null
	let layout3 = null
	let layout4 = null
	let suffix = "";
	let hidden = false;

	//alert(layout)
	//let kb = []
	//kb.push("qwertyuiop")

	if (layout == "qwerty")
	{
		 layout1 = "qwertyuiop"
		 layout2 = "asdfghjkl"
		 layout3 = "↑zxcvbnm←"
		 layout4 = "%_.✓"	
	}
	else
	{
		 hidden = true;
		 suffix = live ? "_2" : "_2_"
		 layout1 = "1234567890"
		 layout2 = `-/:;()$&@"`
		 layout3 = `↑.,?!'←`
		 layout4 = "%_.✓"	
	
	}

	//asdfghjklzxcvbnm,.?!_:;'"

	let row1 = "";
	let row2 = "";
	let row3 = "";
	let row4 = "";


	for (let row = 0; row < layout1.length; row++)
	{
		row1 += key(layout1.charAt(row), live, layout)
	}	
	for (let row = 0; row < layout2.length; row++)
	{
		row2 += key(layout2.charAt(row), live, layout)
	}	
	for (let row = 0; row < layout3.length; row++)
	{
		row3 += key(layout3.charAt(row), live, layout)
	}
	for (let row = 0; row < layout4.length; row++)
	{
		row4 += key(layout4.charAt(row), live, layout)
	}					

	row1 = `<div id="row1${suffix}" class="row">${row1}</div>`;
	row2 = `<div id="row2${suffix}" class="row">${row2}</div>`;
	row3 = `<div id="row3${suffix}" class="row">${row3}</div>`;
	row4 = `<div id="row4${suffix}" class="row">${row4}</div>`;

	let id = ""

	if (layout == "qwerty" && live)
	{
		id = "keyboard";
	} else if (layout == "qwerty" && !live)	
	{
		id = "keyboard_ghost";
	} else if (layout == "symbols" && live)
	{
		id = "keyboard_2";
	} else if (layout == "symbols" && !live)
	{
		id = "keyboard_2_ghost";
	} else {
		id = "fail";
	}

	let markup = `
			<div id="${id}" class="${live ? '' : 'ghost'} ${hidden ? 'hidden' : ''}">
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
	<div class="acronymContainer">
		<button id = "btnStart">Start</button>			  	
	</div>
	  <div id="divChatWindow"></div>
	  
	   <input disabled type="text" id="txtMessage" placeholder="send a message">  <button id = "btnMessage">Send</button>
				
		 <div id="game-keyboard">
		 	   ${generateKeyboard({live: false, layout: "qwerty"})}	
			   ${generateKeyboard({live: true, layout: "qwerty"})}
		 	   ${generateKeyboard({live: false, layout: "symbols"})}	
			   ${generateKeyboard({live: true, layout: "symbols"})}				   
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