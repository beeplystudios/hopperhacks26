import {
  Chart as ChartJS,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, CategoryScale, Title, Tooltip, Legend, Filler);

const options = {
  responsive: true,
  plugins: {
    legend: {
      //   display: false,
    },
  },
};

export const ReservationCapacityChart: React.FC<{
  seatsFilled: number;
  capacity: number;
}> = ({ capacity, seatsFilled }) => {
  const formattedData = {
    labels: ["Occupied", "Available"],
    datasets: [
      {
        data: [seatsFilled, capacity - seatsFilled],
        backgroundColor: ["#60b3eb", "#2276e3"],
      },
    ],
  };

  return (
    <Doughnut
      options={options}
      data={formattedData}
      className="max-w-4/5 max-h-4/5"
    />
  );
};
