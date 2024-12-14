# Checking BRIDGES Assignment Features

1. Run all the tests in each language (using the scripts)

	a) Open each visualization. For each visualization

		(i) Check if zoom and pan works  - there are a few like line charts
			and color grid that wont have zoom/pan.
		(2) Check all buttons on right sidebar - toggle buttons for node
			and link labels, Reset view and Hide nodes/labels - these are 
			for node-link visualizations
		(3) Line charts -- mouse over the labels of each chart and make 
			sure the remaining charts are made more transparent
		(4) [User Gallery Related] Check the gallery page, both 
			after logging in and after logging out - they are different pages!
			(a) when you are logged out, it should show a tooltip on the left 
				with details of assignment; no tooltip if you are logged in
				and viewing the gallery. 
		 	(b) Make sure each assignment has an image that illustrates what 
				type of data structure/vis type it signifies

Not working, to fix:
	a) Reset View - not working
	b) Link Label -- is printed as Link Label in large font!
	c) Need to check graphs - large graphs - labels are not displayed
	e) consider modifying keys: 'n' for node labels, 'l' for link labels
	f) Hide nodes, links is not implemented on all tree structures? (not there for
		general tree)
	g) node labels are permanent in bst?
	h) bridges grid tutorials -- use a better image in gallery

