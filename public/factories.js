
function nightModeToggle()
{
	let nightMode = $('#nightModeToggle')
	if (nightMode.hasClass('fa-moon')) {
		nightMode.removeClass('fa-moon').addClass('fa-sun')
		$('html').addClass('invert')
	} else {
		nightMode.addClass('fa-moon').removeClass('fa-sun')
		$('html').removeClass('invert')
	}
	saveUser();
}

function string2emoji(str)
{
	let letterMap = {
		"A":	"🅰",	
		"B":	"🅱",	
		"C":	"🅲",
		"D":	"🅳",	
		"E":	"🅴",	
		"F":	"🅵",	
		"G":	"🅶",	
		"H":	"🅷",	
		"I":	"🅸",	
		"J":	"🅹",	
		"K":	"🅺",	
		"L":	"🅻",	
		"M":	"🅼",	
		"N":	"🅽",	
		"O":	"🅾",	
		"P":	"🅿",	
		"Q":	"🆀",	
		"R":	"🆁",	
		"S":	"🆂",	
		"T":	"🆃",
		"U":	"🆄",	
		"V":	"🆅",	
		"W":	"🆆",	
		"X":	"🆇",	
		"Y":	"🆈",	
		"Z":	"🆉",               
	}

	let newStr = ""
	for (let i = 0; i < str.length; i++)
	{
		newStr += letterMap[str[i]]
	}	

	return newStr
}

function number2emoji(number)
{
	lettermap = [
	"0️⃣",
	"1️⃣",
	"2️⃣",
	"3️⃣",
	"4️⃣",
	"5️⃣",
	"6️⃣",
	"7️⃣",
	"8️⃣",
	"9️⃣" ]

	number = number.toString()
	let newStr = ""
	for (let i=0; i < number.length; i++)
	{
			newStr+=lettermap[parseInt(number[i],10)]
	}		
	return newStr

}


function stripLeadingSpaces(inputString) {
    return inputString.replace(/^\s+/, ''); // ^\s+ matches one or more whitespace characters at the beginning of the string
}

function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
}

function roundShare(el) {
	// this is quickly implemented trash, marked for refactor
	$("#scoreboard .confirmation_button:eq(1)").html("<i class='fas fa-hourglass-1'></i>")
	
	setTimeout(function() {
		$("#scoreboard .confirmation_button:eq(1)").html("<i class='fas fa-hourglass-2'></i>")
	}, 300)
	
	setTimeout(function() {
	$("#scoreboard .confirmation_button:eq(1)").html("<i class='fas fa-hourglass-3'></i>")
	}, 600)
	
	setTimeout(function() {
		$("#scoreboard .confirmation_button:eq(1)").html("<i class='fas fa-hourglass-1'></i>")
	}, 900)
	
	setTimeout(function() {
		$("#scoreboard .confirmation_button:eq(1)").html("copied!")
	}, 1200)			

	let awards = ["🏆", "🥈", "🥉"]
	let modal = document.getElementById(el)
	let round = JSON.parse(modal.dataset.resultArray)
	let letters = string2emoji(modal.dataset.letters)
	let result = "";

	round.sort((a, b) => b.roundScore - a.roundScore);

	for (let i = 0; i < round.length; i++) {
		clog(typeof round[i].acronym, 4)
		clog(round[i].acronym, 4)
		if (typeof round[i].acronym !== "object")
			result += ` ${round[i].nick}: ${round[i].acronym}  ${round[i].roundScore}pts ${i < 1 ? awards[i] : ""}\n`	
	}

	result = `         ${letters}\n${result}`

	result = stripLeadingSpaces(result)					


	copyToClipboard(result)



  //generateNotification({message: "Round copied to clipboard! Go share it!",
                    //  type: "dm",
                    //  color: "green"})   
}
	

