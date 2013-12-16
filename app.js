var t1x;
var t1y;
var t2x;
var t2y;

var zIndexCount = 1;

var touchTimeout = true;

var dragged = "";

var screensaverTimer;

var ssDelay = eval(1000 * 60 * 30);
var ssResume = eval(1000 * 60 * 60);

/*
* Revision:
*     SW - 12/5/13
* Description:
*     Runtime function. Separate handlers fn so we can call again if we remove/clone HTML
*/
$(document).ready(function(){
      setupOrigami();

      SetEventHandlers();
});
function SetEventHandlers(){
	$(".column").on("touchstart", function(e){
		t1=e.touches[0];
		if(touchTimeout){
            	t1x=t1.pageX;
            	t1y=t1.pageY;
            	touchTimeout = false;
            	setTimeout(function(){touchTimeout=true},2000);
            }
            else {
			if(Math.abs(t1x-t1.pageX)<20 && Math.abs(t1y-t1.pageY)<20){
                        createSticky();
                  };
            }
	});
      
      $(".frame").on("touchmove", function(e){            
            t2=e.touches[0];
            t2x=t2.pageX;
            t2y=t2.pageY;
            if(dragged!=""){dragSticky(dragged,e)}
      }).on("touchend", function(){
            if(t2x>1720+50 && t2y>880+50 && dragged!=""){
                  dragged.remove();
            }
            dragged=""
      });

      $(".sticky").on("touchstart", function(){
            zIndexControl($(this));
      });

      $("body").on("touchstart", function(){ window.clearTimeout(screensaverTimer); resetScreensaver()});

      resetScreensaver();

}

var txtID = 0;


/*
* Revision:
*     SW - 12/5/13
* Description:
*     generates a draggable div and puts a new text area in it. on typing int he area, the area will call resize
* Parameters:
*     none
*/
function createSticky() {
      var newDiv = $("<div/>").addClass("sticky").css({"left":eval(t1x-110)+"px", "top":eval(t1y-90)+"px"}).on("touchstart", function(){dragged=$(this)});
      var txtAr = $("<textarea/>").addClass("txtarea").attr("id","txt"+txtID).attr("onKeyUp","resizeText('txt"+txtID+"')").attr("spellcheck","false");
      newDiv.append(txtAr);
      zIndexControl(newDiv);
      $(".frame").append(newDiv);
      txtID++;
}

/*
* Revision:
*     AC
* Description:
*     sets the height attribute of a text area to the height of its content, using scrollheight, minus some margin
* Parameters:
*     id of a text area
*/
function resizeText(id){
      $("#"+id).css("height",eval($("#"+id)[0].scrollHeight-120)+"px");
}


/*
* Revision:
*     SW - 12/5/13
* Description:
*     sets the translateX and translateY attribute of an element to a touch event's position 
* Parameters:
*     element to drag, and the drag event
*/
function dragSticky(elem, e) {
      elem.css({"left":eval(e.touches[0].pageX-elem.get(0).offsetWidth/2)+"px", "top":eval(e.touches[0].pageY-elem.get(0).offsetHeight/2)+"px"});
      zIndexControl(elem);
}

/*
* Revision:
*     SW - 12/5/13
* Description:
*     uses global counter to bring last pressed element to the top z-index
* Parameters:
*     element to set z-index
*/
function zIndexControl(elem) {
      zIndexCount++;
      elem.css("z-index",zIndexCount);
}





var screensaverTimer2;
/*
* Revision:
*     AC - 12/8/13
* Description:
*     Moves elements across the screen after a delay, then stops them from moving after that same delay elapses again
*/
function resetScreensaver() {
      window.clearTimeout(screensaverTimer2);
    $(".screensaver").hide()

      screensaverTimer = setTimeout(function(){
            $(".screensaver").show();
             screensaverTimer2 = setTimeout(function(){resetScreensaver()}, ssResume);
      },ssDelay);      
}

