class GlobalManager {
	constructor() {
		this.fileInput = document.getElementById("FileInput");
		this.saveButton = document.getElementById("SaveButton");
		this.saveCSVButton = document.getElementById("SaveCSVButton");
		this.tableFrame = document.getElementById("TableFrame");
		this.editDialog = document.getElementById("EditDialog");
		this.editDialogContent = document.getElementById("EditDialogContent");
		this.searchSection = document.getElementById("SearchSection");
		this.keyField = document.getElementById("KeyField");
		this.entryField = document.getElementById("EntryField");
		this.urlField = document.getElementById("URLField");
		this.searchButton = document.getElementById("SearchButton");
		this.sessionLink = document.getElementById("SessionLink");
		this.saveDialog = document.getElementById("SaveDialog");
		this.saveDialogContent = document.getElementById("SaveDialogContent");
		this.deckName = document.getElementById("DeckName");
		this.modelSelector = document.getElementById("ModelSelector");
		this.fieldSelector = document.getElementById("FieldSelector");
		this.frontId = document.getElementById("frontId");
		this.backId = document.getElementById("backId");
		this.deck = null;
		this.package = null;
		this.modelManager = new ModelManager();
		this.d2arr = [];
		this.localStorageKey = "searchURL";
		this.defaultSearchURL = "https://ejje.weblio.jp/content/$";
	}
}

var SQL;
initSqlJs().then(function (sql) {
	SQL = sql;
});


let G = new GlobalManager();
if (localStorage.getItem(G.localStorageKey) == null) {
	localStorage.setItem(G.localStorageKey, G.defaultSearchURL);
}

G.fileInput.addEventListener("change", (e) => {
	const file = e.target.files[0];
	if (!file) {
		G.tableFrame.innerHTML = "";
		return;
	}
	readFile(file);
});

G.saveButton.addEventListener("click", (e) => {
	if (G.d2arr.length == 0)  return;
	let colSize = getMaxColSize(G.d2arr);
	if (colSize == 2) {
		G.fieldSelector.hidden = true;
	} else {
		G.frontId.innerHTML = "";
		G.backId.innerHTML = "";
		for (let i = 1; i <= colSize; i++) {
			let optf = document.createElement("option");
			optf.value = i;
			optf.text = i;
			G.frontId.appendChild(optf);
			let optb = document.createElement("option");
			optb.value = i;
			optb.text = i;
			G.backId.appendChild(optb);
		}
		G.fieldSelector.hidden = false;
	}
	for (let model of G.modelManager.listModels()) {
		let opt = document.createElement("option");
		opt.value = model;
		opt.text = model;
		G.modelSelector.appendChild(opt);
	}
	G.saveDialog.style.display = "block";
});

G.saveCSVButton.addEventListener("click", (e) => {
	const csvData = Papa.unparse(G.d2arr)
	const blob = new Blob([csvData], { type: 'text/csv' })
	const link = document.createElement('a')
	link.href = window.URL.createObjectURL(blob)
	link.download = 'output.csv'
	link.click()
});

function saveDialogOK() {
	if (G.deckName.value == "") {
		alert("Enter Deck name.");
		return;
	}
	G.deck = new Deck(Date.now(), G.deckName.value);
	let mm = G.modelManager.getModel(G.modelSelector.value,
		Date.now());
	G.package = new Package();
	for (const row of G.d2arr) {
		if (row.length == 2) {
			addCard(row[0], row[1], mm);
		} else {
			addCard(row[G.frontId.value-1], row[G.backId.value-1], mm);
		}
	}
	G.package.addDeck(G.deck)
	G.package.writeToFile('deck.apkg')
	G.saveDialog.style.display = "none";
}

function saveDialogCancel() {
	G.saveDialog.style.display = "none";
}

function addCard(frontCard, backCard, mm) {
	if ((frontCard == "") || (backCard == "")) {
		alert("Front: '" + frontCard + "' with Back: '" + backCard + "' / skipped.");
		return;
	}
	G.deck.addNote(mm.note([frontCard, backCard]));
}


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
	};
	reader.readAsText(file);
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
	if (G.urlField.value == "") {
		G.urlField.value = localStorage.getItem(G.localStorageKey);
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
	localStorage.setItem(G.localStorageKey, G.urlField.value);
	G.editDialog.style.display = "none";
}

function editDialogCancel() {
	G.editDialog.style.display = "none";
}
