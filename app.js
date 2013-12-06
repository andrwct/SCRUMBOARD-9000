var t1x;
var t1y;
var t2x;
var t2y;

var zIndexCount = 1;

var touchTimeout = true;

var dragged = "";

/*
* Revision:
*     SW - 12/5/13
* Description:
*     Runtime function. Separate handlers fn so we can call again if we remove/clone HTML
*/
$(document).ready(function(){
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
}

var txtID = 0;

function createSticky() {
      var newDiv = $("<div/>").addClass("sticky").css({"-webkit-transform":"translateX("+eval(t1x-110)+"px) translateY("+eval(t1y-90)+"px)"}).on("touchstart", function(){dragged=$(this)});
      var txtAr = $("<textarea/>").addClass("txtarea").attr("id","txt"+txtID).attr("onKeyUp","resizeText('txt"+txtID+"')").attr("spellcheck","false");
      newDiv.append(txtAr);
      zIndexControl(newDiv);
      $(".frame").append(newDiv);
      txtID++;
}

function resizeText(id){
      $("#"+id).css("height",eval($("#"+id)[0].scrollHeight-120)+"px");
}

function dragSticky(elem, e) {
      elem.css({"-webkit-transform":"translateX("+eval(e.touches[0].pageX-elem.get(0).offsetWidth/2)+"px) translateY("+eval(e.touches[0].pageY-elem.get(0).offsetHeight/2)+"px)"});
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
