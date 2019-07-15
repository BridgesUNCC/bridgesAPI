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
  }else{
    var yaxisType = 'linear'
  }


    
  var a = xAxisData[0].xaxis_data.concat(xAxisData[1].xaxis_data)
  for(var i=0; i<a.length; ++i) {
      for(var j=i+1; j<a.length; ++j) {
          if(a[i] === a[j])
              a.splice(j--, 1);
      }
  }

  var series = [];
  for(let i = 0; i < yAxisData.length; i++){
    var yaxis = [];
    for(let j = 0; j < yAxisData[i].yaxis_data.length; j++){
      yaxis.push([decimal(xAxisData[i].xaxis_data[j]), decimal(yAxisData[i].yaxis_data[j])]);
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
            min: 0
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
