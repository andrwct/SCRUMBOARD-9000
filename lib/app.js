/// <reference path="jquery-2.1.1.js" />
/// <reference path="jquery-ui-1.10.4.custom.js" />
//  __________________________________________________

//  Kaon Interactive
//  Internal Scrum Board Project
//  Created by Anderw Cote


//  Update History
//  No.     Date      Developer     Description
//  ----    --------  -----------   -------------------------------
//  1        6/15/2014  Sia           Save/Load functionality added.

var screenWidth = 1600;
var screenHeight = 900;

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
$(document).ready(function () {
    LoadCurrentBoardStatus();
    SetEventHandlers();
    init();
    setupOrigami();
});

function init() {
    resetScreensaver();
}

function SetEventHandlers() {
    $(".column").on("click", function (e) {
        if (touchTimeout) {
            t1x = e.clientX;
            t1y = e.clientY;
            touchTimeout = false;
            setTimeout(function () { touchTimeout = true }, 2000);
        }
        else {
            if (Math.abs(t1x - e.clientX) < 50 && Math.abs(t1y - e.clientY) < 50) {
                createSticky();
            };
        }
        //Shift||Alt + Click
        var evt = e || window.event;
        if (evt.shiftKey || evt.altKey)
            createSticky();
    });

    $(".stickyContainer").on("click", function () {
        zIndexControl($(this));
    });

    $("body").on("click", function () { window.clearTimeout(screensaverTimer); resetScreensaver() });

    // Added by Sia, Update No. 1
    // Save functionality for the board
    $(".save").on("click", function (eventArgs) {
        saveCurrentBoardStatus();
        // suppress event from bubbling, so higher elements in DOM won't receive the event, when save button.
        eventArgs.preventDefault();
        eventArgs.stopPropagation();
    });

    $(".stickyClose").on("click", function (eventArgs) {        
        $(this).parent().remove();        
        eventArgs.preventDefault();
        eventArgs.stopPropagation();
    })
}

// Added by Sia, Update No. 1
function LoadCurrentBoardStatus() {
    var stickiesHtml = localStorage.stickiesHtml;
    var stickiesData = localStorage.stickiesData;

    if (stickiesHtml && stickiesData) {
        $(".frame").append(stickiesHtml);
        var dataItems = stickiesData.split("^");
        var stickyContainers = $(".stickyContainer");
        for (var i = 0; i < stickyContainers.length; i++) {
            if (dataItems[i].slice(0, dataItems[i].indexOf("$")) !== "") {
                $(stickyContainers[i]).children(".stickyDueDate").val(dataItems[i].slice(0, dataItems[0].indexOf("$")));
            }
            if (dataItems[i].slice(dataItems[i].indexOf("$") + 1, dataItems[i].length) !== "") {
                $(stickyContainers[i]).children(".stickyTaskOwner").val(dataItems[i].slice(dataItems[i].indexOf("$") + 1, dataItems[i].length));
            }
        }
    }

        $(".stickyContainer").resizable().draggable();
        $(".stickyContainer .stickyDueDate").datepicker();      
}

// Added by Sia, Update No. 1
function saveCurrentBoardStatus() {
    var stickiesHtml = "";
    var stickiesData = "";

    var stickyContainers = $(".stickyContainer");
    var stickyContainersClone = $(".stickyContainer").clone();

    // jquery UI resizable() adds some divs that should be removed before saving the divs
    stickyContainersClone.children(".ui-resizable-handle").remove();
    // jquery UI datepicker adds stuff to stickyDueDate element, which should be removed,
    // otherwise while loading data from local storage, calling datepicker() on this element won't work
    stickyContainersClone.children(".stickyDueDate").removeAttr("id").removeClass("hasDatepicker");

    for (var i = 0; i < stickyContainers.length; i++) {
        // if sticky note is empty, don't save it
        if ($(stickyContainers[i]).children(".stickyNote").val() === "") {
            continue;
        }
        //save stickyNote textarea value as it's inner html
        $(stickyContainersClone[i]).children(".stickyNote").html($(stickyContainers[i]).children(".stickyNote").val());
        stickiesHtml += stickyContainersClone[i].outerHTML;
        //save input text values in a separate local storage key in "DueDate$TaskOwner^" format.
        stickiesData += $(stickyContainers[i]).children(".stickyDueDate").val() + "$" +
            $(stickyContainers[i]).children(".stickyTaskOwner").val() + "^";
    }
    console.log(stickiesData);
    localStorage.stickiesHtml = stickiesHtml;
    localStorage.stickiesData = stickiesData;
    alert("Board Saved Successfully!");
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

    var initWidth = 300, initHeight = 200;
    var initLeft = eval(t1x - 100) < 10 ? 10 : eval(t1x - 100) > screenWidth ? screenWidth - initWidth : eval(t1x - 100);
    var initTop = eval(t1y - 100) < 10 ? 10 : eval(t1y - 100) > screenHeight ? screenHeight - initHeight : eval(t1y - 100);
    var boxShadowFactor = Math.floor((Math.random() * 13) + 2); //a random number between 2 and 15
    var rotateFactor = (Math.random() * 10) - 5; //a random number between -5 and 5

    var newDiv = $(".stickyTemplate").clone().removeClass("stickyTemplate").addClass("stickyContainer")
        .css({ "left": initLeft + "px", "top": initTop + "px" })
        .css({ "width": initWidth + "px", "height": initHeight + "px" })
        .css({ "box-shadow": "rgba(0,0,0,0.5) " + boxShadowFactor + "px " + boxShadowFactor + "px " + boxShadowFactor * 3 + "px" })
        .css({ "-webkit-transform": "rotate(" + rotateFactor + "deg)" })
        .css({ "transform": "rotate(" + rotateFactor + "deg)" });
    // adding jQuery UI resiable and draggable features
    $(newDiv).resizable().draggable();

    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1;
    var yyyy = today.getFullYear();
    if (dd < 10) {
        dd = '0' + dd
    }

    if (mm < 10) {
        mm = '0' + mm
    }
    today = mm + '/' + dd + '/' + yyyy;
    $(newDiv).children(".stickyDueDate").val(today);
    $(newDiv).children(".stickyDueDate").datepicker();

    $(newDiv).children(".stickyClose").on("click", function (eventArgs) {
        $(this).parent().remove();
        eventArgs.preventDefault();
        eventArgs.stopPropagation();
    })

    zIndexControl(newDiv);
    $(".frame").append(newDiv);
    $(newDiv).children(".stickyTaskOwner").focus();

    txtID++;
    touchTimeout = true;
}

/*
* Revision:
*     AC
* Description:
*     sets the height attribute of a text area to the height of its content, using scrollheight, minus some margin
* Parameters:
*     id of a text area
*/
function resizeText(id) {
    $("#" + id).css("height", eval($("#" + id)[0].scrollHeight - 120) + "px");
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
    elem.css("z-index", zIndexCount);
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

    screensaverTimer = setTimeout(function () {
        $(".screensaver").show();
        screensaverTimer2 = setTimeout(function () { resetScreensaver() }, ssResume);
    }, ssDelay);
}

/*
* Revision:
*     SW - 5/5/14
* Description:
*     Removes selection in HTML text input/text area
*     http://stackoverflow.com/questions/6562727/is-there-a-function-to-deselect-all-text-using-javascript
*/
function clearSelection() {
    if (document.selection) {
        document.selection.empty();
    } else if (window.getSelection) {
        window.getSelection().removeAllRanges();
    }
}