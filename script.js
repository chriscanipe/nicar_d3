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



var theData;
var toggle = false;

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
    .tickFormat(function (d) {
        return d / 1000;
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
        });

    bar.append("text")
        .attr("y", function (d) {
            return y(d.target_short) + (y.rangeBand() / 2);
        })
        .attr("x", function (d) {
            return x(d.price) - 10
        })
        .text(function (d) {
            var plainEnglish = stringVal(d.price)
            return plainEnglish;
        })
        .attr("text-anchor", "end")
        .attr("class", "label");
});



function stringVal(price) {
    var newString = "$" + (price / 1000).toFixed(1) + " billion"
    return newString;
}


//Type function changes the price field from a string to a number.
//D3 won't be able to chart the pricing data unless it's first converted to a number
//This is just a simple return function called when we first load our data above (d3.csv(...))
function type(d) {
    d.price = parseInt(d.price);
    return d;
}