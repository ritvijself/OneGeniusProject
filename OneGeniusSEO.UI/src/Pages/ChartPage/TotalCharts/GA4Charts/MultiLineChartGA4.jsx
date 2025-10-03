import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, registerables } from "chart.js";
import { FaChartLine } from "react-icons/fa";
import Loader from "../../../Loader/Loader";
import "bootstrap/dist/css/bootstrap.min.css";
import { formatDateLocal } from "../../../../utils/FormatDate";

ChartJS.register(...registerables);

const MultiLineChartGA4 = ({
  propertyId,
  startDate,
  endDate,
  SquareBox,
  title,
  height,
}) => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });
  const [metric, setMetric] = useState("totalUsers");
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const apibaseurl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");
  const formattedStart = formatDateLocal(startDate);
  const formattedEnd = formatDateLocal(endDate);
  const [isHidden, setIsHidden] = useState(false);

  const generateDateRange = (start, end) => {
    const dates = [];
    let currentDate = new Date(start);
    const endDateObj = new Date(end);

    while (currentDate <= endDateObj) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates.map((date) => {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      return {
        formatted: date.toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
        }),
        raw: `${yyyy}${mm}${dd}`,
        dateObj: date,
      };
    });
  };

  const fetchTotalUsers = async () => {
    try {
      const response = await fetch(
        `${apibaseurl}/api/google-analytics/report/total-users`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            propertyId: propertyId,
            startDate: formattedStart,
            endDate: formattedEnd,
          }),
        }
      );

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      setTotalUsers(parseInt(result[0]?.totalUsers || 0));
    } catch (error) {
      console.error("Error fetching total users:", error);
      setTotalUsers(0);
    }
  };

  const fetchData = async () => {
    if (!propertyId || !token) {
      const dateRange = generateDateRange(startDate, endDate);
      setChartData({
        labels: dateRange.map((date) => date.formatted),
        datasets: [
          {
            label: "No Data",
            data: Array(dateRange.length).fill(0),
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

    setLoading(true);
    try {
     
      await fetchTotalUsers();

  
      const response = await fetch(
        `${apibaseurl}/api/${SquareBox.apiurl}/${SquareBox.url}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            propertyId: propertyId,
            startDate: formattedStart,
            endDate: formattedEnd,
          }),
        }
      );

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();
      if (
        result.isSuccess === true &&
        result.data === null &&
        result.message === "User wants to hide this API"
      ) {
        setIsHidden(true);
        return [];
      }
      const dateRange = generateDateRange(startDate, endDate);
      const labels = dateRange.map((date) => date.formatted);

      const metricName = result.metricHeaders[0]?.name || "totalUsers";
      setMetric(metricName);

      const dataMap = {};
      result.rows.forEach((row) => {
        if (!dataMap[row.date]) dataMap[row.date] = {};
        dataMap[row.date][row.deviceCategory] = parseInt(row[metricName] || 0);
      });

      const deviceCategories = ["mobile", "desktop", "tablet"];
      const colors = {
        mobile: "#28a745",
        desktop: "#007bff",
        tablet: "#ff8c00",
      };

      const datasets = deviceCategories.map((category) => {
        const data = dateRange.map(
          (date) => dataMap[date.raw]?.[category] || 0
        );
        return {
          label: category.charAt(0).toUpperCase() + category.slice(1),
          data,
          borderColor: colors[category],
          backgroundColor: colors[category] + "33",
          fill: false,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 5,
        };
      });

      setChartData({ labels, datasets });
    } catch (error) {
      console.error("Error fetching data:", error);
      const dateRange = generateDateRange(startDate, endDate);
      setChartData({
        labels: dateRange.map((date) => date.formatted),
        datasets: [
          {
            label: "Error",
            data: Array(dateRange.length).fill(0),
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

  const formatNumber = (value) => value.toLocaleString("en-US");

  const formatSecondsToHMS = (seconds) => {
    if (!seconds || isNaN(seconds)) return "-";
    const sec = Math.floor(seconds);
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h}h ${m}m ${s}s`;
  };

  const getTotalValue = () => {
    if (metric === "userEngagementDuration") {
      return formatSecondsToHMS(
        chartData.datasets.reduce(
          (acc, dataset) =>
            acc + dataset.data.reduce((sum, val) => sum + val, 0),
          0
        )
      );
    }
    return formatNumber(totalUsers);
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.parsed.y;
            if (metric === "userEngagementDuration") {
              return `${context.dataset.label}: ${formatSecondsToHMS(value)}`;
            }
            return `${context.dataset.label}: ${formatNumber(value)}`;
          },
        },
        intersect: false,
        mode: "index",
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
          callback: (value) => {
            if (metric === "userEngagementDuration") {
              return value;
            }
            return formatNumber(value);
          },
        },
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
      },
      x: {
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
  if (loading) {
    return <Loader />;
  }

  return (
    <div className="card shadow-sm p-3 h-100">
      <div className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <FaChartLine size={16} color="#ff8c00" className="me-2" />
          <h5 style={{ fontSize: "16px", margin: 0 }}>
            {metric === "userEngagementDuration"
              ? "Engagement Duration"
              : title}
          </h5>
        </div>
        <span>{getTotalValue()}</span>
      </div>
      <div style={{ height: height || 200 }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default MultiLineChartGA4;
