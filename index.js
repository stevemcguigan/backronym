// this is where the server manages requests and sends responses

const http = require("http");
const express = require("express")
const app = express();

// vvv this one goes in ngrok & browser
app.listen(8000, () => console.log("listening on 8000"));
app.use(express.static('public'))
app.get("/", (req, res) => res.sendFile(__dirname + "/index.html"));

const websocketServer = require("websocket").server
const httpServer = http.createServer();


// vvv this one goes in parser.js
httpServer.listen(9090, () => console.log("Listening on port 9090"));
const wsServer = new websocketServer({
	"httpServer": httpServer
});
 

const clients = {};
const clientLocals = {};
const games = {};
const keys = {};

wsServer.on("request", request => {
	// this is the connect!
	const connection = request.accept(null, request.origin);
	// connected, cool, make an id
	connection.on("open", () => {
		console.log("connection opened");
	});
	connection.on("close", () => {
		console.log("connection closed");
	});
	connection.on("message", message => {
	// could fail if client sends bad JSON
	const result = JSON.parse(message.utf8Data);

		if(result.method === "getGames")
		{
			const payload = {
				"method": "getGames",
				"games" : games
			}

			const con = clients[clientId].connection;
			con.send(JSON.stringify(payload));	
		}	

		if(result.method === "pong")
		{
			console.log("got a pong back");
			console.log(result)
			ping(result.clientId, result.pongid);
		}	

		if(result.method === "create")
		{
			// user requests new game
			const clientId = result.clientId;
			const host = result.host;
			const isPrivate = result.isPrivate;
			let key = "";
			const gameId = guid();
			if (isPrivate)
			{	
				for (let x = 0; x < 3; x++)
				{
					x ? key += "-" + getRandomWord() : key = getRandomWord();
				}	
				keys[key] = gameId; 

			} else {
				key = false
			}	
			console.log(`the game is private? ${isPrivate}. the KEY is ${key}`);

			games[gameId] = {
				"id": gameId,
				"hostId": clientId,
				"hostname": host,
				"key": key,
				"inProgress" : false,
				"clients": [],
				"acronyms": [],
				"currentRound": 1,
				"roundTimer" : null,
				"acceptingAnswers" : false,
				"answers": []
			}

			const payload = {
				"method": "create",
				"game" : games[gameId]
			}

			const con = clients[clientId].connection;
			con.send(JSON.stringify(payload));

		}

		if(result.method === "chatmsg")
		{
			const clientId = result.clientId;
			const gameId = result.gameId;
			const game = games[gameId];
			const nick = result.nick;
			chat(game, clientId, nick, result.message)
		}

		if(result.method === "castVote")
		{
			const clientId = result.clientId;
			const ownerId = result.ownerId;
			const gameId = result.gameId;
			const game = games[gameId];
			console.log("**** cast vote");
			console.log(result);
			dm(clientId, "vote received.");
			clients[clientId].currentGameInfo.vote = ownerId;
			//console.log(clients[clientId]);
		}		

		if(result.method === "play")
		{
			const clientId = result.clientId;
			const gameId = result.gameId;
			const game = games[gameId];
			if (game.acceptingAnswers)
			{	
				const play = result.play;
	 			console.log("Play received from " + result.clientId); 
				//console.log(game);
				console.log(clients[clientId].currentGameInfo.play)

				if (clients[clientId].currentGameInfo.play == null) {
					//broadcast(game, clients[clientId].currentGameInfo.nick + " answered.")
					broadcast(game, "someone answered.")
				} else {
					broadcast(game, "someone changed their answer.")
					//broadcast(game, clients[clientId].currentGameInfo.nick + " changed their answer.")
				}

				clients[clientId].currentGameInfo.play = play;
				console.log(clients[clientId].currentGameInfo.play)

			}
			else
			{
				dm(clientId, "too late.");
				//console.log("tried to submit an answer outside of time")
			}	
			//chat(game, clientId, nick, result.message)
		}		

		if(result.method === "localId")
		{
			// this is in case the socket is dropped, which is likely because people will background the 
			// browser to answer texts etc. 
			// the server issues a clientId but the client generates it's own guid as well. As soon as 
			// a connection is made, server will store a relationship so that on reconnect it can find
			// which game you were playing before and reconnect you to it seamlessly
			const clientId = result.clientId; 
			const localId = result.localId;
			
			if (clientLocals[localId]) { // move this (And everything else tbh) into function when it works
				console.log(`looks like the connection was probably interupted!`)
				console.log(`old client id: ${clientLocals[localId]}`)
				console.log(`new client id: ${clientId}`)
				let oldClient = clients[clientLocals[localId]];
				let newClient = clients[clientId];
				newClient.currentGameInfo = JSON.parse(JSON.stringify(oldClient.currentGameInfo));
				let gameId = newClient.currentGameInfo.gameId;
				let game = games[gameId];
				// now lets go pluck out that old dead client outta the game and add this new one
				console.log("")
				console.log(`Trying to find and delete ${clientLocals[localId]} from game.clients using key ${localId}`)
				console.log(`before culling old:`)
				console.log(game.clients);
				for (let x = 0; x < game.clients.length; x++)
				{
					if (game.clients[x].clientId == clientLocals[localId])
						game.clients.splice(x, 1);
				}
				console.log(`after:`)
				console.log(game.clients);				
				//delete game.clients[clientLocals[localId]];
				game.clients.push({
					"clientId" : clientId,		
				});	
				if (game.hostId == clientLocals[localId])
				{	
					game.hostId == clientId;
					game.hostNick = clients[clientId].currentGameInfo.nicl
				}	
				for (let x = 0; x < game.answers.length; x++)
				{
					if (game.answers[x].owner == clientLocals[localId])
						game.answers[x].owner = clientId;
				}
				const payload = {
					"method" : "join",
					"game" : game
				}
				console.log("trying to seamlessly re-insert player into game, cross your fingers")	
				console.log(`after reinsert:`)
				console.log(game.clients);							
				clients[clientId].connection.send(JSON.stringify(payload));	
				clientLocals[localId] = clientId;
			} else {
				console.log(`looks like a fresh connection`);
				clientLocals[localId] = clientId;

			}

			//clientLocals[localId] = clientId;
			//checkForReconnect(localId); 
		}
   
		if(result.method === "start")
		{

			const clientId = result.clientId;
			const gameId = result.gameId;
			setup(games[gameId]);
		}
   

		if(result.method === "joinPrivate")
		{
			//console.log("received a request to join a private game with key " + result.key);
			if (keys[result.key] !== undefined) {
				privategameId = keys[result.key];
				console.log(`${result.key} found with id ${privategameId}`);
			} else {
				console.log("no game found with key " + result.key)
				privategameId = false;
			}
			
			privateJoinWinFail(result.clientId, newgameId)

		}	

		if(result.method === "join")
		{
			//console.log("RESULT")
			//console.log(result)
			const clientId = result.clientId;
			const gameId = result.gameId;
			const game = games[gameId];
			//console.log("GAME")
			//console.log(game);
			game.clients.push({
				"clientId" : clientId,		
			});
			//game.clients[clientId]
			clients[clientId].currentGameInfo = {
				"gameId" : gameId,
				"nick" : result.nick,
				"clientId" : clientId,
				"roundScore" : 0,
				"scoreTotal" : 0,
				"votesReceived" : 0,
				"won": false,
				"selfVoted" : false,
				"didNotVote" : false,
				"play" : null,
				"vote" : null
			}

			//console.log(game)

			const payload = {
				"method" : "join",
				"game" : game
			}

			//console.log(typeof game.clients)
			//console.log(game.clients.length);
			//game.clients.forEach (c => { // i think this is where the multiple pops happen when anyone joins, look later
				//console.log("c")
			//	console.log(JSON.stringify(c));
				clients[clientId].connection.send(JSON.stringify(payload));
				broadcast(game, `${result.nick} joined. say hi!`);
			//})
		}
	})

	//generate new clientid
	const clientId = guid();
	clients[clientId] = {
		"connection": connection
	}

	//console.log("CLIENTS")
	console.log(clients);

	const payload = {
		"method" : "connect",
		"clientId" : clientId
	}
	// send back to client
	connection.send(JSON.stringify(payload));


	/*setInterval(() => {
		ping(clientId)
	}, 60000)*/
	
})

