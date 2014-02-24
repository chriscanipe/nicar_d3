//The parameters for our chart space within the svg.
//The svg is where we will be drawing our chart.
//The margins give us room for things like axis labels and category names,
//and the width and height define the entire are available to us 
//LOOK TO THE svg VARIABLE TO SEE HOW THESE PARAMETERS ARE IMPLIMENTED
var margin = {
    top: 20,
    right: 20,
    bottom: 80,
    left: 140
},
    width = 600 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

//Create a global object to hold our data once loaded.
var theData;

//The x-values are on a linear because dollar$ are NUMBERICAL. Numbers are almost always on a linear scale
//The range of our chart in pixels is between 0 and the width of our chart, defined above
var x = d3.scale.linear()
    .range([0, width]);

//The y-values are on an ordinal scale, which allows us to plot CATEGORICAL datasets
//The range bounds define the height of each bar
var y = d3.scale.ordinal()
    .rangeRoundBands([0, height], .2);

//The Axis variable accounts for the axis gridline and labels
//Labels are placed according to their relative value
var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .ticks(10)
    .tickFormat(function (d, i) {
    	//Divide by 1000 so our x-axis labels are tiny
		//Add a dollar sign and "billion" to the first tick
    	if (i == 0) {
	    	return "$"+d / 1000+" billion";
    	} else {
	    	return d / 1000;
    	}
    });

//The yAxis variable accounts for the y-axis gridline and labels
var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

//The svg variable selects our '.chart' div  in the html and appends svg space for our chart
//The parameters are drawn from the margin/width/height variables defined above
var svg = d3.select(".chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//This is where we call our data
d3.csv("acquisitions.csv", type, function (error, data) {

	//Assign the data from our csv file to our global data variable so we can access it outside of this function.
	theData = data;

    //Sort function to show our bars heirarchically
    data.sort(function (a, b) {
        return parseFloat(b.price) - parseFloat(a.price)
    });

    //The domain method takes our data and splits it into its parts.
    //y is defined above as ORDINAL. Our data has five categories, so our available space is split into 5 pieces.
    y.domain(data.map(function (d) {
        return d.target_short;
    }));

    //Our x values are LINEAR, so the full range of values (price) is represented on the x-axis.
    x.domain([0, d3.max(data, function (d) {
        return d.price;
    })]);

    //"g" is an svg page element used to group objects
    //in this case, we're creating a group for our y-axis and x-axis elements
    //The translate(x,y) attribute makes the y-position of the axis the height of the graphic space, so it will sit under the chart.
    //The text attribute puts a label on the axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
      .append("text")
        .attr("y", 40)
        .attr("dy", "8px")
        .style("text-anchor", "middle")
        .attr("x", width / 2)
        .text("Price paid");

    //Do the same for the y axis
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    //".bar" doesn't exist yet but we select it anyway. (This is one of d3's more confusing methods. Just go with it)
    //The data/enter combination creates one "rect" object with the class ".bar" for each category (company) in the data
    var bar = svg.selectAll(".bar")
        .data(data)
      .enter().append("g")
        .attr("y", function (d) {
            return y(d.target_short);
        })
        .attr("height", y.rangeBand());



	//Append a rectangle to each bar grouping <g>. This is where we actually draw the bars.
	//The y positiong is the position of the category grouping we drew when we defined "bar"...
	//...it's accessible by the category value ("target_short")
	//The width is the value of the bar translated to fit the space...
	//...but we first define it as "0" in order to get the pleasing animation when the chart loads.
	//transition is where the animation happens, 1000 is the number of milliseconds it takes to play out
	//Then we define the width again, this time as the price each company was sold for.
	//Finally, we set the opacity of each bar to .5 (50%) but leave "WhatsApp" at 100% in order to emphasize it.
    bar.append("rect")
        .attr("class", "bar")
        .attr("y", function (d) {
            return y(d.target_short);
        })
        .attr("height", y.rangeBand())
        .attr("x", function (d) {
            return 0;
        })
        .attr("width", function (d) {
            return x(0);
        })
        .transition()
		.duration(1000)
		.attr("width", function (d) {
            return x(d.price);
        })
        .attr("opacity", function (d) {
            if (d.target_short == "WhatsApp") {
                return 1;
            } else {
                return .5;
            }
        })
    
    //It's always nice to label horizontal bars directly.    
    bar.append("text")
        .attr("y", function (d) {
            return y(d.target_short) + (y.rangeBand() / 2 + 4);
        })
        .attr("x", function (d) {
            return x(d.price) - 10;
        })
        .text(function (d) {
            var plainEnglish = stringVal(d.price)
            return plainEnglish;
        })
        .attr("text-anchor", "end")
        .attr("class", "label");
        
        
    //Let's add a tooltip so we can see how many employees each company had when sold
    var tooltip = d3.select(".chart")
		.append("div")
		.attr("class", "tooltip")
		.style("position", "absolute")
		.style("z-index", "10")
		.style("visibility", "hidden");

	//Here's a variable to hold our (unknown) value	
	var tooltipText = "";

	//And the mouseover logic to hide, show and populate the tooltip
	bar.on("mouseover", function(d){
			var employees = addCommas(d.employees);
			tooltipText = employees+" employees when sold"
			tooltip.text(tooltipText);
			return tooltip.style("visibility", "visible");
		})
		.on("mousemove", function(d){
			var pos = d3.mouse(this);
					
			return tooltip.style("left", (pos[0]+margin.left+20)+"px").style("top", pos[1] - 10+"px");
		})
		.on("mouseout", function(){
			return tooltip.style("visibility", "hidden");
		});
        
        
});


//A couple of simple return functions to help our labeling read as plain English
function stringVal(price) {
    var newString = "$" + (price / 1000).toFixed(1) + " billion"
    return newString;
}

function addCommas(val) {
	var format = d3.format("0,000");
	return format(val);
}

//Type function changes the price field from a string to a number.
//D3 won't be able to chart the pricing data unless it's first converted to a number
//This is just a simple return function called when we first load our data above (d3.csv(...))
function type(d) {
    d.price = parseInt(d.price);
    return d;
}