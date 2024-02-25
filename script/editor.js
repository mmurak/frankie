class GlobalManager {
	constructor() {
		this.fileInput = document.getElementById("FileInput");
		this.saveCSVButton = document.getElementById("SaveCSVButton");
		this.tableFrame = document.getElementById("TableFrame");
		this.editDialog = document.getElementById("EditDialog");
		this.editDialogContent = document.getElementById("EditDialogContent");
		this.searchSection = document.getElementById("SearchSection");
		this.keyField = document.getElementById("KeyField");
		this.entryField = document.getElementById("EntryField");
		this.dictionaryURL1 = document.getElementById("DictionaryURL1");
		this.dictionaryURL2 = document.getElementById("DictionaryURL2");
		this.dictionaryURL3 = document.getElementById("DictionaryURL3");
		this.sessionLink = document.getElementById("SessionLink");
		this.d2arr = [];
		this.localStorageKey1 = "searchURL1";
		this.localStorageKey2 = "searchURL2";
		this.localStorageKey3 = "searchURL3";
		this.defaultSearchURL1 = "https://ejje.weblio.jp/content/$";
		this.defaultSearchURL2 = "☆https://www.collinsdictionary.com/dictionary/english/$";
		this.defaultSearchURL3 = "☆https://dictionary.cambridge.org/dictionary/english/$";
		this.newDataButton = document.getElementById("NewDataButton");
	}
}

let G = new GlobalManager();
checkSearchURL();

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


G.fileInput.addEventListener("change", (e) => {
	const file = e.target.files[0];
	if (!file) {
		G.tableFrame.innerHTML = "";
		return;
	}
	readFile(file);
});


G.saveCSVButton.addEventListener("click", (e) => {
	const csvData = Papa.unparse(G.d2arr)
	const blob = new Blob([csvData], { type: 'text/csv' })
	const link = document.createElement('a')
	link.href = window.URL.createObjectURL(blob)
	link.download = 'output.csv'
	link.click()
});

function readFile(file) {
	const reader = new FileReader();
	reader.onload = (e) => {
		G.d2arr = Papa.parse(e.target.result).data;
		G.d2arr = G.d2arr.filter((e) => {
			let flag = false;
			for (let i of e) {
				if (i != []) flag = true;
			}
			if (flag) {
				return e;
			} else {
				return null;
			}
		});
		let maxCol = getMaxColSize(G.d2arr);
		maxCol = (maxCol < 2) ? 2 : maxCol;		// minimum 2 columns
		G.d2arr = G.d2arr.map((row) => { return regulariseSize(row, maxCol); });
		makeUpView();
		G.fileInput.disabled = true;
	};
	reader.readAsText(file);
}

function makeUpView() {
		G.tableFrame.innerHTML = "";
		// header line should be here
		let rowCount = 0;
		for (let row of G.d2arr) {
			if (row.filter((e) => { return e != ""; }).length == 0)  continue;
			let colCount = 0;
			let tr = document.createElement("tr");
			for (let col of row) {
				let td = document.createElement("td");
				td.innerHTML = col.trim();
				td.id = "R" + rowCount + "C" + colCount;
				td.addEventListener("click", (e) => { cellClicked(td.id); });
				colCount++;
				tr.appendChild(td);
			}
			rowCount++;
			G.tableFrame.appendChild(tr);
		}
}

function regulariseSize(row, maxCol) {
	while (row.length < maxCol) {
		row.push("");
	}
	return row;
}

function getMaxColSize(array) {
	let maxCol = 0;
	array.map((line) => { maxCol = (maxCol < line.length) ? line.length : maxCol; });
	return maxCol;
}

function cellClicked(id) {
	G.sessionLink.innerHTML = id;
	let m = id.match(/^R(\d+)C(\d+)$/);
	G.keyField.value = G.tableFrame.rows[m[1]].cells[0].innerHTML;
	G.entryField.value = G.tableFrame.rows[m[1]].cells[m[2]].innerHTML;

	if (G.dictionaryURL1.value == "") {
		G.dictionaryURL1.value = localStorage.getItem(G.localStorageKey1);
	}
	if (G.dictionaryURL2.value == "") {
		G.dictionaryURL2.value = localStorage.getItem(G.localStorageKey2);
	}
	if (G.dictionaryURL3.value == "") {
		G.dictionaryURL3.value = localStorage.getItem(G.localStorageKey3);
	}

	if (m[2] == 0) {
		G.searchSection.hidden = true;
	} else {
		G.searchSection.hidden = false;
	}
	G.editDialog.style.display = "block";
	G.entryField.focus();
	G.entryField.select();
}

function searchEntry() {
	let target = encodeURI(G.keyField.value);
	let url = G.urlField.value.replace("$", target);
	window.open(url);
	G.entryField.focus();
	G.entryField.select();
}

function editDialogOK() {
	let m = G.sessionLink.innerHTML.match(/^R(\d+)C(\d+)$/);
	if (G.entryField.value == "") {
		alert("Blank is not allowed.");
		return;
	}
	G.tableFrame.rows[m[1]].cells[m[2]].innerHTML = G.entryField.value;
	G.d2arr[m[1]][m[2]] = G.entryField.value;
	setDictionaries();
	G.editDialog.style.display = "none";
}

function editDialogCancel() {
	G.editDialog.style.display = "none";
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
}

function search1() {
	openUpURL(G.keyField.value, G.dictionaryURL1.value);
}
function search2() {
	openUpURL(G.keyField.value, G.dictionaryURL2.value);
}
function search3() {
	openUpURL(G.keyField.value, G.dictionaryURL3.value);
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

function newData() {
	let colSize = getMaxColSize(G.d2arr);
	if (colSize == 0) {
		let colN = prompt("Enter number of columns");
		if (colN == null || !colN.match(/^\d+$/)) return;
		colSize = colN;
	}
	let line = [];
	for (let i = 0; i < colSize; i++) {
		line.push("-");
	}
	G.d2arr.push(line);
	makeUpView();
	cellClicked("R" + (G.d2arr.length-1) + "C0");
}

function deleteEntry() {
	if (confirm("Do you really wish to delete this entry? :") == null) return;
	const result = G.sessionLink.innerHTML.match(/^R(\d+)C/);
	const row = result[1];
	console.log(row);
	G.d2arr.splice(row, 1);
	makeUpView();
	editDialogCancel();
}
