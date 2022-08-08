const lexer = [{
	type: "blockquote",
	raw: ">>> three\n>\n> 1\n>\n>  1\n> > 2\n> > > 3\n> > > > 4",
	tokens: [
		{
			type: "blockquote",
			raw: ">> three\n\n",
			tokens: [{
				type: "blockquote",
				raw: "> three\n",
				tokens: [{
					type: "paragraph",
					raw: "three\n",
					text: "three",
					tokens: [{
						type: "text",
						raw: "three",
						text: "three"
					}]
				}],
				text: "three\n"
			}],
			text: "> three\n"
		},
		{
			type: "paragraph",
			raw: "1",
			text: "1",
			tokens: [{
				type: "text",
				raw: "1",
				text: "1"
			}]
		},
		{
			type: "space",
			raw: "\n\n"
		},
		{
			type: "paragraph",
			raw: " 1\n",
			text: " 1",
			tokens: [{
				type: "text",
				raw: " 1",
				text: " 1"
			}]
		},
		{
			type: "blockquote",
			raw: "> 2\n> > 3\n> > > 4",
			tokens: [
				{
					type: "paragraph",
					raw: "2\n",
					text: "2",
					tokens: [{
						type: "text",
						raw: "2",
						text: "2"
					}]
				},
				{
					type: "blockquote",
					raw: "> 3\n> > 4",
					tokens: [
						{
							type: "paragraph",
							raw: "3\n",
							text: "3",
							tokens: [{
								type: "text",
								raw: "3",
								text: "3"
							}]
						},
						{
							type: "blockquote",
							raw: "> 4",
							tokens: [{
								type: "paragraph",
								raw: "4",
								text: "4",
								tokens: [{
									type: "text",
									raw: "4",
									text: "4"
								}]
							}],
							text: "4"
						}],
					text: "3\n> 4"
				}
			],
			text: "2\n> 3\n> > 4"
		}
	],
	text: ">> three\n\n1\n\n 1\n> 2\n> > 3\n> > > 4"
}]
