# List of changes to update d3js from 4.1.2 to 7.9.0

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

4. [To Fix:] The gallery interaction functions (mouseover, mouseout) are not working. The gallery container is coming back with the divs corresponding to each 
assignment, but the index in the event handler is not getting the index into the assignment and fails as a result to display the meta data of each assignment.

5. Need to look at Webgl code


