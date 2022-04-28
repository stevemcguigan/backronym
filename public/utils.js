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


function handleInput(kid)
{
	txtMessage  = id("txtMessage");
	let key = $(`#${kid}`);
	let keypress = key.attr("data-key");
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
