var svg = d3.select("svg"),
  width = +svg.attr("width"),
  height = +svg.attr("height");

graph = {
  nodes: [],
  links: [],
}

var simulation = d3.layout.force()
  .size([width, height])
  .nodes(graph.nodes)
  .links(graph.links)
  .on("tick", function() {
    svg.selectAll('.link')
      .attr("x1", function (d) { return d.source.x })
      .attr("y1", function (d) { return d.source.y })
      .attr("x2", function (d) { return d.target.x })
      .attr("y2", function (d) { return d.target.y })
      
    svg.selectAll('.node')
      .attr("cx", function (d) { return d.x })
      .attr("cy", function (d) { return d.y })
      .attr("transform", function (d) {
        return "translate(" + d.x + "," + d.y + ")";
      })
  });
  
function update() {
  // update links
  var link = svg.selectAll('.link').data(graph.links);
  link.enter()
    .insert('line', '.node')
    .attr('class', 'link')
    .style('stroke', '#d9d9d9');
  link
    .exit()
    .remove()
    
  // update nodes
  var node = svg.selectAll('.node').data(graph.nodes);
  var g = node.enter()
            .append('g')
            .attr('class', 'node');
  g.append('circle')
    .attr("r", 20)
    .style("fill", "#d9d9d9");
  g.append('text')
    .attr("class", "text")
    .text(function (d) { return d.name });
  node
    .exit()
    .remove();
    
  // update simulation
  simulation
    .linkDistance(100)
    .charge(-200)
    .start();
};

function addNode(node) {
  graph.nodes.push(node);
  update();
};

function connectNodes(source, target) {
  graph.links.push({
    source: source,
    target: target,
  });
  update();
};

addNode({
  id: "you",
  name: "you",
});

let index = 1;

// add a new node every three seconds and connect to 'you'
const interval = window.setInterval(() => {
  let id = Math.random().toString(36).replace('0.','');
  id = id.slice(0,4);
  addNode({
      id: id,
      name: id
  });
  
  connectNodes(0, index);
  index++;
}, 3000);

// no more than 8 nodes
setTimeout(() => {
  clearInterval(interval)
}, 3000 * 8);