function generateTitleBar(exit)
{
	let markup = `	<div id="titleBar" class="">
		<span ${exit ? 'class="reveal disable-animation"' : ""} id="exitContainer" onclick="exitGameConfirm()"><i class="fas fa-caret-left"></i></span>
		<span id="logoBar">backronym</span>
		<span id="toolBar">
			<span id="nightModeToggleContainer" onclick="nightModeToggle()"><i id="nightModeToggle" class="fas ${user.theme == 1 ? "fa-sun" : "fa-moon"}"></i></span>
			<span id="settingsContainer" onclick="openMenu()"><i class="fas fa-info-circle"></i></span></span>
		</span>	
  </div>`
	return markup;
}

function generateLobby()
{
	let markup = `
		${generateTitleBar(false)}
		<div class="gameListContainer"><div class="" style="font-size:12px;">-join a public game-</div></div>
	  <div class="gameListContainer"><div style="margin-top:15px" id="gameList"></div>
	  </div>
	  <div style="flex: 1"></div>
	  <div class="gameListContainer" style=""><div style="font-size:12px;" class="">-or-</div></div>
	  <div class="lobbyButtons">
		  <button class="confirmation_button" id = "btnCreate">create new game</button>
		  <button class="confirmation_button" id = "btnJoinPrivate" style="">join private game</button>
		</div>
		<div style="flex: 1"></div>
		<div id="lobbyInstructionsContainer">
			${generateInstructions()}
		</div>
	  <!--<button id = "btnJoin">Join Game</button>-->
	  <input type = "text" id = "txtGameId">`; 
	return markup;
}

function generateInstructions()
{
  clog("generating new acro for instructions", 5)
	let acro = randomAcronym();
	let lettersMarkup = "";

	for (var x = 0; x < acro.letters.length; x++)
	{
		lettersMarkup += `<span id="${x}" class="letterTile animate__animated animate__rubberBand hidden">
													<div class="letterTileLetter">${acro.letters.charAt(x)}</div>
											</span>`
	}	

	return `
	<div class="gameListContainer" style="margin:20px 0px 20px 0px;font-size:12px;"><div class="">-how to play-</div></div>
	<div class="gameListContainer" style="margin:20px 0px 20px 0px;"><div style="text-align:center; font-style: italic; font-size:10px; width:75%; max-width:80%">Objective: reverse-engineer an acronym.<br><br>
		<div id="lobbyInstructions" class="instructions" style="transform: scale(.5); margin-top: -30px;
    	margin-bottom: -30px; font-size:12px;">
			<div class="acronymContainer sampleAcro">
							${lettersMarkup}																		
			</div>
		</div>
		<div>
			${randomPhraseContainer(acro.phrase)}
		</div>
		<div style='margin-top:10px'>There's no right answer. Just try to come up with the funniest, cutest, or most clever thing the letters <span class='bold'>could</span> stand for. Have fun!</div>`
}

function randomAcronym()
{
	let acro = [
		{letters: "LATTU", 	phrase: "Louis Armstrong's Trumpet-themed Underpants"},
		{letters: "CRST", 	phrase: "Can't Really Smell Taters"},
		{letters: "PTCA", 	phrase: "Pass the cheese, Amiga"},
		{letters: "MOWCB", 	phrase: "Making out with Celebrity Butlers"},
		{letters: "CITBOV", phrase: "Corn is the Beef of Vegetables"},
		{letters: "PAOWE", 	phrase: "Presbyterians Are Obsessed With Elvis"},
		{letters: "UK", 		phrase: "Understanding Klingon"},		
		{letters: "LEVP", 	phrase: "Limited Edition Vegetable Poptarts®"},	
		{letters: "JMORT",	phrase: "John Mayer Oughta Retire TBH"},		
		{letters: "MTSD", 	phrase: "Margaret Thatcher: Still Dead."},
		{letters: "CCFD", 	phrase: "Captain Crunch® for Dinner"},	
		{letters: "ITHHAS", phrase: "IN THIS HOUSE, HOTDOGS ARE SANDWICHES."},	
		{letters: "PMSEB", 	phrase: "Paul McCartney secretly eats bacon"},		
		{letters: "PWI", 		phrase: "Parasailing While Intoxicated"},	
		{letters: "STHHH", 	phrase: `Steve "The Hair" Harrington's Hairdresser`},		
		{letters: "AHW", 		phrase: `Anyway, here's Wonderwall.`},		
		{letters: "PSFY", 	phrase: `Potato Salad fetish? Yikes.`},		
		{letters: "IBF", 		phrase: `International Butterbean Fanclub`},			
		{letters: "TFBWY", 	phrase: `The Fifth Beatle was Yoko`},		
		{letters: "DPFPOE", phrase: `Dolly Parton for President of Earth`}																														
	];
	return acro[randomInt(0, acro.length - 1)];
}


