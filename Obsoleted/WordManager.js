class WordManager {
	constructor(str) {
		this.wordDict = {};
		this.excludedDict = {};
		this.wordList = [];
		this.rejectedList = {};
		this.selectedList = {}
	}
	setText(str) {
		let wl = [];
		for (let w of str.split(/[\s]+/)) {
			w = w.replace(/[\.,'"]$/, "");
			w = w.replace(/^['"]/, "");
			w = w.replace(/^[0-9]*$/, "");
			if (w == "") continue;
			wl.push(w.toLowerCase());
		}
		this.wordList = this.makeUnique(wl).filter((x) => { return !(x.toUpperCase() in this.excludedDict); });
		this.wordList.push("-- END --");		// sentinel
		this.currentPtr = 0;
	}
	makeUnique(arr) {
		let dataStore = {};
		for (const e of arr) {
			dataStore[e] = "A";
		}
		return Object.keys(dataStore);
	}
	getNextWord() {
		while(this.currentPtr < this.wordList.length) {
			let currentWord = this.wordList[this.currentPtr++];
			let upCase = currentWord.toUpperCase();
			if (upCase in this.rejectedList) continue;
			if (upCase in this.selectedList) continue;
			if (upCase in this.excludedDict) continue;
			return currentWord;
		}
		return null;
	}
	getCurrentWord() {
		return this.wordList[this.currentPtr - 2];	// 2 cuz there're 2 cards stick together
	}
	setCurrentWord(newVal) {
		let cWord = this.getCurrentWord();
		this.excludedDict[cWord.toUpperCase()] = cWord;
		this.wordList[this.currentPtr - 2] = newVal;	// 2 cuz there're 2 cards stick together
	}
	disposeCurrentWord() {
		let bptr = this.currentPtr - 2;	// 2 cuz there're 2 cards stick together
		let rWord = this.wordList[bptr];
		this.rejectedList[rWord] = "D";
		this.excludedDict[rWord.toUpperCase()] = rWord;
	}
	selectCurrentWord() {
		let bptr = this.currentPtr - 2;	// 2 cuz there're 2 cards stick together
		let sWord = this.wordList[bptr];
		this.selectedList[sWord] = "S";
		this.excludedDict[sWord.toUpperCase()] = sWord;
	}
	undo() {
		let bOffset;
		if (this.currentPtr <= 2) {
			bOffset = 2;
		} else {
			bOffset = 3;
		}
		let prevPtr = this.currentPtr - bOffset;
		let prevWord = this.wordList[prevPtr];
		delete this.selectedList[prevWord];
		delete this.rejectedList[prevWord];
		delete this.excludedDict[prevWord.toUpperCase()];
		this.currentPtr = prevPtr;
	}
}
