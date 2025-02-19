/**
 * Determines and returns the appropriate visualization type based on the provided assignment type.
 * @param {string} toCheck - The assignment type to check.
 * @returns {string} The corresponding visualization type. Defaults to "nodelink" if no match is found.
 */
exports.getVisType = function(toCheck) {
  var validTypes = {
    "ALIST":           						"Alist",
    "Array":           						"Alist",
    "Array_Stack":     						"Alist",
    "Array_Queue":     						"Alist",
    "LinkedListStack": 						"nodelink",
    "LinkedListQueue": 						"nodelink",

    "SinglyLinkedList":						"nodelink",//"llist",
    "llist":           						"nodelink",//"llist",
    "DoublyLinkedList":						"nodelink",//"dllist",
    "dllist":          						"nodelink",//"dllist",
    "CircularSinglyLinkedList": 	"nodelink",//"cllist",
    "CircularDoublyLinkedList": 	"nodelink",//"cdllist",

    "tree":                       "tree",
    "Tree":                       "tree",
    "BinaryTree":                 "tree",
    "BinarySearchTree":           "tree",
    "AVLTree":                    "tree",
    "KdTree":                     "tree",
    "QuadTree":                   "tree",
    "BTree":                      "tree",
    "B+Tree":                     "tree",

    "GraphAdjacencyList":  				"nodelink",
    "GraphAdjacencyMatrix":				"nodelink",
    "largegraph":                 "graph-webgl",

    "ColorGrid":                  "grid",

   "SymbolCollection":           "collection",
   "SymbolCollectionV2":           "collectionv2",

    "LineChart":                       "LineChart",
    "BarChart":                   "BarChart",

    "Audio":         				"Audio",
    "Scene":                "scene",
    "Map":  "Map"
  };
    if( toCheck && validTypes[toCheck] )
      return validTypes[toCheck];
    else if( toCheck && validTypes[toCheck.toString().toUpperCase()] )
      return validTypes[toCheck.toString().toUpperCase()];
    else
        return "nodelink";
};

/**
 * Checks if the data has dimensions defined and returns the appropriate visualization type for arrays.
 * @param {object} data - The data object containing dimension information.
 * @returns {string} The corresponding visualization type for arrays ("Array2D", "Array3D", or "Alist").
 */
var checkIfHasDims = function (data){
    if(data.dims && Array.isArray(data.dims)){
        if(parseInt(data.dims[1]) > 1 && parseInt(data.dims[2]) == 1){
            return data.vistype = "Array2D";
        } else if(parseInt(data.dims[1]) > 1 && parseInt(data.dims[2]) > 1){
            return data.vistype = "Array3D";
        } else {
            return "Alist";
        }
    }
    return "Alist";
};

exports.checkIfHasDims = checkIfHasDims;

/**
 * Returns an object containing visualization information (vistype, script, and link)
 * based on the provided data's vistype.
 * @param {object} data - The data object containing the vistype.
 * @returns {object} An object with vistype, script, and link properties.
 */
exports.getVisTypeObject = function(data) {
  var validTypes = {
      "nodelink": {
        "vistype":"nodelink",
        "script":"/js/graph.js",
        "link":""
      },
      "nodelink-canvas": {
        "vistype":"nodelink-canvas",
        "script":"/js/graph-canvas.js",
        "link":""
      },
      "graph-webgl": {
          "vistype":"graph-webgl",
          "script":"/js/graph-webgl.js",
          "link":""
      },
      "grid": {
        "vistype":"grid",
        "script":"/js/grid.js",
        "link":""
      },
      "collection": {
        "vistype":"collection",
        "script":"/js/collection.js",
        "link":""
      },
      "collectionv2": {
        "vistype":"collectionv2",
        "script":"/js/collectionv2.js",
        "link":""
      },
      "tree": {
        "vistype":"tree",
        "script":"/js/tree/lib/bst.js",
        "link":"/css/vis/tree.css"
      },
      "queue": {
        "vistype":"queue",
        "script":"/js/queue.js",
        "link":""
      },
      "Alist": {
        "vistype":"Alist",
        "script":"/js/array/array.js",
        "link":""
      },
      "Array2D": {
        "vistype":"Array2D",
        "script":"/js/array/array2d.js",
        "link":""
      },
      "Array3D": {
        "vistype":"Array3D",
        "script":"/js/array/array3d.js",
        "link":""
      },
      // "llist": {
      //   "vistype":"llist",
      //   "script":"/js/list/llist.js",
      //   "link":""
      // },
      // "dllist": {
      //   "vistype":"dllist",
      //   "script":"/js/list/dllist.js",
      //   "link":""
      // },
      // "cllist": {
      //   "vistype":"cllist",
      //   "script":"/js/list/cllist.js",
      //   "link":""
      // },
      // "cdllist": {
      //   "vistype":"cdllist",
      //   "script":"/js/list/cdllist.js",
      //   "link":""
      // },
      "llist": {
        "vistype":"nodelink",
        "script":"/js/graph.js",
        "link":""
      },
      "dllist": {
        "vistype":"nodelink",
        "script":"/js/graph.js",
        "link":""
      },
      "cllist": {
        "vistype":"nodelink",
        "script":"/js/graph.js",
        "link":""
      },
      "cdllist": {
        "vistype":"nodelink",
        "script":"/js/graph.js",
        "link":""
      },
      "LineChart": {
        "vistype": "LineChart",
        "script":"/js/plot/plot.js",
        "link":""
      },
      "BarChart":{
        "vistype": "BarChart",
        "script": "/js/plot/barchart.js",
        "link": ""
      },
      "Audio": {
      	"vistype": "Audio",
      	"script": "/js/audio/audio.js",
      	"link": ""
      },
      "scene":{
        "vistype": "scene",
        "script": "/js/scene.js",
        "link":""
      },
      "Map":{
        "vistype": "Map",
        "script": "",
        "link": ""
      }
    };

    if(data.vistype == "Alist")
        return validTypes[checkIfHasDims(data)];
    else if( data.vistype && validTypes[data.vistype] )
        return validTypes[data.vistype];
    else
        return {"vistype":"nodelink",   "script":"/js/graph.js",          "link":""                  	};

};
