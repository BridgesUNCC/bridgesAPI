d3.barChart = function(vis, id, data){
<<<<<<< Updated upstream
    console.log(data)

    let series = [];
    for(let i = 0; i < data.yaxis_data.series.length; i++){
      series.push({name: data.yaxis_data.series[i].name, 
                     data: data.yaxis_data.series[i].data})

    }


    let mychart = Highcharts.chart(id, {

=======
    let mychart = Highcharts.chart(id, {
>>>>>>> Stashed changes
      chart: {
          type: 'bar'
      },
      title: {
<<<<<<< Updated upstream
          text: data.plot_title,
          align: 'left'
      },
      subtitle: {
          text: data.subtitle,
          align: 'left'
      },
      xAxis: {
          categories: data.xaxis_data.xAxis.categories,
=======
          text: 'Historic World Population by Region',
          align: 'left'
      },
      subtitle: {
          text: 'Source: <a ' +
              'href="https://en.wikipedia.org/wiki/List_of_continents_and_continental_subregions_by_population"' +
              'target="_blank">Wikipedia.org</a>',
          align: 'left'
      },
      xAxis: {
          categories: ['Africa', 'America', 'Asia', 'Europe', 'Oceania'],
>>>>>>> Stashed changes
          title: {
              text: null
          }
      },
      yAxis: {
          min: 0,
          title: {
<<<<<<< Updated upstream
              text: '',
=======
              text: 'Population (millions)',
>>>>>>> Stashed changes
              align: 'high'
          },
          labels: {
              overflow: 'justify'
          }
      },
      tooltip: {
<<<<<<< Updated upstream
          valueSuffix: ''
=======
          valueSuffix: ' millions'
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
      series: series
=======
      series: [{
          name: 'Year 1990',
          data: [631, 727, 3202, 721, 26]
      }, {
          name: 'Year 2000',
          data: [814, 841, 3714, 726, 31]
      }, {
          name: 'Year 2010',
          data: [1044, 944, 4170, 735, 40]
      }, {
          name: 'Year 2018',
          data: [1276, 1007, 4561, 746, 42]
      }]
>>>>>>> Stashed changes
  });
    return mychart;
}
