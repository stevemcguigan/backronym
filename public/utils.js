function id (id)
{
	return document.getElementById(id);
}

function clear(eid)
{
	id(eid).innerHTML = "";
}

function randomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


function b(x, min, max) {


  return x >= min && x <= max;
}

function handleInput(kid)
{
	
	txtMessage  = id("txtMessage");
	let key = $(`#${kid}`);
	let keypress = key.attr("data-key");
	let code = parseInt(keypress.charCodeAt(0), 10);
	//console.log(keypress)
	//console.log((b(code, 57, 60)))
	if (b(code, 0, 48) || b(code, 57, 65) || b(code, 90, 97) || b(code, 122, 165))
	{
		console.log(code)
	}	

	let shifted = $("#game-keyboard button").hasClass("upper");// ? function () {} : String.prototype.toUpperCase; 
	if (shifted)
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
			$(key).addClass("pressed");
			$("#btnMessage").click();
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
			$(`#keyboard button`).not(key).addClass("ghost");//addClass("hide");
			$('#keyboard_ghost').removeClass("ghost")
		break;
	}

	if (txtMessage.value.length == 1 || txtMessage.value.charAt(txtMessage.value.length - 2) == " ")
	{
		checker();
	}	
	
	lastKeyPress = keypress;
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

function focusAndOpenKeyboard(el, timeout) {
  if(!timeout) {
    timeout = 100;
  }
  if(el) {
    // Align temp input element approximately where the input element is
    // so the cursor doesn't jump around
    var __tempEl__ = document.createElement('input');
    __tempEl__.style.position = 'absolute';
    __tempEl__.style.top = (el.offsetTop + 7) + 'px';
    __tempEl__.style.left = el.offsetLeft + 'px';
    __tempEl__.style.height = 0;
    __tempEl__.style.opacity = 0;
    // Put this temp element as a child of the page <body> and focus on it
    document.body.appendChild(__tempEl__);
    __tempEl__.focus();

    // The keyboard is open. Now do a delayed focus on the target element
    setTimeout(function() {
      el.focus();
      el.click();
      // Remove the temp element
      document.body.removeChild(__tempEl__);
    }, timeout);
  }
}
