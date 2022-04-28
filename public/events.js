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

    $("#keyboard button").on("touchstart", function() {
        handleInput(this.id);
    })

    $("#keyboard button").on('taphold', function() {
        heldKeyInterval = window.setInterval(() => handleInput(this.id), 50);
    })

    $("#keyboard button").on("touchend", function(){
        clearInterval(heldKeyInterval);
        $(this).removeClass("pressed").removeClass("shifted");
        $(`#keyboard button`).removeClass("ghost");//addClass("hide");
        $('#keyboard_ghost').addClass("ghost")
    })


    /*$('#txtMessage').on("input change keyup paste", function () {
        let candidate = txtMessage.value;
        const checker = candidate.split(" ");

        if (checker.length)
        {
            console.log(checker);
            for (let x = 0; x < checker.length; x++)
            {
                //console.log(checker[x].charAt(x).toUpperCase());
                if ((checker[x].charAt(0)).toUpperCase() == acronym.charAt(x))
                {
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
                $(`#0`).addClass("highlightedTile");
            }          
        } 


 

        //console.log(candidate);
    });*/

    btnMessage.addEventListener("click", e => {
        if (acronym)
        {
            candidate = phrase2acronym(id("txtMessage").value).toUpperCase();
            if (candidate === acronym)
            {
                play(id("txtMessage").value);
            }
            else 
            {
                chat(id("txtMessage").value);
            }    
            id("txtMessage").value = "";               
        }  
        else if (id("txtMessage").value == "")
        {
            // do nothing
        } 
        else {
            chat(id("txtMessage").value);
            id("txtMessage").value = "";
        }  
 
    })

    btnStart.addEventListener("click", e => {
        start(gameId); 
        txtMessage  = id("txtMessage");
//        txtMessage.focus(); 
        $('#btnStart').hide();      
    })


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
                $(`#0`).addClass("highlightedTile");
            }          
        } 

}
  		