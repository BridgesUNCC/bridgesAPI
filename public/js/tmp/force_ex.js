
window.onload = function init() {

var width = 400, height = 300

var nodes = [
	{name: 'A'},
	{name: 'B'},
	{name: 'C'},
	{name: 'D'},
	{name: 'E'},
	{name: 'F'},
	{name: 'G'},
	{name: 'H'},
]

var links = [
	{source: 0, target: 1},
	{source: 0, target: 2},
	{source: 0, target: 3},
	{source: 1, target: 6},
	{source: 3, target: 4},
	{source: 3, target: 7},
	{source: 4, target: 5},
	{source: 4, target: 7}
]

let svg = d3.select('svg');
	attr('transform', 'translate(100, 50)')

var simulation = d3.forceSimulation(nodes)
	.force('charge', d3.forceManyBody().strength(-100))
	.force('center', d3.forceCenter(width / 2, height / 2))
	.force('link', d3.forceLink().links(links))
	.on('tick', ticked);

function updateLinks() {
	var u = d3.select('.links')
		.selectAll('line')
		.data(links)
		.join('line')
		.attr('x1', function(d) {
			return d.source.x
		})
		.attr('y1', function(d) {
			return d.source.y
		})
		.attr('x2', function(d) {
			return d.target.x
		})
		.attr('y2', function(d) {
			return d.target.y
		});
}

function updateNodes() {
	u = d3.select('.nodes')
		.selectAll('text')
		.data(nodes)
		.join('text')
		.text(function(d) {
			return d.name
		})
		.attr('x', function(d) {
			return d.x
		})
		.attr('y', function(d) {
			return d.y
		})
		.attr('dy', function(d) {
			return 5
		});
}

function ticked() {
	updateLinks()
	updateNodes()
}

}

