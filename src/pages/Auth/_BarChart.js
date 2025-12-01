import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

export const options = {
    responsive: true,
    plugins: {
        legend: {
            position: 'bottom',
        },
        title: {
            display: true,
        },
    },
};

const labels = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export const data = {
    labels,
    datasets: [
        {
            label: 'Registered Users',
            data: [20000, 8000, 5000, 16000, 2500, 8000, 11000, 8000, 4000, 6000, 15000, 16000],
            backgroundColor: '#4990F2',
        },
        {
            label: 'Active Users',
            data: [19000, 8000, 4500, 14900, 2500, 7200, 10000, 4000, 1000, 5700, 13000, 12000],
            backgroundColor: '#F3E008',
        }
    ],
};

const BarChart = () => {
    return <Bar options={options} data={data} />;
}

export default BarChart
