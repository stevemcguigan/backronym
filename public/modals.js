function create_new_modal(m)   //creates a new alert modal 
{
	
	var modal_content = null;
	var modal_prompt = null;
	var activate_modal = null;
	var deactivate_modal = null;
	activate_modal = function() {};
	deactivate_modal = function() {};
	if (m.activate != null) 
	{
		activate_modal = function() {m.activate();};
	}
	
	if (m.deactivate != null)
	{
		deactivate_modal = function() {m.deactivate();};
	}

	var androidCallback = function() {
		deactivate_modal();
		clear_modal_by_id(`${m.modal_id}`, null);
	}

	//setBackButton_reference(androidCallback);


//	console.log("creating a new modal");
	
	if(m.modal_type == null) {m.modal_type = m.modal_id;console.log("Missing modal type using " + m.modal_id);} //legacy support

	switch (m.modal_type)
	{

		case "vote":
			modal_content = generate_vote_markup(m);
		break;

		case "generic_confirm":
			modal_content = generate_generic_confirm_markup(m);
		break;

		case "look_loader":
			modal_content = generate_look_loader_markup(m);
		break;		

		case "update_wifi_credentials":
			modal_content = generate_update_wifi_credentials(m);
		break;

		case "confirm_look_save":
			modal_content = generate_confirm_look_save(m);
		break;

		case "pattern_file_modal":
			modal_content = generate_file_modal_markup(m.modal_id, m.patternKey);
		break;

		case "HSV_picker":
			modal_content = gen_HSV_picker_markup(m);
		break;

		case "alert":
			modal_content = gen_alert_icon_markup(m);
			activate_modal = function() {show_animate_svg(m.modal_id);}
		break;

		case "generic_win":
			modal_content = gen_win_icon_markup(m);
			activate_modal = function() {show_animate_svg(m.modal_id);}
		break;		

		case "build_opcode":
			modal_content = generate_opcode_markup(m);
		break;	

		
		case "join_private_server":
			modal_content = generate_private_server_markup(m);
		break;	

		case "device_tags":
			modal_content = generate_device_tags_markup(m);
		break;			

		case "newPattern":
			modal_content = generate_new_file_markup (m.modal_id);
		break;		

		case "connect_attempt":
			modal_content = generate_generic_confirm_markup(m);
			break;	

		case "cloning":
			modal_content = gen_clone_shape_markup(m);
			break;

		case "device_settings":
			modal_content = generate_device_settings_markup(m);
			break;

		case "wifi_settings":
			modal_content = generate_wifi_settings_markup(m);
			break;		

		case "remap_slot":
			modal_content = generate_remap_slot_markup(m);
		break;			

		case "group_devices":
			modal_content = generate_group_devices_markup(m);
			break;

		case "select_stored_palette":
			modal_content = generate_select_stored_palette_markup(m);
		break;			

		case "group_spanning":
			modal_content = generate_group_spanning_markup(m);
			break;

		case "group_sync":
			modal_content = generate_group_sync_markup(m);
			break;

		case "group_sync_tune":
			modal_content = generate_group_sync_tune_markup(m);
			break;

		case "span_index_picker":
			modal_content = generate_span_index_markup(m);
			break;

		case "sync_index_picker":
			modal_content = generate_sync_index_markup(m);
			break;

		case "group_management":
			modal_content = generate_group_management_markup(m);
			break;

		case "group_settings":
			modal_content = generate_group_settings_markup(m);
			break;

		case "confirm_look_loader":
			modal_content = generate_confirm_look_loader_markup_single_look(m);	
		break;	

		case "tag_cloud_filter_modal":
			modal_content = generate_tag_cloud_filter_modal(m);
			break;


		case "win_fail":
			break;

		default:
			console.log("no handler for " + m.modal_id + " context menu.");
			m.modal_id = "generic";
			m.prompt = m.modal_type;
			modal_content = gen_alert_icon_markup(m);
			var callback = function() {clear_modal_by_id(m.modal_id, null);}
			activate_modal = function() {
					show_animate_svg(m.modal_id);
				}
			break;
	}

	var refresh = false;
	// Here is where we add the final markup to the DOM and activate its elements
   	if ($("#modals_stack_outer").find("#"+m.modal_id).length != 0)
   	{
   		refresh = true;
   		modal_to_update = find_modal_by_id(m.modal_id);
   		var updateForce = modal_to_update.force !== m.force ? true : false;
   		
//   		console.log("this modal already was popped so we just updated the content");
   		//$("#"+m.modal_id+"_content").html(modal_content);
    	
    	if (m.transition == null)
    	{
    		$("#"+m.modal_id+"_content").html(modal_content);
    		unblockInput();
    	}
    	else
    	{
	   		modal_replace_content({
	   			modal_id: m.modal_id,
	   			new_markup: modal_content,
	   			callback: m.activate
	   		});
	   		activate_modal = null; //kill the callback so it doesnt get fired later
   		}

   		if (updateForce)
   		{	
	   		if (m.force)
			{
				$("#"+m.modal_id).unbind('click');
				//generateNotification(m.modal_id);
		   		if (m.canTimeout)
				{
					m.timeout = setTimeout(() => {
							modal_remove_force(m.modal_id)
					}, 25000)
//					console.log("forcing action in modal");
				}				
			}
			else
			{
//					console.log("refresh removed force, rebinding clickoff");
				clearTimeout(m.timeout);
				$("#"+m.modal_id).unbind('click').click(function(e){
			    	//Do nothing if .header was not directly clicked
			    	if(e.target !== e.currentTarget) return;
			  		deactivate_modal(),
			  		clear_modal_by_id(m.modal_id, null);
				});
			}
		}	

		replace_literal(m);
   		unblockInput();	
   		
   		
   	}
   	else
   	{
  
	   	var next_z = 200;
	    if ($("#modals_stack_outer").children().length > 0)
		{
			var next_z = parseInt($("#modals_stack_outer").find(".modal_bg").first().css( "zIndex"))+2;
			console.log("there are already modals, lets get a new z: "+next_z);
		}

		var modal_width_type = "modal_content";

		if (m.narrow)
		{
			modal_width_type = "modal_content_narrow";
		}

		var my_modal = `
		<div id=${m.modal_id} class="modal_bg animate__animated animate__fadeIn" style="z-index:${next_z} !important">
			<div id=${m.modal_id+'_box'} class="modal_box">
				<div id=${m.modal_id+'_content'} class=${modal_width_type}>
		      		${modal_content}
		      	</div>
		    </div>
	    </div>`;
	
		$("#modals_stack_outer").prepend(my_modal);

		clearTimeout(m.timeout);
		
		if (m.force)
		{
			$("#"+m.modal_id).unbind('click');
			//generateNotification(m.modal_id);
	   		if (m.canTimeout)
			{
				m.timeout = setTimeout(() => {
						modal_remove_force(m.modal_id)
				}, 25000)
//				console.log("forcing action in modal");
			}				
		}
		else
		{
			clearTimeout(m.timeout);
			$("#"+m.modal_id).unbind('click').click(function(e){
		    	//Do nothing if .header was not directly clicked
		    	if(e.target !== e.currentTarget) return;
		  		deactivate_modal(),
		  		clear_modal_by_id(m.modal_id, null);
			});
		}
		/*if (m.force)
		{
			$("#"+m.modal_id).unbind('click');
			m.timeout = setTimeout(() => {
					modal_remove_force(m.modal_id)
			}, 25000)

		}
		else
		{
			$("#"+m.modal_id).unbind('click').click(function(e){
		    	//Do nothing if .header was not directly clicked
		    	if(e.target !== e.currentTarget) return;
		  		deactivate_modal(),
		  		clear_modal_by_id(m.modal_id, null);

			});
		}*/	

		current.modal_queue.push(m);
	}
	

	fade_in_dimmer();


	if (activate_modal != null){ activate_modal();}

	if (!refresh)
	{
		//const element = document.getElementById(m.modal_id);
		//element.classList.add('animated', 'slideInUp', 'superfast');
	}
}

function replace_literal(m)
{
    for (var x = 0; x < current.modal_queue.length; x++)
    {
    	clearTimeout(current.modal_queue[x].timeout); 
        if (current.modal_queue[x].modal_id == m.modal_id)
        {
            
            //console.log("found our modal and updating its literal: " + m.modal_id );
            //generateNotification(`timeout: ${m.modal_id } ${current.modal_queue[x].timeout}`);
       
            current.modal_queue[x] = JSON.parse(JSON.stringify(m));
             current.modal_queue[x].activate = m.activate;
             current.modal_queue[x].deactivate = m.deactivate;
            return true;
        }

    }    
    return false;
}


function find_modal_by_id(modal_id)
{
	if ($("#modals_stack_outer").find("#"+modal_id).length != 0)
   	{
   		for (var x = 0; x < current.modal_queue.length; x++)
		{
			if (current.modal_queue[x].modal_id == modal_id)
			{
				
				//console.log("found our modal and returned its literal: " + modal_id );
				return current.modal_queue[x];
			}

		}	
   	}
   	else
   	{
   		return false;
   	}
}

function simple_modal_close(mid)
{
	let modal = id(mid);
	element.classList.add("zoomOut")
}

function clear_modal_by_id(modal_id, callback_on_close)
{
	
	if ($("#modals_stack_outer").find("#"+modal_id).length != 0)
   	{
		//console.log("clearing modal: "+modal_id);

		for (var x = 0; x < current.modal_queue.length; x++)
		{
			if (current.modal_queue[x].modal_id == modal_id)
			{
				current.modal_queue.splice(x,1);
				//console.log("spliced out a modal as we cleared");
			}

		}

		//alert(callback_on_close);

		if (callback_on_close == null)
		{
			//callback_on_close = function() {unblockInput();}
			//console.log("no callback, just unblocking input");
		}
		
		try
		{
			const el = document.getElementById(modal_id);
			el.classList.add('animate__fadeOut');
		}
		catch
		{
			console.log("couldn't find or close modalid: " + modal_id);
			systemLog("couldn't find or close modalid: " + modal_id);
		}


		setTimeout(() => {
			$("#"+modal_id).remove();
			if (typeof callback_on_close == "function")
			{
				callback_on_close();	
				$("#txtMessage").focus();			
			}
			else
			{
				$("#txtMessage").focus();
			}
	  }, 425);	

	}
	else
	{
		console.log("tried to clear a modal by ID not in the dom " + modal_id);
	}

}

/*
function close_non_blocking_confirm(id)
{
	animateCss('confirmationNonBlocking', 'slideOutDown', function() {
		$('#confirmationNonBlocking').css("display","none");
	});
}
*/
function update_modal_or_die_by_id(modal_id, killActivate)
{
	var m = find_modal_by_id(modal_id);

	if (m != false)
	{
		if ($("#modals_stack_outer").find("#"+m.modal_id).length != 0)
	   	{
	   		if (killActivate)
	   		{	
	   			m.activate = null;
	   		}
			create_new_modal(m);
		}
	}
	else
	{
		console.log("update_modal_or_die_by_id tried to update a modal by ID not in the dom " + modal_id);
	}


}

function update_modal_or_die(m)
{
	if ($("#modals_stack_outer").find("#"+m.modal_id).length != 0)
   	{
		create_new_modal(m);
	}
	else
	{
//		console.log("update_modal_or_die tried to update a modal by ID not in the dom" + m.modal_id);
	}


}


function modal_update_detail(m)
{
	if ($("#modals_stack_outer").find("#"+m.modal_id).length != 0)
   	{
		var detail_text_markup = "";
		/*
		if (m.detail_text)
		{
			detail_text_markup =`
			<div class="modal_detail_text">
					${m.detail_text}
			</div>`
		}
		*/
		$("#"+m.modal_id+"_content").find(".modal_detail_text").first().html(m.detail_text);
	}
	else
	{
		console.log("tried to update detail text of a modal by ID not in the dom");
	}
}

function modal_change_id(m)
{
	//m.old_id 
	//m.new_id

//alert(JSON.stringify(m));

	elem(m.old_id).id = m.new_id;
	elem(m.old_id + "_box").id = m.new_id + "_box";
	elem(m.old_id + "_content").id = m.new_id + "_content";

	for (var x = 0; x < current.modal_queue.length; x++)
    {
    	clearTimeout(current.modal_queue[x].timeout); 
        if (current.modal_queue[x].modal_id == m.old_id)
        {
            
            current.modal_queue[x].modal_id = m.new_id
//            console.log("found our modal and updating its id from " + m.old_id + " to " + current.modal_queue[x].modal_id);
            //generateNotification(`timeout: ${m.modal_id } ${current.modal_queue[x].timeout}`);
            //return true;
        }
    }    


}


//function modal_replace_content(new_content_markup, modal_id, callback_on_swap, resize_width, resize_height)
function modal_replace_content(m)
{
	// m.modal_id = modal_id to swap content of
	// m.new_markup = markup to fade to
	// m.callback = callback on swap
	// m.resize_wdith = (true,false)
	// m.resize_height = (true, false)
	// m.hold_height = true

	//console.log("replacing content")
	//console.log(JSON.stringify(m));
	var width_old = $("#"+m.modal_id+"_content").width();
	var height_old = $("#"+m.modal_id+"_content").height();
	var duration = 175;
	var opacity = "0";

	$("#"+m.modal_id+"_content").width(width_old);
	//$("#"+m.modal_id+"_content").height(height_old);

	if (m.new_markup == undefined)
	{
		m.new_markup = `<div class='stackablePrompt' style='min-height:${height_old}px !important;width:${width_old}'></div>`;
		console.log("Making dummy markup with a height of: " + height_old);
	}

	var activate_modal = function() {};
	if (m.callback != null)
	{
		activate_modal = function() { $("#"+m.modal_id+"_content").animate({opacity: "1"}, 175, m.callback); unblockInput();};
		console.log("swapping content cause an activate function came in");
	}
	else
	{
		activate_modal = function() { $("#"+m.modal_id+"_content").animate({opacity: "1"}, 175); unblockInput();};
	}

	if (m.skipAnimation)
	{
		duration = 0;
		opacity = "1";
	}	

	$("#"+m.modal_id+"_content").animate({
		opacity: opacity
	},duration, function() 
	{	
		console.log("replace content id  #" + m.modal_id+"_content")
		$("#"+m.modal_id+"_content").html(m.new_markup);
		var width_new = $("#"+m.modal_id+"_content").children().first().width();
	    var height_new = $("#"+m.modal_id+"_content").children().first().height();
		if (!m.resize_width) {width_new = width_old;}
		//if (m.hold_height) {$("#"+m.modal_id+"_content").height(height_old);} 
		$("#"+m.modal_id+"_content").animate({
			width: width_new,
			//height: height_new,
		}, 175, activate_modal);
 	});
}


