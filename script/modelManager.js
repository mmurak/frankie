class ModelManager {
	constructor() {
		this.modelDatabase = {
			"Basic (and reversed card)":
			{
				name: "Basic (and reversed card)",
				id: "",
				flds: [
					{ name: "Front" },
					{ name: "Back" }
				],
				req: [
					[ 0, "all", [ 0 ] ],
					[ 1, "all", [ 1 ] ]
				],
				tmpls: [
					{
						name: "Card 1",
						qfmt: "{{Front}}",
						afmt: "{{FrontSide}}\n\n<hr id=answer>\n\n{{Back}}",
					},
					{
						name: "Card 2",
						qfmt: "{{Back}}",
						afmt: "{{FrontSide}}\n\n<hr id=answer>\n\n{{Front}}",
					}
				],
			},

			"Basic":
			{
				name: "Basic",
				id: "0",
				flds: [
					{ name: "Front" },
					{ name: "Back" }
				],
				req: [
					[0, "all", [0]],
				],
				tmpls: [
					{
						name: "Card 1",
						qfmt: "{{Front}}",
						afmt: "{{FrontSide}}\n\n<hr id=answer>\n\n{{Back}}",
					}
				],
			},
		};
	}
	listModels() {
		return Object.keys(this.modelDatabase);
	}
	getModel(modelName, oid) {
		let model = this.modelDatabase[modelName];
		model.id = oid;
		return new Model(model);
	}
}
