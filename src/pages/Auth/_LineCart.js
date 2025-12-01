import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import ChartJS from 'chart.js/auto';

const LineChart = ({ data }) => {
  const [chartData, setChartData] = useState(data);

  const options = {
    scales: {
      yAxes: [
        {
          ticks: {
            beginAtZero: true,
          },
        },
      ],
    },
    plugins: {
      legend: {
        display: false, // Hide the dataset label
      },
    },
  };

  useEffect(() => {
    console.log(data,"data")
    setChartData(data);
  }, [data]);

  const OnChange = (value) => {
    console.log(value, 31)
  }

  return (
    <div>
      {chartData ? (
        <Line data={chartData} options={options} onChange={() => OnChange()} />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default LineChart;
