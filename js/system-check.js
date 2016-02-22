$(document).ready(function(){
	
	//*~*~*~*~*~*~*~*Test Bandwidth*~*~*~*~*~*~*~*//
	
	var BandwidthRequired = 1000; // 1500 is 1.5 Mbps or T1

	var imageAddr = "http://support.lti-inc.net/aappl-system-check/media/31120037-5mb.jpg"; 
	var downloadSize = 4995374; //bytes

	window.onload = function() {
		var connectionCheck = $("#progress");
		connectionCheck.html("Please wait while your connection speed is being calculated...");
		window.setTimeout(MeasureConnectionSpeed, 1);
	};

	function MeasureConnectionSpeed() {
		var connectionCheck = $("#progress");
		var startTime, endTime;
		var download = new Image();
		download.onload = function () {
			endTime = (new Date()).getTime();
			showResults();
		}
		
		download.onerror = function (err, msg) {
			connectionCheck.html("Error performing this test");
		}
		
		startTime = (new Date()).getTime();
		var cacheBuster = "?nnn=" + startTime;
		download.src = imageAddr + cacheBuster;
		
		function showResults() {
			var duration = (endTime - startTime) / 1000;
			var bitsLoaded = downloadSize * 8;
			var speedBps = (bitsLoaded / duration).toFixed(2);
			var speedKbps = (speedBps / 1024).toFixed(2);
			var speedMbps = (speedKbps / 1024).toFixed(2);
			
			(speedKbps < BandwidthRequired)? $('#bandwidthCheckImg i').removeClass().addClass('check-status fa fa-times'):$('#bandwidthCheckImg i').removeClass().addClass('check-status fa fa-check');
			
			connectionCheck.html("Your internet connection speed is: " + commaSeparateNumber(speedKbps) + " Kbps");
			checkRequirements();
		}
	}
	
	function commaSeparateNumber(val){
		while (/(\d+)(\d{3})/.test(val.toString())){
			val = val.toString().replace(/(\d+)(\d{3})/, '$1'+','+'$2');
		}
			return val;
	}



	//*~*~*~*~*~*~*~*Flash Test*~*~*~*~*~*~*~*//
	
	var flashDependantCriteria = $('#portsCheckImg i,#flashCheckImg i,#MP3CheckImg i,#microphoneCheckImg i,#languageCheckImg i');

	//Test for Flash, Audio and Mic
	var minVersion = '10'; //minimum Flash version required

	$('.min-version-number').html(minVersion); //inject minimum Flash version required into markup
	
	var flashVers = swfobject.getFlashPlayerVersion(); //Get browser's Flash version
	
	var minVersCheck = swfobject.hasFlashPlayerVersion(minVersion); //Check if browser has minimum required Flash version
	
	if(minVersCheck){ // if browser passes the required version check display flash control
		$('.displayFlash').toggle();
		$('#version-number').html(flashVers.major);
		$('#flashCheckImg i').removeClass().addClass('check-status fa fa-check');
		checkRequirements();
	} else if(flashVers.major===0) { // if the browser doesn't have Flash or is blocking display message to install or unblock
		$('.installFlash').toggle();
		flashDependantCriteria.removeClass().addClass('check-status fa fa-times');
	} else { // if the browser has a really old version of Flash display message to upgrade
		$('.upgradeFlash').toggle();
		$('#version-number-low').html(flashVers.major);
		flashDependantCriteria.removeClass().addClass('check-status fa fa-times');
	}



	//*~*~*~*~*~*~*~*Port Test*~*~*~*~*~*~*~*//
	
	var portCheckMsg = $('#portCheckMsg');
	portCheckMsg.html('<p>Checking port...</p>');

	//port check params
	var portFlashVars = {
		FmsUrl : "BL-AAPPL-AMS-777299592.us-west-2.elb.amazonaws.com",
		FmsAppName : "aappl"
	};

	//embed port check flash file
	swfobject.embedSWF(	"flash/portTester.swf", 
						"portCheck", 
						"0", 
						"0", 
						"10.0.0", 
						false, //Express Install
						portFlashVars); //FlashVars

	window.setSuccess = function setSuccess() {
		portCheckMsg.html('<p>Port 1935 is open.</p>');
		$('#portsCheckImg i').removeClass().addClass('check-status fa fa-check');
		checkRequirements();
	}

	window.setFail = function setFail() {
		portCheckMsg.html('<p>Port 1935 is closed. Please contact your system administrator.</p>');
		$('#portsCheckImg i').removeClass().addClass('check-status fa fa-times');				
	}



	//*~*~*~*~*~*~*~*Audio Test*~*~*~*~*~*~*~*//
	
	//audio check params
	var audioFlashVars = {
		VolumeCheck : "http://duhbaddmanamr.cloudfront.net/mic_check.flv"
	};

	var audioParams = {
		VolumeCheck : "http://duhbaddmanamr.cloudfront.net/mic_check.flv"
	};

	//embed audio check flash file
	swfobject.embedSWF(	"flash/audioTester.swf", 
						"audioPlayer", 
						"100", 
						"62", 
						"10.0.0", 
						false, //Express Install
						audioFlashVars, //FlashVars
						audioParams); //Parameters



	//*~*~*~*~*~*~*~*Mic Test*~*~*~*~*~*~*~*//
	
	//mic check params
	var micFlashVars = {
		FilePath : "rtmp://BL-AAPPL-AMS-777299592.us-west-2.elb.amazonaws.com/aappl/volcheck/"
	};

	var micParams = {
		FilePath : "rtmp://BL-AAPPL-AMS-777299592.us-west-2.elb.amazonaws.com/aappl/volcheck/"
	};

	//embed mic check flash file
	swfobject.embedSWF(	"flash/recordTester.swf", 
						"micCheck", 
						"250", 
						"140", 
						"10.0.0", 
						false, //Express Install
						micFlashVars, //FlashVars
						micParams); //Parameters

	// If no mic detected, hide mic check and ask if user is taking a speaking assessment
	window.micCheckFail = function micCheckFail() {
		$('#MicFlashDiv').toggle();
		$('#NoMicDiv').toggle();
	}
	
	$('#NoMicDiv .failCheck').click(function() { // Display help message if user is taking a speaking assessment
		$('#speaking-help-msg').slideDown();
	});

	$('#NoMicDiv .passCheck').click(function() { // Hide help message if user is not taking a speaking assessment
		$('#speaking-help-msg').slideUp();
	});



	//*~*~*~*~*~*~*~*Keyboard Test*~*~*~*~*~*~*~*//
	
	//keyboard check params
	var keyboardParams = {
		quality: "high", 
		play: "true", 
		loop: "true",
		scale: "showall", 
		wmode: "transparent",//"window",
		devicefont: "false", 
		menu: "false",
		allowFullScreen: "false",
		allowScriptAccess: "sameDomain"
	};
	
	var keyboardAttributes = {
		bgcolor: "#FFFFEE"
	};

	//embed keyboard check flash file
	swfobject.embedSWF(	"flash/inputTest.swf", 
						"keyboardCheck", 
						"200", 
						"100", 
						"10.0.0", 
						false, //Express Install
						keyboardParams, //Parameters
						keyboardAttributes); //Attributes



	//*~*~*~*~*~*~*~*Yes/No button controls*~*~*~*~*~*~*~*//
	
	$('a.passCheck').click(function() { //When Yes is clicked display check in the corresponding row
		var disabled = $(this).hasClass("disabled");
		if(!disabled) {
			$(this).parents("tr").find("td i").removeClass().addClass('check-status fa fa-check');
		}
		
		checkRequirements();
	});
	
	$('a.failCheck').click(function() { // When No is clicked display X in the corresponding row
		var disabled = $(this).hasClass("disabled");		
		if(!disabled) {
			$(this).parents("tr").find("td i").removeClass().addClass('check-status fa fa-times');
		}
		$('#login-btn').addClass('disabled').removeAttr('href'); // Disable the login link if need be
	});
	
	// Enable Yes/No buttons when the corresponding flash control is clicked
	window.audioBtnClick = function audioBtnClick() {	
		$('#audio-dialog a').removeClass("disabled");
	}	

	window.recordBtnClick = function recordBtnClick() {	
		$('#mic-dialog a').removeClass("disabled");
	}

	 // If all rows are checked, enable link to login page
	function checkRequirements() {
		var icons = $('td > i').filter('.check-status').length;
		var iconsChecked = $('td > i').filter('.fa-check').length;
		
		console.log(icons);
		console.log(iconsChecked);
		
		if (icons === iconsChecked) 
			$('#login-btn').removeClass('disabled').attr('href', 'http://aappl.actfltesting.org/');
	}

	//*~*~*~*~*~*~*~*Intenet Explorer hacks*~*~*~*~*~*~*~*//

	//zebra striping for ie8
	$('.ie8 .system-check-table tr:odd').css('background-color','#eee');
	$('.ie8 .system-check-table tr:even').css('background-color','#d9e4ee');
	$('.ie8 .system-check-table tr:eq(1)').css('background-color','#fff');	

	//column styles for ie8
	$('.ie8 .system-check-table tr td:nth-child(1)').css('width','150px').css('text-align','center').css('font-weight','bold');	
	$('.ie8 .system-check-table tr td:nth-child(2)').css('width','200px');	
	$('.ie8 .system-check-table tr td:nth-child(3)').css('width','300px');	
	$('.ie8 .system-check-table tr td:nth-child(4)').css('text-align','center');
});