function findGameByKey(key)
{

}

function ping(clientId, pongid)
{
	const payload = {
		"method": "ping",
		"pongid": pongid
	}

	const con = clients[clientId].connection;
	con.send(JSON.stringify(payload));	
}

function makeAcronym(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWYZ';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      a = characters.charAt(Math.floor(Math.random() * 
 		charactersLength));
      if (a == "Q" || a == "Z")
      {
      	 if (coinFlip())
      	 {	
	      a = characters.charAt(Math.floor(Math.random() * 
	 		charactersLength));  
	 	 }	    	
      }	
      result += a; //characters.charAt(Math.floor(Math.random() * 
 		//charactersLength));
   }
   return result;
}

function randomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


function setup(game)
{
	game.inProgress = true;
	for (let x = 0; x < 5; x++)
	{
		game.acronyms.push(makeAcronym(randomInt(3, 5)));	
	}		
	startRound(game)
}

function startRound(game)
{

	game.acceptingAnswers = true;
	const payload = {
		"method" : "startRound",
		"round" : game.currentRound,
		"acronym" : game.acronyms[game.currentRound - 1]
	}
	sendAll(game, payload);
	setTimeout(() => {
	  broadcast(game, "30 seconds left.")
		setTimeout(() => {
		  broadcast(game, "15 seconds. it's more than it sounds.")
			setTimeout(() => {
			  warning(game, "<span id='counter'>5</span>") 
			  	setTimeout(() => {
					  cullAnswers(game) 			  	
				}, 5000);			  	
			}, 10000);	 		  
		}, 15000);	  
	}, 30000);
}

