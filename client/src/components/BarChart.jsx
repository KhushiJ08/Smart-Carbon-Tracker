import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export default function Chart({ activities }) {
  const chartData = activities.map((activity, index) => ({
    day: `A${index + 1}`,
    emission: Number(activity.emission || 0),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#444" />

        <XAxis dataKey="day" stroke="#ffffff" tick={{ fill: "#ffffff" }} />

        <YAxis stroke="#ffffff" tick={{ fill: "#ffffff" }} />

        <Tooltip />

        <Bar dataKey="emission" fill="#9BE564" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
