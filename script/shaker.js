class GlobalManager {
	constructor() {
		this.dialogOpenButton = document.getElementById("DialogOpenButton");
		this.textDialog = document.getElementById("TextDialog");
		this.textDialogContent = document.getElementById("TextDialogContent");
		this.editDialog = document.getElementById("EditDialog");
		this.editDialogContent = document.getElementById("EditDialogContent");
		this.dataArea = document.getElementById("DataArea");
		this.textArea = document.getElementById("TextArea");
		this.wm = null;	// new WordManager("The quick brown fox jumps over the lazy dog.");
		this.carousel = null;
	}
}

const G = new GlobalManager();

openDialog();

G.textArea.setAttribute("style", "height:" + window.clientHeight + "px;");
G.textArea.focus();



G.dialogOpenButton.addEventListener("click", (e) => {
	openDialog();
});

let board = document.querySelector('#board');


function getNextCard() {
	let nextWord = G.wm.getNextWord();
	if (nextWord == null) {
		console.log("ENDED");
		const csvData = Papa.unparse(Object.keys(G.wm.selectedList).map((e) => { return [e];}));
		const blob = new Blob([csvData], { type: 'text/csv' })
		const link = document.createElement('a')
		link.href = window.URL.createObjectURL(blob)
		link.download = 'output.csv'
		link.click()
	}
	let card = document.createElement('div');
	card.classList.add('card');
	card.innerHTML = nextWord;
	return card;
}
function tap() {
	let dat = G.wm.getCurrentWord();
	G.dataArea.value = dat;
	G.dataArea.selectionStart = G.dataArea.selectionEnd = dat.length;
	G.editDialog.style.display = "block";
	G.dataArea.focus();
}
function leftS() {
//	console.log("left Swipe");
	G.wm.disposeCurrentWord();
}
function rightS() {
//	console.log("right Swipe");
	G.wm.selectCurrentWord();
}
function upS() {
//	console.log("up Swipe");
	G.wm.undo();
}

function openDialog() {
console.log("OPEN");
	G.textDialog.style.display = "block";
}
function dialogOK() {
	G.textDialog.style.display = "none";
	G.wm = new WordManager(G.textArea.value);
	G.carousel = new Carousel(board, getNextCard, leftS, rightS, upS, tap);
}
function dialogCancel() {
	G.textDialog.style.display = "none";
}

function convToLowercase() {
	let val = G.dataArea.value;
	G.dataArea.value = val.toLowerCase();
}

function eDialogOK() {
	let newVal = G.dataArea.value;
	G.wm.setCurrentWord(newVal);
	G.carousel.cards[G.carousel.cards.length-1].innerHTML = newVal;
	G.editDialog.style.display = "none";
}
function eDialogCancel() {
	G.editDialog.style.display = "none";
}
