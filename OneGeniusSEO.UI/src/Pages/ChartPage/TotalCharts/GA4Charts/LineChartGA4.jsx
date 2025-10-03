import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, registerables } from "chart.js";
import Loader from "../../../Loader/Loader";
import { formatDateLocal } from "../../../../utils/FormatDate";

ChartJS.register(...registerables);

const LineChartGA4 = ({
  propertyId,
  startDate,
  endDate,
  SquareBox,
  title,
  height,
  totalUsers,
}) => {
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [loading, setLoading] = useState(true);
  const [isHidden, setIsHidden] = useState(false);
  const apibaseurl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");
  const formattedStart = formatDateLocal(startDate);
  const formattedEnd = formatDateLocal(endDate);

  const generateDayLabels = () => {
    return Array.from({ length: 31 }, (_, i) => String(i + 1));
  };

  const processDataByMonth = (apiData, metricKey) => {
    const uniqueMonths = [
      ...new Set(apiData.map((item) => item.date.slice(0, 6))),
    ].sort((a, b) => a.localeCompare(b));

    const monthNames = {};
    uniqueMonths.forEach((yearMonth) => {
      const year = yearMonth.slice(0, 4);
      const month = parseInt(yearMonth.slice(4, 6), 10) - 1;
      const date = new Date(year, month, 1);
      monthNames[yearMonth] = date.toLocaleString("en-US", {
        month: "long",
        year: "numeric",
      });
    });

    const monthlyData = {};
    uniqueMonths.forEach((yearMonth) => {
      monthlyData[yearMonth] = Array(31).fill(0);
    });

    apiData.forEach((item) => {
      const date = item.date;
      const yearMonth = date.slice(0, 6);
      const day = parseInt(date.slice(6, 8), 10) - 1;
      if (monthlyData[yearMonth] && day >= 0 && day < 31) {
        monthlyData[yearMonth][day] = parseFloat(item[metricKey]) || 0;
      }
    });

    const colors = [
      { borderColor: "#bbdefb", backgroundColor: "rgba(187, 222, 251, 0.3)" },
      { borderColor: "#90caf9", backgroundColor: "rgba(144, 202, 249, 0.5)" },
      { borderColor: "#1565c0", backgroundColor: "rgba(21, 101, 192, 0.8)" },
    ];

    const datasets = uniqueMonths.map((yearMonth, index) => {
      const total = monthlyData[yearMonth].reduce(
        (acc, val) => acc + (val || 0),
        0
      );
      return {
        label: ` ${monthNames[yearMonth]} (${formatNumber(total)})`,
        data: monthlyData[yearMonth],
        borderColor: colors[index % colors.length].borderColor,
        backgroundColor: colors[index % colors.length].backgroundColor,
        fill: false,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 5,
      };
    });

    return datasets;
  };

  const fetchData = async () => {
    const labels = generateDayLabels();

    if (!propertyId || !token || !SquareBox) {
      setChartData({
        labels,
        datasets: [
          {
            label: "No Data",
            data: Array(31).fill(0),
            borderColor: "#ccc",
            backgroundColor: "rgba(204, 204, 204, 0.3)",
            fill: false,
            borderWidth: 2,
            pointRadius: 0,
          },
        ],
      });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(
        `${apibaseurl}/api/${SquareBox.apiurl}/${SquareBox.url}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            propertyId,
            startDate: formattedStart,
            endDate: formattedEnd,
          }),
        }
      );

      if (!res.ok) {
        console.error("API error:", res.status, res.statusText);
        throw new Error("API error");
      }

      const result = await res.json();

      if (
        result.isSuccess === true &&
        result.data === null &&
        result.message === "User wants to hide this API"
      ) {
        setIsHidden(true);
        return [];
      }

      const metricKey =
        SquareBox.metric ||
        (result[0] &&
          Object.keys(result[0]).find(
            (k) => k !== "date" && !isNaN(parseFloat(result[0][k]))
          )) ||
        "metric";

      if (Array.isArray(result) && result.length > 0) {
        const datasets = processDataByMonth(result, metricKey);
        setChartData({
          labels,
          datasets,
        });
      } else {
        setChartData({
          labels,
          datasets: [
            {
              label: "No Data",
              data: Array(31).fill(0),
              borderColor: "#ccc",
              backgroundColor: "rgba(204, 204, 204, 0.3)",
              fill: false,
              borderWidth: 2,
              pointRadius: 0,
            },
          ],
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setChartData({
        labels,
        datasets: [
          {
            label: "Error",
            data: Array(31).fill(0),
            borderColor: "#ff0000",
            backgroundColor: "rgba(255, 0, 0, 0.1)",
            fill: false,
            borderWidth: 2,
            pointRadius: 0,
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [propertyId, startDate, endDate, token, SquareBox]);

  const formatNumber = (val) => {
    if (typeof val !== "number") return val;
    if (val >= 1000) {
      return `${(val / 1000).toFixed(1)}k`;
    }
    return val.toLocaleString("en-US");
  };
  const isThreeMonthView = () => {
    const months = new Set();
    chartData.datasets.forEach((ds) => {
      const match = ds.label?.match(/([A-Za-z]+ \d{4})/);
      if (match && match[1]) {
        months.add(match[1]);
      }
    });
    return months.size >= 3;
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          generateLabels: (chart) => {
            const data = chart.data;
            if (data.datasets.length) {
              return data.datasets.map((dataset, i) => ({
                text: dataset.label,
                fillStyle: "transparent",
                strokeStyle: dataset.borderColor,
                lineWidth: 2,
                fontColor: dataset.borderColor,
                hidden: !chart.isDatasetVisible(i),
                datasetIndex: i,
              }));
            }
            return [];
          },
          boxWidth: 0,
          padding: 10,
          usePointStyle: false,
        },
      },
      tooltip: {
        mode: "index",
        intersect: false,
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${formatNumber(ctx.parsed.y)}`,
        },
      },
    },
    interaction: {
      mode: "index",
      intersect: false,
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: formatNumber,
        },
        grid: {
          color: "rgba(0,0,0,0.05)",
        },
        title: {
          display: true,
          text: chartData.datasets[0]?.label.split(" - ")[0] || "Metric",
        },
      },
      x: {
        title: {
          display: true,
          text: "Day of Month",
        },
        grid: {
          display: false,
        },
      },
    },
    elements: {
      point: {
        radius: 0,
        hoverRadius: 5,
      },
    },
  };
  if (isHidden) return null;
  if (loading) return <Loader />;

  const totalValue =
    totalUsers ||
    chartData.datasets.reduce(
      (acc, dataset) =>
        acc + dataset.data.reduce((sum, val) => sum + (val || 0), 0),
      0
    ) ||
    0;

  return (
    <div className="card shadow-sm p-3 h-100">
      <div className="d-flex justify-content-between align-items-center">
        <h5 style={{ fontSize: "16px", margin: 0 }}>{title}</h5>
        {!isThreeMonthView() && <span>{formatNumber(totalValue)}</span>}
      </div>
      <div style={{ height: height }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default LineChartGA4;