function randomPhraseContainer(phrase)
{

	var markup = `
	<div class="sampleAcronymContainer" style="display:flex; font-size:12px;">
		<div style="flex-basis:25%"></div>
			<div style="display:flex;    flex-basis: 75%;justify-content:center;">	
				<div>
					<div class="sampleAcronym borderBlink sampleAcro" style="width:0px;overflow:hidden;white-space:nowrap;text-align:center;" class="sampleAcronym">
							<b>${phrase}</b>
					</div>
				</div>
			</div>
		<div style="flex-basis:25%">
		</div>
	</div>`
	return markup;
}


function randomLATU()
{
	let i = randomInt(1,5)
	let latu = ""
	switch (i)
	{
		case 1:
		latu = `<div class="sampleAcronymContainer" style="display:flex; font-size:12px;">
				<div style="flex-basis:25%"></div>
				<div style="display:flex;    flex-basis: 75%;justify-content:center;">	
				<div><div class="sampleAcronym borderBlink" style="width:0px;overflow:hidden;white-space:nowrap;text-align:center;" class="sampleAcronym"><b>L</b>ets <b>A</b>ll <b>T</b>rade <b>U</b>ncles. </div></div>
				</div>
				<div style="flex-basis:25%"></div>
			</div>`
		break;
		case 2:
		latu = `<div class="sampleAcronymContainer" style="display:flex; font-size:12px;">
				<div style="flex-basis:25%"></div>
				<div style="display:flex;    flex-basis: 75%;justify-content:center;">	
					<div class="sampleAcronym borderBlink" style="width:0px;overflow:hidden;white-space:nowrap;text-align:center;margin-top:8px;" class="sampleAcronym"><b>L</b>emons <b>A</b>re <b>T</b>angy, <b>U</b>hhhhhhh</div>
				</div>
				<div style="flex-basis:25%"></div>
			</div>`

		break;
		case 3:
		latu = `<div class="sampleAcronymContainer" style="display:flex; font-size:12px;">
					<div style="flex-basis:25%"></div>
					<div style="display:flex;    flex-basis: 75%;justify-content:center;">	
						<div><div class=sampleAcronym borderBlink" style="width:0px;overflow:hidden;white-space:nowrap;text-align:center;margin-top:8px;" class="sampleAcronym"><b>L</b>ouis <b>A</b>rmstrong's <b>T</b>rumpet-themed <b>U</b>nderpants</div></div>
					</div>
					<div style="flex-basis:25%"></div>
				</div>`		
		break;
		case 4:
		latu = `<div class="sampleAcronymContainer" style="display:flex; font-size:12px;">
					<div style="flex-basis:25%"></div>
					<div style="display:flex;    flex-basis: 75%;justify-content:center;">	
						<div class=sampleAcronym borderBlink" style="width:0px;overflow:hidden;white-space:nowrap;text-align:center;margin-top:8px;" class="sampleAcronym"><b>L</b>ittle <b>a</b>wkward, <b>t</b>here, <b>U</b>rsula...</div>
					</div>
					<div style="flex-basis:25%"></div>
				</div>`		
		break;		
		case 5:
		latu = `<div class="sampleAcronymContainer" style="display:flex; font-size:12px;">
					<div style="flex-basis:25%"></div>
					<div style="display:flex;    flex-basis: 75%;justify-content:center;">	
						<div class=sampleAcronym borderBlink" style="width:0px;overflow:hidden;white-space:nowrap;text-align:center;margin-top:8px;" class="sampleAcronym"><b>L</b>unchables® <b>A</b>re <b>T</b>horoughly <b>U</b>nappealing...</div>
					</div>
					<div style="flex-basis:25%"></div>
				</div>`		
		break;				
		default:
		latu = `<div class="sampleAcronymContainer" style="display:flex; font-size:12px;">
					<div style="flex-basis:25%"></div>
					<div style="display:flex;    flex-basis: 75%;justify-content:center;">	
						<div><div class=sampleAcronym borderBlink" style="width:0px;overflow:hidden;white-space:nowrap;text-align:center;margin-top:8px;" class="sampleAcronym"><b>L</b>ouis <b>A</b>rmstrong's <b>T</b>rumpet-themed <b>U</b>nderpants</div></div>
					</div>
					<div style="flex-basis:25%"></div>
				</div>`				
		break;
	}

return latu;

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


function generateAcronymContainer(acronym, reroll)
{
	if (!acronym)
		return;

	let letters = ""

	for (let x = 0; x < acronym.length; x++)
	{
		letters += tile(acronym.charAt(x), x)
	}	

	let markup = `
	${generateTitleBar(reroll)}
	<div class="acronymContainer">
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

function injectChat(markup)
{
    const divChatWindow = id("divChatWindow");
    const d = document.createElement("div");
    d.innerHTML = markup
    divChatWindow.appendChild(d);
}


function generateGame() 
{
	let markup = `
	<!--<div id="titleBar" class="">
		<span style="flex-basis:80%" id="logoBar">backronym</span>
		<span style="flex-basis:20%">
			<span id="nightModeToggleContainer" onclick="nightModeToggle()"><i id="nightModeToggle" class="fas fa-moon"></i></span>
			<span id="exitContainer" onclick="exitGameConfirm()"><i class="fas fa-door-open"></i></span>
			<span id="settingsContainer" onclick="openMenu()"><i class="fas fa-info-circle"></i></span></span>
		</span>	
  </div>-->
  ${generateTitleBar(false)}
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

  let players = 0;
 	clear("gameList");

 	$(`<div id="gameListHeading" class="gameWrapper"><div class="gamePuck">host</div><div class="playersPuck">players</div><div class="joinPuck"></div></div>`, {}).appendTo('#gameList');	
	Object.keys(games).forEach (c => {
		players = games[c].clients.length;	
		//if (games[c].joinable) {
			// checking to see if the game is "joinable", usually only false during three seconds after host has exited but before server boots the rest
			// also checking if "key" is false, which indicates that it's a public game. Private games have keys and do not appear in this list. eventually the server will filter these out before sending them over.
			$(`<div onclick="join('${c}')" class="gameWrapper"><div  id="${c}" class="gamePuck">${games[c].hostname}</div><div class="playersPuck">${players}/10</div><div class="joinPuck"><button>join</button></div></div>`, {}).appendTo('#gameList');	
		//} 
	})

  let markup = `

  `;
}

function generateNickList()
{
	let markup = ""
	for (let i = 0; i < current.nickList.length; i++) {
		markup+= `<div id="${current.nickList[i].id}" class="nickListNick">${current.nickList[i].nick}${current.nickList[i].id == clientId ? " (You) <span onclick='editNick()' class='nickEditIcon'><i class='fas fa-edit'></i></span>" : ""}</div>`
	}
	return markup
}


function generateClock()
{
	let color = $('html').hasClass("invert") ? "#9932CC" : "olivedrab"
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
      <line class="iconic-clock-second-hand-arm" fill="none" stroke="${color}" stroke-width="2" stroke-miterlimit="10" x1="192" y1="192" x2="192" y2="28.5"/>
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