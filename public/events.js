// ui events only

function wireLobbyEvents()
{
    btnCreate      = id("btnCreate");
    btnJoin        = id("btnJoin");
    btnJoinPrivate = id("btnJoinPrivate");
    txtGameId      = id("txtGameId");
    txtNick        = id("txtNick");
    txtMessage     = id("txtMessage");
    divPlayers     = id("divPlayers");
    divChatWindow  = id("divChatWindow");

    /*btnJoin.addEventListener("click", e => {
        join(); //old generic join before lobby
    })*/

    btnJoinPrivate.addEventListener("click", e => {
        joinPrivatePrompt();
    })


    btnCreate.addEventListener("click", e => {
        createGame();
    }) 

}

function wireGameEvents()
{
    btnMessage  = id("btnMessage");
    btnStart    = id("btnStart");
    txtMessage  = id("txtMessage");
   // txtMessage.focus();
    //$('#txtMessage').tap();

    //focusAndOpenKeyboard(txtMessage);
    disableInputStuff();

    /*txtMessage.addEventListener("onchange", e => {
        let candidate = txtMessage.value;
        console.log(candidate);
    })*/

    $("#game-keyboard button").on("touchstart", function() {
        handleInput(this.id);
    })

    $("#game-keyboard button").on('taphold', function() {
        if (!longpressKeySkips[this.id])
        {
            heldKeyInterval = window.setInterval(() => handleInput(this.id), 50);   
        }      
    })

    $("#game-keyboard button").on("touchend", function(){
        clearInterval(heldKeyInterval);
        $(this).removeClass("pressed").removeClass("shifted");                           
    
        if ($('#keyboard').hasClass("hidden"))
        {
            $(`#keyboard_2 button`).removeClass("ghost");//addClass("hide");
            $('#keyboard_2_ghost').addClass("ghost hidden")  
        }
        else
        {
            $(`#keyboard button`).removeClass("ghost");//addClass("hide");
            $('#keyboard_ghost').addClass("ghost")            
        }    

    })

    btnMessage.addEventListener("click", e => {

        let highlight = $('html').hasClass("invert") ? "highlightedTile invert" : "highlightedTile"
        if (acronym)
        {
            let candidate = strip(id("txtMessage").value)
            candidate = phrase2acronym(candidate).toUpperCase();
            if (candidate === acronym)
            {
                play(id("txtMessage").value);
                $('.acronymContainer').addClass("animate__animated animate__tada");
                //$('.acronymContainer span').addClass("completed");
                $('.acronymContainer span').removeClass(highlight);
                setTimeout(function(){
                     $('.acronymContainer').removeClass("animate__animated animate__tada");   
                }, 1000)

            }
            else 
            {
                $('.acronymContainer span').removeClass(highlight);
                checkForCommand(id("txtMessage").value)
            }    
            var tmsg =id("txtMessage");
            tmsg.value = "";
            if (!isMobile)
                tmsg.setSelectionRange(0,0);          
        }  
        else if (id("txtMessage").value == "")
        {
            // do nothing
        } 
        else {
            let msg = id("txtMessage").value
            checkForCommand(msg)
            
   

        }  
 
    })

    if (host)
    {    
        btnStart.addEventListener("click", e => {
            start(gameId); 
            txtMessage  = id("txtMessage");
            btnStart.classList.add('animate__zoomOut'); 
            if (!isMobile)
                $('#txtMessage').focus();    
        })
    }


// Select the node that will be observed for mutations
    var targetNode = document.getElementById('divChatWindow');

    // Options for the observer (which mutations to observe)
    var config = { attributes: true, childList: true };

    // Callback function to execute when mutations are observed
    callback = function(mutationsList) {
        for(var mutation of mutationsList) {
            if (mutation.type == 'childList') {
                const divChatWindow = id("divChatWindow");

                divChatWindow.lastChild.scrollIntoView({ behavior: "smooth", block: "end" });
            }
            else if (mutation.type == 'attributes') {
                clog('The ' + mutation.attributeName + ' attribute was modified.', 3);
            }
        }
    };

    observer = new MutationObserver(callback);

    // Start observing the target node for configured mutations
    observer.observe(targetNode, config);

    // Later, you can stop observing
    //observer.disconnect();

    /*
    $('#divChatWindow').on('DOMSubtreeModified', function(){
        const divChatWindow = id("divChatWindow");
        divChatWindow.scrollIntoView({ behavior: "smooth", block: "end" });
    });*/

    
    if (!isMobile)
    {
        clog("not mobile, autofocusing", 4)
        $("#txtMessage").focus();
    } else {
        cursorInterval = window.setInterval(() => toggleCursor(), 530);
        clog("mobile detected", 4);
    }   

    setTimeout(function() {
        $("#exitContainer").addClass("reveal")
    }, 10);    
        

}

function focusText()
{
    clog("autofocusing textbox", 5);
    $("#txtMessage").focus();        


}

function toggleCursor()
{
    let cursor = $('#txtMessage');
    let tval = cursor.val();
    let placeholder = cursor;
    cursor.attr('placeholder',  cursor.attr('placeholder') == "|" ? "" : "|");
}

function scrollChat()
{
    divChatWindow  = id("divChatWindow");
    divChatWindow.lastChild.scrollIntoView({ behavior: "smooth", block: "end" });
}



function strip(stringToStrip)
{
    stringToStrip = stringToStrip.replace(/-/g, ' ');
    stringToStrip = stringToStrip.replace(/"/g, '');
    return stringToStrip;
}

function checker()
{
    let highlight = $('html').hasClass("invert") ? "highlightedTile invert" : "highlightedTile"
    if (!acronym)
        return;

        let candidate = txtMessage.value;
        candidate = strip(candidate);
        const checker = candidate.split(" ");

        if (checker.length)
        {
            for (let x = 0; x < checker.length; x++)
            {
                //console.log(checker[x].charAt(x).toUpperCase());
                if ((checker[x].charAt(0)).toUpperCase() == acronym.charAt(x))
                {
                    //$(`#${x}`).removeClass("completed");
                    $(`#${x}`).addClass(highlight);
                }    
                else
                {

                    $(`#${x}`).removeClass(highlight);
                }    
            }   
        }
        else
        {
            if (candidate.charAt(0).toUpperCase() == acronym.charAt(x))
            {
                 //$(`#0`).removeClass("completed");
                $(`#0`).addClass(highlight);
            }          
        } 

}
  		