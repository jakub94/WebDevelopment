/* Fires after the basic DOM (*without* CSS / images) has loaded
document.addEventListener("DOMContentLoaded", function(event) {
    console.log("DOM fully loaded and parsed");
});
*/

/* Fires after the page has fully loaded (*including* CSS and images
window.addEventListener("load", function load(event){
    window.removeEventListener("load", load, false); //remove listener, no longer needed
    console.log("DOM fully loaded and parsed");
},false);
*/

window.addEventListener('load', init);

// Game Dialogs
var introDialog;
var helpDialog;
var pauseDialog;
var winDialog;
var loseDialog;

// Game Items
var items;

// Game Displays
var pointsDisplay;	// Showing the number of collected items
var clockDisplay;	// Showing the remaining time
var hintDisplay;	// Showing the hint for the current item

// Game Controls
var pauseButton;
var helpButton;

// Game State
var current;  // Item index - where are we at?
var points;   // How many items have been collected? - This could be calculated via 'current'
var timeLeft; // The remaining time until the game is over (in seconds)
var paused;   // Flag indicating whether the game is paused or not

// Countdown timer
var timer;

// Game Parameters
var timeLimit = 30;	// Tweak this to make the game harder or easier

/*
 * THIS IS WHERE WE START
 */

function init(e) {
	window.removeEventListener('load', init, false);
	
	current = -1;		// -1 indicates that the game hasn't startet yet (or is already over)
	initGameElements();
	showIntroDialog();
}

/*
 * INIT ELEMENTS
 */
 
function initGameElements() {
	initItems();
	initPointsDisplay();
	initClockDisplay();
	initHintDisplay();
	initPauseButton();
	initHelpButton();
}

function initItems() {
	items = document.querySelectorAll('#game .item');			// Get all items
	for (var i=0; i < items.length; ++i) {
		items[i].addEventListener('click', itemClick);			// Add the click listener, parameter e passes information to itemClick by default
		items[i].style.display = 'block';						// Make sure all items are visible
		items[i].ondragstart = function() { return false; };	// Disable image dragging
	}
}

function initPointsDisplay() {
	pointsDisplay = document.querySelector('#points-display');
	setPoints(0);
}

function initClockDisplay() {
	clockDisplay  = document.querySelector('#clock-display');
	timeLeft = timeLimit;
	setClock(timeLimit);
}

function initHintDisplay() {
	hintDisplay   = document.querySelector('#hint-display');
	setHint('');
}

function initPauseButton() {
	pauseButton = document.querySelector('#pause-button');
	pauseButton.addEventListener('click', pauseButtonClick);
}

function initHelpButton() {
	helpButton  = document.querySelector('#help-button');
	helpButton.addEventListener('click', helpButtonClick);
}

/*
 * UPDATING GAME DISPLAYS
 */

function updateHint() {
	if (items[current]) {
		setHint(items[current].title);
	}
}

function setPoints(pts) {
	points = pts;
	pointsDisplay.innerHTML = points+"/"+items.length;
}

function setHint(str) {
	hintDisplay.innerHTML = str;
}

function setClock(sec) {
	clockDisplay.innerHTML = sec;
}

function hideCurrentItem() {
	items[current].style.display = 'none';
}

/*
 * FLOW CONTROL
 */

function startGame() {
	proceed();
}

function resetGame() {
	initGameElements();
	current = -1;
}

function pauseGame() {
	if (!paused) {
		window.clearInterval(timer);
		paused = !paused;
	}
}

function unpauseGame() {
	if (paused) {
		timer = window.setInterval(timeTick, 1000);
		paused = !paused;
	}
}

function proceed() {
	if (items[current+1]) {
		++current;
		updateHint();
	}
	else {
		win();
	}
}

/*
 * WIN & LOSE
 */
 
function win() {
	current = -1;
	showWinDialog();	
}
 
function lose() {
	current = -1;
	showLoseDialog();
}


/*
 * ITEM ACTION
 */

function itemClick(e) {
	if (!paused && e.target == items[current]) {
		scoreItem();
		proceed();
	}
}

function scoreItem() {
	hideCurrentItem();
	setHint('');
	setPoints(++points); // points++ would pass the old value
}

/*
 * COUNTDOWN
 */

function timeTick() {
	--timeLeft;
	setClock(timeLeft);
	if (timeLeft <= 0) {
		lose();
	}
}

/*
 * DIALOGS
 */
 
function showIntroDialog() {
	if (!dialogIsOpen()) {
		introDialog = createIntroDialog();
		openDialog(introDialog);
	}
}

function showWinDialog() {
	if (!dialogIsOpen()) {
		winDialog = createWinDialog();
		openDialog(winDialog);
	}
}

function showLoseDialog() {
	if (!dialogIsOpen()) {
		loseDialog = createLoseDialog();
		openDialog(loseDialog);
	}
}

function showPauseDialog() {
	if (!dialogIsOpen()) {
		pauseDialog = createPauseDialog();
		openDialog(pauseDialog);
	}
}

