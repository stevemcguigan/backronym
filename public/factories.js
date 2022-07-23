// functions that return blocks of markup

function generateTitleScreen()
{
	let markup = `<div>`
}

function generateTitleBar()
{
	let markup = `<div id="titleBar" class=""><span id="logoBar">backronym</span><span id="menu" onclick="openMenu()">☰</span></div>`
	return markup;
}

function generateLobby()
{
	let markup = `
		<div class="gameListContainer"><div class="">-join a public game-</div></div>
	  <div class="gameListContainer"><div style="margin-top:15px" id="gameList"></div>
	  </div>
	  <div style="flex: 1"></div>
	  <div class="gameListContainer" style="margin:20px 0px 20px 0px;"><div class="">-or-</div></div>
	  <div class="lobbyButtons">
		  <button class="confirmation_button" id = "btnCreate">create new game</button>
		  <button class="confirmation_button" id = "btnJoinPrivate">join private game</button>
		</div>
		<div style="flex: 1"></div>
		<div id="lobbyInstructionsContainer">
			${generateInstructions()}
		</div>
	  <!--<button id = "btnJoin">Join Game</button>-->
	  <input type = "text" id = "txtGameId"><br>`;
	return markup;
}

function generateInstructions()
{
	return `
	<div class="gameListContainer" style="margin:20px 0px 20px 0px;"><div class="">-how to play-</div></div>
	<div class="gameListContainer" style="margin:20px 0px 20px 0px;"><div class="">chat with friends while reverse engineering acronyms</div></div>

		<div id="lobbyInstructions" class="instructions" style="transform: scale(.5);    margin-top: -30px;
    	margin-bottom: -30px;">
			<div class="acronymContainer">
							<span id="0" class="letterTile animate__animated animate__rubberBand hidden">
								<div class="letterTileLetter">L</div>
							</span>
							<span id="1" class="letterTile animate__animated animate__rubberBand hidden">
								<div class="letterTileLetter">A</div>
							</span>
							<span id="2" class="letterTile animate__animated animate__rubberBand hidden">
								<div class="letterTileLetter">T</div>
							</span>
							<span id="3" class="letterTile animate__animated animate__rubberBand hidden">
								<div class="letterTileLetter">U</div>
							</span>																					
			</div>
		</div>
		<div>
			<div class="sampleAcronymContainer" style="display:flex;">
				<div style="flex-basis:25%"></div>
				<div style="display:flex;justify-content:flex-start;">	
					<div class="sampleAcronym borderBlink" style="width:0px;overflow:hidden;white-space:nowrap;text-align:center;" class="sampleAcronym"><b>L</b>ets <b>A</b>ll <b>T</b>rade <b>U</b>nderpants. </div>
				</div>
				<div style="flex-basis:25%"></div>
			</div>			
			<!--<div class="sampleAcronymContainer" style="display:flex;">
				<div style="flex-basis:25%"></div>
				<div style="display:flex;justify-content:flex-start;">	
					<div class="sampleAcronym borderBlink" style="width:0px;overflow:hidden;white-space:nowrap;text-align:center;margin-top:8px;" class="sampleAcronym"><b>L</b>et's <b>A</b>ll <b>T</b>rade <b>U</b>ncles </div>
				</div>
				<div style="flex-basis:25%"></div>
			</div>					
			<div class="sampleAcronymContainer" style="display:flex;">
				<div style="flex-basis:25%"></div>
				<div style="display:flex;justify-content:flex-start;">	
					<div class=sampleAcronym borderBlink" style="width:0px;overflow:hidden;white-space:nowrap;text-align:center;margin-top:8px;" class="sampleAcronym"><b>L</b>ouis <b>A</b>rmstrong's <b>T</b>rumpet-themed <b>U</b>nderpants</div>
				</div>
				<div style="flex-basis:25%"></div>
			</div>-->
		</div>`
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
			<div class="letterTileLetter">${letter}</div>
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
		'"' : {"id" : "doublequote","label" : '"'},
		"." : {"id" : "period",		"label" : "."},
		"," : {"id" : "comma",		"label" : ","},	
		"?" : {"id" : "question",	"label" : "?"},
		"!" : {"id" : "exclamation","label" : "!"},
		"'" : {"id" : "apostrophe",	"label" : "'"},	
		"*" : {"id" : "period2",	"label" : "."},
		"." : {"id" : "period",		"label" : "."},		
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

	if (layout == "qwerty" && (mappedSymbol.id == "period"))
		data = mappedSymbol.label;

	if (layout == "symbols" && (mappedSymbol.id == "symbols" || mappedSymbol.id == "shift"))
		data = mappedSymbol.id;

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
		 layout4 = "%_✓"	
	}
	else
	{
		 hidden = true;
		 suffix = live ? "_2" : "_2_"
		 layout1 = "1234567890"
		 layout2 = `-/:;()$&@"`
		 layout3 = `↑.,?!'←`
		 layout4 = "%_*✓"	
	
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
	if (!acronym)
		return;

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
		<button id = "${host ? 'btnStart' : 'btnWait'}" class="animate__animated animate__zoomIn">${host ? 'start' : 'waiting...'}</button>			  	
	</div>
	<div id="notifications">

	</div>
	  <div id="divChatWindow"></div>
		<div class="textarea-wrapper">	  
	   <textarea id="txtMessage" placeholder="|"></textarea>  <button id = "btnMessage">Send</button>
		</div>		
		 <div id="game-keyboard">
		 	   ${generateKeyboard({live: false, layout: "qwerty"})}	
			   ${generateKeyboard({live: true, 	layout: "qwerty"})}
		 	   ${generateKeyboard({live: false, layout: "symbols"})}	
			   ${generateKeyboard({live: true, 	layout: "symbols"})}				   
		</div>		  
	`;
	return markup;
}

function updateGameList(games)
{
	//alert(games);
  
  	//console.log(JSON.stringify(games));
  	let players = 0;
 // let gamesObj = games.games;
 	clear("gameList");

 	$(`<div id="gameListHeading" class="gameWrapper"><div class="gamePuck">host</div><div class="playersPuck">players</div><div class="joinPuck"></div></div>`, {}).appendTo('#gameList');	
	Object.keys(games).forEach (c => {
		players = games[c].clients.length;
		$(`<div onclick="join('${c}')" class="gameWrapper"><div  id="${c}" class="gamePuck">${games[c].hostname}</div><div class="playersPuck">${players}/10</div><div class="joinPuck"><button>join</button></div></div>`, {}).appendTo('#gameList');	
	})

  let markup = `

  `;

  //populate("gameList", )
}



function generateClock()
{
	let markup = `<div id="clockContainer" class="animate__animated animate__rubberBand">
	<svg version="1.1" class="iconic-clock" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="384px" height="384px" viewBox="0 0 384 384" enable-background="new 0 0 384 384" xml:space="preserve">
 
 <line x1="200" y1="25" x2="200" y2="35" stroke-width="6" stroke="#777"></line> 
<line x1="200" y1="25" x2="200" y2="35" stroke-width="6"  stroke="#777" transform="rotate(30, 200, 200)"></line>
<line x1="200" y1="25" x2="200" y2="35" stroke-width="6"  stroke="#777" transform="rotate(60, 200, 200)"></line>
<line x1="200" y1="25" x2="200" y2="35" stroke-width="6"  stroke="#777" transform="rotate(90, 200, 200)"></line>
<line x1="200" y1="25" x2="200" y2="35" stroke-width="6"  stroke="#777" transform="rotate(120, 200, 200)"></line>
<line x1="200" y1="25" x2="200" y2="35" stroke-width="6"  stroke="#777" transform="rotate(150, 200, 200)"></line>
<line x1="200" y1="25" x2="200" y2="35" stroke-width="6"  stroke="#777" transform="rotate(180, 200, 200)"></line>
<line x1="200" y1="25" x2="200" y2="35" stroke-width="6"  stroke="#777" transform="rotate(210, 200, 200)"></line>
<line x1="200" y1="25" x2="200" y2="35" stroke-width="6"  stroke="#777" transform="rotate(240, 200, 200)"></line>
<line x1="200" y1="25" x2="200" y2="35" stroke-width="6"  stroke="#777" transform="rotate(270, 200, 200)"></line>
<line x1="200" y1="25" x2="200" y2="35" stroke-width="6"  stroke="#777" transform="rotate(300, 200, 200)"></line>
<line x1="200" y1="25" x2="200" y2="35" stroke-width="6"  stroke="#777" transform="rotate(330, 200, 200)"></line>

  <line class="iconic-clock-hour-hand" id="foo" fill="none" stroke="#777" stroke-width="10" stroke-miterlimit="10" x1="192" y1="192" x2="192" y2="87.5"/>
  <line class="iconic-clock-minute-hand" id="iconic-anim-clock-minute-hand" fill="none" stroke="#777" stroke-width="4" stroke-miterlimit="10" x1="192" y1="192" x2="192" y2="54"/>
  <circle class="iconic-clock-axis" cx="192" cy="192" r="9"/>
  <g class="iconic-clock-second-hand" id="iconic-anim-clock-second-hand">
      <line class="iconic-clock-second-hand-arm" fill="none" stroke="olivedrab" stroke-width="2" stroke-miterlimit="10" x1="192" y1="192" x2="192" y2="28.5"/>
      <circle class="iconic-clock-second-hand-axis" fill="#olivedrab" cx="192" cy="192" r="4.5"/>
  </g>
  <defs>
    <animateTransform
          type="rotate"
          fill="remove"
          restart="always"
          calcMode="linear"
          accumulate="none"
          additive="sum"
          xlink:href="#iconic-anim-clock-hour-hand"
          repeatCount="indefinite"
          dur="43200s"
          to="360 192 192"
          from="0 192 192"
          attributeName="transform"
          attributeType="xml">
    </animateTransform>

    <animateTransform
          type="rotate"
          fill="remove"
          restart="always"
          calcMode="linear"
          accumulate="none"
          additive="sum"
          xlink:href="#iconic-anim-clock-minute-hand"
          repeatCount="indefinite"
          dur="3600s"
          to="360 192 192"
          from="0 192 192"
          attributeName="transform"
          attributeType="xml">
    </animateTransform>

    <animateTransform
          type="rotate"
          fill="remove"
          restart="always"
          calcMode="linear"
          accumulate="none"
          additive="sum"
          xlink:href="#iconic-anim-clock-second-hand"
          repeatCount="indefinite"
          dur="60s"
          to="360 192 192"
          from="0 192 192"
          attributeName="transform"
          attributeType="xml">
    </animateTransform>
  </defs>
  <script  type="text/javascript">
  <![CDATA[
      var date = new Date;
      var seconds = date.getSeconds();
      var minutes = date.getMinutes();
      var hours = date.getHours();
      hours = (hours > 12) ? hours - 12 : hours;

      minutes = (minutes * 60) + seconds;
      hours = (hours * 3600) + minutes;

      document.querySelector('.iconic-clock-second-hand').setAttribute('transform', 'rotate('+360*(seconds/60)+',192,192)');
      document.querySelector('.iconic-clock-minute-hand').setAttribute('transform', 'rotate('+360*(minutes/3600)+',192,192)');
      document.querySelector('.iconic-clock-hour-hand').setAttribute('transform', 'rotate('+360*(hours/43200)+',192,192)');
  ]]>
  </script>
</svg>
				  </div>`
return markup;
}


function populate (id, markup, callback)
{
	$(`#${id}`).html(markup);
	if (callback)
		callback();
}