function cullAnswers(game)
{
	console.log("here's all the answers");
	game.clients.forEach (c => {
		var answer = {
			owner: c.clientId,
			acronym: clients[c.clientId].currentGameInfo.play
		};
		game.answers.push(answer);
		
	});
	console.log(game.answers)
	getVotes(game);
}

function cullVotes(game)
{
	//console.log("here's all the votes before");
	//console.log(game);
	//console.log(clients);
	game.clients.forEach (c => {
			//console.log(c);
			if (c.clientId === clients[c.clientId].currentGameInfo.vote)
			{
				console.log("ITS A MATCH");
				//chat(game, null, "", "SELF VOTE BY " + clientId + ", -3 points lol");
				clients[c.clientId].currentGameInfo.selfVoted = true;
				//c.score -= 3;
			}	
			else if (clients[c.clientId].currentGameInfo.vote === null)
			{
				
				console.log("Didn't vote");
				clients[c.clientId].currentGameInfo.didNotVote = true;
				//chat(game, null, "", clientId + "didn't vote, -3 points lol");
				//c.score -= 3;
			}
			else
			{
				let voter = clients[c.clientId];
				let votee = clients[voter.currentGameInfo.vote]
				votee.currentGameInfo.votesReceived += 1;
			}	
	});

	console.log(`*****

    `)

	calculateRoundResult(game);
	reportRoundResult(game); 
	endRound(game);
	reportScore(game);
}

function checkForReconnect(localId)
{

}

function calculateRoundResult(game)
{
	console.log("calculating round result")
	game.clients.forEach (c => {
		let player = clients[c.clientId];
		let adjuster = player.currentGameInfo.selfVoted || player.currentGameInfo.didNotVote ? 6 : 0;
		player.currentGameInfo.roundScore = (player.currentGameInfo.votesReceived * 5) - adjuster;
		if (player.currentGameInfo.roundScore < 0)
		{
			player.currentGameInfo.roundScore = 0;	
		}	
		console.log(player.currentGameInfo)
	});

}

function reportRoundResult(game)
{
	let result = [];


	game.clients.forEach (c => {
		let player = clients[c.clientId];
		result.push({
			"nick":             player.currentGameInfo.nick,
			"acronym": 			player.currentGameInfo.play,
			"votesReceived" : 	player.currentGameInfo.votesReceived,
			"didNotVote" : 		player.currentGameInfo.didNotVote,
			"selfVoted" : 		player.currentGameInfo.selfVoted,
			"roundScore" : 		player.currentGameInfo.roundScore
		})
	});	

	const payload = {
		"method" : "reportRoundResult",
		"roundResult": result
	}	
	sendAll(game, payload);	
}


