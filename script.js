

//The parameters for our chart space within the svg.
//The svg is where we will be drawing our chart.
//The margins give us room for things like axis labels and category names,
//and the width and height define the entire are available to us 
//LOOK TO THE svg VARIABLE TO SEE HOW THESE PARAMETERS ARE IMPLIMENTED
var margin = {top: 20, right: 20, bottom: 30, left: 60},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;


//The x-values are on an ordinal scale, which allows us to plot CATEGORICAL datasets
//The range bounds define the width of each bar
var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .2);

//The y-values are on a linear because $dollars are numerical. Numbers are usually on a linear scale
var y = d3.scale.linear()
    .range([height, 0]);

//The xAxis variable accounts for the axis gridline and labels
//Labels are placed according to their relative value
var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

//The xAxis variable accounts for the yxis gridline and labels
var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(10, "$");

//The svg variable selects our body space in the html and appends svg space for our chart
//The parameters are drawn from the margin/width/height variables defined above
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//This is where we call our data
d3.csv("acquisitions.csv", type, function(error, data) {
  
  //Sort function to show our bars heirarchically
  data.sort(function(a,b) { return parseFloat(b.price) - parseFloat(a.price) } );
  
  //The domain method takes our data and splits it into its parts.
  //x is defined above as ordinal. Our data has five categories, so our available space is split into 5 pieces.
  x.domain(data.map(function(d) { return d.company; }));
  
  //y is linear, so the full range of values (price) is represented on the y-axis.
  y.domain([0, d3.max(data, function(d) {
  	return d.price;
  })]);

  //"g" is an svg page element used to group objects
  //in this case, we're creating a group for our x-axis and y-axis elements
  //The translate(x,y) attribute makes the y-position of the axis the height of the graphic space, so it will sit under the chart.
  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  //Do the same for the y axis and add a label.
  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "8px")
      .style("text-anchor", "end")
      .text("Price paid (millions)");

  //".bar" doesn't exist yet but we select it anyway.
  //The data/enter combination creates one "rect" object with the class ".bar" for each category (company) in the data
  var bar = svg.selectAll(".bar")
      .data(data)
	  .enter().append("g")
	  .attr("x", function(d) { return x(d.company); })
	  .attr("width", x.rangeBand());
    
    bar.append("rect")
      .attr("class", "bar")
       .attr("x", function(d) { return x(d.company); })
      .attr("width", x.rangeBand())
      .attr("y", function(d) { return y(d.price); })
      .attr("height", function(d) { return height - y(d.price); });
    
    bar.append("text")
      .attr("x", function(d) { return x(d.company) + (x.rangeBand()/2); })
      .attr("y", function(d) { return y(d.price) + 20; })
      .text(function(d) {
      	var withCommas = stringVal(d.price)
      	return withCommas
      })
      .attr("text-anchor", "middle")
      .attr("class", "label");
});

function stringVal(price) {
	var newString = "$"+(price/1000).toFixed(1)+" billion"
	return newString;
}


//Type function changes the price field from a string to a number.
//D3 won't be able to chart the pricing data unless it's first converted to a number
//This is just a simple return function called when we first load our data above (d3.csv(...))
function type(d) {
  d.price = parseInt(d.price);
  return d;
}
