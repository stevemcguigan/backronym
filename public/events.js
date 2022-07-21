// ui events only

function wireLobbyEvents()
{
    btnCreate      = id("btnCreate");
    btnJoin        = id("btnJoin");
    txtGameId      = id("txtGameId");
    txtNick        = id("txtNick");
    txtMessage     = id("txtMessage");
    divPlayers     = id("divPlayers");
    divChatWindow  = id("divChatWindow");

    btnJoin.addEventListener("click", e => {
        join();
    })


    btnCreate.addEventListener("click", e => {
        create();
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
        if (acronym)
        {
            candidate = phrase2acronym(id("txtMessage").value).toUpperCase();
            if (candidate === acronym)
            {
                play(id("txtMessage").value);
                $('.acronymContainer').addClass("animate__animated animate__tada");
                //$('.acronymContainer span').addClass("completed");
                $('.acronymContainer span').removeClass("highlightedTile");
                setTimeout(function(){
                     $('.acronymContainer').removeClass("animate__animated animate__tada");   
                }, 1000)

            }
            else 
            {
                $('.acronymContainer span').removeClass("highlightedTile");
                chat(id("txtMessage").value);
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
            chat(id("txtMessage").value);
            var tmsg =id("txtMessage");
            tmsg.value = "";
            if (!isMobile)
                tmsg.setSelectionRange(0,0);
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
                console.log('The ' + mutation.attributeName + ' attribute was modified.');
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

    cursorInterval = window.setInterval(() => toggleCursor(), 530);
    if (!isMobile)
    {
        console.log("NOT MOBILE, AUTOFOCUSING")
        $("#txtMessage").focus();
    } else {
        console.log("mobile detected");
    }   
        

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


function checker ()
{
    if (!acronym)
        return;

        let candidate = txtMessage.value;
        const checker = candidate.split(" ");

        if (checker.length)
        {
            for (let x = 0; x < checker.length; x++)
            {
                //console.log(checker[x].charAt(x).toUpperCase());
                if ((checker[x].charAt(0)).toUpperCase() == acronym.charAt(x))
                {
                    //$(`#${x}`).removeClass("completed");
                    $(`#${x}`).addClass("highlightedTile");
                }    
                else
                {

                    $(`#${x}`).removeClass("highlightedTile");
                }    
            }   
        }
        else
        {
            if (candidate.charAt(0).toUpperCase() == acronym.charAt(x))
            {
                 //$(`#0`).removeClass("completed");
                $(`#0`).addClass("highlightedTile");
            }          
        } 

}
  		