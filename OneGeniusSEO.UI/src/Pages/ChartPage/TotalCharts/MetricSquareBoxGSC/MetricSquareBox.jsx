import React, { useEffect, useState } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { FaInfoCircle } from "react-icons/fa";
import Loader from "../../../Loader/Loader";
import "bootstrap/dist/css/bootstrap.min.css";
import { formatDateLocal } from "../../../../utils/FormatDate";

const MetricSquareBox = ({ siteUrl, startDate, endDate, SquareBox }) => {
  const [metrics, setMetrics] = useState({
    clicks: 0,
    impressions: 0,
    avgPosition: 0,
    ctr: 0,
  });
  const [loading, setLoading] = useState(true);
  const apibaseurl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");
  const formattedStart = formatDateLocal(startDate);
  const formattedEnd = formatDateLocal(endDate);
  const [isHidden, setIsHidden] = useState(false);
  const fetchData = async () => {
    if (!siteUrl) {
      setLoading(false);
      return;
    }

    setLoading(true);
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
            siteUrl: siteUrl,
            startDate: formattedStart,
            endDate: formattedEnd,
          }),
        }
      );

      const result = await response.json();

      if (
        result.isSuccess === true &&
        result.data === null &&
        result.message === "User wants to hide this API"
      ) {
        setIsHidden(true);
        setLoading(false);
        return;
      }

      if (
        result.isSuccess &&
        Array.isArray(result.data) &&
        result.data.length > 0
      ) {
        const totalClicks = result.data.reduce(
          (sum, item) => sum + (item.Clicks || 0),
          0
        );
        const totalImpressions = result.data.reduce(
          (sum, item) => sum + (item.Impressions || 0),
          0
        );

        const weightedPosition =
          result.data.reduce(
            (sum, item) => sum + (item.Position || 0) * (item.Impressions || 0),
            0
          ) / totalImpressions;

        const overallCTR =
          totalImpressions > 0 ? totalClicks / totalImpressions : 0;

        setMetrics({
          clicks: totalClicks,
          impressions: totalImpressions,
          avgPosition: weightedPosition,
          ctr: overallCTR,
        });
      } else {
        setMetrics({
          clicks: 0,
          impressions: 0,
          avgPosition: 0,
          ctr: 0,
        });
      }
    } catch (error) {
      console.error("Error fetching metrics data:", error);
      setMetrics({
        clicks: 0,
        impressions: 0,
        avgPosition: 0,
        ctr: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [siteUrl, startDate, endDate]);

  const formatNumber = (value) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value;
  };

  const formatCTR = (value) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  const renderTooltip = (title, description) => (props) =>
    (
      <Tooltip id={`${title}-tooltip`} {...props}>
        {description}
      </Tooltip>
    );

  const metricItems = [
    {
      title: "Clicks",
      value: formatNumber(metrics.clicks),
      description: "Total clicks from Google Search",
      tooltip: renderTooltip("Clicks", "Total clicks from Google Search"),
    },
    {
      title: "Impressions",
      value: formatNumber(metrics.impressions),
      description: "Total impressions in Google Search",
      tooltip: renderTooltip(
        "Impressions",
        "Total times your site appeared in search results"
      ),
    },
    {
      title: "Avg Position",
      value: metrics.avgPosition.toFixed(1),
      description: "Average position in search results",
      tooltip: renderTooltip(
        "Avg Position",
        "Average ranking position in search results (lower is better)"
      ),
    },
    {
      title: "CTR",
      value: formatCTR(metrics.ctr),
      description: "Click-through rate",
      tooltip: renderTooltip(
        "CTR",
        "Percentage of impressions that resulted in a click"
      ),
    },
  ];

  if (isHidden) {
    return null;
  }
  if (loading) {
    return <Loader />;
  }

  return (
    <div className="row g-3">
      {metricItems.map((item, index) => (
        <div key={index} className="col-md-3 col-sm-6">
          <div className="card shadow-sm h-100">
            <div className="card-body d-flex flex-column">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <h6 className="text-muted mb-0 fw-semibold">{item.title}</h6>
              
              </div>
              <div
                className="mt-auto text-center  fw-bold"
                style={{ marginBottom: "20px", fontSize: "35px" }}
              >
                {item.value}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MetricSquareBox;