function generate_conflict_modal_markup()
{

}

function generate_conflict_rename_markup()
{


}

function generate_connecting_modal_markup()
{


}




function generate_tag_cloud_filter_modal(m)
{

var tagList = "";

  var tagTable = Object.keys(CSApp.tags);

  tagTable.sort(function(a, b) {
          var nameA = a.toUpperCase(); // ignore upper and lowercase
          var nameB = b.toUpperCase(); // ignore upper and lowercase
          if (nameA > nameB) {
            return 1;
          }
          if (nameA < nameB) {
            return -1;
          }
          // names must be equal
          return 0;
        });


	for (var x = 0; x < tagTable.length; x++)
	{
		tagList += `<div class="tagListItem">
							<div class="filterByTagListItemTitle" onclick="filterMenuByTag('editPatternsMenu', '${tagTable[x]}')">${tagTable[x]}</div>  
							<div style="flex-basis:40%">#patts: ${CSApp.tags[tagTable[x]]}</div>
							<div><i class="linear-pencil5"></i></div>
							<div onclick="masterDeleteTag('${tagTable[x]}')"><i class="linear-trash2"></i></div> 
					</div>`

	}  
	tagList = `<div class="tagListItem">
                      <div onclick="clearTagMenuFilters('editPatternsMenu')">
                        Clear tag filter
                      </div>
                      <div>
                       
                      </div>
               </div>` + tagList; 

	tagList += `<div class="tagListItem">
                      <div>
                        <input class="textInput" id="createTagTextBox" type="textbox"></input>
                      </div>
                      <div>
                        <div onclick='createTag ()'><i class="linear-plus-circle"></i></div>
                      </div>
               </div>`;

	tagList = `<div class="tagListContainer">
					${tagList}
				</div>`;


	return tagList;

}


function return_actions_array(m)
{

	var actionsMarkup = "";
	if (m.actionsArray != undefined)
	{
		actionsMarkup  = `<div class="confirmationActions">`
		if (m.actionsArray[0] != null)
		{
			var actionID = m.actionsArray[0].action;
			

			if (m.actionsArray[0].active)
			{	
							actionsMarkup +=   `<div class="centered_content" style="text-align:center;width:100%;">
									<button class="${m.actionsArray[0].class}" 
									
									onclick="${m.actionsArray[0].action}">
									${m.actionsArray[0].label}
									</button>
								</div>`;
			} 
			else 
			{
				actionsMarkup += `<div class="centered_content" style="text-align:center;width:100%;"><button class="${actionID} inactive_button" style="" >${m.actionsArray[0].label}</button></div>`;
			}
		}

		if (m.actionsArray[1] != null)
		{
			var actionID = m.actionsArray[1].action;
		

			if (m.actionsArray[1].active)
			{	
				actionsMarkup +=   `<div class="centered_content" style="text-align:center;width:100%;">
							<button class="${m.actionsArray[1].class}"  
						
							onclick="${m.actionsArray[1].action}">
							${m.actionsArray[1].label}
							</button>
						</div>`;
			} 
			else 
			{
				actionsMarkup += `<div class="centered_content" style="text-align:center;width:100%;"><button class="${actionID} inactive_button" style="" >${m.actionsArray[1].label}</button></div>`;
			}
		}
		actionsMarkup  += `</div>`
	}
	var third_option_markup = "";
	if (m.mini_button != null)
	{
		var actionID = m.mini_button.action;
		third_option_markup +=   `<div class="centered_content" style="text-align:center;width:100%;">
									<button class="confirmation_third_option" style="font-variant-caps: all-small-caps;" 
									onclick="${m.mini_button.action}">
									${m.mini_button.label}
									</button>
								</div>`;
	}
	else
	{
		if (actionsMarkup != "") {third_option_markup +=`<div style="padding-top:22px"></div>`;}
	}

return actionsMarkup;

}



function generate_generic_confirm_markup(m)
{

	var textbox_markup = "";
	var textarea_markup = "";
	if (m.textbox)
	{
		var placeholder = m.placeholder ? m.placeholder : "";
		var defaultTextboxValue = m.defaultTextboxValue ? m.defaultTextboxValue : "";

		textbox_markup = `
			<div style="display:flex;text-align:center; align-items:center;padding:10px 10px 0; width:80%">
				<input class="textInput" id="${m.textbox}" maxlength="15" placeholder="${placeholder}" value="${defaultTextboxValue}"></input><i id="${m.textbox}_clear"  class="icon linear-cross textboxClear"></i>
			</div>`


			setTimeout(() => {
				$(`#${m.textbox}`).focus();
				$(`#${m.textbox}_clear`).on('touchstart', function(event) {
					event.stopImmediatePropagation();
					event.preventDefault();
					clearTextbox(`${m.textbox}`);			
				});
	    	}, 500)


	}

	if (m.textarea)
	{
		var placeholder = m.placeholder ? m.placeholder : "";
		var defaultTextareaValue = m.defaultTextareaValue ? m.defaultTextareaValue : "";

		textarea_markup = `
			<div style="display:flex;text-align:center; align-items:center;padding:10px 10px 0; width:80%">
				<textarea maxlength="75" class="textAreaInput" id="${m.textarea}" placeholder="${placeholder}" value="${defaultTextareaValue}"></textarea>
			</div>`


			setTimeout(() => {
				$(`#${m.textarea}`).focus();
				$(`#${m.textarea}_clear`).on('touchstart', function(event) {
					event.stopImmediatePropagation();
					event.preventDefault();
					clearTextbox(`${m.textarea}`);			
				});
	    	}, 500)


	}	

	var detail_text_markup = ""
	if (m.detail_text)
	{
		detail_text_markup =`
		<div class="modal_detail_text ${m.detail_text_classes ? m.detail_text_classes : ''}">
				${m.detail_text}
		</div>`
	}

	var icon_markup = "";
	if (m.icon)
	{

		icon_markup = `
			<div class="modal_icon">
				<i class="${m.icon}"></i>
			</div>`
		
	}

	var loader_markup = ""

	if (m.loader)
	{
		//loader_markup = `<div class="modal_icon"><img id="loader" src="img/loading.svg"  width="128" style="padding-bottom:25px" alt=""></div>`
		loader_markup = `<div class="loader_icon" style="padding-bottom:25px;"><div class="connect_svg_animation" style="width:128px; height:60px" alt=""></div></div>`
	}

	var canvas_markup = ""
	if (m.canvas)
	{
		canvas_markup = `
		<div style="height:4px;width:100%;background-color:black;overflow:hidden">
		<canvas id="${m.canvas}_canvas" class="filepreview fileModalPreviewCanvas" height="6px">
		</canvas>
		</div>`
	}
	else
	{
		//canvas_markup = `<div style="height:15px;width:100%; border-top: 1px solid var(--offblack);"></div>`

	}


	var progress_bar_markup = ""

	if (m.progress_bar)
	{
		progress_bar_markup = `
		<div class="firmwareUpdateMessage">
		 	<div class="firmwareProgressContainer">
		 			<div id="firmwareProgress" class="firmwareProgressClass"></div>
		 	</div>	
		</div>
		<div class="firmwareProgressInfo modal_detail_text detail_center_aligned"><span id="firmwareBytesSent"></span>Kb sent of <span id="firmwareSize"></span></div>`							
	}


	var conflict_preview_markup = ""
	if (m.conflict_preview)
	{
		conflict_preview_markup = `
		<div style="display:flex;justify-content:space-around">
			<div style="height:6px;width:40%;background-color:black;overflow:hidden">
				<canvas id="conflict_app_canvas" class="filepreview fileModalPreviewCanvas" height="8px">
				</canvas>
			</div>
			<div style="height:6px;width:40%;background-color:black;overflow:hidden">
				<canvas id="conflict_device_canvas" class="filepreview fileModalPreviewCanvas" height="8px">
				</canvas>
			</div>
		</div>`
	}


	var actionsMarkup = "";
	if (m.actionsArray != undefined)
	{
		actionsMarkup  = `<div class="confirmationActions">`
		if (m.actionsArray[0] != null)
		{
			var actionID = m.actionsArray[0].action;
			

			if (m.actionsArray[0].active)
			{	
							actionsMarkup +=   `<div class="centered_content" style="text-align:center;width:100%;">
									<button class="${m.actionsArray[0].class}" style="" 
									
									onclick="${m.actionsArray[0].action}">
									${m.actionsArray[0].label}
									</button>
								</div>`;
			} 
			else 
			{
				actionsMarkup += `<div class="centered_content" style="text-align:center;width:100%;"><button class="${actionID} inactive_button" style="" >${m.actionsArray[0].label}</button></div>`;
			}
		}

		if (m.actionsArray[1] != null)
		{
			var actionID = m.actionsArray[1].action;
		

			if (m.actionsArray[1].active)
			{	
				actionsMarkup +=   `<div class="centered_content" style="text-align:center;width:100%;">
							<button class="${m.actionsArray[1].class}" style="" 
						
							onclick="${m.actionsArray[1].action}">
							${m.actionsArray[1].label}
							</button>
						</div>`;
			} 
			else 
			{
				actionsMarkup += `<div class="centered_content" style="text-align:center;width:100%;"><button class="${actionID} inactive_button" style="" >${m.actionsArray[1].label}</button></div>`;
			}
		}
		actionsMarkup  += `</div>`
	}
	var third_option_markup = "";
	if (m.mini_button != null)
	{
		var actionID = m.mini_button.action;
		third_option_markup +=   `<div class="centered_content" style="text-align:center;width:100%;">
									<button class="confirmation_third_option" style="font-variant-caps: all-small-caps;" 
									onclick="${m.mini_button.action}">
									${m.mini_button.label}
									</button>
								</div>`;
	}
	else
	{
		if (actionsMarkup != "") {third_option_markup +=`<div style="padding-top:22px"></div>`;}
	}
	
	var modalBody = `
			${icon_markup}
			${loader_markup}
			<div class = "stackablePrompt">
				<div class = "blockingModalTitle">	
				${m.prompt}
				</div>
			</div> 
			${progress_bar_markup}
			${canvas_markup}
			${textarea_markup}
			${textbox_markup}
			${detail_text_markup}
			${conflict_preview_markup}
			${actionsMarkup}
			${third_option_markup}
		`;

	return modalBody;

}

function generate_vote_markup(m)
{

	let actionsArray = m.actionsArray ? m.actionsArray : [];
	let actionsMarkup = generate_modal_action_buttons(actionsArray)

	var modalBody = `
			<div class = "stackablePrompt">
				<div class = "blockingModalTitle">	
				${m.prompt}
				</div>
			</div> 
			${actionsMarkup}
		`;

	return modalBody;


}


function respin_file_modal ()
{

	//generateNotification("respun");
	//console.trace();

	var modal_to_update = find_modal_by_id("pattern_file_modal");

	if (modal_to_update && modal_to_update.state == undefined)
	{
		update_sync_patterns_button();
		console.log("attempting respin");
		create_new_modal(modal_to_update);
		return;
	}
}

function modal_remove_force(modal_id)
{
    var modal_to_update = find_modal_by_id(modal_id);

    if (modal_to_update)
    {
        modal_to_update.force = false;
        modal_to_update.transition = false;
        //modal_to_update.detail_text = "Unknown error. Tap anywhere to clear.";
        console.log("attempting respin with force remove");
        update_modal_or_die(modal_to_update);
        return;
    }
}


function generate_ordinal_picker_markup(m)
{
	var picker_type = m.picker_type;

	if (m.picker_type == null) 
	{
		console.log('need a picker type');
		return;
	}

	var modalBody = `
		<div id="ordinal_container_${m.modal_id}">
		<div class="actionsArrayContainer" id = "fileModal${actionsArray[x].name}ButtonContainer"  onclick="${actionsArray[x].action}">					
							<div  class="halfWhite_A" style="display:flex;flex-direction:column;align-items:center;min-height:55px"  ontouchstart="click_state_opacity(this, true); ${actionsArray[x].touchstartaction}" ontouchend="click_state_opacity(this, false); ${actionsArray[x].touchendaction}" >
								<i style="font-size:${iconSize}px;" id="fileModal${actionsArray[x].name}Button" class="${actionsArray[x].icon} ${actionsArray[x].label_class}" aria-hidden="true"></i>
								<div class="modal_text_label ${actionsArray[x].label_class}" style="font-size:${labelSize+3}px;">
									${actionsArray[x].label}
								</div>
								<div class="modal_text_label ${actionsArray[x].label2_class}" style="font-size:${labelSize+1}px;line-height:8px;">
									${actionsArray[x].label2}
								</div>

							</div>
						</div>

		</div
			
		`;

	return modalBody;

}


