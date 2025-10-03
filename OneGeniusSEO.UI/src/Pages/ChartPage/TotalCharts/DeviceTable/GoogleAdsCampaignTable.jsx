import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import style from "./DeviceTable.module.css";
import Loader from "../../../Loader/Loader";
import { formatDateLocal } from "../../../../utils/FormatDate";

const monthNames = {
  "01": "Jan",
  "02": "Feb",
  "03": "Mar",
  "04": "Apr",
  "05": "May",
  "06": "Jun",
  "07": "Jul",
  "08": "Aug",
  "09": "Sep",
  10: "Oct",
  11: "Nov",
  12: "Dec",
};

const GoogleAdsCampaignTable = ({
  customerID,
  startDate,
  endDate,
  ApiData,
}) => {
  const [loading, setLoading] = useState(true);
  const [tableData, setTableData] = useState([]);
  const [uniqueMonths, setUniqueMonths] = useState([]);
  const [isHidden, setIsHidden] = useState(false); // New state for hiding
  const apibaseurl = import.meta.env.VITE_API_BASE_URL;
  const formattedStart = formatDateLocal(startDate);
  const formattedEnd = formatDateLocal(endDate);
  const token = localStorage.getItem("token");
  const latestMonth = uniqueMonths[uniqueMonths.length - 1];

  const metrics = [
    { key: "clicks", label: "Clicks" },
    { key: "conversions", label: "Conversions" },
    { key: "avgCPC", label: "Avg CPC" },
  ];

  const fetchData = async () => {
    setLoading(true);
    setIsHidden(false); // Reset isHidden
    setTableData([]);
    setUniqueMonths([]);

    try {
      const response = await fetch(
        `${apibaseurl}/api/${ApiData.apiurl}/${ApiData.url}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            customerID,
            startDate: formattedStart,
            endDate: formattedEnd,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const result = await response.json();

      // Check if the API indicates the data should be hidden
      if (
        result.IsSuccess === true &&
        result.Data === null &&
        result.Message === "User wants to hide this API"
      ) {
        setIsHidden(true);
        setLoading(false);
        return;
      }

      if (!result?.results?.length) {
        console.warn("No results in API response");
        setTableData([]);
        setUniqueMonths([]);
        setLoading(false);
        return;
      }

      const grouped = {};
      const monthsSet = new Set();

      result.results.forEach((item) => {
        const campaignName = item.campaign?.name || "N/A";
        let monthYear;

        if (
          item.segments?.date &&
          /^\d{4}-\d{2}-\d{2}$/.test(item.segments.date)
        ) {
          const year = item.segments.date.slice(0, 4);
          const month = item.segments.date.slice(5, 7);
          const monthName = monthNames[month] || month;
          monthYear = `${monthName} '${year.slice(-2)}`;
        } else {
          console.warn("Skipping invalid date:", item.segments?.date);
          return; // Skip invalid entries
        }

        monthsSet.add(monthYear);

        if (!grouped[campaignName]) {
          grouped[campaignName] = {};
        }
        if (!grouped[campaignName][monthYear]) {
          grouped[campaignName][monthYear] = {
            clicks: 0,
            conversions: 0,
            totalCPC: 0,
            clickCountForAvg: 0,
          };
        }

        grouped[campaignName][monthYear].clicks += parseInt(
          item.metrics?.clicks || 0
        );
        grouped[campaignName][monthYear].conversions += parseFloat(
          item.metrics?.conversions || 0
        );

        if (item.metrics?.costMicros && parseInt(item.metrics.clicks) > 0) {
          grouped[campaignName][monthYear].totalCPC += parseFloat(
            item.metrics.costMicros
          );
          grouped[campaignName][monthYear].clickCountForAvg += parseInt(
            item.metrics.clicks
          );
        }
      });

      const monthArray = [...monthsSet].sort((a, b) => {
        const [monthA, yearA] = a.split(" ");
        const [monthB, yearB] = b.split(" ");
        const dateA = new Date(`${monthA} 1, ${yearA}`);
        const dateB = new Date(`${monthB} 1, ${yearB}`);
        return dateA - dateB;
      });

      setUniqueMonths(monthArray);

      const transformed = Object.entries(grouped).map(
        ([campaignName, monthData]) => {
          const row = { campaignName };
          monthArray.forEach((monthYear) => {
            const data = monthData[monthYear] || {
              clicks: 0,
              conversions: 0,
              totalCPC: 0,
              clickCountForAvg: 0,
            };
            row[monthYear] = {
              clicks: data.clicks.toLocaleString(),
              conversions: data.conversions.toFixed(2),
              avgCPC:
                data.clickCountForAvg > 0
                  ? `£${(
                      data.totalCPC /
                      data.clickCountForAvg /
                      1000000
                    ).toFixed(2)}`
                  : "£0.00",
            };
          });
          return row;
        }
      );

      setTableData(transformed);
    } catch (error) {
      console.error("API Error:", error);
      setTableData([]);
      setUniqueMonths([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customerID && startDate && endDate) {
      fetchData();
    } else {
      setLoading(false);
      setIsHidden(false);
    }
  }, [customerID, startDate, endDate]);

  // Return null if the component should be hidden
  if (isHidden) return null;

  if (loading) return <Loader />;

  return (
    <div className={`${style.Orgnaic_content_box} mt-3`}>
      <div className={style.table_container}>
        <table className={style.metrics_table}>
          <thead>
            <tr style={{ color: "red" }}>
              <th rowSpan={2}>Campaign Name</th>
              {metrics.map((metric) => (
                <th
                  key={metric.key}
                  colSpan={uniqueMonths.length}
                  className="text-center"
                >
                  {metric.label}
                </th>
              ))}
            </tr>
            <tr>
              {metrics.map((metric) =>
                uniqueMonths.map((monthYear) => (
                  <th
                    key={`${metric.key}-${monthYear}`}
                    className={
                      monthYear === latestMonth ? style.highlightColumn : ""
                    }
                    style={{ textAlign: "center" }}
                  >
                    {monthYear}
                  </th>
                ))
              )}
            </tr>
          </thead>
          <tbody>
            {tableData.length === 0 ? (
              <tr>
                <td
                  colSpan={1 + metrics.length * uniqueMonths.length}
                  className="text-center"
                >
                  No Data Found
                </td>
              </tr>
            ) : (
              tableData.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.campaignName}</td>
                  {metrics.map((metric) =>
                    uniqueMonths.map((monthYear) => (
                      <td
                        key={`${metric.key}-${monthYear}`}
                        className={
                          monthYear === latestMonth ? style.highlightColumn : ""
                        }
                        style={{ textAlign: "center" }}
                      >
                        {row[monthYear][metric.key]}
                      </td>
                    ))
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GoogleAdsCampaignTable;
