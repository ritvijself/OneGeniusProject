import React, { useEffect, useState } from "react";
import { Card, OverlayTrigger, Tooltip } from "react-bootstrap";
import Loader from "../../../../Loader/Loader";
import { FaInfoCircle } from "react-icons/fa";

const InstagramMetricCard = ({ instadata, insta_id, title, metricType }) => {
  const [loading, setLoading] = useState(true);
  const [metricValue, setMetricValue] = useState(0);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");
  const apibaseurl = import.meta.env.VITE_API_BASE_URL;

  
  const getMetricInfo = () => {
    switch (metricType) {
      case "followers":
        return {
          key: "totalFollowers",
          description:
            "Returns the total number of followers for the Instagram account.",
        };
      case "posts":
        return {
          key: "totalPosts",
          description:
            "Returns the total number of posts on the Instagram account.",
        };
      case "likes":
        return {
          key: "totalLikes",
          description:
            "Returns the total number of likes across all posts on the Instagram account.",
        };
      default:
        return {
          key: "totalFollowers",
          description: "Instagram account metric",
        };
    }
  };

  useEffect(() => {
    if (!insta_id) return;

    const fetchMetricData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${apibaseurl}/${instadata.apiurl}/${instadata.url}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              accountId: insta_id,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        const { key } = getMetricInfo();
        setMetricValue(data[key] || 0);
      } catch (err) {
        console.error(`Error fetching ${metricType} count:`, err);
        setError(err.message || `Failed to load ${metricType} count`);
        setMetricValue(0);
      } finally {
        setLoading(false);
      }
    };

    fetchMetricData();
  }, [insta_id, token, apibaseurl, metricType]);

  const { description } = getMetricInfo();

  const renderTooltip = (props) => (
    <Tooltip id="metric-tooltip" {...props}>
      {description}
    </Tooltip>
  );

  if (loading) {
    return (
      <Card className="shadow-sm">
        <Card.Body>
          <div className="d-flex align-items-center">
            <Card.Title className="text-start mb-0">{title}</Card.Title>
          
          </div>
          <div className="d-flex align-items-center justify-content-center">
            <Loader />
          </div>
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-sm">
        <Card.Body>
          <div className="d-flex align-items-center">
            <Card.Title className="text-start mb-0">{title}</Card.Title>
         
          </div>
          <div className="d-flex align-items-center justify-content-center">
            <p className="text-danger">{error}</p>
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <Card.Body>
        <div className="d-flex align-items-center">
          <Card.Title className="text-start mb-0">{title}</Card.Title>
       
        </div>
        <div className="d-flex align-items-center justify-content-center">
          <h1 className="display-4 fw-bold">{metricValue.toLocaleString()}</h1>
        </div>
      </Card.Body>
    </Card>
  );
};

export default InstagramMetricCard;
