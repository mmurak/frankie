class SelectorPanel {
	constructor(panel, funcName, str) {
		this.panel = panel;
		this.panel.innerHTML = "";
		this.words = [];
		this.counter = 0;
		this.colorManager = [];
		let lines = str.split(/\n/);
		for (const line of lines) {
			let html = "";
			let tempWords = line.split(/\s+/);
			for (const w of tempWords) {
				html += "<a href=\"javascript:" + funcName + "(" + this.counter + ");\" id=\"t" + this.counter + "\">" + w + "</a> ";
				this.words.push(w);
				this.counter++;
				this.colorManager.push("B");
			}
			this.panel.innerHTML += html + "<br>";
		}
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
		this.dictionaryURL1 = document.getElementById("DictionaryURL1");
		this.dictionaryURL2 = document.getElementById("DictionaryURL2");
		this.dictionaryURL3 = document.getElementById("DictionaryURL3");
		this.localStorageKey1 = "searchURL1";
		this.localStorageKey2 = "searchURL2";
		this.localStorageKey3 = "searchURL3";
		this.defaultSearchURL1 = "https://ejje.weblio.jp/content/$";
		this.defaultSearchURL2 = "☆https://www.collinsdictionary.com/dictionary/english/$";
		this.defaultSearchURL3 = "☆https://dictionary.cambridge.org/dictionary/english/$";
		this.workField = document.getElementById("WorkField");
		this.additionalFieldArea = document.getElementById("AdditionalFieldArea");
		this.selectorPanel = new SelectorPanel(this.mainPanel, "tapped", this.textArea.value);
		this.copyButton = document.getElementById("CopyButton");
		this.numWordsPanel  = document.getElementById("NumWordsPanel");
	}
}

const G = new GlobalManager();
checkSearchURL();
createDynamicFields();

function createDynamicFields() {
	let url = new URL(window.location.href);
	let params = url.searchParams;
	let fparams = params.get("f");
	if (fparams == null)  return;
	G.copyButton.hidden = false;
	G.workField.hidden = false;
	let fields = fparams.split("|");
	let cnt = 0;
	for (const f of fields) {
		const btn = document.createElement("input");
		btn.type = "button";
		btn.id = "btn" + cnt;
		btn.value = f;
		btn.style = "background-color: lightGrey";
		btn.addEventListener("click", (e) => {
			let num = btn.id.replace("btn", "");
			if (e.shiftKey) {
				alert(document.getElementById("htf"+num).value);
				return;
			}
			let waValue = G.workField.value.substring(G.workField.selectionStart, G.workField.selectionEnd);
			document.getElementById("htf"+num).value = waValue;
			btn.style = "background-color: lightGreen";
			e.preventDefault();
		});
		G.additionalFieldArea.appendChild(btn);
		const htf = document.createElement("input");
		htf.type = "textfield";
		htf.id = "htf" + cnt;
		htf.hidden = true;
		G.additionalFieldArea.appendChild(htf);
		cnt++;
	}
}

function copyIt() {
	let waValue = G.workField.value.substring(G.workField.selectionStart, G.workField.selectionEnd);
	G.definitionField.value += waValue;
}

