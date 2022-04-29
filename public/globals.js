let   name           = "Default Name";
let   clientId       = null;
let   gameId         = null;
let	  game 			 = null;
let	  loc	 		 = "lobby";
let   nick 			 = "Player" + randomInt(100,999);
let	  host			 = false;
let   acronym		 = false;
let observer = null;
let callback = null;

let btnCreate      = null; //id("btnCreate");
let btnJoin        = null; //id("btnJoin");
let txtGameId      = null; //id("txtGameId");
let txtNick        = null; //id("txtNick");
let txtMessage     = null; //id("txtMessage");
let divPlayers     = null; //id("divPlayers");
let divChatWindow  = null; //id("divChatWindow");
let btnMessage	   = null;
let btnStart 	   = null;
let wordsTyped = 0;
let heldKeyInterval = null;
let lastKeyPress = null;
let counter = 0;
let counterInterval = null;
let current = {} // stolen from colorspike, name kept to avoid refactor :eyeroll:
current.notifications = []; 



document.addEventListener('touchmove', function (event) {
  if (event.scale !== 1) { event.preventDefault(); }
}, { passive: false });

window.addEventListener("keydown", (evt) => {//when this happens
	//console.log(evt.keyCode); //log keycode

	switch (evt.keyCode)
	{
		case 13:
			$("#btnMessage").click();
		break;
		default:
			checker();
		break;	
	}
});


window.onfocus = function () { 
	let divChatWindow = id("divChatWindow");
	//console.log(typeof divChatWindow.lastChild)
	try
	{
		divChatWindow.lastChild.scrollIntoView({ behavior: "smooth", block: "end" });
	}
	catch
	{
		console.log("couldn't force scroll in chat")
	}
}; 