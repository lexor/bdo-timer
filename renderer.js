function updateCountdowns() {

	var d = new Date();
	var startHour = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0);
	var rlDayElapsedS = (Date.now() - startHour) / 1000;

	// Midnight UTC
	this.secsUntilDailyReset = 24 * 60 * 60 - rlDayElapsedS;

	// Imperial cooking/alchemy reset is every 3 hours from reset
	this.secsUntilImperialReset = 3 * 60 * 60 - rlDayElapsedS % (60 * 60 * 3);

	// Imperial delivery (trade) reset is every 4 hours from reset
	this.secsUntilTradeReset = 4 * 60 * 60 - rlDayElapsedS % (60 * 60 * 4);

	// Jumani board game reset is at 5am UTC
	this.secsUntilJumanjiReset = 60 * 60 * 24 - (rlDayElapsedS - 5 * 60 * 60) % (60 * 60 * 24);
	if (this.secsUntilJumanjiReset > 60 * 60 * 24) {
		this.secsUntilJumanjiReset -= 60 * 60 * 24;
	}
}

// This version gets called far more often but doesn't update if
// the site is not the active tab (using HTML page visibility api)
function updateClockActive() {
	if (document.hidden) {
		return;
	}
	updateClock();
}

function updateClock() {

	var d = new Date();
	var startHour = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0);
	var rlDayElapsedS = (Date.now() - startHour) / 1000;
	var secsIntoGameDay = (rlDayElapsedS + 200 * 60 + 20 * 60) % (240 * 60);

	// Last part of the shifted day is night
	if (secsIntoGameDay >= 12000) {

		var secsIntoGameNight = secsIntoGameDay - 12000;
		var pctOfNightDone = secsIntoGameNight / (40 * 60);
		var gameHour = 9 * pctOfNightDone;
		gameHour = gameHour < 2 ? 22 + gameHour : gameHour - 2;
		var secsUntilNightEnd = 40 * 60 - secsIntoGameNight;

		this.isDay = false;
		this.inGameHour = gameHour / 1 >> 0;
		this.inGameMinute = gameHour % 1 * 60 >> 0;
		this.secsUntilNightEnd = secsUntilNightEnd;
		this.secsUntilNightStart = secsUntilNightEnd + 12000;
	} else {

		var secsIntoGameDaytime = secsIntoGameDay;
		var pctOfDayDone = secsIntoGameDay / (200 * 60);
		var gameHour = 7 + (22 - 7) * pctOfDayDone;
		var secsUntilNightStart = 12000 - secsIntoGameDaytime;

		this.isDay = true;
		this.inGameHour = gameHour / 1 >> 0;
		this.inGameMinute = gameHour % 1 * 60 >> 0;
		this.secsUntilNightEnd = secsUntilNightStart + 40 * 60;
		this.secsUntilNightStart = secsUntilNightStart;
	}
}

function ampm() {
	return this.inGameHour < 12 ? 'AM' : 'PM';
}

function displayHour() {
	var t = this.inGameHour % 12;
	if (t === 0) {
		t = 12;
	}
	return this.inGameHour > 0 && this.inGameHour < 10 ? '0' + +t : t;
}

function displayMinute() {
	return this.inGameMinute < 10 ? '0' + +this.inGameMinute : this.inGameMinute;
}

function clocktime(secs) {
	if (secs < 60) {
		return '<1 min';
	} else if (secs < 60 * 60) {
		return (secs / 60 >> 0) + 'm';
	} else {
		return (secs / 3600 >> 0) + 'h' + (secs % 3600 / 60 >> 0) + 'm';
	}
}

function updateHtmls() {
	document.getElementById('ampm').innerHTML = ampm();
	document.getElementById('displayHour').innerHTML = displayHour();
	document.getElementById('displayMinute').innerHTML = displayMinute();

	if (isDay) {
		document.getElementById('untilNight').innerHTML = '<span>Night in</span> <b>' + clocktime(secsUntilNightStart) + '</b>';
		document.getElementById('untilNight').style.display = 'block';
		document.getElementById('untilDaytime').style.display = 'none';
	} else {
		document.getElementById('untilDaytime').innerHTML = '<span>Daytime in</span> <b>' + clocktime(secsUntilNightEnd) + '</b>';
		document.getElementById('untilDaytime').style.display = 'block';
		document.getElementById('untilNight').style.display = 'none';
	}

	/**
	 * secsUntilDailyReset < 30*60
	 * secsUntilImperialReset < 30*60
	 * secsUntilTradeReset < 30*60
	 * secsUntilJumanjiReset < 3*60*60
	 */

	 document.getElementById('untilDailyReset').innerHTML = clocktime(secsUntilDailyReset);
	 document.getElementById('untilImperialReset').innerHTML = clocktime(secsUntilImperialReset);
	 document.getElementById('untilTradeReset').innerHTML = clocktime(secsUntilTradeReset);
}

var baseTick = 4444.444444;
setInterval(updateClockActive, baseTick);
setInterval(updateClock, baseTick * 6);
setInterval(updateCountdowns, 20 * 1000);
updateClock();
updateCountdowns();
updateHtmls();

setInterval(function() {
	updateHtmls();
}, 1000);
