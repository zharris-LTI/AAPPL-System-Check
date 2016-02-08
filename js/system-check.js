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
	
	//audio check params
	var audioParams = {
		mp3: "media/mic_check.mp3",
		showvolume: 1,
		volume: 100,
		autoplay: 0	
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

	swfobject.embedSWF("flash/microphone.swf", "micCheck", "300", "150", "10.0.0", false);
	swfobject.embedSWF("flash/player_mp3_maxi.swf", "audioPlayer", "200", "20", "10.0.0", false, audioParams);
	swfobject.embedSWF("flash/inputTest.swf", "keyboardCheck", "200", "100", "10.0.0", false, keyboardParams, keyboardAttributes);
			
	$('.flash-control').mousedown(function() {
		//console.log('clicked');
		var dialogButtons = $(this).parents("td").find(".confirmation a");
		dialogButtons.removeClass("disabled");
	});
			
	$('a.passCheck').click(function() {
		var disabled = $(this).hasClass("disabled");
		if(!disabled) {
			$(this).parents("td").next().children().removeClass().addClass('fa fa-check');
		}
		
		var requirementCheck = allCriteria.filter('.fa-check').length;
		//console.log(requirementCheck);
		if(requirementCheck === 6) {
			$('#login-btn').removeClass('disabled');
		}
		
	});
	
	$('a.failCheck').click(function() {
		var disabled = $(this).hasClass("disabled");		
		if(!disabled) {
			$(this).parents("td").next().children().removeClass().addClass('fa fa-times');
		}
	});
	
});