function notification()
{
	this.id = null;
	this.message = "default notification";
	this.markup = "cancel";
	this.active = false;
	this.timeout = null;
}

function n(m)
{
	generateNotification({message: m})
}

function closeNote(newIndex)
{
	$('#notification_' + current.notifications[newIndex].id).fadeOut("200",function(){
		$('#notification_' + current.notifications[newIndex].id).remove();
	});

}

function processNotificationQueue()
{
	for (var x = 0; x < current.notifications.length; x++)
	{
		if (current.notifications[x].active == false)
		{
			var newNote = `<div class="note animate__animated animate__bounceInRight" id="notification_${x}">
							 	<span> ${current.notifications[x].message} </span>
						   </div>`;
			$('#notifications').append(newNote);			
			current.notifications[x].active = true;
		} else {
			// DO NOTHING
		}	
	}	
}

function generateNotification(m)
{

	let msg  	 = m.message ? m.message : "default notification";
	let type 	 = m.type 	 ? m.type	 : "info";
	let color	 = m.color	 ? m.color	 : "#fff";
	let note 	 = new notification();
	note.message = msg;
	//let newIndex = current.notifications.length;
	note.id 	 = guid();

	//current.notifications.push(note);	


	const element = document.querySelector('.note'); 
	if (element)
	{
		element.classList.add('animate__animated', 'animate__backOutDown');
		setTimeout(() => {
			element.classList.add("ghost")
			element.remove();	
		}, 600)
	    element.addEventListener('animationend', () => {
	          $(element).closest("div").animate({height: "0px"}, 75, function (){
	          	this.remove();	
	          })
	          //element.remove();
	          	/*var newNote = `<div class="note animate__animated animate__backInDown" id="notification_${note.id}">
					 	<span> ${note.message} </span>
				   </div>`;
				$('#notifications').append(newNote);	*/
	    });		
	} 
	else
    {
    	
    }

	var newNote = `<div class="note animate__animated animate__backInDown" id="notification_${note.id}">
					 	<span> ${note.message} </span>
				   </div>`;

	$('#notifications').append(newNote);	

	setTimeout(() => {
		console.log("forcing clear of" + note.id)
		let element = id(`notification_${note.id}`) 
		try
		{
			element.classList.add('animate__animated', 'animate__backOutDown');
			setTimeout(() => {
				element.classList.add("ghost")
				element.remove();	
			}, 600)	
		}
		catch
		{

		}		
	}, 10000);					

	//$('.note').removeClass("animate__bounceInRight").addClass("animate__bounceOutLeft");
	

	/*current.notifications[newIndex].timeout = setTimeout(function(){
				$('#notification_' + current.notifications[newIndex].id).fadeOut("450",function(){
						$('#notification_' + current.notifications[newIndex].id).remove();
				});

	}, 2500);*/

	//processNotificationQueue();
	//popper.play();
	return `notification_${note.id}`
}