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