function checkSearchURL() {
	if ((localStorage.getItem(G.localStorageKey1) == null) || (localStorage.getItem(G.localStorageKey1) == "")) {
		localStorage.setItem(G.localStorageKey1, G.defaultSearchURL1);
	}
	if ((localStorage.getItem(G.localStorageKey2) == null) || (localStorage.getItem(G.localStorageKey2) == "")) {
		localStorage.setItem(G.localStorageKey2, G.defaultSearchURL2);
	}
	if ((localStorage.getItem(G.localStorageKey3) == null) || (localStorage.getItem(G.localStorageKey3) == "")) {
		localStorage.setItem(G.localStorageKey3, G.defaultSearchURL3);
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
	if (G.dictionaryURL1.value == "") {
		G.dictionaryURL1.value = localStorage.getItem(G.localStorageKey1);
	}
	if (G.dictionaryURL2.value == "") {
		G.dictionaryURL2.value = localStorage.getItem(G.localStorageKey2);
	}
	if (G.dictionaryURL3.value == "") {
		G.dictionaryURL3.value = localStorage.getItem(G.localStorageKey3);
	}
	G.definitionField.value = "";
	G.workField.value = "";
	let fieldsArea = G.additionalFieldArea.getElementsByTagName("input");
	for (const elem of fieldsArea) {
		if (elem.type == "button") {
			elem.style = "background-color: lightGrey";
		} else {
			elem.value = "";
		}
	}
	G.editDialog.style.display = "block";
	if (words == "") {
		G.selectedWordsField.focus();
	} else if (G.additionalFieldArea.hasChildNodes()) {
		G.workField.focus();
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
			treatedWord = treatedWord.replace(/[\.,!?'"”)\]]+$/, "");
			treatedWord = treatedWord.replace(/^['"“(\[]+/, "");
			words += delimiter + treatedWord;
			delimiter = " ";
		}
	}
	return words;
}

function eDialogOK() {
	if (G.selectedWordsField.value == "") {
		if (!confirm("Keyword field is blank.  Is it OK to proceed?")) {
			return;
		}
	}
	if (G.definitionField.value == "") {
		if (!confirm("Definition field is blank.  Is it OK to proceed?")) {
			return;
		}
	}
	G.editDialog.style.display = "none";
	setDictionaries();
	let defArray = [];
	defArray.push(G.selectedWordsField.value);
	defArray.push(G.definitionField.value);
	let fieldsArea = G.additionalFieldArea.getElementsByTagName("input");
	for (const elem of fieldsArea) {
		if (elem.type == "text") {
			defArray.push(elem.value);
		}
	}
	G.wordArray.push(defArray);
	G.numWordsPanel.innerHTML = G.wordArray.length;
	setColors("R", "rgb(0, 0, 255)");
	G.saveCSVButton.disabled = false;
}

function eDialogCancel() {
	G.editDialog.style.display = "none";
	setDictionaries();
	setColors("R", "rgb(0, 0, 0)");
}

function setDictionaries() {
	if (G.dictionaryURL1.value == "") {
		G.dictionaryURL1.value = localStorage.getItem(G.localStorageKey1);
	} else {
		localStorage.setItem(G.localStorageKey1, G.dictionaryURL1.value);
	}
	if (G.dictionaryURL2.value == "") {
		G.dictionaryURL2.value = localStorage.getItem(G.localStorageKey2);
	} else {
		localStorage.setItem(G.localStorageKey2, G.dictionaryURL2.value);
	}
	if (G.dictionaryURL3.value == "") {
		G.dictionaryURL3.value = localStorage.getItem(G.localStorageKey3);
	} else {
		localStorage.setItem(G.localStorageKey3, G.dictionaryURL3.value);
	}
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

function openUpURL(target, dictionaryURL) {
	if (dictionaryURL.substr(0, 1) == "☆") {
		target = target.replaceAll(" ", "-");
		dictionaryURL = dictionaryURL.substr(1);
	}
	target = encodeURI(target);
	let url = dictionaryURL.replace("$", target);
	window.open(url);
	G.definitionField.focus();
	G.definitionField.select();
	if (G.additionalFieldArea.hasChildNodes()) {
		G.workField.focus();
	}
}

function search1() {
	openUpURL(G.selectedWordsField.value, G.dictionaryURL1.value);
}
function search2() {
	openUpURL(G.selectedWordsField.value, G.dictionaryURL2.value);
}
function search3() {
	openUpURL(G.selectedWordsField.value, G.dictionaryURL3.value);
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
//		if (e.key == "Enter")  textDialogOK();
	} else if (G.editDialog.style.display == "block") {
		if (e.key == "Escape")  eDialogCancel();
		if (e.key == "Enter") {
			if (e.ctrlKey)  search();
//			else eDialogOK();
		}
	} else {
//		if (e.key == "Enter") {
//			processWords();
//		}
	}
});