function reportScore(game)
{

	let score = []

	game.clients.forEach (c => {
		let player = clients[c.clientId];
		score.push({
			"clientId": c.clientId,
			"nick" : clients[c.clientId].currentGameInfo.nick,
			"score": clients[c.clientId].currentGameInfo.scoreTotal
		})
	});	
	//score.sort(compare);

	const payload = {
		"method" : "reportScore",
		"score": JSON.stringify(score)
	}

	sendAll(game, payload);	

	if (game.currentRound >= game.acronyms.length)
	{
		endGame(game, score[0]);
	}	
	else
	{
		broadcast(game, "next round starts in 30 seconds")
		setTimeout(() => {
			startRound(game);			  			  	
		}, 30000);			
			
	}	


}

function endRound(game)
{

	game.clients.forEach (c => {
		console.log("ENDING ROUND, ADDING SCORES")
		clients[c.clientId].currentGameInfo.scoreTotal += clients[c.clientId].currentGameInfo.roundScore; 
		clients[c.clientId].currentGameInfo.roundScore = 0;
		clients[c.clientId].currentGameInfo.votesReceived = 0;
		clients[c.clientId].currentGameInfo.didNotVote = false;
		clients[c.clientId].currentGameInfo.selfVoted = false;
		clients[c.clientId].currentGameInfo.play = null;
		clients[c.clientId].currentGameInfo.vote = null;
	});

	game.answers = [];
	game.currentRound++;

}

function endGame(game, winner)
{

	let payload = {
		"method":   "endGame",
		"hostId":   game.hostId,
		"clientId": winner.clientId,
		"nick"  :   clients[winner.clientId].currentGameInfo.nick,
		"score" :   winner.score
	}

	sendAll(game, payload);	

	game.clients.forEach (c => {
			clients[c.clientId].currentGameInfo.scoreTotal = 0;
	});

	game.currentRound = 1;
	game.acronyms = [];		

}


function getVotes(game)
{
	broadcast(game, null, "", "30 seconds to vote");
	game.acceptingAnswers = false;								 
	const payload = {
		"method" : "getVotes",
		"answers": JSON.stringify(game.answers)
	}
	sendAll(game, payload);
	setTimeout(() => {
		warning(game, "<span id='counter'>5</span>") 
		setTimeout(() => {
			cullVotes(game);	  			  		  			  	 			  		  			  	
		}, 5500);			  			  	
	}, 24500);	
}


// **** COMMS

function privateJoinWinFail(clientId, privategameId)
{

	const payload = {
		"method" : "privateJoinWinFail",
		"privategameId": privategameId
	}
	clients[clientId].connection.send(JSON.stringify(payload));
}


function chat(game, clientId, nick, message)
{
	const payload = {
		"method" : "chatmsg",
		"clientId": clientId, 
		"nick": nick,
		"message": message
	}
	sendAll(game, payload)
}

function broadcast(game, message)
{
	const payload = {
		"method" : "broadcast",
		"message": message
	}
	sendAll(game, payload)
}

function warning(game, message)
{
	const payload = {
		"method" : "warning",
		"message": message
	}
	sendAll(game, payload)
}

function dm(clientId, msg)
{
	const payload = {
		"method" : "dm",
		"message": msg
	}
	console.log("sending " + msg + " to " + clientId);
	clients[clientId].connection.send(JSON.stringify(payload));
}

function sendAll(game, payload)
{
	console.log(game);
	game.clients.forEach (c => {
		clients[c.clientId].connection.send(JSON.stringify(payload));
	})
}


//****** UTILS


function compare( a, b ) {
  if ( a.score< b.score ){
    return -1;
  }
  if ( a.score > b.score ){
    return 1;
  }
  return 0;
}

function coinFlip() {
    return (Math.floor(Math.random() * 2) == 0);
}