function generate_group_management_markup(m)
{
	console.log("making group modal markup");
	var group_index = m.group_index;
	//alert(group_index);
	var group = CSApp.groups[group_index];
	//console.log(JSON.stringify(group));
	var action, action, editWindow, color, deviceRecordID;
	var viewedFile = CSApp.patternTable[storage.findPatternIndexByPatternKey(group.lastPattern)];
	//console.log(JSON.stringify(viewedFile));
	var patternKey = group.lastPattern;
	var actionsArray = [];
	var displayer = "opacity:0;height:0px;";				
	var windowDisplayer = "";
	var deviceRecordID;
	var hasDevices = false;

	var device_area_title = `
					<div class="fileModalDeviceMessageArea">
						<div>group members</div>
						<div>remove from group</div>
					</div>`;
	
	var current_p = null;

	var device_pucks_markup = '';

	for (var x = 0; x < group.devices.length; x++)
	{
		var device_index_app = group.devices[x].deviceIndex;		
		var action = `onclick="CSApp.groups[${group_index}].removeDeviceFromGroup(${x});update_modal_or_die_by_id('${m.modal_id}')"`;
		var actionicon = `<i class="linear-arrow-down"  aria-hidden="true"></i>`;
		
		
		var body_action = `ontouchstart="idDevice(${device_index_app},1);clickStateCustom(this,1,'device_puck_click')" 
							ontouchend="idDevice(${device_index_app},0);clickStateCustom(this,0,'device_puck_click')"`;

		device_pucks_markup += `<div class="remoteGroupDeviceContainer">
					${generate_device_puck_multi({
						device_index: device_index_app,
						//left_action: left_action,
						//left_action_icon: left_action_icon,
						right_action: action,
						right_action_icon: actionicon,
						body_action: body_action,
						
						})}
				</div>`;	

	}					

	if (!group.devices.length) 
	{
		device_pucks_markup += `<div style="width:100%;text-align:center;color:var(--neutraltext);opacity:.75;font-size:14px;margin:15px 0px;">
				(group has no devices)
			</div>`;

	}
	
	var device_area_title_ungrouped = `
					<div class="fileModalDeviceMessageArea">
						<div>ungrouped spikes</div>
						<div>add to group</div>
					</div>`;

	var device_pucks_markup_ungrouped = '';
	var no_devices = true;
	for (var x = 0; x < CSApp.device.length; x++)
	{
		
		if (group.findDeviceIndexInGroup(x) === false) 
		{
			no_devices = false;
			var device_index_app = x;		
			var action = `onclick="CSApp.groups[${group_index}].addDeviceToGroup(${x});update_modal_or_die_by_id('${m.modal_id}')"`;
			var actionicon = `<i class="linear-arrow-up"  aria-hidden="true"></i>`;
			
			
			var body_action = `ontouchstart = "idDevice(${device_index_app},1);clickStateCustom(this,1,'device_puck_click')" 
							   ontouchend   = "idDevice(${device_index_app},0);clickStateCustom(this,0,'device_puck_click')"`;

			device_pucks_markup_ungrouped += `<div class="remoteGroupDeviceContainer">
						${generate_device_puck_multi({
							device_index: device_index_app,
							right_action: action,
							right_action_icon: actionicon,
							body_action: body_action,
							})}
					</div>`;	
		}

	}					

	if (no_devices) 
	{
		device_pucks_markup_ungrouped = `<div style="width:100%;text-align:center;color:var(--neutraltext);opacity:.75;font-size:14px;margin:15px 0px;">
														(all known devices are in this group)
													</div>`;
	}

	var sync_button_markup = ``;
					


	var header = generate_simple_modal_header({
		title: `${group.name}: members`,
	});	
	
	var modal_divider = `<div class="modal_divider"></div>`

	var modalBody = `
			${header}	
			
			<div class="fileModalDeviceContainer">
				${device_area_title}
				${device_pucks_markup}
			</div>
			<div class="fileModalDeviceContainer">
				${device_area_title_ungrouped}
				${device_pucks_markup_ungrouped}
			</div>
			
	`;

	return modalBody;

}

function generate_group_devices_markup(m)
{

	console.log("making group modal markup");
	var group_index = m.group_index;
	//alert(group_index);
	var group = CSApp.groups[group_index];
	//console.log(JSON.stringify(group));
	var action, action, editWindow, color, deviceRecordID;
	var viewedFile = CSApp.patternTable[storage.findPatternIndexByPatternKey(group.lastPattern)];
	//console.log(JSON.stringify(viewedFile));
	var patternKey = group.lastPattern;
	var actionsArray = [];
	var displayer = "opacity:0;height:0px;";				
	var windowDisplayer = "";
	var deviceRecordID;
	var hasDevices = false;

	var device_area_title = `
					<div class="fileModalDeviceMessageArea">
						<div>grouped devices</div>
						<div><i class="csicon-check activeIcon"></i>=&nbsp;&nbsp;active in group</div>
					</div>`;
	
	var current_p = null;

	var device_pucks_markup = '';

	for (var x = 0; x < group.devices.length; x++)
	{
		var device_index_app = group.devices[x].deviceIndex;		
		var action = `onclick="toggleDevicePresentInGroup(${group_index}, ${x}, ${group.devices[x].deviceIndex});update_modal_or_die_by_id('${m.modal_id}');"`;
		if (group.devices[x].present)
		{
			var actionicon = `<i class="csicon-checkbox_on activeIcon"  aria-hidden="true"></i>`
		}
		else
		{
			var actionicon = `<i class="csicon-checkbox_off inactiveIcon" aria-hidden="true"></i>`
		}
		
		if (CSApp.device[device_index_app].stats.orientation)
		{
			var left_action = `onclick="flipOrientation(${device_index_app},0);update_modal_or_die_by_id('${m.modal_id}')"`;
			var left_action_icon = `<i class="linear-flip-vertical2 active_color"  aria-hidden="true"></i>`;
		}
		else
		{	
			var left_action = `onclick="flipOrientation(${device_index_app},1);update_modal_or_die_by_id('${m.modal_id}')"`;
			var left_action_icon = `<i class="linear-flip-vertical2"  aria-hidden="true"></i>`;
		}
		
		//	var left_action = ``;
		//	var left_action_icon = ``;


		var body_action = `ontouchstart="idDevice(${device_index_app},1);clickStateCustom(this,1,'device_puck_click')" 
							ontouchend="idDevice(${device_index_app},0);clickStateCustom(this,0,'device_puck_click')"`;

		if (group.devices[x].present)
		{
			var group_status = true;
		}
		else
		{
			var group_status = false;
		}

		device_pucks_markup += `<div class="remoteGroupDeviceContainer">
					${generate_device_puck_multi({
						device_index: device_index_app,
						left_action: left_action,
						left_action_icon: left_action_icon,
						right_action: action,
						right_action_icon: actionicon,
						body_action: body_action,
						disable_actions:true,
						status_group: group_status
						})}
				</div>`;	

	}					
	
	var addable_devices = CSApp.device.length - group.devices.length;
	console.log(`You have ${addable_devices} that could be put in the group`);
	

	var sync_action = `create_new_modal({
				        modal_id:'group_management_${group.selfIndex}',
				        modal_type:'group_management',
				        group_index: ${group.selfIndex},
				        deactivate: function(){update_modal_or_die_by_id('group_devices_${group.selfIndex}');}
				      })`;
	var sync_label = "manage group members";
	

	var sync_button_markup = `
					<div class="fileModalSyncButtonArea">
						<div class="centered_content" style="text-align:center;width:100%;">
									<button style="width:85%;" 
									
									onclick="${sync_action}">
									${sync_label}
									</button>
								</div>
					</div>`;


	var header = generate_simple_modal_header({
		title: `${group.name}: active spikes`,
	});	
	

	//var span_controls = generate_spanning_controls_markup(m);
	var modalBody = `
			${header}	
			
			<div class="fileModalDeviceContainer">
				${device_area_title}
				${device_pucks_markup}
			</div>
			<div style="padding:15px;width:100%;">
				${sync_button_markup}
			</div>
	`;

	checkIfShortRemotesNeedToBeRestarted(); 
	return modalBody;

}

function deactivate_sync_modal(group_index)
{


	CSApp.groups[group_index].refreshRemoteLowerDrawer();
	checkIfGroupManagerNeedsUpdate();

  //  CSApp.groups[group_index].remote.pattern.group_modal_draw_on(); 
}

function activate_sync_modal(group_index)
{
	//generateNotification("hi")

	var defaultValue = CSApp.groups[group_index].syncDelay;

    var syncDelaySlider = new slider_l({
    	context:`syncDelaySlider_${group_index}`,
    	min: 0,
    	max: 3,
    	step: .1,
    	rangeStyle: "seconds",
    //	range: false,
    	defaultvalue:defaultValue,
    /*	slider_fill: true,
    	handle_style:"open_slide_handle",*/
    	callback: function(value, force) { CSApp.groups[group_index].updateSyncDelay(value, force) },
    });


    initSlider_single(syncDelaySlider);

    updateSlider(`syncDelaySlider_${group_index}_slider`, defaultValue); // have to trigger a programatic slide 

  //  CSApp.groups[group_index].remote.pattern.group_modal_draw_on(); 
}


function activate_span_modal(group_index)
{
	//alert(group_index);
/*
	var defaultValue = CSApp.groups[group_index].spanCount;

    var spanCountSlider = new slider_l({
    	context:`spanCountSlider_${group_index}`,
    	min: 2,
    	max: 8,
    	rangeStyle: false,
    	range: false,
    	defaultvalue:defaultValue,
    	slider_fill: false,
    	handle_style:"open_slide_handle",
    	callback: function(value, force) { CSApp.groups[group_index].updateSpanCount(value, force) },
    });


    initSlider_single(spanCountSlider);
*/
    CSApp.groups[group_index].remote.pattern.group_modal_draw_on(); 
}

function deactivate_span_modal(group_index)
{
	CSApp.groups[group_index].refreshRemote(true);
    CSApp.groups[group_index].remote.pattern.custom_target_canvas(CSApp.groups[group_index].remote.canvasID); 
}

function generate_group_settings_markup(m)
{

	console.log("making group settings modal markup");
	var group_index = m.group_index;
	var group = CSApp.groups[group_index];
	var action, action, editWindow, color, deviceRecordID;
	//var viewedFile = CSApp.patternTable[storage.findPatternIndexByPatternKey(group.lastPattern)];
	//var patternKey = group.lastPattern;
	var actionsArray = [];
	var displayer = "opacity:0;height:0px;";				
	var windowDisplayer = "";
	var deviceRecordID;
	var hasDevices = false;
	var current_p = null;
	

	var device_area_title = `
					
					`;

	var device_pucks_markup = '';

	/*if (group.active)
	{
		var manage_action = `activateGroup(${group_index}, false);update_modal_or_die_by_id('${m.modal_id}');`;
		var manage_label = "deactivate";
	}
	else
	{
		var manage_action = `activateGroup(${group_index}, true);update_modal_or_die_by_id('${m.modal_id}');`;
		var manage_label = "activate";
	}*/

	/*var manage_button_markup = `<div class="confirmationActions">
									<div class="centered_content" style="text-align:center;width:100%;">
										<button style="width:75%;" onclick="${manage_action}" class="${group.active ? '' : 'hero_button'}">
											${manage_label}
										</button>
									</div>
									<div class="centered_content" style="text-align:center;width:100%;">
										<button style="width:75%;" onclick="deleteGroup(${group_index})" class="">
											delete 
										</button>
									</div>
								</div>`;*/
					
	var header = generate_simple_modal_header({
		title: `Rename ${group.name}`,
	});	
	

	var group_settings_controls = generate_settings_controls_markup(m);
	var modalBody = `
			${header}	
			${group_settings_controls}`;
			/*
			<!--<div class="fileModalDeviceContainer">
				${device_area_title}
				${device_pucks_markup}
				${manage_button_markup}
			</div>-->`;*/

	return modalBody;
}

function generate_device_tags_markup(m)
{
				
		

					
	var header = generate_simple_modal_header({
		title: `Device Tags`,
	});	

	var tags_markup = "";

	for (var x = 0; x < CSApp.deviceTags.length; x++)
	{
		tags_markup += generateTagContainer({
							id: `tag_${x}`,
							tagID: CSApp.deviceTags[x].id,
							hidden: false,
							prepop: true
						})
	}	
	

	var modalBody = `
			${header}	
			<div class="fileModalDeviceContainer">
				${tags_markup}
			</div>
			<div style="padding:15px;width:100%;">
			</div>
	`;

	return modalBody;
}



function generate_group_sync_markup(m)
{

	console.log("making group sync modal markup");
	var group_index = m.group_index;
	var group = CSApp.groups[group_index];
	var action, action, editWindow, color, deviceRecordID;
	var viewedFile = CSApp.patternTable[storage.findPatternIndexByPatternKey(group.lastPattern)];
	var patternKey = group.lastPattern;
	var actionsArray = [];
	var displayer = "opacity:0;height:0px;";				
	var windowDisplayer = "";
	var deviceRecordID;
	var hasDevices = false;
	var current_p = null;
	

	var device_area_title = `
					<div class="fileModalDeviceMessageArea">
						<div>invert</div>
						<div>grouped devices</div>
						<div>sync order</div>
					</div>
					`;

	var device_pucks_markup = '';

	for (var x = 0; x < group.devices.length; x++)
	{
		var device_index_app = group.devices[x].deviceIndex;
		var action = `onclick="CSApp.groups[${group_index}].generateSyncIndexPicker(${x})"`;

		var syncIndex_clamp = group.devices[x].syncIndex;
		
		//if (syncIndex_clamp > group.syncCount) {syncIndex_clamp = group.syncCount;}
		
		//var actionicon = `<div class="detail_text">${syncIndex_clamp}/${group.syncCount}</div>`
		var actionicon = `<div class="detail_text" style="padding-right:5px;">${ordinalArray[syncIndex_clamp]}&nbsp;<i class="linear-pencil"></i></div>`
		
		if (CSApp.device[device_index_app].stats.orientation)
		{
			var left_action = `onclick="flipOrientation(${device_index_app},0);update_modal_or_die_by_id('${m.modal_id}')"`;
			var left_action_icon = `<i class="linear-flip-vertical2 active_color"  aria-hidden="true"></i>`;
		}
		else
		{	
			var left_action = `onclick="flipOrientation(${device_index_app},1);update_modal_or_die_by_id('${m.modal_id}')"`;
			var left_action_icon = `<i class="linear-flip-vertical2"  aria-hidden="true"></i>`;
		}

		var body_action = `ontouchstart="idDevice(${device_index_app},1);clickStateCustom(this,1,'device_puck_click')" 
							ontouchend="idDevice(${device_index_app},0);clickStateCustom(this,0,'device_puck_click')"`;

		if (group.devices[x].present)
		{
			var group_status = true;
		}
		else
		{
			var group_status = false;
		}

		device_pucks_markup += `<div class="remoteGroupDeviceContainer" id="syncDevices">
					${generate_device_puck_multi({
						device_index: device_index_app,
						left_action: left_action,
						left_action_icon: left_action_icon,
						right_action: action,
						right_action_icon: actionicon,
						body_action: body_action,
						status_group: group_status
						})}
				</div>`;	

	}					
		
	
	var sync_action = `CSApp.groups[${group_index}].syncPattern();`
	var sync_label = "restart pattern";


	var sync_button_markup = `
					<div class="fileModalSyncButtonArea">
						<div class="centered_content" style="text-align:center;width:100%;">
									<button style="width:85%;" onclick="${sync_action}">
									${sync_label}
									</button>
								</div>
					</div>`;
					
	var header = generate_simple_modal_header({
		title: `${group.name}: Sync Delay`,
	});	
	

	var sync_controls = generate_sync_controls_markup(m);
	var modalBody = `
			${header}	
			${sync_controls}
			<div class="fileModalDeviceContainer">
				${device_area_title}
				${device_pucks_markup}
			</div>
			<div style="padding:15px;width:100%;">
				${sync_button_markup}
			</div>
	`;

	return modalBody;
}



