
var w = 1000,
    h = 1000,
    fill = d3.scale.category20();

var color = d3.scale.ordinal()
    .domain([0,1,2,3,4,5,6,7,8,9,10,11,12])
    .range(["#1f77b4","#aec7e8","#ff7f0e","#ffbb78","#2ca02c","#98df8a","#d62728","#ff9896","#9467bd","#c5b0d5","#8c564b",
      "#c49c94","#e377c2"]);

var vis = d3.select("#chart")
  .append("svg:svg")
    .attr("width", w)
    .attr("height", h);

// parameters for the force algorithm
d3.json("braingraph_lessconnect.json", function(json) {
  var force = d3.layout.force()
      .charge(-200)
      .linkDistance(100)
      .gravity(0.05)
      .nodes(json.nodes)
      .links(json.links)
      .size([w, h])
      .start();

  // define the edges
  var link = vis.selectAll("line.link")
      .data(json.links)
    .enter().append("svg:line")
      .attr("class", "link")
      .style("stroke-width", function(d) { return -Math.log(d.weight*10)*0.2; })
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; })
      .style("stroke", "#999");//function(d) {return fill(d.bb);})
      

  // draw nodes as circles
  var node = vis.selectAll("circle.node")
      .data(json.nodes)
    .enter().append("svg:circle")
      .attr("class", "node")
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; })
      .attr("r", function(d) { return Math.sqrt(d.degree)*2; })
      .style("fill", function(d) { return color(d.hemisphere); })
      .style("stroke-width",function(d) {return d.ctx?1:5;})
      .style("stroke",function(d) {return d.ctx?"#fff":"#ffa500";})
      .call(force.drag).on("mouseover",fade(.1)).on("mouseout", fade(1));

  //labels of the nodes
  var texts = vis.selectAll("text.label")
    .data(json.nodes)
    .enter().append("svg:text")
    .attr("class", "label")
    .attr("fill", "black")
    .style("text-anchor", "middle")
    .style("font-size", "14px")
    .text(function(d) {  return d.name;  }) //d.name or d.lobesnames
    .call(force.drag).on("mouseover",fade(.1)).on("mouseout", fade(1));

  //show node number when the mouse stays on the node
  node.append("svg:title")
      .text(function(d) { return d.id; });


  vis.style("opacity", 1e-6)
    .transition()
      .duration(1000)
      .style("opacity", 0.9);

  // define what to do when dragging the nodes
  force.on("tick", function() {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });

    texts.attr("transform", function(d) {
        return "translate(" + d.x + "," + d.y + ")";});
  });

  //functions needed for handling the opacity effect
  var linkedByIndex = {};
  json.links.forEach(function(d) {
        linkedByIndex[d.source.index + "," + d.target.index] = 1;
  });

  function isConnected(a, b) {
        return linkedByIndex[a.index + "," + b.index] || linkedByIndex[b.index + "," + a.index] || a.index == b.index;
  }

  function fade(opacity) {
        return function(d) {
            node.style("stroke-opacity", function(o) {
                thisOpacity = isConnected(d, o) ? 1 : opacity;
                this.setAttribute('fill-opacity', thisOpacity);
                return thisOpacity;
            });
            texts.style("stroke-opacity", function(o) {
                thisOpacity = isConnected(d, o) ? 1 : opacity;
                this.setAttribute('fill-opacity', thisOpacity);
                return thisOpacity;
            });
            link.style("stroke-opacity", opacity).style("stroke-opacity", function(o) {
                return o.source === d || o.target === d ? 1 : opacity;
            });
        };
  }

});
