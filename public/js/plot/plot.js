d3.lineChart = function(vis, id, data){
  var xAxisData = data.xaxis_data
  var yAxisData = data.yaxis_data
  var myChart;
  if(data.xaxisType == true){
    var xaxisType = 'logarithmic';
  }else{
    var xaxisType = 'linear'
  }
  if(data.yaxisType == true){
      var yaxisType = 'logarithmic';
            var ymin = null; //scale the axis automatically in logscale
  }else{
      var yaxisType = 'linear'
      var ymin = 0; //in linear scale start the y axis at 0
  }


    //constructing the series to pass to hi charts from the content of the assignment.
  var series = [];
  for(let i = 0; i < yAxisData.length; i++){
    var yaxis = [];
    for(let j = 0; j < yAxisData[i].yaxis_data.length; j++){
	yaxis.push([ xAxisData[i].xaxis_data[j], yAxisData[i].yaxis_data[j] ]);
    }
    series.push({name: yAxisData[i].Plot_Name, data: yaxis});
  }


    
  // document.addEventListener('DOMContentLoaded', function () {
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
          series: series
      });
      return myChart;
  // });
}
