d3.barChart = function(vis, id, data){
    let series = [];
    for(let i = 0; i < data.yaxis_data.series.length; i++){
      series.push({name: data.yaxis_data.series[i].name, 
                     data: data.yaxis_data.series[i].data})

    }

    let barAlignment = (data.alignment.toLowerCase() == "vertical") ? "column" : "bar";

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
          valueSuffix: ''
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

      series: series
  });
  return mychart;
}
