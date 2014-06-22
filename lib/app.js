/// <reference path="jquery-2.1.1.js" />
/// <reference path="jquery-ui-1.10.4.custom.js" />
/// <reference path="jquery-2.1.1.js" />
//  __________________________________________________

//  Kaon Interactive
//  Internal Scrum Board Project
//  Created by Anderw Cote

var screenWidth = 1920;
var screenHeight = 1080;

var zIndexCount = 1;
var touchTimeout = true;
var screensaverTimer;
var currentCol = -1;

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
    $(".column").on("touchstart", function (e) {
        if (touchTimeout) {
            t1x = window.event.touches[0].pageX;
            t1y = window.event.touches[0].pageY;
            touchTimeout = false;
            setTimeout(function () { touchTimeout = true }, 2000);
        }
        else {
            if (Math.abs(t1x - window.event.touches[0].pageX) < 50 && Math.abs(t1y - window.event.touches[0].pageY) < 50) {
                createSticky();
            };
        }
        //Shift||Alt + Click
        var evt = e || window.event;
        if (evt.shiftKey || evt.altKey)
            createSticky();
    });

    $(".stickyContainer").on("touchend", function () {
        zIndexControl($(this));
    });


    $("body").on("touchend", function () { window.clearTimeout(screensaverTimer); resetScreensaver() });

    // Save functionality for the board
    $(".save").on("touchend", function (eventArgs) {
        saveCurrentBoardStatus();
        // suppress event from bubbling, so higher elements in DOM won't receive the event, when save button.
        eventArgs.preventDefault();
        eventArgs.stopPropagation();
    });

    $(".stickyClose").on("touchend", function (eventArgs) {
        // remove the whole sticky container
        $(this).parent().parent().remove();
        eventArgs.preventDefault();
        eventArgs.stopPropagation();
    })

    $(".stickyContainer").on("drag", function (event, ui) {
        if (Math.floor(ui.position.left / (screenWidth / 5)) !== currentCol) {
            changeColorAnim($(this), currentCol, Math.floor(ui.position.left / (screenWidth / 5)));
            currentCol = Math.floor(ui.position.left / (screenWidth / 5));
            $(this).attr("data-col", currentCol);
        }
    });
}

function LoadCurrentBoardStatus() {
    var stickiesHtml = localStorage.stickiesHtml;
    var stickiesData = localStorage.stickiesData;

    if (stickiesHtml && stickiesData) {
        $(".frame").append(stickiesHtml);
        var dataItems = stickiesData.split("^");
        var stickyContainers = $(".stickyContainer");
        for (var i = 0; i < stickyContainers.length; i++) {
            if (dataItems[i].slice(0, dataItems[i].indexOf("$")) !== "") {
                $(stickyContainers[i]).find(".stickyDueDate").val(dataItems[i].slice(0, dataItems[0].indexOf("$")));
            }
            if (dataItems[i].slice(dataItems[i].indexOf("$") + 1, dataItems[i].length) !== "") {
                $(stickyContainers[i]).find(".stickyTaskOwner").val(dataItems[i].slice(dataItems[i].indexOf("$") + 1, dataItems[i].length));
            }
        }
    }

    $(".stickyContainer").resizable().draggable();
    $(".stickyContainer .stickyDueDate").datepicker();
}

