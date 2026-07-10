import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export default function BarChart({ activities }) {
  const chartData = activities.map((activity, index) => ({
    day: `A${index + 1}`,
    emission: Number(activity.activityData || activity.value || 0),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid stroke="#444" strokeDasharray="3 3" />

        <XAxis dataKey="day" stroke="#fff" tick={{ fill: "#fff" }} />

        <YAxis stroke="#fff" tick={{ fill: "#fff" }} />

        <Tooltip
          contentStyle={{
            background: "#111",
            borderRadius: 10,
          }}
        />

        <Line
          type="monotone"
          dataKey="emission"
          stroke="#8ef58e"
          strokeWidth={4}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
