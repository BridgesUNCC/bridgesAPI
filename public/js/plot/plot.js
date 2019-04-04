function chart(vis, id, data){

  var series = [];
  for(let i = 0; i < data.plots.length; i++){
    var yaxis = [];
    for(let j = 0; j < data.plots[i].yaxis_data.length; j++){
      yaxis.push(parseInt(data.plots[i].yaxis_data[j]));
    }
    series.push({name: data.plots[i].Plot_Name, data: yaxis});
  }

  document.addEventListener('DOMContentLoaded', function () {
      var myChart = Highcharts.chart(id, {
          chart: {
            type: 'line'
          },
          title: {
            text: data.plot_title
          },
          subtitle: {
            text: 'Test Visualization'
          },
          xAxis: {
            categories: data.xaxis_data
          },
          yAxis: {
            title: {
              text: 'RunTime (Milliseconds)'
            },
            min: 0
          },
          plotOptions: {
            line: {
              dataLabels: {
                enabled: true
              },
              enableMouseTracking: false
            }
          },
          series: series
      });
  });
}
