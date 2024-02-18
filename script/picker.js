class GlobalManager {
	constructor() {
		this.board = document.getElementById("board");
		this.dialogOpenButton = document.getElementById("DialogOpenButton");
		this.textDialog = document.getElementById("TextDialog");
		this.textDialogContent = document.getElementById("TextDialogContent");
		this.editDialog = document.getElementById("EditDialog");
		this.editDialogContent = document.getElementById("EditDialogContent");
		this.dataArea = document.getElementById("DataArea");
		this.textArea = document.getElementById("TextArea");
		this.inRejectDB = document.getElementById("InRejectDB");
		this.outRejectDB = document.getElementById("OutRejectDB");
		this.wm =  new WordManager();
		this.carousel = null;
	}
}

const G = new GlobalManager();


G.textArea.setAttribute("style", "height:" + window.clientHeight + "px;");
G.textArea.focus();



G.dialogOpenButton.addEventListener("click", (e) => {
	openDialog();
});

G.inRejectDB.addEventListener("change", (e) => {
	const file = e.target.files[0];
	if (!file) {
		return;
	}
	readRejectFile(file);
});

function readRejectFile(file) {
	const reader = new FileReader();
	reader.onload = (e) => {
		let ed = Papa.parse(e.target.result).data;
		for (let i of ed) {
			G.wm.excludedDict[i] = "E";
		}
	};
	reader.readAsText(file);
}



G.outRejectDB.addEventListener("click", (e) => {
	const csvData = Papa.unparse(Object.keys(G.wm.excludedDict).map((e) => { return [e];}));
	const blob = new Blob([csvData], { type: 'text/csv' });
	const link = document.createElement('a');
	link.href = window.URL.createObjectURL(blob);
	link.download = 'excluded.csv';
	link.click();
});

let board = document.querySelector('#board');


function getNextCard() {
	let nextWord = G.wm.getNextWord();
	if (nextWord == null) {
		const csvData = Papa.unparse(Object.keys(G.wm.selectedList).map((e) => { return [e];}));
		const blob = new Blob([csvData], { type: 'text/csv' });
		const link = document.createElement('a');
		link.href = window.URL.createObjectURL(blob);
		link.download = 'output.csv';
		link.click();
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
//console.log("OPEN");
	G.textArea.value = "";
	G.textDialog.style.display = "block";
	G.textArea.focus();
}
function dialogOK() {
	G.textDialog.style.display = "none";
	G.wm.setText(G.textArea.value);
	G.board.innerHTML = "";
console.log("HERE" + G.wm);
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
