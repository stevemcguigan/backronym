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
        else 
        {
            chat(id("txtMessage").value);
        }  
 
    })

    btnStart.addEventListener("click", e => {
        start(gameId); 
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
  		