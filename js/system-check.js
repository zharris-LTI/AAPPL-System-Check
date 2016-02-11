var portTest = 'fail';

function setSuccess() {
	portTest = 'success';
}

function setFail() {
	portTest = 'fail';
}
	
$(document).ready(function(){

	var allCriteria = $('#bandwidthCheckImg i,#portsCheckImg i,#flashCheckImg i,#MP3CheckImg i,#microphoneCheckImg i,#languageCheckImg i');
	var flashDependantCriteria = $('#flashCheckImg i,#MP3CheckImg i,#microphoneCheckImg i,#languageCheckImg i');
	//Test Bandwidth
	var BandwidthRequired = 1000; // 1500 is 1.5 Mbps or T1

	var imageAddr = "http://support.lti-inc.net/aappl-system-check/media/31120037-5mb.jpg"; 
	var downloadSize = 4995374; //bytes

	window.onload = function() {
		var oProgress = $("#progress");
		oProgress.html("Please wait while your connection speed is being calculated...");
		window.setTimeout(MeasureConnectionSpeed, 1);
	};

	function MeasureConnectionSpeed() {
		var oProgress = $("#progress");
		var startTime, endTime;
		var download = new Image();
		download.onload = function () {
			endTime = (new Date()).getTime();
			showResults();
		}
		
		download.onerror = function (err, msg) {
			oProgress.html("Error performing this test");
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
			
			//console.log(speedKbps + ' < ' + BandwidthRequired);
			
			(speedKbps < BandwidthRequired)? $('#bandwidthCheckImg i').removeClass().addClass('fa fa-times'):$('#bandwidthCheckImg i').removeClass().addClass('fa fa-check');
			
			oProgress.html("Your internet connection speed is: " + commaSeparateNumber(speedKbps) + " Kbps");
		}
	}
	
	function commaSeparateNumber(val){
		while (/(\d+)(\d{3})/.test(val.toString())){
			val = val.toString().replace(/(\d+)(\d{3})/, '$1'+','+'$2');
		}
			return val;
	}
	
	//Test for Flash, Audio and Mic
	var flashVers = swfobject.getFlashPlayerVersion();
	var minVersion = '12';
	var minVersCheck = swfobject.hasFlashPlayerVersion(minVersion);
	
	$('.min-version-number').html(minVersion);

	//Port Test
	var portCheckMsg = $('#portCheckMsg');
	portCheckMsg.html('<p>Checking port...</p>');

	//port check params
	var portFlashVars = {
		VolumeCheck : "http://duhbaddmanamr.cloudfront.net/mic_check.flv&FilePath=rtmp://BL-AAPPL-AMS-777299592.us-west-2.elb.amazonaws.com/aappl/volcheck/&FmsUrl=10.0.0.171&FmsAppName=zflv"
	};
			
	//audio check params
	var audioFlashVars = {
		VolumeCheck : "http://duhbaddmanamr.cloudfront.net/mic_check.flv",
	};

	var audioParams = {
		VolumeCheck : "http://duhbaddmanamr.cloudfront.net/mic_check.flv"
	};

	//mic check params
	var micFlashVars = {
		FilePath : "rtmp://BL-AAPPL-AMS-777299592.us-west-2.elb.amazonaws.com/aappl/volcheck/"
	};

	var micParams = {
		FilePath : "rtmp://BL-AAPPL-AMS-777299592.us-west-2.elb.amazonaws.com/aappl/volcheck/"
	};

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
	
	if(minVersCheck){
		$('.displayFlash').toggle();
		$('#version-number').html(flashVers.major);
		$('#flashCheckImg i').removeClass().addClass('fa fa-check');
	} else if(flashVers.major===0) {
		$('.installFlash').toggle();
		flashDependantCriteria.removeClass().addClass('fa fa-times');
	} else {
		$('.upgradeFlash').toggle();
		$('#version-number-low').html(flashVers.major);
		flashDependantCriteria.removeClass().addClass('fa fa-times');
	}			

	swfobject.embedSWF(	"flash/portTester.swf", 
						"portCheck", 
						"0", 
						"0", 
						"10.0.0", 
						false, //Express Install
						portFlashVars); //FlashVars

	swfobject.embedSWF(	"flash/audioTester.swf", 
						"audioPlayer", 
						"100", 
						"110", 
						"10.0.0", 
						false, //Express Install
						audioFlashVars, //FlashVars
						audioParams); //Parameters
						
	swfobject.embedSWF(	"flash/recordTester.swf", 
						"micCheck", 
						"300", 
						"150", 
						"10.0.0", 
						false, //Express Install
						micFlashVars, //FlashVars
						micParams); //Parameters
						
	swfobject.embedSWF(	"flash/inputTest.swf", 
						"keyboardCheck", 
						"200", 
						"100", 
						"10.0.0", 
						false, //Express Install
						keyboardParams, //Parameters
						keyboardAttributes); //Attributes
						
	$('.flash-control').mousedown(function() {
		//console.log('clicked');
		var dialogButtons = $(this).parents("td").find(".confirmation a");
		dialogButtons.removeClass("disabled");
	});
			
	$('a.passCheck').click(function() {
		var disabled = $(this).hasClass("disabled");
		if(!disabled) {
			$(this).parents("tr").find("td i").removeClass().addClass('fa fa-check');
		}
		
		var requirementCheck = allCriteria.filter('.fa-check').length;
		//console.log(requirementCheck);
		if(requirementCheck === 6) {
			$('#login-btn').removeClass('disabled').attr('href', 'http://aappldemo.actfltesting.org/');
		}
		
	});
	
	$('a.failCheck').click(function() {
		var disabled = $(this).hasClass("disabled");		
		if(!disabled) {
			$(this).parents("tr").find("td i").removeClass().addClass('fa fa-times');
		}
		$('#login-btn').addClass('disabled').removeAttr('href');
	});

	var portCheckFn = setTimeout( function() {
			if (portTest === 'success') {
				portCheckMsg.html('<p>Port 1935 is open.</p>');
				$('#portsCheckImg i').removeClass().addClass('fa fa-check');
			} else {
				portCheckMsg.html('<p>Port 1935 is closed. Please contact your system administrator.</p>');
				$('#portsCheckImg i').removeClass().addClass('fa fa-times');				
			}
	},5000);
	
	$('.ie8 .system-check-table tr:odd').css('background-color','#eee');
	$('.ie8 .system-check-table tr:even').css('background-color','#d9e4ee');
	
});