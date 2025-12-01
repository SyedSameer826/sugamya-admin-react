import React from 'react';
import { Line } from 'react-chartjs-2';

const LineChartWithoutAxis = ({isUp,points}) => {
    const data = {
      labels: ['Label 1', 'Label 2', 'Label 3', 'Label 4', 'Label 5'],
      datasets: [
        {
          label: '',
          data: points ?? [70, 50,20,10,5,2,1], //[50, 30, 40, 20, 60], // Example data, replace with your own values
          fill: false,
          borderColor: isUp ? "#1EB564" : ' #D02626',
          borderWidth: 2,
          pointRadius: 0, // Set to 0 to hide points
        },
      ],
    };
  
    const options = {
      scales: {
        x: {
          display: false, // Hide x-axis
        },
        y: {
          display: false, // Hide y-axis
        },
      },
      plugins: {
        legend: {
          display: false, // Hide legend
        },
      },
      elements: {
        line: {
          tension: 0.5, // Disable bezier curves
        },
      },
    };
  
    return (
     <Line data={data} options={options} />  
    );
  };

export default LineChartWithoutAxis;