function generate_group_sync_tune_markup(m)
{

	console.log("making group sync tune modal markup");
	var group_index = m.group_index;
	var group = CSApp.groups[group_index];
	var action, action, editWindow, color, deviceRecordID;
	var viewedFile = CSApp.patternTable[storage.findPatternIndexByPatternKey(group.lastPattern)];
	var patternKey = group.lastPattern;
	var actionsArray = [];
	var displayer = "opacity:0;height:0px;";				
	var windowDisplayer = "";
	var deviceRecordID;
	var hasDevices = false;
	var current_p = null;
	var highlightIndex = 0;
	//var selected_device = m.selected_device ? CSApp.device[m.selected_device] : false;



	if (m.selected_device === false || typeof m.selected_device == "undefined")
	{
		var selected_device = false;
	}
	else
	{
		var selected_device = CSApp.device[m.selected_device];
	}	

	//generateNotification("Selected: " + m.selected_device + ", " + selected_device)

	var device_area_title = `
					<div class="fileModalDeviceMessageArea">
						<div>&nbsp;grouped devices</div>
						<div>select</div>
					</div>
					`;


	var device_pucks_markup = '';

	for (var x = 0; x < group.devices.length; x++)
	{
		var device_index_app = group.devices[x].deviceIndex;
		//var action = `onclick="CSApp.device[${device_index_app}].sendFrameSkipFast(${group.frameSkipValue});"`;
		var action; // = `onclick="setSelectedSyncTuneDevice(${device_index_app}, ${group_index})"`;

		var syncIndex_clamp = group.devices[x].syncIndex;
		
		//if (syncIndex_clamp > group.syncCount) {syncIndex_clamp = group.syncCount;}
		
		//var actionicon = `<div class="detail_text">${syncIndex_clamp}/${group.syncCount}</div>`
		var actionicon;
		var inactivatedClass = "";


		if (selected_device && selected_device.deviceIndex == device_index_app)
		{	
			//generateNotification("first outer case")
			if (CSApp.device[device_index_app].ble.connected)
			{
				//generateNotification("first inner case")
				action = `onclick="setSelectedSyncTuneDevice(${false}, ${group_index})"`;
				actionicon = `<i id="device_${device_index_app}_sync_tune_checkbox" class="csicon-checkbox_on activeIcon"></i>`;
			}
			else
			{
				//generateNotification("second inner case")
				action = `onclick=""`;
				actionicon = `<i id="device_${device_index_app}_sync_tune_checkbox" class="csicon-checkbox_on activeIcon"></i>`;
			}	
		}
		else
		{
			//generateNotification("second outer case")

			if (CSApp.device[device_index_app].ble.connected)
			{
				//generateNotification("first inner case")
				action = `onclick="setSelectedSyncTuneDevice(${device_index_app}, ${group_index})"`;
				actionicon = `<i id="device_${device_index_app}_sync_tune_checkbox" class="csicon-checkbox_off inactiveIcon"></i>`;
			}
			else
			{
				//generateNotification("second inner case")
				action = `onclick=""`;
				actionicon = `<i id="device_${device_index_app}_sync_tune_checkbox" class="csicon-checkbox_off inactiveIcon"></i>`;

			}	
		}	


		//var actionicon = selected_device.deviceIndex == device_index_app ? `<i id="device_${index}_sync_tune_checkbox" class="csicon-checkbox_on activeIcon"></i>` : `<i id="device_${device_index_app}_sync_tune_checkbox" class="csicon-checkbox_off inactiveIcon"></i>`
		//generateNotification(selected_device.deviceIndex + ", " + device_index_app + ", " + actionicon)

		/*var left_action = `onclick="CSApp.device[${device_index_app}].sendFrameSkipSlow(${group.frameSkipValue});"`;
		var left_action_icon = `<i class="linear-circle-minus"  aria-hidden="true"></i>`;*/
		//var left_action_icon = `<i class="linear-flip-vertical2 active_color"  aria-hidden="true"></i>`;

		var body_action = `ontouchstart="idDevice(${device_index_app},1);clickStateCustom(this,1,'device_puck_click')" 
							ontouchend="idDevice(${device_index_app},0);clickStateCustom(this,0,'device_puck_click')"`;

		if (group.devices[x].present)
		{
			var group_status = true;
		}
		else
		{
			var group_status = false;
		}

		device_pucks_markup += `<div class="remoteGroupDeviceContainer" id="syncTuneDevices">
					${generate_device_puck_multi({
						device_index: device_index_app,
						right_action: action,
						right_action_icon: actionicon,
						body_action: body_action,
						status_group: group_status
						})}
				</div>`;	

	}					
			
	var sync_action = `CSApp.groups[${group_index}].syncPattern();`
	var sync_label = "restart pattern";


	var sync_button_markup = `
					<div class="fileModalSyncButtonArea">
						<div class="centered_content" style="text-align:center;width:100%;">
									<button style="width:85%;" onclick="${sync_action}">
									${sync_label}
									</button>
								</div>
					</div>`;
					
	var header = generate_simple_modal_header({
		title: `${group.name}: Sync Tune ${generateHelpItem('synctune')}`,
	});	
	

	//var sync_controls = generate_sync_controls_markup(m);


	actionsArray.push(new actionItem({
		name:'send spanning', 
		icon:'fa fa-fast-backward', 
		label:'-5', 
		action:`CSApp.device[${selected_device.deviceIndex}].frameSkipFromModal(-5)`
	}));

	actionsArray.push(new actionItem({
		name:'send spanning', 
		icon:'fa fa-step-backward', 
		label:'-1', 
		action:`CSApp.device[${selected_device.deviceIndex}].frameSkipFromModal(-1)`
	}));


	actionsArray.push(new actionItem({
		name:'send spanning', 
		icon:'fa fa-step-forward', 
		label:'+1', 
		action:`CSApp.device[${selected_device.deviceIndex}].frameSkipFromModal(1)`
	}));

	actionsArray.push(new actionItem({
		name:'send spanning', 
		icon:'fa fa-fast-forward', 
		label:'+5', 
		action:`CSApp.device[${selected_device.deviceIndex}].frameSkipFromModal(5)`
	}));

	if (typeof selected_device.currentFrameskipOffset == "undefined")
	{
		selected_device.currentFrameskipOffset = 0;
	}	

	var actionMenu = generateModalActionMenu(patternKey, actionsArray, 28, 10);
	var selectedDeviceTitle = selected_device ? `<b>${selected_device.deviceName}</b> <br> current sync offset: ${selected_device.currentFrameskipOffset}` : "<i>no colorspike<br>selected</i>"   


	var sync_controls = `<div id="syncTuneActionMenu" class="${selected_device ? '' : 'disabled2'}" style="width:100%;display:flex;justify-content:space-between;">
							<div style="display:flex;flex-direction:column;width:100%;">
								<div class="modal_detail_text detail_center_aligned" id="syncTuneActionMenu_title" style="width:100%;padding:0px">
									${selectedDeviceTitle}	
								</div>
								<div>
									${actionMenu}
								</div>
							</div>	
						</div>`;
					
	var modalBody = `
			${header}	
			${sync_controls}
			<div class="fileModalDeviceContainer">
				${device_area_title}
				${device_pucks_markup}
			</div>
			<div style="padding:15px;width:100%;">
				${sync_button_markup}
			</div>
	`;

	return modalBody;
}

function generate_group_sync_tune_markup_old(m)
{

	console.log("making group sync tune modal markup");
	var group_index = m.group_index;
	var group = CSApp.groups[group_index];
	var action, action, editWindow, color, deviceRecordID;
	var viewedFile = CSApp.patternTable[storage.findPatternIndexByPatternKey(group.lastPattern)];
	var patternKey = group.lastPattern;
	var actionsArray = [];
	var displayer = "opacity:0;height:0px;";				
	var windowDisplayer = "";
	var deviceRecordID;
	var hasDevices = false;
	var current_p = null;
	var highlightIndex = 0;
	

	var device_area_title = `
					<div class="fileModalDeviceMessageArea">
						<div>&nbsp;grouped devices</div>
						<div>select</div>
					</div>
					`;

	var device_pucks_markup = '';

	for (var x = 0; x < group.devices.length; x++)
	{
		var device_index_app = group.devices[x].deviceIndex;
		var action = `onclick="CSApp.device[${device_index_app}].sendFrameSkipFast(${group.frameSkipValue});"`;

		var syncIndex_clamp = group.devices[x].syncIndex;
		
		//if (syncIndex_clamp > group.syncCount) {syncIndex_clamp = group.syncCount;}
		
		//var actionicon = `<div class="detail_text">${syncIndex_clamp}/${group.syncCount}</div>`
		var actionicon = `<i class="linear-plus-circle"></i>`
		

		var left_action = `onclick="CSApp.device[${device_index_app}].sendFrameSkipSlow(${group.frameSkipValue});"`;
		var left_action_icon = `<i class="linear-circle-minus"  aria-hidden="true"></i>`;
		//var left_action_icon = `<i class="linear-flip-vertical2 active_color"  aria-hidden="true"></i>`;

		var body_action = `ontouchstart="idDevice(${device_index_app},1);clickStateCustom(this,1,'device_puck_click')" 
							ontouchend="idDevice(${device_index_app},0);clickStateCustom(this,0,'device_puck_click')"`;

		if (group.devices[x].present)
		{
			var group_status = true;
		}
		else
		{
			var group_status = false;
		}

		device_pucks_markup += `<div class="remoteGroupDeviceContainer" id="syncTuneDevices">
					${generate_device_puck_multi({
						device_index: device_index_app,
						left_action: left_action,
						left_action_icon: left_action_icon,
						right_action: action,
						right_action_icon: actionicon,
						body_action: body_action,
						status_group: group_status
						})}
				</div>`;	

	}					
		
	switch (group.frameSkipValue)
	{
		case 1:
			highlightIndex = 0;
		break;
		
		case 5:
			highlightIndex = 1;
		break;
			
		case 25:
			highlightIndex = 2;
		break;
		
		case 50:
			highlightIndex = 3;
		break;
		
		default:
			group.frameSkipValue = 5;
			highlightIndex = 1;
		break;			
					
	}	
	
	var sync_action = `CSApp.groups[${group_index}].syncPattern();`
	var sync_label = "restart pattern";


	var sync_button_markup = `
					<div class="fileModalSyncButtonArea">
						<div class="centered_content" style="text-align:center;width:100%;">
									<button style="width:85%;" onclick="${sync_action}">
									${sync_label}
									</button>
								</div>
					</div>`;
					
	var header = generate_simple_modal_header({
		title: `${group.name}: Sync Tune`,
	});	
	

	//var sync_controls = generate_sync_controls_markup(m);

	
	actionsArray.push(new actionItem({
		name:'send spanning', 
		icon:'icon linear-refresh', 
		label:'1', 
		action:`CSApp.groups[${group_index}].setFrameSkipValue(1);`
	}));


	actionsArray.push(new actionItem({
		name:'spanning sync', 
		icon:'icon linear-sync', 
		label:'5', 
		action:`CSApp.groups[${group_index}].setFrameSkipValue(5);`
	}));

	actionsArray.push(new actionItem({
		name:'span count -1', 
		icon:'icon linear-chevron-down-square', 
		label:'25', 
		action:`CSApp.groups[${group_index}].setFrameSkipValue(25);`
	}));

	actionsArray.push(new actionItem({
		name:'span count +1', 
		icon:'icon linear-chevron-up-square', 
		label:'50', 
		action:`CSApp.groups[${group_index}].setFrameSkipValue(50);`
	}));

	//generateNotification("hi:" + highlightIndex);

	var actionMenu = generateModalActionMenu(patternKey, actionsArray, 28, 10, highlightIndex);



	var sync_controls = `<div class="modal_detail_text">Use the plus and minus buttons next to each spike to speed up or slow down to fine tune group pattern sync.</div>
		<div class="modal_detail_text" onclick="log_resync_pings(${group_index});">LOG RESYNC PINGS</div>
		<div class="modal_detail_text" onclick="auto_adjust_resync(${group_index});">AUTO ADJUST FRAMES</div>
		<div style="width:100%;display:flex;justify-content:space-between;">
			${actionMenu}
		</div>
	`;
	



	var modalBody = `
			${header}	
			${sync_controls}
			<div class="fileModalDeviceContainer">
				${device_area_title}
				${device_pucks_markup}
			</div>
			<div style="padding:15px;width:100%;">
				${sync_button_markup}
			</div>
	`;

	return modalBody;
}

