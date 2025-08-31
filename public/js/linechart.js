d3.lineChart = function(vis, id, data){
	let xAxisData = data.xaxis_data
	let yAxisData = data.yaxis_data
	let myChart, xaxisType, yaxisType, ymin;

	// set axistypes and start values
	if (data.xaxisType == true)
		xaxisType = 'logarithmic';
	else
    	xaxisType = 'linear'

	if (data.yaxisType == true) {
		yaxisType = 'logarithmic';
		ymin = null; //scale the axis automatically in logscale
  	}
	else {
		yaxisType = 'linear'
		ymin = 0; //in linear scale start the y axis at 0
	}


	// Constructing the plots to pass to hi charts from assignment
	// Note plot data can contain multiple graphs

	let plot_data = []; // contains the entire plot data
	for (let i = 0; i < yAxisData.length; i++) {
		let a_plot = [];    // contains data for a single graph
		for (let j = 0; j < yAxisData[i].yaxis_data.length; j++) {
			a_plot.push([ xAxisData[i].xaxis_data[j], yAxisData[i].yaxis_data[j] ]);
		}
	    let plot_series_object = 	    {name: yAxisData[i].Plot_Name, data: a_plot};
	    if (data.linewidth) {
		if (yAxisData[i].Plot_Name in data.linewidth) {
		    plot_series_object["lineWidth"] = data.linewidth[yAxisData[i].Plot_Name];
		}
	    }
		// add to the plot series
		plot_data.push(plot_series_object);
	}

    
	// create the High Charts object, set options

	// Note: Colors are defaulting to the first 10 specified by HighCharts
	// Can set our own set of colors if we need more than 10 through the colors
	// option  in the object
	myChart = Highcharts.chart(id, {
		chart: {
			type: 'line'
		},
		title: {
			text: data.plot_title
		},
		subtitle: {
			text: data.subtitle
		},
		xAxis: {
			title: {
				text: data.xLabel
			},
			minPadding: 0.05,
			maxPadding: 0.05,
			type: xaxisType
		},
		yAxis: {
			title: {
				text: data.yLabel
			},
			type: yaxisType,
			min: ymin
		},
		tooltip: {
			headerFormat: '<b>{series.name}</b><br>',
		},
		plotOptions: {
			line: {
				dataLabels: {
					enabled: data.options.dataLabels
				},
				enableMouseTracking: data.options.mouseTracking
			}
		},
		series: plot_data
	});

	return myChart;
}
