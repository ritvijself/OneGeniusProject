import React, { useEffect, useState } from "react";
import Loader from "../../../../Loader/Loader";
import "bootstrap/dist/css/bootstrap.min.css";
import { formatDateLocal } from "../../../../../utils/FormatDate";
import styles from "./MetricDisplayGA4.module.css";

const MetricDisplayGA4 = ({
  propertyId,
  startDate,
  endDate,
  SquareBox,
  title,
  sign,
  viewType = "chart",
  code,
}) => {
  const [metricData, setMetricData] = useState([]);
  const [dataShowType, setDataShowType] = useState(viewType);
  const [loading, setLoading] = useState(true);
  const apibaseurl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");
  const [isHidden, setIsHidden] = useState(false);
  const formattedStart = formatDateLocal(startDate);
  const formattedEnd = formatDateLocal(endDate);

  const formatNumber = (value) =>
    isNaN(value) ? "-" : Number(value).toLocaleString();

  const formatPercentage = (value) => (
    <>
      {isNaN(value) ? "-" : parseFloat(value).toFixed(2)}
      <sup>{sign || "%"}</sup>
    </>
  );

  const getMetricInfo = (type, value) => {
    const formatted = {
      totalUsers: {
        title: "Total Users",
        value: formatNumber(value),
      },
      engagementRate: {
        title: "Engagement Rate",
        value: formatPercentage(value * 100),
      },
      eventCount: {
        title: "Event Count",
        value: formatNumber(value),
      },
      bounceRate: {
        title: "Bounce Rate",
        value: formatPercentage(value * 100),
      },
      conversions: {
        title: "Conversions",
        value: formatNumber(value),
      },
    };
    return formatted[type] || { title: "Metric", value: formatNumber(value) };
  };

  const getMonthName = (month, year) => {
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  const fetchDataShowType = async () => {
    try {
      const response = await fetch(
        `${apibaseurl}/api/GA4CustomizeMonthApiList/get-datashowtype/${code}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error(`HTTP error! ${response.status}`);
      const data = await response.json();
      return data.dataShowType || viewType;
    } catch (error) {
      console.error("Fetch dataShowType error:", error);
      return viewType;
    }
  };

  const fetchMetricData = async () => {
    try {
      const response = await fetch(
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
      if (!response.ok) throw new Error(`HTTP error! ${response.status}`);
      const result = await response.json();

      if (
        result.isSuccess === true &&
        result.data === null &&
        result.message === "User wants to hide this API"
      ) {
        setIsHidden(true);
        return [];
      }

      return result;
    } catch (error) {
      console.error("Fetch metric data error:", error);
      return [];
    }
  };

  const processTableData = (data) => {
    if (!Array.isArray(data) || data.length === 0) return [];

    return data
      .map((item) => ({
        month: getMonthName(item.month, item.year),
        monthKey: `${item.year}-${item.month}`,
        totalUsers: parseFloat(item.totalUsers) || 0,
        engagementRate: parseFloat(item.engagementRate) || 0,
        eventCount: parseFloat(item.eventCount) || 0,
        bounceRate: parseFloat(item.bounceRate) || 0,
        conversions: parseFloat(item.conversions) || 0,
      }))
      .sort((a, b) => (a.monthKey > b.monthKey ? 1 : -1));
  };

  const processCardData = (data) => {
    if (!Array.isArray(data) || data.length === 0) return {};

    const latestMonth = data.reduce((latest, current) =>
      parseInt(current.month) > parseInt(latest.month) ? current : latest
    );

    return {
      totalUsers: parseFloat(latestMonth.totalUsers) || 0,
      engagementRate: parseFloat(latestMonth.engagementRate) || 0,
      eventCount: parseFloat(latestMonth.eventCount) || 0,
      bounceRate: parseFloat(latestMonth.bounceRate) || 0,
      conversions: parseFloat(latestMonth.conversions) || 0,
    };
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const showType = await fetchDataShowType();
        setDataShowType(showType);

        let data = [];
        if (SquareBox?.data) {
          data = SquareBox.data;
        } else if (propertyId) {
          data = await fetchMetricData();
        }
        setMetricData(data);
      } catch (err) {
        console.error("Processing error:", err);
        setMetricData([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [propertyId, startDate, endDate, SquareBox, code]);

  if (isHidden) return null;

  if (loading) return <Loader />;

  if (dataShowType === "table") {
    const tableData = processTableData(metricData);
    const latestMonthKey =
      tableData.length > 0 ? tableData[tableData.length - 1].monthKey : null;

    const metricDescriptions = {
      totalUsers:
        "The overall number of unique individuals who visited your site or app during the chosen period.",
      engagementRate:
        "A higher engagement rate suggests users are finding value and interacting with your content.",
      eventCount:
        "Total number of times a specific user interaction or event occurs on a website or app.",
      bounceRate:
        "Percentage of sessions that were not engaged (under 10 seconds, no conversion, or only 1 pageview).",
      conversions:
        "Key user actions like purchases, form submissions, or signups defined as success indicators.",
    };

    const metrics = [
      "totalUsers",
      "engagementRate",
      "eventCount",
      "bounceRate",
      "conversions",
    ];

    const rowData = metrics.map((metricKey) => ({
      key: metricKey,
      label: getMetricInfo(metricKey, 0).title,
      values: tableData.map((m) =>
        metricKey === "engagementRate" || metricKey === "bounceRate"
          ? formatPercentage(m[metricKey] * 100)
          : formatNumber(m[metricKey])
      ),
      description: metricDescriptions[metricKey] || "-",
    }));

    return (
      <div className="card shadow-sm p-3">
        <h5
          className={styles.cardTitle}
          style={{ color: SquareBox?.color || "black" }}
        >
          {title || "Monthly Metrics Overview"}
        </h5>
        <div className="table-responsive">
          <table className="table table-sm">
            <thead>
              <tr>
                <th className={`${styles.tableHeader}`}>Metric</th>
                {tableData.map((item, idx) => (
                  <th
                    key={idx}
                    className={`${styles.tableHeader} ${styles.tableHeaderSmall}`}
                  >
                    {item.month}
                  </th>
                ))}
                <th
                  className={`${styles.tableHeader} ${styles.tableHeaderDesc}`}
                >
                  Description
                </th>
              </tr>
            </thead>
            <tbody className={styles.tableCell}>
              {rowData.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.label}</td>
                  {tableData.map((item, i) => (
                    <td
                      key={i}
                      className={`${styles.tableCell} ${
                        item.monthKey === latestMonthKey
                          ? styles.highlightedCell
                          : ""
                      }`}
                    >
                      {row.values[i]}
                    </td>
                  ))}
                  <td className={styles.descriptionCell}>{row.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Card view
  const totals = processCardData(metricData);
  const metrics = totals
    ? Object.keys(totals).map((key) => ({
        key,
        ...getMetricInfo(key, totals[key]),
      }))
    : [];

  return (
    <div className="row">
      {metrics.length > 0 ? (
        metrics.map((metric) => (
          <div key={metric.key} className="col-md">
            <div className="card shadow-sm h-100">
              <div className="card-body d-flex flex-column">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <h6 className="text-muted mb-0 fw-semibold">
                    {metric.title}
                  </h6>
                </div>
                <div
                  className={`mt-auto text-center fw-bold ${styles.metricValue}`}
                >
                  {metric.value}
                </div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="col-12 text-center text-muted">No data available</div>
      )}
    </div>
  );
};

export default MetricDisplayGA4;
