d3.barChart = function(vis, id, data) {

	let barchart_data = [];
	for (let i = 0; i < data.yaxis_data.series.length; i++) {
		barchart_data.push({name: data.yaxis_data.series[i].name,
				data: data.yaxis_data.series[i].data})
	}

	// set alignment of bar chart
	let barAlignment = (data.alignment.toLowerCase() == "vertical") ? "column" : "bar";

	// create the High Charts bar chart object with options
	let mychart = Highcharts.chart(id, {
			chart: {
				type: barAlignment
			},
			title: {
				text: data.plot_title,
				align: 'left'
			},
			subtitle: {
				text: data.subtitle,
				align: 'left'
			},
			xAxis: {
				categories: data.xaxis_data.xAxis.categories,
				title: {
					text: data.xLabel
				}
			},
			yAxis: {
				min: 0,
				title: {
					text: data.yLabel,
					align: 'high'
				},
				labels: {
					overflow: 'justify'
				}
			},
			tooltip: {
				valueSuffix: data.tooltipSuffix
			},
			plotOptions: {
				bar: {
					dataLabels: {
						enabled: true
					}
				}
			},
			legend: {
				layout: 'vertical',
				align: 'right',
				verticalAlign: 'top',
				x: -40,
				y: 80,
				floating: true,
				borderWidth: 1,
				backgroundColor:
				Highcharts.defaultOptions.legend.backgroundColor || '#FFFFFF',
				shadow: true
			},
			credits: {
				enabled: false
			},

			series: barchart_data
	});
	return mychart;
}
