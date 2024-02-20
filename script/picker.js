class SelectorPanel {
	constructor(panel, funcName, str) {
		this.panel = panel;
		this.panel.innerHTML = "";
		this.words = str.split(/\s+/);
		let html = "";
		this.counter = 0;
		this.colorManager = [];
		for (const w of this.words) {
			html += "<a href=\"javascript:" + funcName + "(" + this.counter + ");\" id=\"t" + this.counter + "\">" + w + "</a> ";
			this.counter++;
			this.colorManager.push("B");
		}
		this.panel.innerHTML = html;
	}
}

class GlobalManager {
	constructor() {
		this.textEntryButton = document.getElementById("TextEntryButton");
		this.editButton = document.getElementById("EditButton");
		this.saveCSVButton = document.getElementById("SaveCSVButton");
		this.mainPanel = document.getElementById("MainPanel");
		this.textDialog = document.getElementById("TextDialog");
		this.textArea = document.getElementById("TextArea");
		this.editDialog = document.getElementById("EditDialog");
		this.selectedWordsField = document.getElementById("SelectedWordsField");
		this.definitionField = document.getElementById("DefinitionField");
		this.wordArray = [];
		this.dictionaryURL = document.getElementById("DictionaryURL");
		this.localStorageKey = "searchURL";
		this.defaultSearchURL = "https://ejje.weblio.jp/content/$";
	}
}

const G = new GlobalManager();
checkSearchURL();


function checkSearchURL() {
	if ((localStorage.getItem(G.localStorageKey) == null) || (localStorage.getItem(G.localStorageKey) == "")) {
		localStorage.setItem(G.localStorageKey, G.defaultSearchURL);
	}
}


// Text entry dialog procedures  -- START --
function textDialogOpen() {
	G.textDialog.style.display = "block";
	G.textArea.value = "";
	G.textArea.focus();
}

function textDialogOK() {
	G.selectorPanel = new SelectorPanel(G.mainPanel, "tapped", G.textArea.value);
	G.textDialog.style.display = "none";
	G.editButton.disabled = false;
}

function textDialogCancel() {
	G.textDialog.style.display = "none";
}
// Text entry dialog procedures  -- END --

// Tapping a word
function tapped(num) {
	const strID = "t" + num;
	let elem = document.getElementById(strID);
	if (G.selectorPanel.colorManager[num] == "B") {
		elem.style.color = "rgb(255, 0, 0)";
		G.selectorPanel.colorManager[num] = "R";
	} else {
		elem.style.color = "rgb(0, 0, 0)";
		G.selectorPanel.colorManager[num] = "B";
	}
}

// Processing dialog procedures  -- START --
function processWords() {
	let words = composeWords();
	G.selectedWordsField.value = words;
	if (G.dictionaryURL.value == "") {
		G.dictionaryURL.value = localStorage.getItem(G.localStorageKey);
	}
	G.definitionField.value = "";
	G.editDialog.style.display = "block";
	if (words == "") {
		G.selectedWordsField.focus();
	} else {
		G.definitionField.focus();
	}
}

function composeWords() {
	let words = "";
	let delimiter = "";
	for (let i = 0; i < G.selectorPanel.counter; i++) {
		if (G.selectorPanel.colorManager[i] == "R") {
			let treatedWord = G.selectorPanel.words[i];
			treatedWord = treatedWord.replace(/[\.,!?'"]+$/, "");
			treatedWord = treatedWord.replace(/^['"]+/, "");
			words += delimiter + treatedWord;
			delimiter = " ";
		}
	}
	return words;
}

function eDialogOK() {
	if (G.definitionField.value == "") {
		if (!confirm("Definition field is blank.  Is it OK to proceed?")) {
			return;
		}
	}
	G.editDialog.style.display = "none";
	if (G.dictionaryURL.value == "") {
		G.dictionaryURL.value = localStorage.getItem(G.localStorageKey);
	} else {
		localStorage.setItem(G.localStorageKey, G.dictionaryURL.value);
	}
	let defArray = G.definitionField.value.split(/::/);
	defArray.unshift(G.selectedWordsField.value);
	G.wordArray.push(defArray);
	setColors("R", "rgb(0, 0, 255)");
	G.saveCSVButton.disabled = false;
}

function eDialogCancel() {
	G.editDialog.style.display = "none";
	if (G.dictionaryURL.value == "") {
		G.dictionaryURL.value = localStorage.getItem(G.localStorageKey);
	} else {
		localStorage.setItem(G.localStorageKey, G.dictionaryURL.value);
	}
	setColors("R", "rgb(0, 0, 0)");
}

function setColors(fromColor, colorCode) {
	for (let i = 0; i < G.selectorPanel.counter; i++) {
		if (G.selectorPanel.colorManager[i] == fromColor) {
			G.selectorPanel.colorManager[i] = "B";
			document.getElementById("t" + i).style.color = colorCode;
		}
	}
}

function convToLowerCase() {
	G.selectedWordsField.value = G.selectedWordsField.value.toLowerCase();
}

function search() {
	let target = encodeURI(G.selectedWordsField.value);
	let url = G.dictionaryURL.value.replace("$", target);
	window.open(url);
	G.definitionField.focus();
	G.definitionField.select();
}
// Processing dialog procedures  -- END --

// Ourpur CSV
function saveCSV() {
	const csvData = Papa.unparse(G.wordArray);
	const blob = new Blob([csvData], { type: 'text/csv' });
	const link = document.createElement('a');
	link.href = window.URL.createObjectURL(blob);
	link.download = 'output.csv';
	link.click();
}

// Some keyboard shortcuts...
window.addEventListener("keydown", (e) => {
	if (G.textDialog.style.display == "block") {
		if (e.key == "Escape")  textDialogCancel();
		if (e.key == "Enter")  textDialogOK();
	} else if (G.editDialog.style.display == "block") {
		if (e.key == "Escape")  eDialogCancel();
		if (e.key == "Enter") {
			if (e.ctrlKey)  search();
			else eDialogOK();
		}
	} else {
		processWords();
	}
});
