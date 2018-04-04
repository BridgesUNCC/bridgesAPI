
// This module accepts the vistype sent by the client
//    and returns the appropriate visualization type to display
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

    "tree":            						"tree",
    "Tree":            						"tree",
    "BinaryTree":      						"tree",
    "BinarySearchTree":						"tree",
    "AVLTree":         						"tree",

    "GraphAdjacencyList":  				"nodelink",
    "GraphAdjacencyMatrix":				"nodelink",

    "ColorGrid":                  "grid"
  };
    if( toCheck && validTypes[toCheck] )
      return validTypes[toCheck];
    else if( toCheck && validTypes[toCheck.toString().toUpperCase()] )
      return validTypes[toCheck.toString().toUpperCase()];
    else
        return "nodelink";
};

var checkIfHasDims = function (data){
    if(data.dims){
        if(parseInt(data.dims[1]) > 1 && parseInt(data.dims[2]) == 1){
            return data.visType = "Array2D";
        }else if(parseInt(data.dims[1]) > 1 && parseInt(data.dims[2]) > 1){
            return data.visType = "Array3D";
        }else{
            return "Alist";
        }
    }
    return "Alist"
};exports.checkIfHasDims = checkIfHasDims;

exports.getVisTypeObject = function(data) {
  var validTypes = {
      "nodelink": {
        "vistype":"nodelink",
        "script":"/js/graph.js",
        "link":""
      },
      "grid": {
        "vistype":"grid",
        "script":"/js/grid.js",
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
      }
    };

    if(data.visType == "Alist")
        return validTypes[checkIfHasDims(data)];
    else if( data.visType && validTypes[data.visType] )
        return validTypes[data.visType];
    else
        return {"vistype":"nodelink",   "script":"/js/graph.js",          "link":""                  	};

};
