//  Kaon Interactive
//  Internal Scrum Board Project
//  Created by Anderw Cote


//  Update History
//  No.     Date      Developer     Description
//  ----    --------  -----------   -------------------------------
//  1        6/2/2014  Sia           Save/Load functionality added.

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
    setupOrigami();
    LoadCurrentBoardStatus();
    SetEventHandlers();
});
function SetEventHandlers() {
    $(".column").on("touchstart", function (e) {
        //Double Tap
        t1 = e.touches[0];
        if (touchTimeout) {
            t1x = t1.pageX;
            t1y = t1.pageY;
            touchTimeout = false;
            setTimeout(function () { touchTimeout = true }, 2000);
        }
        else {
            if (Math.abs(t1x - t1.pageX) < 50 && Math.abs(t1y - t1.pageY) < 50) {
                createSticky();
            };
        }
        //Shift||Alt + Click
        var evt = e || window.event;
        if (evt.shiftKey || evt.altKey)
            createSticky();
    });

    $(".frame").on("touchmove", function (e) {
        t2 = e.touches[0];
        t2x = t2.pageX;
        t2y = t2.pageY;
        if (dragged != "") { dragSticky(dragged, e) }
    }).on("touchend", function () {
        if (t2x > 1720 + 50 && t2y > 880 + 50 && dragged != "") {
            dragged.remove();
        }
        dragged = ""
    });

    $(".sticky").on("touchstart", function () {
        zIndexControl($(this));
    });



    $("body").on("touchstart", function () { window.clearTimeout(screensaverTimer); resetScreensaver() });

    resetScreensaver();

    // Added by Sia, Update No. 1
    // Save functionality for the board
    $(".save").on("touchend", function (eventArgs) {
        saveCurrentBoardStatus();
        // suppress touch event from bubbling, so higher elements in DOM won't handle touch event, when save button is touched/clicked
        eventArgs.preventDefault();
        eventArgs.stopPropagation();
    });

}


// Added by Sia, Update No. 1
function LoadCurrentBoardStatus() {
    navigator.webkitTemporaryStorage.requestQuota(1024 * 5, function (grantedBytes) {
        console.log('requestQuota: ', arguments);
        loadFromFile(grantedBytes);
    }, fileError);
}


function loadFromFile(grantedBytes) {
    window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
    window.webkitRequestFileSystem(window.TEMPORARY, grantedBytes, function (fs) {
        console.log('fs: ', arguments);
        fs.root.getFile('stickies.txt', { create: true, exclusive: true }, function (fileEntry) {

            fileEntry.file(function (file) {
                var reader = new FileReader();
                reader.readAsText(file);

                reader.onloadend = function (e) {
                    $(".frame").append(this.result);
                };

            }, fileError);
        }, fileError);
    }, fileError);

}



// Added by Sia, Update No. 1
function saveCurrentBoardStatus() {
    navigator.webkitTemporaryStorage.requestQuota(1024 * 5, function (grantedBytes) {
        console.log('requestQuota: ', arguments);
        saveToFile(grantedBytes);
    }, fileError);
}

function saveToFile(grantedBytes) {
    window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
    window.webkitRequestFileSystem(window.TEMPORARY, grantedBytes, function (fs) {
        console.log('fs: ', arguments);
        fs.root.getFile('stickies.txt', { create: true, exclusive: true }, function (fileEntry) {

            // Create a FileWriter object for our FileEntry (log.txt).
            fileEntry.createWriter(function (fileWriter) {

                fileWriter.onwriteend = function (e) {
                    console.log("Board Saved! at " + (new Date()).getTime());

                };

                fileWriter.onerror = function (e) {
                    console.log('Write failed: ' + e.toString());
                };

                var stickyDivs = $(".sticky");
                var stickies = "";

                for (var i = 0; i < stickyDivs.length; i++) {
                    stickies.concat(stickies, stickyDivs[i]);
                }

                var data = new Blob([stickies], { type: 'text/plain' });
                fileWriter.write(data);

            }, fileError);
        }, fileError);
    }, fileError);
}


function fileError(e) {
    var msg = '';

    switch (e.name) {
        case FileError.QUOTA_EXCEEDED_ERR:
            msg = 'QUOTA_EXCEEDED_ERR';
            break;
        case FileError.NOT_FOUND_ERR:
            msg = 'NOT_FOUND_ERR';
            break;
        case FileError.SECURITY_ERR:
            msg = 'SECURITY_ERR';
            break;
        case FileError.INVALID_MODIFICATION_ERR:
            msg = 'INVALID_MODIFICATION_ERR';
            break;
        case FileError.INVALID_STATE_ERR:
            msg = 'INVALID_STATE_ERR';
            break;
        default:
            msg = 'Unknown Error';
            break;
    };

    console.log('Error: ' + msg);
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
    var newDiv = $("<div/>").addClass("sticky").css({ "left": eval(t1x - 110) + "px", "top": eval(t1y - 90) + "px" }).on("touchstart", function () { dragged = $(this) });
    var txtAr = $("<textarea/>").addClass("txtarea").attr("id", "txt" + txtID).attr("onKeyUp", "resizeText('txt" + txtID + "')").attr("spellcheck", "false");
    newDiv.append(txtAr);
    zIndexControl(newDiv);
    $(".frame").append(newDiv);
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
*     sets the translateX and translateY attribute of an element to a touch event's position 
* Parameters:
*     element to drag, and the drag event
*/
function dragSticky(elem, e) {
    elem.css({ "left": eval(e.touches[0].pageX - elem.get(0).offsetWidth / 2) + "px", "top": eval(e.touches[0].pageY - elem.get(0).offsetHeight / 2) + "px" });
    zIndexControl(elem);
    clearSelection();
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