function generate_group_spanning_markup(m)
{

	console.log("making group spanning modal markup");
	var group_index = m.group_index;
	var group = CSApp.groups[group_index];
	var action, action, editWindow, color, deviceRecordID;
	var viewedFile = CSApp.patternTable[storage.findPatternIndexByPatternKey(group.lastPattern)];
	var patternKey = group.lastPattern;
	var actionsArray = [];
	var displayer = "opacity:0;height:0px;";				
	var windowDisplayer = "";
	var deviceRecordID;
	var hasDevices = false;
	var current_p = null;
	

	var device_area_title = `
					<div class="fileModalDeviceMessageArea">
						<div>grouped devices</div>
						<div>spanning index</div>
					</div>
					`;

	var device_pucks_markup = '';

	for (var x = 0; x < group.devices.length; x++)
	{
		var device_index_app = group.devices[x].deviceIndex;
		var action = `onclick="CSApp.groups[${group_index}].generateSpanIndexPicker(${x})"`;

		var spanIndex_clamp = group.devices[x].spanIndex+1;
		
		if (spanIndex_clamp > group.spanCount) {spanIndex_clamp = group.spanCount;}
		
		var actionicon = `<div class="detail_text">${spanIndex_clamp}/${group.spanCount}</div>`
		
		if (CSApp.device[device_index_app].stats.orientation)
		{
			var left_action = `onclick="flipOrientation(${device_index_app},0);update_modal_or_die_by_id('${m.modal_id}')"`;
			var left_action_icon = `<i class="linear-flip-vertical2 active_color"  aria-hidden="true"></i>`;
		}
		else
		{	
			var left_action = `onclick="flipOrientation(${device_index_app},1);update_modal_or_die_by_id('${m.modal_id}')"`;
			var left_action_icon = `<i class="linear-flip-vertical2"  aria-hidden="true"></i>`;
		}

		var body_action = `ontouchstart="idDevice(${device_index_app},1);clickStateCustom(this,1,'device_puck_click')" 
							ontouchend="idDevice(${device_index_app},0);clickStateCustom(this,0,'device_puck_click')"`;

		if (group.devices[x].present)
		{
			var group_status = true;
		}
		else
		{
			var group_status = false;
		}

		device_pucks_markup += `<div class="remoteGroupDeviceContainer">
					${generate_device_puck_multi({
						device_index: device_index_app,
						left_action: left_action,
						left_action_icon: left_action_icon,
						right_action: action,
						right_action_icon: actionicon,
						body_action: body_action,
						status_group: group_status
						})}
				</div>`;	

	}					
		
	if (group.spanned)
	{
		var sync_action = `CSApp.groups[${group_index}].toggleSpanning();update_modal_or_die_by_id('${m.modal_id}');CSApp.groups[${group_index}].sendSpanningData();`;
		var sync_label = "deactivate spanning";
	}
	else
	{
		var sync_action = `CSApp.groups[${group_index}].toggleSpanning();update_modal_or_die_by_id('${m.modal_id}');CSApp.groups[${group_index}].sendSpanningData();`;
		var sync_label = "activate spanning";
	}

	var sync_button_markup = `
					<div class="fileModalSyncButtonArea">
						<div class="centered_content" style="text-align:center;width:100%;">
									<button style="width:85%;" class="${group.spanned ? '' : 'hero_button'}" 
									
									onclick="${sync_action}">
									${sync_label}
									</button>
								</div>
					</div>`;
					
	var header = generate_simple_modal_header({
		title: `${group.name}: spanning`,
	});	
	

	var span_controls = generate_spanning_controls_markup(m);
	var modalBody = `
			${header}	
			${span_controls}
			<div class="fileModalDeviceContainer">
				${device_area_title}
				${device_pucks_markup}
			</div>
			<div style="padding:15px;width:100%;">
				${sync_button_markup}
			</div>
	`;

	return modalBody;
}


function generate_settings_controls_markup(m)
{
	var group_index = m.group_index;
	var group = CSApp.groups[group_index];
	var patternKey = group.lastPattern;
	//var newname = elem('group_${m.group_index}_name').value;
	
/*
	<!--<button  class="text_button" onclick="document.getElementById('group_${m.group_index}_name').value = ''">
					X
				</button>-->
*/

	var	textbox_markup = `
			<div style="display:flex;justify-content:space-between;text-align:center;padding:10px 10px 0;width:100%">
			
				<input class="textInput" id="group_${m.group_index}_name" type="text" maxlength="15" onfocus="this.placeholder=''" placeholder="rename this group"></input>
				<i onclick="clearTextbox('group_${m.group_index}_name')" class="icon linear-cross textboxClear"></i>
				<button  class="text_button_hero" onclick="CSApp.groups[${group_index}].rename(elem('group_${m.group_index}_name').value)">				
					GO
				</button>
			</div>`

	return textbox_markup;

}

function generate_sync_controls_markup (m)
{
	var actionsArray = [];
	var group_index = m.group_index;
	var group = CSApp.groups[group_index];
	var patternKey = group.lastPattern;

	var pType = CSApp.patternTable[storage.findPatternIndexByPatternKey(group.lastPattern)].rawHeader.pType;

	var span_hint_markup = ``;

		for (var x = 0; x < group.spanCount; x++)
		{
			span_hint_markup += `<div class="detail_text span_hint_tall ${group.spanned ? 'active' : ''}">${x+1}</div>`;
		}


	var sync_delay_slider_markup = ` <div class="spanCountContainer">
					<div class="sliderIconsBody">
						<div class="modal_text_label">
							OFF
						</div>	
						<div class="sliderIconsCenter_shape" id="syncDelaySlider_${group_index}">
						</div>
						<div class="modal_text_label">
							3s
						</div>	

				   </div>
			   </div>`;

/*
	actionsArray.push(new actionItem({
		name:'send spanning', 
		icon:'icon linear-refresh', 
		label:'refresh', 
		action:`CSApp.groups[${group_index}].sendSpanningData();`
	}));
*/

	actionsArray.push(new actionItem({
		name:'spanning sync', 
		icon:'icon linear-sync', 
		label:'Fine tune sync', 
		action:``
	}));

	actionsArray.push(new actionItem({
		name:'sync count -1', 
		icon:'icon linear-chevron-down-square', 
		label:'sync count -1', 
		action:`CSApp.groups[${group_index}].incrementSyncCount(false);`
	}));

	actionsArray.push(new actionItem({
		name:'sync count +1', 
		icon:'icon linear-chevron-up-square', 
		label:'sync count +1', 
		action:`CSApp.groups[${group_index}].incrementSyncCount(true);`
	}));

	var actionMenu = generateModalActionMenu(patternKey, actionsArray, 18, 10);

	var outer_container = ` <div class="span_controls_outer">
								<!--<div style="height:8px;width:100%;background-color:black;overflow:hidden">
									<canvas id="group_spanning_preview"  class="filepreview fileModalPreviewCanvas" width="${pType == 11 ? fireCanvasWidth:otherCanvasWidth}" height="6px">
									</canvas>
								</div>-->
								${sync_delay_slider_markup}
								<!--${actionMenu}-->
							</div>`;

	return outer_container;

}


function generate_spanning_controls_markup (m)
{
	var actionsArray = [];
	var group_index = m.group_index;
	var group = CSApp.groups[group_index];
	var patternKey = group.lastPattern;

	var pType = CSApp.patternTable[storage.findPatternIndexByPatternKey(group.lastPattern)].rawHeader.pType;

	var span_hint_markup = ``;

		for (var x = 0; x < group.spanCount; x++)
		{
			span_hint_markup += `<div class="detail_text span_hint_tall ${group.spanned ? 'active' : ''}">${x+1}</div>`;
		}


	var span_count_slider_markup = ` <div class="spanCountContainer">
					<div class="sliderIconsBody">
						<div class="modal_text_label">
							Count:
						</div>	
						<div class="sliderIconsCenter_shape" id="spanCountSlider_${group_index}">
						</div>
				   </div>
			   </div>`;


	actionsArray.push(new actionItem({
		name:'send spanning', 
		icon:'icon linear-refresh', 
		label:'refresh', 
		action:`CSApp.groups[${group_index}].sendSpanningData();`
	}));


	actionsArray.push(new actionItem({
		name:'spanning sync', 
		icon:'icon linear-sync', 
		label:'Resync', 
		action:`CSApp.groups[${group_index}].syncPattern();`
	}));

	actionsArray.push(new actionItem({
		name:'span count -1', 
		icon:'icon linear-chevron-down-square', 
		label:'count -1', 
		action:`CSApp.groups[${group_index}].incrementSpanCount(false);CSApp.groups[${group_index}].sendSpanningData()`
	}));

	actionsArray.push(new actionItem({
		name:'span count +1', 
		icon:'icon linear-chevron-up-square', 
		label:'count +1', 
		action:`CSApp.groups[${group_index}].incrementSpanCount(true);CSApp.groups[${group_index}].sendSpanningData()`
	}));

	var actionMenu = generateModalActionMenu(patternKey, actionsArray, 28, 10);

	var outer_container = ` <div class="span_controls_outer">
								<div style="height:8px;width:100%;background-color:black;overflow:hidden">
									<canvas id="group_spanning_preview"  class="filepreview fileModalPreviewCanvas" width="${pType == 11 ? fireCanvasWidth:otherCanvasWidth}" height="6px">
									</canvas>
								</div>
								<div class="spanning_hint_container">
									${span_hint_markup}
								</div>
								<!--${span_count_slider_markup}-->
								${actionMenu}
							</div>`;

	return outer_container;

}


function generate_file_modal_markup (id, patternKey)
{
	//console.log("making file modal markup");
	var action, action, editWindow, color, deviceRecordID;
	var viewedFile = CSApp.patternTable[storage.findPatternIndexByPatternKey(patternKey)];
	var actionsArray = [];
	var displayer = "opacity:0;height:0px;";				
	var windowDisplayer = "";
	var deviceRecordID;
	var hasDevices = false;
	current.patternRecordingByPatternKey = patternKey;
//var actionMenu = generateModalActionMenu(patternKey, actionsArray, 28, 10);		
	actionsArray.push(new actionItem({
		name:'fileModalEditButton', 
		icon:'linear-share2', 
		label:'Share', 
		action:`recordCanvas('fileModalPreviewTemp', '${patternKey}')`
	}));

	actionsArray.push(new actionItem({
		name:'fileModalDeleteButton', 
		icon:'linear-trash2', 
		label:'Delete', 
		action:`delete_pattern_confirm(${patternKey})`
	}));

	actionsArray.push(new actionItem({
		name:'fileModalEditAsNewButton', 
		icon:'linear-copy', 
		label:'Copy', 
		action:`openEdit('${patternKey}', false, true, '${id}')`
	}));

	actionsArray.push(new actionItem({
		name:'fileModalEditButton', 
		icon:'linear-pencil5', 
		label:'Edit', 
		action:`openEdit('${patternKey}', false, false, '${id}')`
	}));

	


	var device_area_title = `
					<div class="fileModalDeviceMessageArea">
						<div>devices</div>
						<div><i class="csicon-check activeIcon"></i>=&nbsp;&nbsp;on device</div>
					</div>`;
	
	var current_p = null;

	var device_pucks_markup = '';
	
	
	for (var devices = 0; devices < CSApp.device.length; devices++)
	{
		console.log("File modal for device " + devices);
		if(CSApp.device[devices].hasBeenConnected) {
			hasDevices = true;
			displayer = "opacity:1;height:40px;";
		} else {
			continue;
		}

		deviceRecordID =  CSApp.device[devices].findRecordIDbyPatternKey(patternKey);

		current_p = CSApp.device[devices].get_pattern_header_by_pkey(patternKey);

		if (current_p == null)
		{
			action = `onclick="uiBlock(true);CSApp.device[${devices}].sendPatternByPatternKey(${patternKey})"`;
			actionicon = `<i class="csicon-checkbox_off inactiveIcon" aria-hidden="true"></i>`
			console.log("its not on the sticks table");
		}
		else
		{
			if (current_p.isMarkedForDelete)
			{
				action = `onclick="CSApp.device[${devices}].sendPatternByPatternKey(${patternKey})"`;
				actionicon = `<i class="csicon-checkbox_off inactiveIcon" style="color:blue" aria-hidden="true"></i>`
				console.log("its on the sticks table and marked to delete");
			}
			else if (current_p.isDirty)
			{
				action = `onclick="CSApp.device[${devices}].deletePatternByPatternKey(${patternKey})"`;
				actionicon = `<i class="csicon-checkbox_on activeIcon" style="color:green" aria-hidden="true"></i>`
				console.log("its on the sticks table and marked dirty");
			}
			else if (current_p.isMarkedForSend)
			{
				action = `onclick="CSApp.device[${devices}].delete_queued_send(${patternKey})"`;
				actionicon = `<i class="csicon-checkbox_on activeIcon" style="color:pink"aria-hidden="true"></i>`
				console.log("its on the stick for a fresh send");
			}
			else
			{
				action = `onclick="CSApp.device[${devices}].deletePatternByPatternKey(${patternKey})"`;
				actionicon = `<i class="csicon-checkbox_on activeIcon"  aria-hidden="true"></i>`
				console.log("its on the sticks table and marked dirty");
			}
		}

		device_pucks_markup += `<div class="remoteGroupDeviceContainer">
							${generate_device_puck_multi({
								device_index: devices,
								left_action: null,
								right_action: action,
								right_action_icon:actionicon,
								status_sync: true,

								})}
						</div>`;	

	}

	if (!hasDevices) 
	{ 
		device_pucks_markup = `<div style="display:flex;justify-content:center;margin:10px 0px;font-size:12px;color:var(--four);">no known devices</div> `; 
	}

	var sync_action = null;
	var sync_label = null;
	var sync_action1 = null;
	var sync_label1 = null;
	//if (pattern_is_on_sync_list(patternKey)== true)
	//{
		sync_action = `uiBlock(true);set_for_auto_sync_delete(${patternKey});check_and_queue_patterns_by_flags();respin_file_modal();`
		sync_label = 'Remove all';
	//}
	//else
	//{
		sync_action1 = `uiBlock(true);set_for_auto_sync_send(${patternKey});check_and_queue_patterns_by_flags();respin_file_modal();`
		sync_label1 = 'Send to all';
//	}

	var sync_button_markup = `
					<div class="fileModalSyncButtonArea">
									<button style="width:45%;" 
									onclick="${sync_action}">
									${sync_label}
									</button>

									<button style="width:45%;" 
									onclick="${sync_action1}">
									${sync_label1}
									</button>
					</div>`;


	//var header = generateModalHeader(viewedFile.rawHeader.name, viewedFile.rawHeader.timestamp ? "last edited: " + timeConverter(viewedFile.rawHeader.timestamp) : "last edited: never", "type: " + typeLookup[parseInt(viewedFile.rawHeader.pType,10)], patternKey, true);	
	var actionMenu = generateModalActionMenu(patternKey, actionsArray, 28, 10);		

	var header = generate_modal_header({
		title: viewedFile.rawHeader.name,
		icon: "pType", 
		patternKey: patternKey,
		canvas:"fileModalPreviewTemp"
	});	


	var modalBody = `
			${header}
			${actionMenu}
			<div class="fileModalDeviceContainer">
				${device_area_title}
				${device_pucks_markup}
			</div>
			<div style="padding:15px;width:100%;">
				${sync_button_markup}
			</div>`;

	return modalBody;

}