function showHelpDialog() {
	if (!dialogIsOpen()) {
		helpDialog = createHelpDialog();
		openDialog(helpDialog);
	}
}

/*
 * GAME BUTTON ACTIONS
 */
 
function pauseButtonClick() {
	showPauseDialog();
}

function helpButtonClick() {
	showHelpDialog();
}

/* DYNAMICALL CREATE A DIALOG */

function dialog(id, headText, bodyText, buttonLabel, buttonCallback) {
	var dialog = document.createElement('div');	
	dialog.setAttribute('class','game-dialog');
	dialog.setAttribute('id',id);
	dialog.appendChild(dialogHeading(headText));
	dialog.appendChild(dialogBody(bodyText));
	dialog.appendChild(dialogButton(buttonLabel, buttonCallback));
	return dialog;
}

function dialogHeading(text) {
	var dialogHead = document.createElement('h3');
	dialogHead.appendChild(document.createTextNode(text));
	return dialogHead;
}

function dialogBody(text) {
	var dialogBody = document.createElement('div');
	dialogBody.setAttribute('class','dialog-body');
	var textLines = text.split("\n");
	for (var i=0; i<textLines.length; ++i) {
		var paragraph = document.createElement('p');
		paragraph.appendChild(document.createTextNode(textLines[i]));
		dialogBody.appendChild(paragraph);
	}
	return dialogBody;
}

function dialogButton(label, callback) {
	var dialogButton = document.createElement('div');
	dialogButton.setAttribute('class', 'button');
	dialogButton.appendChild(document.createTextNode(label));
	dialogButton.addEventListener('click', callback);
	return dialogButton;
}

/*
 * OPEN / CLOSE DIALOGS
 */
 
function openDialog(dialog) {
	if (!dialogIsOpen()) {
		pauseGame();
		setHint('');
		document.querySelector('#game').appendChild(dialog);
	}
}

function closeDialog(dialog) {
	dialog.parentNode.removeChild(dialog); // can't delete myself :-(
	updateHint();
	unpauseGame();
}

function closeAllDialogs() {
	var dialogs = document.querySelectorAll('.game-dialog');
	for (var i=0; i<dialogs.length; ++i) {
		closeDialog(dialogs[i]);
	}
}

function dialogIsOpen() {
	var dialogs = document.querySelectorAll('.game-dialog');
	return (dialogs.length > 0) ? true : false;
}

/* CONTENT: DIALOGS */

function createIntroDialog() {
	var dialogText = "";
	dialogText += "Oh no! An important client will show up for a meeting in about "+timeLimit+" seconds. But what happened to the meeting room?\n";
	dialogText += "It seems that by the end of yesterday's party, no one was able to clean up anymore. This is your job now!\n";
	dialogText += "Remove everything that doesn't belong (a simple click with your mouse will do). But make sure to do it in the right order (take a look at the info box at the bottom of the game screen), so the most horrible stuff will be gone first!";
	return dialog("intro-dialog", "Meeting Room Madness!", dialogText, "Start", introDialogButtonClick);
}

function createWinDialog() {
	var dialogText = ""
	dialogText += "Phew, you did it! Now all that's left to worry about is the condition of the G3 employees...\n";
	dialogText += "Your time: "+(timeLimit-timeLeft)+" seconds.";
	return dialog("win-dialog", "Hell yeah!", dialogText, "Play again", winDialogButtonClick);
}

function createLoseDialog() {
	var dialogText = "";
	dialogText += "Oh man, that was pathetic. And the customer wasn't happy. Not at all. I guess this project will be carried out by another company..."
	return dialog("lose-dialog", "Uh-oh!", dialogText, "Try again", loseDialogButtonClick);
}

function createPauseDialog() {
	var dialogText = "";
	dialogText += "You have paused the game. Probably because you are too hungover to continue.";
	return dialog("pause-dialog", "Pause", dialogText, "Continue", pauseDialogButtonClick);
}

function createHelpDialog() {
	var dialogText = ""
	dialogText += "You are supposed to tidy up the meeting room. In order to do so, you have to remove certain objects by left-clicking them in the correct order and within the given time limit.\n";
	dialogText += "At the bottom of the screen, you'll find a hint on which object to remove next. The top right corner will show the remaining time as well as your current status. In the top left corner, you can pause the game as well as access this help.";
	return dialog("help-dialog", "Help", dialogText, "OK", helpDialogButtonClick);
}

/*
 * DIALOG BUTTON ACTIONS
 */

function introDialogButtonClick() {
	closeDialog(introDialog);
	startGame();
}

function helpDialogButtonClick() {
	closeDialog(helpDialog);
}

function pauseDialogButtonClick() {
	closeDialog(pauseDialog);
}

function winDialogButtonClick() {
	closeDialog(winDialog);
	resetGame();
	startGame();
}

function loseDialogButtonClick() {
	closeDialog(loseDialog);
	resetGame();
	startGame();
}