function guid() { // Public Domain/MIT
    var d = new Date().getTime();//Timestamp
    var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now()*1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16;//random number between 0 and 16
        if(d > 0){//Use timestamp until depleted
            r = (d + r)%16 | 0;
            d = Math.floor(d/16);
        } else {//Use microseconds since page-load if supported
            r = (d2 + r)%16 | 0;
            d2 = Math.floor(d2/16);
        }
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

const words = [
  // Borrowed from xkcd password generator which borrowed it from wherever
  "ability","able","aboard","about","above","accept","accident","according",
  "account","accurate","acres","across","act","action","active","activity",
  "actual","actually","add","addition","additional","adjective","adult","adventure",
  "advice","affect","afraid","after","afternoon","again","against","age",
  "ago","agree","ahead","aid","air","airplane","alike","alive",
  "all","allow","almost","alone","along","aloud","alphabet","already",
  "also","although","am","among","amount","ancient","angle","angry",
  "animal","announced","another","answer","ants","any","anybody","anyone",
  "anything","anyway","anywhere","apart","apartment","appearance","apple","applied",
  "appropriate","are","area","arm","army","around","arrange","arrangement",
  "arrive","arrow","art","article","as","aside","ask","asleep",
  "at","ate","atmosphere","atom","atomic","attached","attack","attempt",
  "attention","audience","author","automobile","available","average","avoid","aware",
  "away","baby","back","bad","badly","bag","balance","ball",
  "balloon","band","bank","bar","bare","bark","barn","base",
  "baseball","basic","basis","basket","bat","battle","be","bean",
  "bear","beat","beautiful","beauty","became","because","become","becoming",
  "bee","been","before","began","beginning","begun","behavior","behind",
  "being","believed","bell","belong","below","belt","bend","beneath",
  "bent","beside","best","bet","better","between","beyond","bicycle",
  "bigger","biggest","bill","birds","birth","birthday","bit","bite",
  "black","blank","blanket","blew","blind","block","blood","blow",
  "blue","board","boat","body","bone","book","border","born",
  "both","bottle","bottom","bound","bow","bowl","box","boy",
  "brain","branch","brass","brave","bread","break","breakfast","breath",
  "breathe","breathing","breeze","brick","bridge","brief","bright","bring",
  "broad","broke","broken","brother","brought","brown","brush","buffalo",
  "build","building","built","buried","burn","burst","bus","bush",
  "business","busy","but","butter","buy","by","cabin","cage",
  "cake","call","calm","came","camera","camp","can","canal",
  "cannot","cap","capital","captain","captured","car","carbon","card",
  "care","careful","carefully","carried","carry","case","cast","castle",
  "cat","catch","cattle","caught","cause","cave","cell","cent",
  "center","central","century","certain","certainly","chain","chair","chamber",
  "chance","change","changing","chapter","character","characteristic","charge","chart",
  "check","cheese","chemical","chest","chicken","chief","child","children",
  "choice","choose","chose","chosen","church","circle","circus","citizen",
  "city","class","classroom","claws","clay","clean","clear","clearly",
  "climate","climb","clock","close","closely","closer","cloth","clothes",
  "clothing","cloud","club","coach","coal","coast","coat","coffee",
  "cold","collect","college","colony","color","column","combination","combine",
  "come","comfortable","coming","command","common","community","company","compare",
  "compass","complete","completely","complex","composed","composition","compound","concerned",
  "condition","congress","connected","consider","consist","consonant","constantly","construction",
  "contain","continent","continued","contrast","control","conversation","cook","cookies",
  "cool","copper","copy","corn","corner","correct","correctly","cost",
  "cotton","could","count","country","couple","courage","course","court",
  "cover","cow","cowboy","crack","cream","create","creature","crew",
  "crop","cross","crowd","cry","cup","curious","current","curve",
  "customs","cut","cutting","daily","damage","dance","danger","dangerous",
  "dark","darkness","date","daughter","dawn","day","dead","deal",
  "dear","death","decide","declared","deep","deeply","deer","definition",
  "degree","depend","depth","describe","desert","design","desk","detail",
  "determine","develop","development","diagram","diameter","did","die","differ",
  "difference","different","difficult","difficulty","dig","dinner","direct","direction",
  "directly","dirt","dirty","disappear","discover","discovery","discuss","discussion",
  "disease","dish","distance","distant","divide","division","do","doctor",
  "does","dog","doing","doll","dollar","done","donkey","door",
  "dot","double","doubt","down","dozen","draw","drawn","dream",
  "dress","drew","dried","drink","drive","driven","driver","driving",
  "drop","dropped","drove","dry","duck","due","dug","dull",
  "during","dust","duty","each","eager","ear","earlier","early",
  "earn","earth","easier","easily","east","easy","eat","eaten",
  "edge","education","effect","effort","egg","eight","either","electric",
  "electricity","element","elephant","eleven","else","empty","end","enemy",
  "energy","engine","engineer","enjoy","enough","enter","entire","entirely",
  "environment","equal","equally","equator","equipment","escape","especially","essential",
  "establish","even","evening","event","eventually","ever","every","everybody",
  "everyone","everything","everywhere","evidence","exact","exactly","examine","example",
  "excellent","except","exchange","excited","excitement","exciting","exclaimed","exercise",
  "exist","expect","experience","experiment","explain","explanation","explore","express",
  "expression","extra","eye","face","facing","fact","factor","factory",
  "failed","fair","fairly","fall","fallen","familiar","family","famous",
  "far","farm","farmer","farther","fast","fastened","faster","fat",
  "father","favorite","fear","feathers","feature","fed","feed","feel",
  "feet","fell","fellow","felt","fence","few","fewer","field",
  "fierce","fifteen","fifth","fifty","fight","fighting","figure","fill",
  "film","final","finally","find","fine","finest","finger","finish",
  "fire","fireplace","firm","first","fish","five","fix","flag",
  "flame","flat","flew","flies","flight","floating","floor","flow",
  "flower","fly","fog","folks","follow","food","foot","football",
  "for","force","foreign","forest","forget","forgot","forgotten","form",
  "former","fort","forth","forty","forward","fought","found","four",
  "fourth","fox","frame","free","freedom","frequently","fresh","friend",
  "friendly","frighten","frog","from","front","frozen","fruit","fuel",
  "full","fully","fun","function","funny","fur","furniture","further",
  "future","gain","game","garage","garden","gas","gasoline","gate",
  "gather","gave","general","generally","gentle","gently","get","getting",
  "giant","gift","girl","give","given","giving","glad","glass",
  "globe","go","goes","gold","golden","gone","good","goose",
  "got","government","grabbed","grade","gradually","grain","grandfather","grandmother",
  "graph","grass","gravity","gray","great","greater","greatest","greatly",
  "green","grew","ground","group","grow","grown","growth","guard",
  "guess","guide","gulf","gun","habit","had","hair","half",
  "halfway","hall","hand","handle","handsome","hang","happen","happened",
  "happily","happy","harbor","hard","harder","hardly","has","hat",
  "have","having","hay","he","headed","heading","health","heard",
  "hearing","heart","heat","heavy","height","held","hello","help",
  "helpful","her","herd","here","herself","hidden","hide","high",
  "higher","highest","highway","hill","him","himself","his","history",
  "hit","hold","hole","hollow","home","honor","hope","horn",
  "horse","hospital","hot","hour","house","how","however","huge",
  "human","hundred","hung","hungry","hunt","hunter","hurried","hurry",
  "hurt","husband","ice","idea","identity","if","ill","image",
  "imagine","immediately","importance","important","impossible","improve","in","inch",
  "include","including","income","increase","indeed","independent","indicate","individual",
  "industrial","industry","influence","information","inside","instance","instant","instead",
  "instrument","interest","interior","into","introduced","invented","involved","iron",
  "is","island","it","its","itself","jack","jar","jet",
  "job","join","joined","journey","joy","judge","jump","jungle",
  "just","keep","kept","key","kids","kill","kind","kitchen",
  "knew","knife","know","knowledge","known","label","labor","lack",
  "lady","laid","lake","lamp","land","language","large","larger",
  "largest","last","late","later","laugh","law","lay","layers",
  "lead","leader","leaf","learn","least","leather","leave","leaving",
  "led","left","leg","length","lesson","let","letter","level",
  "library","lie","life","lift","light","like","likely","limited",
  "line","lion","lips","liquid","list","listen","little","live",
  "living","load","local","locate","location","log","lonely","long",
  "longer","look","loose","lose","loss","lost","lot","loud",
  "love","lovely","low","lower","luck","lucky","lunch","lungs",
  "lying","machine","machinery","mad","made","magic","magnet","mail",
  "main","mainly","major","make","making","man","managed","manner",
  "manufacturing","many","map","mark","market","married","mass","massage",
  "master","material","mathematics","matter","may","maybe","me","meal",
  "mean","means","meant","measure","meat","medicine","meet","melted",
  "member","memory","men","mental","merely","met","metal","method",
  "mice","middle","might","mighty","mile","military","milk","mill",
  "mind","mine","minerals","minute","mirror","missing","mission","mistake",
  "mix","mixture","model","modern","molecular","moment","money","monkey",
  "month","mood","moon","more","morning","most","mostly","mother",
  "motion","motor","mountain","mouse","mouth","move","movement","movie",
  "moving","mud","muscle","music","musical","must","my","myself",
  "mysterious","nails","name","nation","national","native","natural","naturally",
  "nature","near","nearby","nearer","nearest","nearly","necessary","neck",
  "needed","needle","needs","negative","neighbor","neighborhood","nervous","nest",
  "never","new","news","newspaper","next","nice","night","nine",
  "no","nobody","nodded","noise","none","noon","nor","north",
  "nose","not","note","noted","nothing","notice","noun","now",
  "number","numeral","nuts","object","observe","obtain","occasionally","occur",
  "ocean","of","off","offer","office","officer","official","oil",
  "old","older","oldest","on","once","one","only","onto",
  "open","operation","opinion","opportunity","opposite","or","orange","orbit",
  "order","ordinary","organization","organized","origin","original","other","ought",
  "our","ourselves","out","outer","outline","outside","over","own",
  "owner","oxygen","pack","package","page","paid","pain","paint",
  "pair","palace","pale","pan","paper","paragraph","parallel","parent",
  "park","part","particles","particular","particularly","partly","parts","party",
  "pass","passage","past","path","pattern","pay","peace","pen",
  "pencil","people","per","percent","perfect","perfectly","perhaps","period",
  "person","personal","pet","phrase","physical","piano","pick","picture",
  "pictured","pie","piece","pig","pile","pilot","pine","pink",
  "pipe","pitch","place","plain","plan","plane","planet","planned",
  "planning","plant","plastic","plate","plates","play","pleasant","please",
  "pleasure","plenty","plural","plus","pocket","poem","poet","poetry",
  "point","pole","police","policeman","political","pond","pony","pool",
  "poor","popular","population","porch","port","position","positive","possible",
  "possibly","post","pot","potatoes","pound","pour","powder","power",
  "powerful","practical","practice","prepare","present","president","press","pressure",
  "pretty","prevent","previous","price","pride","primitive","principal","principle",
  "printed","private","prize","probably","problem","process","produce","product",
  "production","program","progress","promised","proper","properly","property","protection",
  "proud","prove","provide","public","pull","pupil","pure","purple",
  "purpose","push","put","putting","quarter","queen","question","quick",
  "quickly","quiet","quietly","quite","rabbit","race","radio","railroad",
  "rain","raise","ran","ranch","range","rapidly","rate","rather",
  "raw","rays","reach","read","reader","ready","real","realize",
  "rear","reason","recall","receive","recent","recently","recognize","record",
  "red","refer","refused","region","regular","related","relationship","religious",
  "remain","remarkable","remember","remove","repeat","replace","replied","report",
  "represent","require","research","respect","rest","result","return","review",
  "rhyme","rhythm","rice","rich","ride","riding","right","ring",
  "rise","rising","river","road","roar","rock","rocket","rocky",
  "rod","roll","roof","room","root","rope","rose","rough",
  "round","route","row","rubbed","rubber","rule","ruler","run",
  "running","rush","sad","saddle","safe","safety","said","sail",
  "sale","salmon","salt","same","sand","sang","sat","satellites",
  "satisfied","save","saved","saw","say","scale","scared","scene",
  "school","science","scientific","scientist","score","screen","sea","search",
  "season","seat","second","secret","section","see","seed","seeing",
  "seems","seen","seldom","select","selection","sell","send","sense",
  "sent","sentence","separate","series","serious","serve","service","sets",
  "setting","settle","settlers","seven","several","shade","shadow","shake",
  "shaking","shall","shallow","shape","share","sharp","she","sheep",
  "sheet","shelf","shells","shelter","shine","shinning","ship","shirt",
  "shoe","shoot","shop","shore","short","shorter","shot","should",
  "shoulder","shout","show","shown","shut","sick","sides","sight",
  "sign","signal","silence","silent","silk","silly","silver","similar",
  "simple","simplest","simply","since","sing","single","sink","sister",
  "sit","sitting","situation","six","size","skill","skin","sky",
  "slabs","slave","sleep","slept","slide","slight","slightly","slip",
  "slipped","slope","slow","slowly","small","smaller","smallest","smell",
  "smile","smoke","smooth","snake","snow","so","soap","social",
  "society","soft","softly","soil","solar","sold","soldier","solid",
  "solution","solve","some","somebody","somehow","someone","something","sometime",
  "somewhere","son","song","soon","sort","sound","source","south",
  "southern","space","speak","special","species","specific","speech","speed",
  "spell","spend","spent","spider","spin","spirit","spite","split",
  "spoken","sport","spread","spring","square","stage","stairs","stand",
  "standard","star","stared","start","state","statement","station","stay",
  "steady","steam","steel","steep","stems","step","stepped","stick",
  "stiff","still","stock","stomach","stone","stood","stop","stopped",
  "store","storm","story","stove","straight","strange","stranger","straw",
  "stream","street","strength","stretch","strike","string","strip","strong",
  "stronger","struck","structure","struggle","stuck","student","studied","studying",
  "subject","substance","success","successful","such","sudden","suddenly","sugar",
  "suggest","suit","sum","summer","sun","sunlight","supper","supply",
  "support","suppose","sure","surface","surprise","surrounded","swam","sweet",
  "swept","swim","swimming","swing","swung","syllable","symbol","system",
  "table","tail","take","taken","tales","talk","tall","tank",
  "tape","task","taste","taught","tax","tea","teach","teacher",
  "team","tears","teeth","telephone","television","tell","temperature","ten",
  "tent","term","terrible","test","than","thank","that","thee",
  "them","themselves","then","theory","there","therefore","these","they",
  "thick","thin","thing","think","third","thirty","this","those",
  "thou","though","thought","thousand","thread","three","threw","throat",
  "through","throughout","throw","thrown","thumb","thus","thy","tide",
  "tie","tight","tightly","till","time","tin","tiny","tip",
  "tired","title","to","tobacco","today","together","told","tomorrow",
  "tone","tongue","tonight","too","took","tool","top","topic",
  "torn","total","touch","toward","tower","town","toy","trace",
  "track","trade","traffic","trail","train","transportation","trap","travel",
  "treated","tree","triangle","tribe","trick","tried","trip","troops",
  "tropical","trouble","truck","trunk","truth","try","tube","tune",
  "turn","twelve","twenty","twice","two","type","typical","uncle",
  "under","underline","understanding","unhappy","union","unit","universe","unknown",
  "unless","until","unusual","up","upon","upper","upward","us",
  "use","useful","using","usual","usually","valley","valuable","value",
  "vapor","variety","various","vast","vegetable","verb","vertical","very",
  "vessels","victory","view","village","visit","visitor","voice","volume",
  "vote","vowel","voyage","wagon","wait","walk","wall","want",
  "war","warm","warn","was","wash","waste","watch","water",
  "wave","way","we","weak","wealth","wear","weather","week",
  "weigh","weight","welcome","well","went","were","west","western",
  "wet","whale","what","whatever","wheat","wheel","when","whenever",
  "where","wherever","whether","which","while","whispered","whistle","white",
  "who","whole","whom","whose","why","wide","widely","wife",
  "wild","will","willing","win","wind","window","wing","winter",
  "wire","wise","wish","with","within","without","wolf","women",
  "won","wonder","wonderful","wood","wooden","wool","word","wore",
  "work","worker","world","worried","worry","worse","worth","would",
  "wrapped","write","writer","writing","written","wrong","wrote","yard",
  "year","yellow","yes","yesterday","yet","you","young","younger",
  "your","yourself","youth","zero","zebra","zipper","zoo","zulu"
];

function randomNumber(min, max) {
    return Math.round(Math.random() * (max - min) + min);
}

function getRandomWord() {
    return words[randomNumber(0, words.length - 1)];
}