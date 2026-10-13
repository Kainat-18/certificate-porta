var siteBaseUrl = "";
$(document).ready(function () {
    siteBaseUrl = document.getElementById("frmSiteUrl").action;
});
if (document.getElementById("frmSiteUrl")) {
    siteBaseUrl = document.getElementById("frmSiteUrl").action;
}

function getAjaxLoaderImage() {
    return "<img src='" + siteBaseUrl + "Content/img/ajax-loader.gif' alt='loader' />";
}

function LoadingImage() {
    return "<img src='" + siteBaseUrl + "/images/inprocess.gif' style='width:100px; height:100px; margin-left:40%; padding:20px;' />";
}
function LoadingImageSmall() {
    return "<img src='" + siteBaseUrl + "/images/inprocess.gif' style='width:25px; height:25px; margin-left:40%; padding:0px;' />";
}
function replace(fullString, text, by) {
    // Replaces text with by in string
    var strLength = fullString.length, txtLength = text.length;
    if ((strLength == 0) || (txtLength == 0)) return fullString;

    var i = fullString.indexOf(text);
    if ((!i) && (text != fullString.substring(0, txtLength))) return fullString;
    if (i == -1) return fullString;

    var newstr = fullString.substring(0, i) + by;

    if (i + txtLength < strLength)
        newstr += replace(fullString.substring(i + txtLength, strLength), text, by);

    return newstr;
}

function LTrim(str) {
    var whitespace = new String(" \t\n\r ");
    var s = new String(str);
    if (whitespace.indexOf(s.charAt(0)) != -1) {
        var j = 0, i = s.length;
        while (j < i && whitespace.indexOf(s.charAt(j)) != -1)
            j++;
        s = s.substring(j, i);
    }
    return s;
}
function RTrim(str) {
    var whitespace = new String(" \t\n\r ");
    var s = new String(str);
    if (whitespace.indexOf(s.charAt(s.length - 1)) != -1) {
        var i = s.length - 1;
        while (i >= 0 && whitespace.indexOf(s.charAt(i)) != -1)
            i--;
        s = s.substring(0, i + 1);
    }
    return s;
}
function Trim(str) {
    return RTrim(LTrim(str));
}

function GetWindowWidth() {
    if (document.documentElement && (document.documentElement.clientWidth)) //IE 6+ in 'standards compliant mode'
        return document.documentElement.clientWidth;
    else if (document.body && (document.body.clientWidth)) //IE 4 compatible
        return document.body.clientWidth;
    else if (typeof (window.innerWidth) == 'number')   //Non-IE
        return window.innerWidth;

    return screen.width;
}

function GetWindowHeight() {
    if (document.documentElement && (document.documentElement.clientHeight)) //IE 6+ in 'standards compliant mode'
        return document.documentElement.clientHeight;
    else if (document.body && (document.body.clientHeight)) //IE 4 compatible
        return document.body.clientHeight;
    else if (typeof (window.innerHeight) == 'number') //Non-IE
        return window.innerHeight;

    return screen.hight;
}

function getInternetExplorerVersion()
{
    var rv = -1; // Return value assumes failure.
    if (navigator.appName == 'Microsoft Internet Explorer') {
        var ua = navigator.userAgent;
        var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
        if (re.exec(ua) != null)
            rv = parseFloat(RegExp.$1);
    }
    return rv;
}

function gotoHere(componentId) {
    document.getElementById(componentId).style.display = "";
    $('html,body').animate({ scrollTop: $("#" + componentId).offset().top }, 'slow');
}

function AllowOnlyDigits(e) {
   
    // Allow: backspace, delete, tab, escape, enter and .
    if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 190]) !== -1 ||
        // Allow: Ctrl+A
        (e.keyCode == 65 && e.ctrlKey === true) ||
        // Allow: home, end, left, right, down, up
        (e.keyCode >= 35 && e.keyCode <= 40)) {
        // let it happen, don't do anything
        return;
    }
    // Ensure that it is a number and stop the keypress
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
        e.preventDefault();
    }

}