function generate_span_index_markup (m)
{	
	var actionsArray = [];
	
	var snapMarkup;
   	
   	var group_index = m.group_index;
	var group = CSApp.groups[group_index];
	var d_index = m.device_index;
	var deviceName = CSApp.device[group.devices[d_index].deviceIndex].deviceName;

   
	var curIndex = group.devices[d_index].spanIndex;
	//snapMarkup =  generateSimpleModalHeader(`${deviceName}: set span index`, "", "", null, true);
	snapMarkup =  generateSimpleModalHeader(`set span index`, "", "", null, true);

	snapMarkup += `<div class="syncIndexPicker">
					   <div class="syncIndexControl" onclick="CSApp.groups[${group_index}].setSpanIndex(${curIndex - 1}, ${d_index});update_modal_or_die_by_id('span_index_picker_${group_index}')">
					   		<i class="linear-chevron-left iconButton tickerIcon"  aria-hidden="true"></i><br>
					   </div>

					   <div class="syncIndexControl" >		
						   <span id="syncOrderChanger_group_${group_index}_device_${d_index}">
						   		${ordinalArray[curIndex]}
						   </span><br>
					   </div>	   

					   <div class="syncIndexControl" onclick="CSApp.groups[${group_index}].setSpanIndex(${curIndex + 1}, ${d_index});update_modal_or_die_by_id('span_index_picker_${group_index}')">
					   		<i  class="linear-chevron-right iconButton tickerIcon"  aria-hidden="true"></i>
					   </div>		
				   </div>
				   `

	//syncMarkup += generateModalActionMenu(null, actionsArray, 26, 12);

	return snapMarkup;
}

function recordCanvas(canvasID, patternKey)
{

	create_new_modal({
      modal_id:`recordPattern`,
      modal_type:"connect_attempt",
      loader:true,
      prompt:`Uploading Pattern!`,
      detail_text:'<span id="previewPercentage">capturing frames: 0% complete</span>',
      detail_text_classes:"detail_center_aligned",
    });

	console.log("starting the recording");
	var index = storage.findPatternIndexByPatternKey(patternKey);

	current.masterPatternPreview[index].start_recording();
	
	//current.masterPatternPreview[index].init_and_run();
	//current.startRecording = true;	
}

function generate_sync_index_markup (m)
{	
	var actionsArray = [];
	
	var syncMarkup;
   	
   	var group_index = m.group_index;
	var group = CSApp.groups[group_index];
	var d_index = m.device_index;
	var deviceName = CSApp.device[group.devices[d_index].deviceIndex].deviceName;


    /*for (var x = 0; x< group.syncCount; x++)
    {
    	actionsArray.push(new actionItem({
		name:'geometry_new_button',
		icon:'linear-layers',
		label: `index ${x+1}`,
		action: `CSApp.groups[${group_index}].setSyncIndex(${x}, ${d_index});update_modal_or_die_by_id('group_sync_${group_index}');clear_modal_by_id('${m.modal_id}');`
		}));
    }*/
  
	syncMarkup =  generateSimpleModalHeader(`${deviceName}: set sync order`, "", "", null, true);
	syncMarkup += ` <div class="syncIndexPicker">
					   <div class="syncIndexControl" onclick="CSApp.groups[${group_index}].setSyncIndex(${group.devices[d_index].syncIndex - 1}, ${d_index});update_modal_or_die_by_id('sync_index_picker_group_${group_index}_device_${d_index}')">
					   		<i class="linear-chevron-left iconButton tickerIcon"  aria-hidden="true"></i><br>
					   </div>

					   <div class="syncIndexControl" >		
						   <span id="syncOrderChanger_group_${group_index}_device_${d_index}">
						   		${ordinalArray[CSApp.groups[group_index].devices[d_index].syncIndex]}
						   </span><br>
					   </div>	   

					   <div class="syncIndexControl" onclick="CSApp.groups[${group_index}].setSyncIndex(${group.devices[d_index].syncIndex + 1}, ${d_index});update_modal_or_die_by_id('sync_index_picker_group_${group_index}_device_${d_index}')">
					   		<i  class="linear-chevron-right iconButton tickerIcon"  aria-hidden="true"></i>
					   </div>		
				   </div>
				   `
				  /*syncMarkup += `<div class="modal_detail_text" style="padding-bottom:10px;">
					Devices with sync order 1st will restart immediately. Devices with sync order 2nd will restart after the delay has happened once, etc.
				   </div>
				   <div class="syncIndexPicker">
					   <div class="syncIndexControl" onclick="CSApp.groups[${group_index}].setSyncIndex(${group.devices[d_index].syncIndex + 1}, ${d_index});update_modal_or_die_by_id('sync_index_picker_group_${group_index}_device_${d_index}')">
					   		<i class="fa fa-caret-up iconButton"  aria-hidden="true"></i><br>
					   </div>

					   <div class="syncIndexControl" >		
						   <span id="syncOrderChanger_group_${group_index}_device_${d_index}">
						   		${ordinalArray[CSApp.groups[group_index].devices[d_index].syncIndex]}
						   </span><br>
					   </div>	   

					   <div class="syncIndexControl" onclick="CSApp.groups[${group_index}].setSyncIndex(${group.devices[d_index].syncIndex - 1}, ${d_index});update_modal_or_die_by_id('sync_index_picker_group_${group_index}_device_${d_index}')">
					   		<i  class="fa fa-caret-down iconButton"  aria-hidden="true"></i>
					   </div>		
				   </div>
				   <div class="modal_detail_text">
						With these settings, ${deviceName} will restart after ${ (group.devices[d_index].syncIndex * group.syncDelay).toFixed(2)} seconds.
				   </div>

				   `*/


	//syncMarkup += generateModalActionMenu(null, actionsArray, 26, 12);

	return syncMarkup;
}


function generate_opcode_markup(m)
{

var actionsArray = [];
var snapMarkup;
var connectedDeviceArray = [];


	for (var x = 0; x < CSApp.device.length; x++)
	{
	  if (CSApp.device[x].ble.connected)
	  {
	    var deviceTemp = {index: x, name: CSApp.device[x].deviceName}
	    connectedDeviceArray.push(deviceTemp);
	  }  
	}


    for (var x =0; x < connectedDeviceArray.length; x++)
    {
      actionsArray.push(new actionItem({
      label:`${connectedDeviceArray[x].name}`,
      class:"hero_button",
      touchstartaction:`idDevice(${connectedDeviceArray[x].index}, 1);`,
       touchendaction:`idDevice(${connectedDeviceArray[x].index}, 0);`,
      action: `changeManualOpcodeIndex(${connectedDeviceArray[x].index});`
    	})); 
    }  

	snapMarkup =  generateSimpleModalHeader(`Manual Opcode`, "", "", null, true);
	snapMarkup += `<div><input class="textInput" style="width:100%;" id="opcode"></input></div>`
	snapMarkup += generateModalActionMenu(null, actionsArray, 24, 10);
	snapMarkup += `<button onclick="commitOpcode();" class="hero_button opcodeSend" style="margin-bottom:25px;margin-top:15px;padding:0px 15px;">send</button>`;

	return snapMarkup;


}

function generate_new_file_markup (id)
{
	console.log("generating new file markup " + id);
	var actionsArray = [];
	
	var snapMarkup;
    
	actionsArray.push(new actionItem({
		name:'geometry_new_button',
		icon:'linear-layers',
		label: 'shapes',
		action: `openEdit(null, false, false, '${id}', ${PTYPE_GEOMETRY})`
		}));
	
	actionsArray.push(new actionItem({
		name:'fire_new_button',
		icon:'linear-fire',
		label: 'fire',
		action: `openEdit(null, false, false, '${id}', ${PTYPE_FIRE})`
		}));

	actionsArray.push(new actionItem({
		name:'slideshow_new_button',
		icon:'linear-film',
		label: 'slideshow',
		action: `openEdit(null, false, false, '${id}', ${PTYPE_SLIDESHOW})`
		}));

	actionsArray.push(new actionItem({
		name:'solid_new_button',
		icon:'linear-palette',
		label: 'solid',
		action: `openEdit(null, false, false, '${id}', ${PTYPE_SOLID})`
		}));

	actionsArray.push(new actionItem({
		name:'white_new_button',
		icon:'linear-lamp',
		label: 'white',
		action: `openEdit(null, false, false, '${id}', ${PTYPE_WHITE})`
		}));
		
	snapMarkup =  generateSimpleModalHeader(`create a new pattern${generateHelpItem('createpattern')}`, "", "", null, true);
	snapMarkup += generateModalActionMenu(null, actionsArray, 24, 10);
	snapMarkup += `<div class="doubleHRContainer">
						<hr>
							<span>OR</span>
						<hr>
					</div>	

						<button onclick="openPatternImportModal();" style="margin-bottom:25px;margin-top:15px;padding:0px 15px;">import a pattern</button>`;


	return snapMarkup;
}
/*
function generate_animation_modal_markup (id, actionsArray)
{	
	
	return modalBody;
}
*/


function show_animate_svg(modal_id, callback_on_swap)
{
	//console.log("showing and animating an svg");
	if (callback_on_swap == null) {callback_on_swap = function(){};}
//	console.log("showing svg")
	$("#"+modal_id+"_content").find(".unpause_me").css("animation-play-state", "running");

	//console.log(callback_on_swap);

	$("#"+modal_id+"_content").animate({
	opacity: "1"
	}, 125, function() 
	{
		setTimeout(function() {
			callback_on_swap();
		}, 800);
	}); 
}



//function modal_win_fail(message, result, modal_id, callback_on_close)
function modal_show_win_fail(m)
{
	// m.modal_id = modal to show state in
	// m.state = "win,fail,alert"
	// m.message = any message to display with alert
	// m.callback = whatever we want to do 1.5s after the win state is shown
	if (m.modal_id == null)
	{
		console.log("no modal id for win state, returning");
		return
	}

	replace_literal(m);

	$("#"+m.modal_id).unbind('click').click(function(e){
    	//Do nothing if .header was not directly clicked
    	if(e.target !== e.currentTarget) return;
  		//deactivate_modal(),
  		clear_modal_by_id(m.modal_id, null);

	});

	var win_state_markup;

//	console.log("Generating win state for "+ m.modal_id);
	
	switch (m.state)
	{
		case "win":
			win_state_markup = gen_win_icon_markup(m);
			break;

		case "fail":
			win_state_markup = gen_fail_icon_markup(m);
			break;

		case "alert":
			win_state_markup = gen_alert_icon_markup(m);
			break;

		default:
			win_state_markup = gen_alert_icon_markup(m);
			break;
	}
	//console.log(m.callback);
	$("#"+m.modal_id+"_content").animate({
		opacity: "0"
	},105, function() 
	{	
		$("#"+m.modal_id+"_content").html(win_state_markup);
		var width_new = $("#"+m.modal_id+"_content").children().first().width();
	    var height_new = $("#"+m.modal_id+"_content").children().first().height();
	 
		$("#"+m.modal_id+"_content").animate({
			width: width_new,
			height: height_new,
		}, 125, function() {show_animate_svg(m.modal_id, m.callback);});

    });
     
}

function activate_HSV_modal(modal_id, subspace, callbackHSV, h, s, v)
{
	var target = modal_id;
	var sliderIndex = sliders.length;
    //subspace = 1;

    if (typeof(callbackHSV) !== "function") {callbackHSV = function(){};}

    var slider_hue = new slider_l({
    	context:`${target}_hue`,
    	max: 359,
    	rangeStyle: false,
    	range: false,
    	defaultvalue:h,
    	slider_fill: false,
    	handle_style:"open_slide_handle",
    	callback: function(value, force) {updateHSV_picker(modal_id, value);callbackHSV(subspace, 0, value, modal_id, force);},
    });

    var slider_sat = new slider_l({
    	context:`${target}_saturation`,
    	defaultvalue:s,
    	callback: function(value, force) {updateHSV_picker(modal_id, value);callbackHSV(subspace, 1, value, modal_id, force);},
    });

    var slider_val = new slider_l({
    	context:`${target}_value`,
    	defaultvalue:v,
    	callback: function(value, force) {updateHSV_picker(modal_id, value);callbackHSV(subspace, 2, value, modal_id, force);},
    });

    initSlider_single(slider_hue);
    initSlider_single(slider_sat);
    initSlider_single(slider_val);
    updateHSV_picker(modal_id, null);
}



