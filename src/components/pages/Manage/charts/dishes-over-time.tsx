import { timeLabels } from "@/lib/parse-time";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

export const oldOptions = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: true,
      text: "Dishes Ordered",
    },
  },
};
const options = {
  responsive: true,
  scales: {
    y: {
      stacked: true,
    },
  },
  plugins: {
    filler: {
      propagate: true,
    },
  },
  interaction: {
    intersect: false,
  },
};

const labels = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export const oldData = {
  labels,
  datasets: [
    {
      label: "Ingredients",
      data: labels.map(() => Math.random() * 25),
      borderColor: "#65a30d",
      // backgroundColor: "rgba(255, 99, 132, 0.5)",
    },
  ],
};

export const DishesOverTimeChart: React.FC<{
  data: Map<string, number[]> | undefined;
  startTime?: string;
  endTime?: string;
}> = ({ data, startTime, endTime }) => {
  if (!data || !startTime || !endTime) {
    return <div>Loading...</div>;
  }
  const formattedData = {
    labels: timeLabels(startTime, endTime),
    datasets: Array.from(data.entries()).map(([name, quantities]) => ({
      label: name,
      data: quantities,
      borderColor: `hsl(${Math.random() * 360} 70% 50%)`,
      fill: true,
    })),
  };

  return <Line options={options} data={formattedData} />;
};