function AllowOnlyDecimal(e, txtId) {
    //alert(txtId);
    // Allow: backspace, delete, tab, escape, enter and .
    if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 190]) !== -1 ||
        // for .
        (e.keyCode == 110 && document.getElementById(txtId).value.indexOf('.') === -1) ||
        // Allow: Ctrl+A
        (e.keyCode == 65 && e.ctrlKey === true) ||
        // Allow: home, end, left, right, down, up

        (e.keyCode == 173 && document.getElementById(txtId).value.indexOf('-') === -1) ||

        (e.keyCode >= 35 && e.keyCode <= 40)) {
        // let it happen, don't do anything
        return;
    }
    // Ensure that it is a number and stop the keypress
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
        e.preventDefault();
    }
}

function toggleMe(elementId) {
    $("#" + elementId).slideToggle("slow");
}

function hideElement(elementId) {
    $("#" + elementId).hide("slow");
}
function showElement(elementId) {
    $("#" + elementId).show("slow");
}



function showProcessingPopup() {

  
    if (siteBaseUrl == "")
        siteBaseUrl = document.getElementById("frmSiteUrl").action;

    var screenWidth = GetWindowWidth();
    var screenHeight = GetWindowHeight();
    var leftMargin = (screenWidth / 2) - 100;
    var topMargin = (screenHeight / 2) - 200;

    document.getElementById("divProcessingPopup").style.display = "";
    document.getElementById("divProcessingPopup").style.left = leftMargin + "px";
    document.getElementById("divProcessingPopup").style.top = topMargin + "px";
}

function hideProcessingPopup() {
    document.getElementById("divProcessingPopup").style.display = "none";
}



function checkImageSize(imageElementId) {

var fileInput = $("#" + imageElementId)[0];
        var imgbytes = fileInput.files[0].fileSize;
   

}    

function getOperationMessage(messageTitle, messageText, messageCssClass) {

    var retHtml = "<div id='responseMessage' style='margin-top:5px'>";
    retHtml = retHtml + "<div class='alert " + messageCssClass + "'>";
    retHtml = retHtml + "<strong>" + messageTitle + "</strong>";
    retHtml = retHtml + " "+messageText;
    retHtml = retHtml + "<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;</button>";

    retHtml = retHtml + "</div></div>";
    return retHtml;
}
function getErrorMessage(messageTitle,messageText)
{
    return getOperationMessage(messageTitle, messageText, "alert-dismissable alert-danger")
}

function getNoticeMessage(messageTitle, messageText)
{
    return getOperationMessage(messageTitle, messageText, "alert-dismissable alert-warning")
}
function getInformationMessage(messageTitle, messageText)
{
    return getOperationMessage(messageTitle, messageText, "alert-dismissable alert-info")
}
function getSuccessMessage(messageTitle, messageText) {
    return getOperationMessage(messageTitle, messageText, "alert-dismissable alert-success")
}



function loadURL(url, container) {
    //console.log(container)

    $.ajax({
        type: "GET",
        url: url,
        dataType: 'html',
        cache: true, // (warning: this will cause a timestamp and will call the request twice)
        beforeSend: function () {
         
            //showProcessingPopup();

        },
        /*complete: function(){
	    	// Handle the complete event
	    	// alert("complete")
		},*/
        success: function (data) {

            //hideProcessingPopup();

            container.css({
                opacity: '0.0'
            }).html(data).delay(50).animate({
                opacity: '1.0'
            }, 300);

            //hideElement("loading");


        },
        error: function (xhr, ajaxOptions, thrownError) {
            //alert("Error");
            container.html('<h4 style="margin-top:10px; display:block; text-align:left"><i class="fa fa-warning txt-color-orangeDark"></i> Error 404! Page not found.</h4>');
        },
        async: false
    });

}