function gen_HSV_picker_markup(m)
{

	var markup = "";
    var target = m.modal_id;
    var label = m.modal_id;

    var shapeAction = new actionItem({});
            shapeAction.name = ``;
            shapeAction.icon = ``;
            shapeAction.action = ``;

            
	markup += `

			<div id="${label}_HSV" class = "stackablePrompt">
					<div class = "blockingModalTitle">	
						Select a fill color
					</div>
			</div>
          	<div class="colorPickerBody">
            	<div id="${label}_HSV_preview" style="width:75%;height:55px;background-color:blue;margin:5px 0 35px 0px;border-radius:var(--button_radius);">
            	</div>

		        <div class="sliderContainerWithLabel" style="margin-top:15px; width:90%;">
		       	    <div class="fatSlider tintBg" id="${target}_hue">						        
			    	</div>
		            <div class="sliderUnderLabel_container">
		            	<div class = "sliderUnderLabel modal_text_label sliderUnderLabelleft">
		            		0º
		            	</div>

		            	<div class = "sliderUnderLabel modal_text_label sliderUnderLabelcenter">
		            		HUE
		            	</div>

		            	<div class = "sliderUnderLabel modal_text_label sliderUnderLabelright">
		            		359º
		            	</div>
		            </div>
			    </div>  

				 <div class="sliderContainerWithLabel" style="width:90%;">
			        <div class="" id="${target}_saturation">					        
			        </div>
		            <div class="sliderUnderLabel_container" style="margin-top:4px;">
		            	<div class = "sliderUnderLabel modal_text_label sliderUnderLabelleft">
		            		0%
		            	</div>

		            	<div class = "sliderUnderLabel modal_text_label sliderUnderLabelcenter">
		            		SATURATION
		            	</div>

		            	<div class = "sliderUnderLabel modal_text_label sliderUnderLabelright">
		            		100%
		            	</div>
		            </div>
		        </div>    			         

				 <div class="sliderContainerWithLabel" style="width:90%;">
			        <div class="" id="${target}_value">					        
			        </div>
		            <div class="sliderUnderLabel_container" style="margin-top:4px;">
		            	<div class = "sliderUnderLabel modal_text_label sliderUnderLabelleft">
		            		0%
		            	</div>

		            	<div class = "sliderUnderLabel modal_text_label sliderUnderLabelcenter">
		            		VALUE
		            	</div>

		            	<div class = "sliderUnderLabel modal_text_label sliderUnderLabelright">
		            		100%
		            	</div>
		            </div>
		        </div>    		
      		</div>   
    </div>`;

    return markup;
}





function generate_wifi_settings_markup(m)
{
	var index = m.device_index;
	var device = CSApp.device[index];

/*
	this.firmware_version 		= [];  //three bytes for major, minor, point
	this.use_dhcp				= null;
	this.mac_array 				= []; //six bytes for mac address
	this.hardware_version 		= []; //two bytes for wifi hardware major/minor
	this.isHotSpot 				= null;
	this.allowHotSpot			= false;

	this.network_state 			= null; //32 char max
	this.network_name 			= null; //32 char max
	this.network_pass 			= null;
	this.ap_ip 					= []; //four bytes for access point ip
	this.network_ip 			= []; //four bytes for network ip
	this.broadcast_ip			= []; // four bytes
	this.subnet 				= []; //four bytes
	this.csp_protocol_mode 		= null;
	this.artnet_node_name 		= null; // 32 char max
	this.artnet_sub 			= null;
	this.artnet_mapping 		= null;
	this.artnet_zones 			= null;
	this.artnet_w_start 		= null;
	this.artnet_w_size 			= null;
*/

  	var actionsArray = [];
	actionsArray.push(new actionItem({
		name:'dmxbutton', 
		icon:'fa fa-usb', 
		label:'DMX on', 
		action:`toggleDMX(${index}, 1)`
	}));

	actionsArray.push(new actionItem({
		name:'dmxbutton', 
		icon:'fa fa-usb', 
		label:'DMX off', 
		action:`toggleDMX(${index}, 0)`
	}));

	actionsArray.push(new actionItem({
		name:'wifibutton', 
		icon:'fa fa-wifi', 
		label:'update wifi', 
		action:`updateWifi(${index})`
	}));	

 	var actionMenu = generateModalActionMenu('wifi', actionsArray, 28, 10);	


	settingsBody =  generateSimpleModalHeader(device.deviceName + " WiFi Settings", "", "", null, true);

	settingsBody += `


				<div class="deviceSettingsContainer wifisettings detail_text" style="margin: 0px 15px;">				

 					${actionMenu}

					<div class="settingsRowItem">
						<div>
								firmware_version :
						</div>
						<div >
							v${device.wifi.firmware_version[0]}.${device.wifi.firmware_version[1]}.${device.wifi.firmware_version[2]}
						</div>
					</div>




					<div class="settingsRowItem">
						<div>
								use_dhcp:
						</div>
						<div >
							${device.wifi.use_dhcp ? "YES" : "NO"}	
						</div>
					</div>





					<div class="settingsRowItem">
						<div>
							mac_array:
						</div>
						<div >
							${device.wifi.mac_array[0] + ":" + device.wifi.mac_array[1] + ":" + device.wifi.mac_array[2] + ":" + device.wifi.mac_array[3] + ":" + device.wifi.mac_array[4] + ":" + device.wifi.mac_array[5]}	
						</div>
					</div>


					<div class="settingsRowItem">
						<div>
							hardware_version :
						</div>
						<div >
							v${device.wifi.hardware_version[0]}.${device.wifi.hardware_version[1]}
						</div>
					</div>



					<div class="settingsRowItem">
						<div>
							isHotSpot :
						</div>
						<div >
							${device.wifi.isHotSpot ? "YES" : "NO"}	
						</div>
					</div>



					<div class="settingsRowItem">
						<div>
							allowHotSpot:
						</div>
						<div >
							${device.wifi.allowHotSpot ? "YES" : "NO"}	
						</div>
					</div>


					<div class="settingsRowItem">
						<div>
							network_state :
						</div>
						<div >
							${device.wifi.network_state }	
						</div>
					</div>


					<div class="settingsRowItem">
						<div>
							network_name:
						</div>
						<div >
							${device.wifi.network_name}	
						</div>
					</div>


					<div class="settingsRowItem">
						<div>
							network_pass:
						</div>
						<div >
							${device.wifi.network_pass}	
						</div>
					</div>


					<div class="settingsRowItem">
						<div>
							ap_ip:
						</div>
						<div >
							${device.wifi.ap_ip[0]}.${device.wifi.ap_ip[1]}.${device.wifi.ap_ip[2]}
						</div>
					</div>



					<div class="settingsRowItem">
						<div>
							network_ip:
						</div>
						<div >
						${device.wifi.network_ip[0]}.${device.wifi.network_ip[1]}.${device.wifi.network_ip[2]}.${device.wifi.network_ip[3]}
							
						</div>
					</div>



					<div class="settingsRowItem">
						<div>
							broadcast_ip:
						</div>
						<div >
						${device.wifi.broadcast_ip[0]}.${device.wifi.broadcast_ip[1]}.${device.wifi.broadcast_ip[2]}.${device.wifi.broadcast_ip[3]}
						</div>
					</div>		

					<div class="settingsRowItem">
						<div>
							subnet:
						</div>
						<div >
						${device.wifi.subnet[0]}.${device.wifi.subnet[1]}.${device.wifi.subnet[2]}
						</div>
					</div>		

					<div class="settingsRowItem">
						<div>
							csp_protocol_mode:
						</div>
						<div >
							${device.wifi.csp_protocol_mode}	
						</div>
					</div>		

					<div class="settingsRowItem">
						<div>
							artnet_node_name:
						</div>
						<div >
							${device.wifi.artnet_node_name}	
						</div>
					</div>																																								


					<div class="settingsRowItem">
						<div>
							artnet_sub:
						</div>
						<div >
							${device.wifi.artnet_sub}	
						</div>
					</div>																																								


					<div class="settingsRowItem">
						<div>
							artnet_mapping :
						</div>
						<div >
							${device.wifi.artnet_mapping}	
						</div>
					</div>																																								

					<div class="settingsRowItem">
						<div>
							artnet_zones:
						</div>
						<div >
							${device.wifi.artnet_zones}	
						</div>
					</div>			

					<div class="settingsRowItem">
						<div>
							artnet_w_start:
						</div>
						<div >
							${device.wifi.artnet_w_start}	
						</div>
					</div>			


					<div class="settingsRowItem">
						<div>
							artnet_w_size:
						</div>
						<div >
							${device.wifi.artnet_w_size}	
						</div>
					</div>																																																			
					${return_actions_array(m)}

							
				</div>`;	

return settingsBody;

}

function generate_device_settings_markup(m)
{
	var index = m.device_index;
	var device = CSApp.device[index];

	/*
	var device = new colorspike_device_t();
	
	device.hasBeenConnected = true;
	device.firmwareVersion = 1;
	device.ble.connected = true;
*/
	var disabler = "";
	var hider = "";
	var hider_new = "";
	var shower_new = 'style="display:none;"';
	var used_kb = (device.fds.totalSpaceInBytes-device.fds.freeSpaceInBytes)/1024;
	used_kb = used_kb.toFixed(1);
	var total_kb = device.fds.totalSpaceInBytes/1024;
	total_kb = total_kb.toFixed(1);


	var wifiSettings = "";


	if (device.hardware_major)
	{	
	wifiSettings = `<div class="settingsRowItem">
						<div> 
								WiFi Settings
						</div>
						<div>
							<div style="border:1px solid #888;border-radius:4px;padding:3px 6px;" onclick="openWifiModal(${device.deviceIndex})">
								VIEW	
							</div>
						</div>
					</div>`	
	}				



	if (!device.ble.connected) 
	{
		disabler = 'disabled2'
		hider = 'style="display:none;"';

	}

	if (!device.firmwareVersion && !device.ble.connected)
	{
		hider_new = 'style="display:none;"';
		shower_new = '';
	}

	settingsBody =  generateSimpleModalHeader(device.deviceName, "", "", null, true);

	settingsBody += `


				<div class="deviceSettingsContainer detail_text" style="margin: 0px 15px;">
									
					<div class="settingsRowItemTall" ${hider}>
						<div class="centered_content" style="text-align:center;width:100%;margin-bottom:10px;">
							<button id="device_${index}_connect_toggle"  style="width:55%;" 
							onclick="app.preDisconnect(${index});" >Disconnect</button>
						</div> 
					</div>

					

					<div class="settingsRowItem" ${shower_new}>
						<div style="text-align:center;width:100%;margin-bottom:10px;">
							<div>You have never connected to this device.</div>
						</div>
					</div>

					<div class="settingsRowItem" style="${!device.ble.connected ? 'display:none;' : '' }">
						<div>
								Device Name
						</div>
						<div ontouchstart="clickState(this,true)" ontouchend="clickState(this,false)" style="display:flex;align-items:center;" onclick="changeName(${index})">
								<i class="linear-pencil"></i><span style="padding-left:3px; " id="deviceSettingsName_${index}">${device.deviceName}</span>
						</div>
					</div>

					<div class="settingsRowItem" style="${!device.ble.connected ? '' :'display:none;' }">
						<div>
								Device Name
						</div>
						<div>
								${device.deviceName}
						</div>
					</div>

					<div class="settingsRowItem">
						<div>
								Nickname
						</div>
						<div ontouchstart="clickState(this,true)" ontouchend="clickState(this,false)" style="display:flex;align-items:center;" onclick="changeNickname(${index})">
								<i class="linear-pencil"></i><span style="padding-left:3px; font-style:italic;text-transform:uppercase;" id="deviceSettingsName_${index}">${device.returnNullOrNick()}</span>
						</div>
					</div>		

					<div class="settingsRowItem">
						<div>
								MAC ID:
						</div>
						<div >
								<span style="padding-left:3px; " id="deviceSettingsName_${index}">${toMac(u_atob(device.deviceAddress))}</span>
						</div>
					</div>

					<div class="settingsRowItem">
						<div>
								SOLO ON
						</div>
						<div onclick="CSApp.device[${index}].soloOn()">
								SEND
						</div>
					</div>

					<div class="settingsRowItem">
						<div>
								SOLO OFF
						</div>
						<div onclick="CSApp.device[${index}].soloOff()">
								SEND
						</div>
					</div>					

					<div class="settingsRowItem ${disabler}" ${hider_new} >
						<div> 
								Firmware
						</div>
						 <div>
								<span id="deviceFirmwareVersion_${index}">v${device.firmwareVersion}</span>
						</div>
					</div>


					<div class="settingsRowItem ${disabler}" ${hider_new}>
						<div> 
								Memory Usage
						</div>
						<div>
							<div>
								${used_kb}k/${total_kb}k
							</div>
						</div>
					</div>

					

					${wifiSettings}


					<div class="settingsRowItem ${disabler}" ${hider_new}>
						<div> 
								Patterns
						</div>
						<div>
							<div>
								${device.fds.validRecords-4 <  0 ? "0" : device.fds.validRecords-4}
							</div>
						</div>
					</div>

					<div class="settingsRowItem ${disabler}" ${hider_new} >
						<div> 
								Orientation
						</div>
						<div>
							 <div>
								${device.orientation ? "inverted" : "normal"}
							</div>
						</div>
					</div>		

					<div class="settingsRowItem ${disabler}" ${hider_new} >
						<div> 
								Charge Profile
						</div>
						<div>
								<div>
									${device.stats.chargeProfile}
								</div>
						</div>
					</div>		

					<!--<div class="settingsRowItem ${disabler}" ${hider_new}>
						<div> 
								Debug Mode${generateHelpItem('debug')} 
						</div>
						<div>
								<div>
								${device.stats.debug ? "OFF" : "ON"}
								</div>
						</div>
					</div>-->

					<div class="settingsRowItem ${disabler}" ${hider_new}>
						<div> 
								Debug Mode${generateHelpItem('debug')} 
						</div>
						<div>
								<div id="device_${index}_debug_toggle" style="transform:scale(0.65);transform-origin:right;" data-toggle='debug' 
								ontouchend="checkToggle(this, ${index})" class="${device.debug ? 'toggle active' : 'toggle'}">
							      <div class="toggle-handle"></div>
							    </div>
						</div>
					</div>

					<!--<div class="settingsRowItem" ${hider_new}>
						<div> 
								Auto Sync${generateHelpItem('autoSync')}</i> 
						</div>
						<div>
								 <div id="device_${index}_autoSync_toggle" style="transform:scale(0.65);transform-origin:right;" data-toggle='autoSync' 
								 ontouchend="checkToggle(this, ${index})" class="${device.autoSync ? 'toggle active' : 'toggle'}">
							      <div class="toggle-handle"></div>
							    </div>
						</div>
					</div>-->


					<div class="centered_content" style="text-align:center;width:100%;padding-top:5px;${device.ble.connected?'':'display:none;'}">
							<button class="confirmation_third_option" style="width:80%;" 
							onclick="deleteAll(${index})">
							Reset to Factory Default
							</button>
						</div>
							
				</div>`;	


return settingsBody;

}

