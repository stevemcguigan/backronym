function id (id)
{
	return document.getElementById(id);
}

function clear(eid)
{
	try
	{
		id(eid).innerHTML = "";
	}
	catch
	{
		console.log(`a dom element with id ${eid} does not exist or no longer exists`);
	}	
}

function randomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function openMenu()
{

	   let actionsArray = [];       
	   actionsArray.push(new actionItem({
	      label:`ok`,
	      action:`clear_modal_by_id('settingsMenu');`
	    }));
      create_new_modal({
        modal_id:"settingsMenu",
        modal_type: "generic_confirm",
        prompt: `settings`,
        detail_text: ``,
        actionsArray: actionsArray
  	  });

}

function b(x, min, max) {


  return x >= min && x <= max;
}

function handleInput(kid)
{	
	txtMessage  = id("txtMessage");
	divChatWindow  = id("divChatWindow");
	let key = $(`#${kid}`);
	let keypress = key.attr("data-key");
	let code = parseInt(keypress.charCodeAt(0), 10);

	if (txtMessage.value.length > 120 && keypress !== "return")
	{
		generateNotification({message: "no walls of text. sheesh."})
		return;
	}	
	
	let shifted = $("#game-keyboard button").hasClass("upper");// ? function () {} : String.prototype.toUpperCase; 
	if (shifted && !$('#key_shift').hasClass("pressed"))
		$("#game-keyboard button").removeClass("upper");

	switch (keypress)
	{
		case "backspace":
			$(key).addClass("pressed");
			txtMessage.value = shifted ? txtMessage.value.substr(0, txtMessage.value.length - 1).toUpperCase() : txtMessage.value.substr(0, txtMessage.value.length - 1);
			checker();
		break;

		case "space":
			$(key).addClass("pressed");	
			txtMessage.value += " ";
			//checker();
		break;

		case "return":
			//generateNotification({message: "fixing"})
			$(key).addClass("pressed");
			$("#btnMessage").click();
			txtMessage.style.height = "27px"
			divChatWindow.style.height = "178px"
		break;

		case "symbols":

			$(key).addClass("pressed");
			let kb = $("#keyboard");
			let kb2 = $("#keyboard_2");

			if ($("#keyboard").hasClass("hidden"))
			{
				$("#keyboard").removeClass("hidden");
				$("#keyboard_2").addClass("hidden");		
			}
			else
			{
				$("#keyboard").addClass("hidden");
				$("#keyboard_2").removeClass("hidden");			
			}	
			
			//txtMessage.value += keypress
		break;

		case "shift":
			generateNotification({message: lastKeyPress})
			if (lastKeyPress == "shift")
			{
				$("#game-keyboard button").removeClass("upper")
			}	
			else
			{
				$("#game-keyboard button").addClass("upper")
			}	
			$(key).addClass("pressed");
		break;

		default:
			txtMessage.value += shifted ? keypress.toUpperCase() : keypress;
			$(key).addClass("shifted");
			
	        if ($('#keyboard').hasClass("hidden"))
	        {
				$(`#keyboard_2 button`).not(key).addClass("ghost");//addClass("hide");
				$('#keyboard_2_ghost').removeClass("ghost hidden")  
	        }
	        else
	        {
				$(`#keyboard button`).not(key).addClass("ghost");//addClass("hide");
				$('#keyboard_ghost').removeClass("ghost")         
	        } 			

		break;
	}
	//n(txtMessage.value.length)
	if (txtMessage.value && txtMessage.value.length % 38 == 0)
	{
		let h = $('#txtMessage').height();
		let j = $('#divChatWindow').height();
		//generateNotification({message: h})
		$('#txtMessage').height(h + 15)
		$('#divChatWindow').height(j - 15)
		setTimeout(function(){
			scrollChat();
		}, 250)

		//txtMessage.value += '\r\n'*/
	}	

	if (txtMessage.value.length == 1 || txtMessage.value.charAt(txtMessage.value.length - 2) == " ")
	{
		checker();
	}	
	
	if (lastKeyPress == "shift" && kid == "key_shift")
	{
		lastKeyPress = "";
	}
	else
	{
		lastKeyPress = keypress;
	}	

	

	
}


function countdown(id)
{
	//alert(id)
	//var count = $("#" + id);//.first("span").first("span");
	//$(count).addClass("pink")	
	//alert($(count).html())
	counter = 5;
	counterInterval = setInterval(function(){
		counter--;
		$("#counter").html(counter);
		if (counter == 0)
			clearInterval(counterInterval);
	}, 1000)

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

function showScore()
{

	  let actionsArray = [];       
	   actionsArray.push(new actionItem({
	      label:`ok`,
	      action:`clear_modal_by_id('scoreboard_total');`
	    }));
      create_new_modal({
        modal_id:"scoreboard_total",
        modal_type: "generic_confirm",
        prompt: `scoreboard`,
        detail_text: current.score,
        actionsArray: actionsArray
  	  });
}


function phrase2acronym(str)
{
return str.split(/\s/).reduce((response,word)=> response+=word.slice(0,1),'')
}

