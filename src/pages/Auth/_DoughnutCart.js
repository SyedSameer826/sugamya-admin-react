import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export const  data = {
    labels: ['Sales', 'Revenue', 'Profit'],
    datasets: [
      {
        data: [30, 50, 60], // Example data, you can replace this with your own values
        backgroundColor: ['#FFA523', '#9F49A3', '#00B4B0'],
        hoverBackgroundColor: ['#FFA523', '#9F49A3', '#00B4B0'],
      },
    ],
  }; 

  const options = {
    plugins: {
      legend: {
          display: true,
          position: "right",
          fullSize: true,
          align: "start",
          labels: {
              padding: 18,
              textAlign: "center",
              color: "#252420",
              pointStyle: "circle",
              usePointStyle: true,
          }
      },
     
  },
  };

const DoughnutCart =()=>{ 
  
  return <Doughnut data={data} options={options}/>;
}

export  default DoughnutCart