//function generate_modal_header(title, edited, type, actionableItem, preview)
function generate_modal_header(h)
{
	// h.recordKey is required for ptype hint
	// h.canvas is required for canvas preview and will set the id

	var icon_markup = ``;
	switch (h.icon)
	{
		case "pType":
			if (h.patternKey != false  && h.patternKey != undefined)
			{
				var pType = CSApp.patternTable[storage.findPatternIndexByPatternKey(h.patternKey)].rawHeader.pType;
				icon_markup = `${ptypeIconLookup[pType]}`;
			}
		break;

		default:

		break;
	}


	var header = `  <div class="fileModalTitleBar ${h.icon ? '':'centered'} ">
						<div class="fileModalTitle">
							${h.title} ${generateTagCloud(h.patternKey)}
						</div>	

						<div class="fileModalpTypeHint">
							<i class="${icon_markup}" aria-hidden="true"></i>
							<!--<i class="${ptypeIconLookup[pType]}" aria-hidden="true"></i>-->
						</div>
					
					</div>
					`;
	
	if (h.canvas) {
		header += `<div style="height:4px;width:100%;background-color:black;overflow:hidden"><canvas id="${h.canvas}"  class="filepreview fileModalPreviewCanvas" width="${pType == 11 ? fireCanvasWidth:otherCanvasWidth}" height="6px"></canvas></div>`;	
	}				
	return header;				
}

function generate_simple_modal_header(h)
{
	var header = `  <div class="fileModalTitleBar" style="justify-content:center;">
						<div class="fileModalTitle">
							${h.title}
						</div>	
					</div>
					`;

	return header;		
}

function gen_clone_shape_markup(m)
{
		//current.cloneFromShape = null;
		//current.cloneToShape = null;


		var actionsArray = [];
		
		var cloneMarkup;

		cloneMarkup =  generateSimpleModalHeader(m.prompt, "", "", null, true);
		cloneMarkup += `<div class="cloneOuterContainer"><div style="width:48%"><div class="detail_text" style="text-align:center;">Copy from</div>`;
		
			cloneMarkup += `<div class="cloneCanvasContainer">
							
							<div class="cloneCanvasButton" id="cloneFromCanvasButton_2" onclick="setCloneFromShape(2)">
								<div class="cloneCanvas"><canvas height=20 width='${otherCanvasWidth}' id="cloneFromCanvas2"></canvas></div>
								<!--<div>Shape 1</div>-->
							</div>	

							<div class="cloneCanvasButton" id="cloneFromCanvasButton_1" onclick="setCloneFromShape(1)">
								<div class="cloneCanvas"><canvas height=20 width='${otherCanvasWidth}' id="cloneFromCanvas1"></canvas></div>
								<!--<div>Shape 2</div>-->
							</div>		

							<div class="cloneCanvasButton" id="cloneFromCanvasButton_0" onclick="setCloneFromShape(0)">
								<div class="cloneCanvas"><canvas height=20 width='${otherCanvasWidth}' id="cloneFromCanvas0"></canvas></div>
								<!--<div>Shape 3</div>-->
							</div>
								
						  </div>
					  </div>
					  `;


		cloneMarkup += `<div style="width:48%"><div class="detail_text" style="text-align:center"> Copy to</div>`;
		
		cloneMarkup += `<div class="cloneCanvasContainer">

							<div class="cloneCanvasButton" id="cloneToCanvasButton_2" onclick="setCloneToShape(2)">
								<div class="cloneCanvas"><canvas height=20 width='${otherCanvasWidth}' id="cloneToCanvas2"></canvas></div>
								<!--<div>Shape 1</div>-->
							</div>	

							<div class="cloneCanvasButton" id="cloneToCanvasButton_1" onclick="setCloneToShape(1)">
								<div class="cloneCanvas"><canvas height=20 width='${otherCanvasWidth}' id="cloneToCanvas1"></canvas></div>
								<!--<div>Shape 2</div>-->
							</div>		

							<div class="cloneCanvasButton" id="cloneToCanvasButton_0" onclick="setCloneToShape(0)">
								<div class="cloneCanvas"><canvas height=20 width='${otherCanvasWidth}' id="cloneToCanvas0"></canvas></div>
								<!--<div>Shape 3</div>-->
							</div>

					  </div>
					  </div>
					  </div> <!--holds the two divs left and right-->
					  

					 
					  <div class="cloneInvertFlagContainerOuter">
					  		
					  		
					  		<div class="cloneInvertFlagContainer detail_text" id="shape_center_invert_container">
					  			<div>INVERT<br>CENTER</div>
								
								<div class="cloneInvertFlagToggleContainer">
									<div id="shape_center_invert_toggle" data-toggle='centerinvert' ontouchend="checkToggle(this, 0)" class="${current.centerInvertFlag ? 'toggle active':'toggle'}">
								      <div class="toggle-handle"></div>
								    </div>
							    </div>
					  		</div>

							<div class="cloneInvertFlagContainer detail_text" id="shape_size_invert_container">
								<div>INVERT<br>SIZE</div>
					  			

								<div class="cloneInvertFlagToggleContainer ">
									<div id="shape_center_invert_toggle" data-toggle='sizeinvert' ontouchend="checkToggle(this, 0)" class="${current.sizeInvertFlag ? 'toggle active':'toggle'}">
								      <div class="toggle-handle"></div>
								    </div>
							    </div>

					  		</div>

							<div class="cloneInvertFlagContainer detail_text" id="shape_fill_invert_container">
								<div>INVERT<br>FILL</div>
					  		

							<div class="cloneInvertFlagToggleContainer">
									<div id="shape_center_invert_toggle" data-toggle='fillinvert' ontouchend="checkToggle(this, 0)" class="${current.fillInvertFlag ? 'toggle active':'toggle'}">
								      <div class="toggle-handle"></div>
								    </div>
							    </div>


					  		</div>

					  </div>
					  <div style="width:100%;display:flex;justify-content:flex-end;margin-top:20px;">
					  		<button style="width:100px; margin:10px;" class="marginBody" onclick="closeCloneModal()">CANCEL</button>
					  		<button id="cloneUndo" class="hero_button disabledCloneUndo marginBody" onclick="cloneShape();">CLONE</button>
	
					  </div>
					  `;
	return cloneMarkup;

	//elem("alertButtons").innerHTML = cloneMarkup;
	//startClonePreviews();
	//sim_device.geo_RAM.draw_clones = true;
}


function generate_update_wifi_credentials(m)
{
	var device = CSApp.device[m.device_index];
	var header = generate_simple_modal_header({
		title: `Update wifi information`,
	});	


	markup = `
	${header}
	<div style="width:90%;margin-top:15px;">
		<input type="text" placeholder="${device.wifi.network_name}"><br>
		<input type="password" value="${device.wifi.network_pass}"><br>
	</div>
	${return_actions_array(m)}`


	return markup;
}

function gen_win_icon_markup(m)
{
	var markup;

	var prompt_markup = "";
	
	if (m.prompt != undefined) 
		{
			prompt_markup = `
				<div id="confirmMessage" class="modal_detail_text detail_center_aligned">${m.prompt}</div>
			`;
		}

	markup = `<div style="width:fit-content;height:fit-content;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center">
			 <div class="svg-box">
                <svg class="circular white-stroke">
                    <circle class="path unpause_me" cx="75" cy="75" r="50" fill="none" stroke-width="5" stroke-miterlimit="10"/>
                </svg>
                <svg class="checkmark white-stroke">
                    <g transform="matrix(0.79961,8.65821e-32,8.39584e-32,0.79961,-489.57,-205.679)">
                        <path class="checkmark_check unpause_me" fill="none" d="M616.306,283.025L634.087,300.805L673.361,261.53"/>
                    </g>
                </svg>
            </div>
            ${prompt_markup}
         </div>`

    return markup;
}

function gen_fail_icon_markup(m)
{
	var markup;
	var prompt_markup = "";
	
	if (m.prompt != undefined) 
		{
			prompt_markup = `
				<div id="confirmMessage" class="modal_detail_text detail_center_aligned">${m.prompt}</div>
			`;
		}

	markup = `<div style="width:fit-content;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center">
			 <div class="svg-box">
                <svg class="circular white-stroke">
                    <circle class="path unpause_me" cx="75" cy="75" r="50" fill="none" stroke-width="5" stroke-miterlimit="10"/>
                </svg>
                <svg class="cross white-stroke">
                    <g transform="matrix(0.79961,8.65821e-32,8.39584e-32,0.79961,-502.652,-204.518)">
                        <path class="first-line unpause_me" d="M634.087,300.805L673.361,261.53" fill="none"/>
                    </g>
                    <g transform="matrix(-1.28587e-16,-0.79961,0.79961,-1.28587e-16,-204.752,543.031)">
                        <path class="second-line unpause_me" d="M634.087,300.805L673.361,261.53"/>
                    </g>
                </svg>
            </div>
            ${prompt_markup}
         </div>`

    return markup;
	
}

function gen_alert_icon_markup(m)
{
	var markup;
	if (m.prompt == undefined) {m.prompt = "";}
	markup = `<div style="width:fit-content;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center">
			  <div class="svg-box">
                <svg class="circular white-stroke">
                    <circle class="path unpause_me" cx="75" cy="75" r="50" fill="none" stroke-width="5" stroke-miterlimit="10"/>
                </svg>
                <svg class="alert-sign white-stroke unpause_me">
                    <g transform="matrix(1,0,0,1,-615.516,-257.346)">
                        <g transform="matrix(0.56541,-0.56541,0.56541,0.56541,93.7153,495.69)">
                            <path class="line unpause_me" d="M634.087,300.805L673.361,261.53" fill="none"/>
                        </g>
                        <g transform="matrix(2.27612,-2.46519e-32,0,2.27612,-792.339,-404.147)">
                            <circle class="dot unpause_me" cx="621.52" cy="316.126" r="1.318" />
                        </g>
                    </g>
                </svg>
            </div>
            <div class = "blockingModalTitle">	
				${m.prompt}
			</div>
            <div id="confirmMessage" class="modal_detail_text">${m.detail_text}</div>
            <div class="centered_content" style="padding:10px 0px 20px">
					<button style="width:55%;" 
					onclick="clear_modal_by_id('${m.modal_id}')">
					OK
					</button>
			</div>
         </div>`

    return markup;
	
}

function close_non_blocking_modal(id)
{
	console.log("Trying to close modal");
/*
	animateCss(id, 'slideOutDown', function() {
		$('#'+id).css("display","none");
	});
*/
}

function fade_out_dimmer(fade_ms)
{
//	console.log("fade out dimmer");
	if ($('#screenDimmer').css('opacity') !=  1)
	{
		return;
	} //not faded in or not finished fading in
	if ($("#modals_stack_outer").children().length > 1)
	{
			console.log("leaving dimmer up cause there are still modals");
			var under_z = parseInt($("#modals_stack_outer").find(".modal_bg").first().next().css( "zIndex"))-1;
			console.log($("#modals_stack_outer").find(".modal_bg").first());
			$('#screenDimmer').css("zIndex",under_z);
		return;
	}

	if (fade_ms == null)
	{
		fade_ms = 100;
	}

	$('#screenDimmer').animate({opacity:0}, fade_ms,function() {  
		  $('#screenDimmer').css("display","none");
		  $('#screenDimmer').css("zIndex",199);
	}); 
}

function fade_in_dimmer(fade_ms)
{
	//console.log("fade in dimmer");
	if ($('#screenDimmer').css('opacity') !=  0)
	{
		//lets check to move the dimmer up in the stack
		if ($("#modals_stack_outer").children().length > 1)
		{
			var under_z = parseInt($("#modals_stack_outer").find(".modal_bg").first().css( "zIndex"))-1;
			$('#screenDimmer').css("zIndex",under_z);
		}
		return;
	} //not faded in or not finished fading in

	if (fade_ms == null)
	{
		fade_ms = 200;
	}

	$('#screenDimmer').css("display","flex");
	$('#screenDimmer').animate({opacity:1}, fade_ms);
}



function generate_modal_action_buttons(actionsArray)
{

	actionMenu = ``;


	for (var x = 0; x < actionsArray.length; x++)
	{
		actionMenu += `<div class="voteContainer_outer" id = ""  onclick="${actionsArray[x].action}">					
								<div class="voteContainer" style="">
									${actionsArray[x].label}
								</div>
						</div>`;	
	}

		actionMenu += `</div>`;
	
	return actionMenu;

}