function saveCurrentBoardStatus() {
    var stickiesHtml = "";
    var stickiesData = "";
    // Due to a bug in jQuery, cloning an element, won't copy the value of input elements,
    // so here I'm maintaining a referenece to the original element, to be able to read the values of input children.
    // Why I'm making a clone? becuae I want to remove unnecessary jquery-added elements before saving the html, but I don't want them to be removed from DOM
    var stickyContainers = $(".stickyContainer");
    var stickyContainersClone = $(".stickyContainer").clone();

    // jquery UI resizable() adds some divs that should be removed before saving stickies
    stickyContainersClone.find(".ui-resizable-handle").remove();
    // jquery UI datepicker adds stuff to stickyDueDate element, which should be removed,
    // otherwise while loading data from local storage, calling datepicker() on this element won't work
    stickyContainersClone.find(".stickyDueDate").removeAttr("id").removeClass("hasDatepicker");

    for (var i = 0; i < stickyContainers.length; i++) {
        // if sticky note is empty, don't save it
        if ($(stickyContainers[i]).find(".stickyNote").val() === "") {
            continue;
        }
        //save stickyNote textarea value as its inner html
        $(stickyContainersClone[i]).find(".stickyNote").html($(stickyContainers[i]).find(".stickyNote").val());
        stickiesHtml += stickyContainersClone[i].outerHTML;
        //save input text values in a separate local storage key in "DueDate$TaskOwner^" format.
        stickiesData += $(stickyContainers[i]).find(".stickyDueDate").val() + "$" +
            $(stickyContainers[i]).find(".stickyTaskOwner").val() + "^";
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
    var initWidth = 250, initHeight = 180;
    var initLeft = eval(t1x - 100) < 10 ? 10 : eval(t1x - 100) > screenWidth ? screenWidth - initWidth : eval(t1x - 100);
    var initTop = eval(t1y - 100) < 10 ? 10 : eval(t1y - 100) > screenHeight ? screenHeight - initHeight : eval(t1y - 100);
    var boxShadowFactor = Math.floor((Math.random() * 13) + 2); //a random number between 2 and 15
    var rotateFactor = (Math.random() * 10) - 5; //a random number between -5 and 5

    currentCol = Math.floor(t1x / (screenWidth / 5));
    var newDiv = $(".stickyTemplate").clone().removeClass("stickyTemplate").addClass("stickyContainer")
        .css({ "left": initLeft + "px", "top": initTop + "px" })
        .css({ "width": initWidth + "px", "height": initHeight + "px" })
        .css({ "box-shadow": "rgba(0,0,0,0.5) " + boxShadowFactor + "px " + boxShadowFactor + "px " + boxShadowFactor * 3 + "px" })
        .css({ "-webkit-transform": "rotate(" + rotateFactor + "deg)" })
        .css({ "transform": "rotate(" + rotateFactor + "deg)" })
        .css({ "background-color": "" })
        .attr("data-col", currentCol);

    $(newDiv).resizable().draggable({
        drag: function (event, ui) {
            if (Math.floor(ui.position.left / (screenWidth / 5)) !== currentCol) {
                changeColorAnim($(this), currentCol, Math.floor(ui.position.left / (screenWidth / 5)));
                currentCol = Math.floor(ui.position.left / (screenWidth / 5));
                $(newDiv).attr("data-col", currentCol);
            }
        }
    });

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
    $(newDiv).find(".stickyDueDate").val(today);
    $(newDiv).find(".stickyDueDate").datepicker();

    $(newDiv).find(".stickyClose").on("touchend", function (eventArgs) {
        $(this).parent().parent().remove();
        eventArgs.preventDefault();
        eventArgs.stopPropagation();
    })

    zIndexControl(newDiv);
    $(".frame").append(newDiv);
    $(newDiv).find(".stickyTaskOwner").focus();

    txtID++;
    touchTimeout = true;
}

var cssAnimName="";
function changeColorAnim(stickyContainer, currentCol, newCol) {
    if (Math.abs(currentCol - newCol) !== 1) {
        return;
    }

    // dragging a sticky fast between columns, won't let the code to remove the cssAnimName class ontime
    // as a result, it breaks the color animation system. So, all existing colxtocolyAnim classes should be removed
    // before starting a new animation.
    // maybe a regular expression selector is nicer, but I doubt about its performance.
    $(stickyContainer)
        .removeClass("col1tocol2Anim").removeClass("col2tocol1Anim")
        .removeClass("col2tocol3Anim").removeClass("col3tocol2Anim")
        .removeClass("col3tocol4Anim").removeClass("col4tocol3Anim")
        .removeClass("col4tocol5Anim").removeClass("col5tocol4Anim");

    cssAnimName = "col" + (currentCol + 1) + "tocol" + (newCol + 1) + "Anim";
    $(stickyContainer).addClass(cssAnimName);
    // remove anim class after a second
    window.setTimeout(function () {
        $(stickyContainer).removeClass(cssAnimName);
    }, 1000);
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
var ssDelay = eval(1000 * 60 * 30);
var ssResume = eval(1000 * 60 * 60);
function resetScreensaver() {
    window.clearTimeout(screensaverTimer2);
    $(".screensaver").hide()

    screensaverTimer = setTimeout(function () {
        $(".screensaver").show();
        screensaverTimer2 = setTimeout(function () { resetScreensaver() }, ssResume);
    }, ssDelay);
}
