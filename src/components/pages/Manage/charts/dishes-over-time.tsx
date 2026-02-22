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
  Filler,
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
  Filler,
);

const options = {
  responsive: true,
  scales: {
    y: {
      stacked: true,
      ticks: {
        stepSize: 1,
      },
    },
  },
  plugins: {
    legend: {
      display: false,
    },
    filler: {
      propagate: true,
    },
  },
  interaction: {
    intersect: false,
  },
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
    datasets: Array.from(data.entries()).map(([name, quantities], index) => ({
      label: name,
      data: quantities,
      borderColor: `hsl(${100 + index * 20} 35% 55%)`,
      fill: true,
    })),
  };

  return (
    <Line
      options={options}
      data={formattedData}
      className="max-w-full max-h-[90%]"
    />
  );
};
