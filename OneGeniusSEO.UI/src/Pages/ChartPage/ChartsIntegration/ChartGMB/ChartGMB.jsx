import React, { useState, useEffect, useCallback } from "react";
import { Row, Col } from "react-bootstrap";
import GMBImpressionCard from "../../TotalCharts/GMBImpressionCard/GMBImpressionCard";
import BarChart from "../../TotalCharts/BarChart/BarChart";
import SearchKeywordsGMB from "../../TotalCharts/SearchKeywordGMB/SearchKeywordsGMB";
import GMBDateCard from "../../TotalCharts/GMBDateCard/GMBDateCard";
import GMBLineChart from "../../TotalCharts/GMBLineChart/GMBLineChart";
import GmbPiechart from "../../TotalCharts/GmbCharts/GmbPieChart";
import { formatDateLocal } from "../../../../utils/FormatDate";
import MetricDisplayGMB from "../../TotalCharts/GMBChart/MetricDisplayGmb/MetricDisplayGmb";

const ChartGMB = ({
  style,
  startDate,
  endDate,
  GMBLocation_Id,
  DesktopMaps,
  SearchKeywords,
  GMBAccount_Id,
  TotalProfileImpression,
  BusinessInteractions,
  setChartRef, ////pdf
}) => {
  const [pieChartData, setPieChartData] = useState({
    labels: ["Mobile Search", "Desktop Search", "Mobile Maps", "Desktop Maps"],
    dataValues: [0, 0, 0, 0],
    total: 0,
  });
  const [mapsVsSearchData, setMapsVsSearchData] = useState({
    labels: ["Search", "Maps"],
    dataValues: [0, 0],
    total: 0,
  });
  const [mobileVsDesktopData, setMobileVsDesktopData] = useState({
    labels: ["Mobile", "Desktop"],
    dataValues: [0, 0],
    total: 0,
  });
  const [loadingPieData, setLoadingPieData] = useState(true);
  const apibaseurl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");
  const formattedStart = formatDateLocal(startDate);
  const formattedEnd = formatDateLocal(endDate);

  const startDateObj = new Date(startDate);
  const startYear = startDateObj.getFullYear();
  const startMonth = startDateObj.getMonth() + 1;

  const calculateTotalImpressions = useCallback(
    (data) => {
      try {
        if (!data?.multiDailyMetricTimeSeries?.length) return 0;

        let total = 0;
        data.multiDailyMetricTimeSeries.forEach((metricSeries) => {
          if (!metricSeries?.dailyMetricTimeSeries) return;
          metricSeries.dailyMetricTimeSeries.forEach((series) => {
            const datedValues = series?.timeSeries?.datedValues || [];
            datedValues.forEach((item) => {
              if (item?.value && item?.date) {
                const itemYear = item.date.year;
                const itemMonth = item.date.month;

                if (itemYear === startYear && itemMonth === startMonth) {
                  total += parseInt(item.value, 10) || 0;
                }
              }
            });
          });
        });
        return total;
      } catch (err) {
        console.error("Error calculating impressions:", err);
        return 0;
      }
    },
    [startYear, startMonth]
  );

  useEffect(() => {
    if (!GMBLocation_Id) {
      setLoadingPieData(false);
      setPieChartData({
        labels: [
          "Mobile Search",
          "Desktop Search",
          "Mobile Maps",
          "Desktop Maps",
        ],
        dataValues: [0, 0, 0, 0],
        total: 0,
      });
      setMapsVsSearchData({
        labels: ["Search", "Maps"],
        dataValues: [0, 0],
        total: 0,
      });
      setMobileVsDesktopData({
        labels: ["Mobile", "Desktop"],
        dataValues: [0, 0],
        total: 0,
      });
      return;
    }

    const fetchPieChartData = async () => {
      setLoadingPieData(true);
      const newDataValues = [0, 0, 0, 0];
      const labels = [
        "Mobile Search",
        "Desktop Search",
        "Mobile Maps",
        "Desktop Maps",
      ];
      const urlToIndex = {
        "mobile-search": 0,
        "desktop-search": 1,
        "mobile-maps": 2,
        "desktop-maps": 3,
      };

      try {
        for (const data of DesktopMaps) {
          const apiUrl = `${apibaseurl}/api/${data.apiurl}/${data.url}`;
          const requestBody = {
            accountId: GMBAccount_Id,
            locationId: GMBLocation_Id,
            startDate: formattedStart,
            endDate: formattedEnd,
          };

          const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(requestBody),
          });

          if (!response.ok) {
            throw new Error(
              `Request failed for ${data.url} with status ${response.status}`
            );
          }

          const result = await response.json();
          const total = calculateTotalImpressions(result);
          const index = urlToIndex[data.url];
          if (index !== undefined) {
            newDataValues[index] = total;
          }
        }

        const total = newDataValues.reduce((a, b) => a + b, 0);

        const totalSearch = newDataValues[0] + newDataValues[1];
        const totalMaps = newDataValues[2] + newDataValues[3];
        setMapsVsSearchData({
          labels: ["Search", "Maps"],
          dataValues: [totalSearch, totalMaps],
          total,
        });

        const totalMobile = newDataValues[0] + newDataValues[2];
        const totalDesktop = newDataValues[1] + newDataValues[3];
        setMobileVsDesktopData({
          labels: ["Mobile", "Desktop"],
          dataValues: [totalMobile, totalDesktop],
          total,
        });

        setPieChartData({ labels, dataValues: newDataValues, total });
      } catch (err) {
        console.error("Error fetching pie chart data:", err);
        setPieChartData({
          labels,
          dataValues: [0, 0, 0, 0],
          total: 0,
        });
        setMapsVsSearchData({
          labels: ["Search", "Maps"],
          dataValues: [0, 0],
          total: 0,
        });
        setMobileVsDesktopData({
          labels: ["Mobile", "Desktop"],
          dataValues: [0, 0],
          total: 0,
        });
      } finally {
        setLoadingPieData(false);
      }
    };

    fetchPieChartData();
  }, [
    GMBLocation_Id,
    GMBAccount_Id,
    formattedStart,
    formattedEnd,
    DesktopMaps,
    apibaseurl,
    token,
    calculateTotalImpressions,
  ]);
  // ===== YEH LINES ADD KARNI HAIN =====
  // PDF Ref IDs: Yeh arrays .map() loop ke andar har chart ko ek unique ID dene ke liye hain.
  // `index` ka use karke in arrays se sahi ID chuni jaati hai.
  const profileImpressionIds = ['gmb_impressions_search', 'gmb_impressions_maps'];
  // Order must match DesktopMaps in GmbApis.js
  const searchBreakdownIds = [
    'gmb_desktop_maps',
    'gmb_desktop_search',
    'gmb_mobile_maps',
    'gmb_mobile_search',
    'gmb_calls_made',
    'gmb_direction_requests',
    'gmb_website_clicks',
  ];
  const interactionIds = ['gmb_website_clicks', 'gmb_direction_requests', 'gmb_calls_made'];

  // ===================================

  return (
    <>
      <div className={`${style.table_heading} mb-5`}>
        <h4 className="mb-0">Local SEO</h4>
        <p className={`${style.table_subheading}`}>
          (Data Source - Google My Business )
        </p>
      </div>

      <Row className="mt-3">
        {/* Pie charts par alag-alag ref */}
        <Col md={4} ref={(el) => setChartRef('gmb_pie_platform_device', el)}>
          <GmbPiechart
            title="Platform & Device"
            totalText="Impressions"
            labels={pieChartData.labels}
            dataValues={pieChartData.dataValues}
            total={pieChartData.total}
            loading={loadingPieData}
          />
        </Col>
        <Col md={4} ref={(el) => setChartRef('gmb_pie_mobile_desktop', el)}>
          <GmbPiechart
            title="Total Mobile vs Desktop"
            totalText="Impressions"
            labels={mobileVsDesktopData.labels}
            dataValues={mobileVsDesktopData.dataValues}
            total={mobileVsDesktopData.total}
            loading={loadingPieData}
          />
        </Col>
        <Col md={4} ref={(el) => setChartRef('gmb_pie_maps_search', el)}>
          <GmbPiechart
            title="Total Maps vs Search"
            totalText="Impressions"
            labels={mapsVsSearchData.labels}
            dataValues={mapsVsSearchData.dataValues}
            total={mapsVsSearchData.total}
            loading={loadingPieData}
          />
        </Col>
      </Row>
      {/* Profile Impressions (2 charts) */}

      <Row className="mt-3 ">
        {TotalProfileImpression.map((data, index) => (
          <Col xs={12} md={6} lg={6} className="mt-3 mb-5" key={data.id} ref={(el) => setChartRef(profileImpressionIds[index], el)}>
            <BarChart
              GMBLocation_Id={GMBLocation_Id}
              GMBAccount_Id={GMBAccount_Id}
              id={data.id}
              SquareBox={data}
              startDate={startDate}
              endDate={endDate}
              title={data.title}
            />
          </Col>
        ))}
      </Row>
      {/* Business Interactions (1 chart) */}
      <Row>
        <Col
          xs={12}
          md={12}
          lg={12}
          className="mt-3 mb-5"
          key={BusinessInteractions[0].id}
         ref={(el) => setChartRef('gmb_business_interactions', el)} >
          <MetricDisplayGMB
            locationId={GMBLocation_Id}
            accountId={GMBAccount_Id}
            id={BusinessInteractions[0].id}
            SquareBox={BusinessInteractions[0]}
            startDate={startDate}
            endDate={endDate}
            title={BusinessInteractions[0].title}
            code={BusinessInteractions[0].code}
          />
        </Col>
      </Row>
      <Row>
        {DesktopMaps.map((data, index) => (
          <Col xs={12} md={6} lg={4} className="mt-3 mb-5" key={data.id} ref={(el) => setChartRef(searchBreakdownIds[index], el)}>
            <BarChart
              GMBLocation_Id={GMBLocation_Id}
              GMBAccount_Id={GMBAccount_Id}
              id={data.id}
              SquareBox={data}
              startDate={startDate}
              endDate={endDate}
              title={data.title}
            />
          </Col>
        ))}
      </Row>
    </>
  );
};

export default ChartGMB;
