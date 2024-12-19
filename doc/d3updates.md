# List of changes to update d3js from 4.1.2 to 7.9.0

Fr reference, you can find previous documentations of d3 at https://devdocs.io/d3~6/ you can change the url for previous versions.

1. Category color object -- only scheme10 supported. Was using scheme20
(was being used in ??)

2. Mouse interaction - the callback function takes two parameters now. For 
instance, 
a) nodes.on("mouseover", function (evt, d), where evt is the mouse event - can
get x, y coords for instance and the second is optional to pass data - for
instance, check array object -- mouseover will show the values of the array
elements.

b). d3.event does not exist. The tooltip and mouse event code in the 
array files and BridgesVisualizer has been modified. Instead of d3.event, just use event. Seem to be documented nowhere!

Zoom Interaction Fixes:

a) Zoom callback function must use evt as parameter.  As in
 function zoomed (evt) {
	svgGroup.attr("transform", evt.transform);
 }

b) Same issues fixed in array (1d, 2d, 3d), tree (bst.js), shape collection
(collectionv2.js, which is the one that is being used)


3. graph.js, graph-canvas.js -- for the link force (force directed layout code), the link's source and target fields need to be integers, as it indexes into thenode list. So we have converted the strings that are coming in from the JSON input to integers.

4. Gallery Code: 
Gallery code is done in index.js (horrible name), gallery/{gallery.js, user_gallery.js}

The mouse functions were modified - they take in the event and a datum as arguments. The index of the object array is  no longer passed as an argument. Instead, we generate
the index using d3.range() and then use that to iterate over the elements.


5. Note. All of the lists are implemented using graphs. There is completely 
	unused code under the list folder that must have been an earlier version!

6. Reset view -- was not working, fixed, was a mouse event and the event had to be passed as argument to the reset() method (in multivisconfig.js)
