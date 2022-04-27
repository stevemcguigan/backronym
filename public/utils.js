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


function phrase2acronym(str)
{
return str.split(/\s/).reduce((response,word)=> response+=word.slice(0,1),'')
}

