import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const GREEK_MONTHS = ['Ιαν', 'Φεβ', 'Μαρ', 'Απρ', 'Μαΐ', 'Ιουν', 'Ιουλ', 'Αυγ', 'Σεπ', 'Οκτ', 'Νοε', 'Δεκ'];

export function MonthlySpendChart({ data }) {
  if (!data?.length) return <div className="text-center py-8 text-gray-400 text-sm">Δεν υπάρχουν δεδομένα</div>;

  const labels = data.map(d => `${GREEK_MONTHS[d.month - 1]} ${d.year}`);
  const values = data.map(d => d.amount);

  const chartData = {
    labels,
    datasets: [{
      label: 'Δαπάνες (€)',
      data: values,
      backgroundColor: '#3f748a',
      borderRadius: 8,
      borderSkipped: false,
    }],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `€${ctx.parsed.y.toFixed(2)}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { callback: (v) => `€${v}` },
      },
      x: { grid: { display: false } },
    },
  };

  return <Bar data={chartData} options={options} />;
}

const CATEGORY_COLORS = ['#3f748a', '#e7bf69', '#2a3d47', '#6bb5d2', '#c9a84c', '#4a8fa8'];

export function CategoryPieChart({ data }) {
  if (!data?.length) return <div className="text-center py-8 text-gray-400 text-sm">Δεν υπάρχουν δεδομένα</div>;

  const chartData = {
    labels: data.map(d => d.category),
    datasets: [{
      data: data.map(d => d.count),
      backgroundColor: CATEGORY_COLORS,
      borderWidth: 0,
    }],
  };

  const options = {
    responsive: true,
    cutout: '65%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: { padding: 16, font: { size: 12 } },
      },
    },
  };

  return <Doughnut data={chartData} options={options} />;
}
