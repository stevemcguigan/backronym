let	  user			 = null;	
let   clientId       = null;
let   gameId         = null;
let	  game 			 = null;
let	  loc	 		 = "lobby";
let   nick 			 = "Player" + randomInt(100,999);
let	  host			 = false;
let   acronym		 = false;
let   soundtrack	 = null;
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
let cursorIntervall = null;
let heldKeyInterval = null;
let lastKeyPress = null;
let counter = 0;
let counterInterval = null;
let current = {} // stolen from colorspike, name kept to avoid refactor :eyeroll:
current.notifications = []; 
current.modal_queue = [];
current.score = "";

let longpressKeySkips = {
	 "key_shift" : true,
	 "key_symbols" : true,	 
}



var actionItem = function(a) {
	
	this.name = a.name;
	this.icon = a.icon;
	this.label =  a.label;
	this.label_class = a.label_class;
	this.label2 =  a.label2;
	this.label2_class = a.label2_class;
	this.action =  a.action;
	this.data1 = a.data1;
	this.data2 = a.data2;
	this.data3 = a.data3;
	this.class = a.class ? a.class : "confirmation_button";
	//this.active = a.active;
	if (a.active === undefined || a.active === null || a.active === 0 || a.active === true)
	{
		this.active = true;
	} else {
		this.active = false;
	}	


	if (a.touchstartaction === undefined || a.touchstartaction === null || a.touchstartaction === 0)
	{
		this.touchstartaction = "";
	} else {
		this.touchstartaction = a.touchstartaction;
	}

	if (a.touchendaction === undefined || a.touchendaction === null || a.touchendaction === 0)
	{
		this.touchendaction = "";
	} else {
		this.touchendaction = a.touchendaction;
	}

}



document.addEventListener('touchmove', function (event) {
  if (event.scale !== 1) { event.preventDefault(); }
}, { passive: false });

window.addEventListener("keydown", (evt) => {//when this happens
	//console.log(evt.keyCode); //log keycode

	switch (evt.keyCode)
	{
		case 13:
			evt.preventDefault();	
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