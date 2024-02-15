class WordManager {
	constructor(str) {
		this.wordDict = {};
		for (let w of str.split(/[\s]+/)) {
			w = w.replace(/\.$/, "");
			if (w == "") continue;
			this.wordDict[w] = "W";
		}
		this.wordList = Object.keys(this.wordDict);
		this.wordList.push("-- END --");		// sentinel
		this.currentPtr = 0;
		this.rejectedList = {};
		this.selectedList = {};
	}
	getNextWord() {
		while(this.currentPtr < this.wordList.length) {
			let currentWord = this.wordList[this.currentPtr++];
			if (currentWord in this.rejectedList) continue;
			if (currentWord in this.selectedList) continue;
			return currentWord;
		}
		return null;
	}
	getCurrentWord() {
		return this.wordList[this.currentPtr - 2];	// 2 cuz there're 2 cards stick together
	}
	setCurrentWord(newVal) {
		this.wordList[this.currentPtr - 2] = newVal;	// 2 cuz there're 2 cards stick together
	}
	disposeCurrentWord() {
		let bptr = this.currentPtr - 2;	// 2 cuz there're 2 cards stick together
		this.rejectedList[this.wordList[bptr]] = "Y";
	}
	selectCurrentWord() {
		let bptr = this.currentPtr - 2;	// 2 cuz there're 2 cards stick together
		this.selectedList[this.wordList[bptr]] = "Y";
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
		this.currentPtr = prevPtr;
	}
}
