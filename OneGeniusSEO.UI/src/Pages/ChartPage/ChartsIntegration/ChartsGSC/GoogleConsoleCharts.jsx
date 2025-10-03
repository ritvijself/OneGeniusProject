import React from "react";
import { Row, Col } from "react-bootstrap";
import DeviceTable from "../../TotalCharts/DeviceTable/DeviceTable";
import ClicksLineGraph from "../../TotalCharts/ClickLineGraphGSC/ClickLineGraph";
import MetricSquareBox from "../../TotalCharts/MetricSquareBoxGSC/MetricSquareBox";
import ProgressBar from "../../TotalCharts/ProgressBar/ProgressBar";
import SecurityCheckBox from "../../TotalCharts/SecurityCheckBox/SecurityCheckBox";
import SitemapTable from "../../TotalCharts/SitemapTable/SitemapTable";

const GoogleConsoleCharts = ({
  propertyid,
  startDate,
  endDate,
  GoogleOrganicRanking,
  style,
  siteUrl,
  PopularContent,
  PerformanceByDevices,
  SearchClicksGsc,
  SitemapTableApi,
  SecurityCheckApi,
  SearchClicksGscOneMonth,
  Top5SearchQueries,
  Top5Pages,
  setChartRef,
}) => {
  return (
    <>
      {/* GSC Charts */}
      <div className={`text-center mt-5 mb-5`}>
        <h4 className=" " style={{ fontSize: "25px" }}>
          Website Monitoring and Performance
        </h4>
        <p className={`${style.table_subheading}`}>
          (Data Source - Google Search Console )
        </p>
      </div>

      {/* <<<<<< CHANGE: REF KO POORE "TOP QUERIES" SECTION PAR LAGANE KE LIYE WRAPPER DIV ADD KIYE >>>>>> */}
      <div ref={(el) => setChartRef('gsc_clicksLineGraph', el)}>
        <div className={`${style.organic_heading} `}>
          <h4 className="mb-0">Top Queries</h4>
        </div>
        <Row>
          <Col md={6} className="mt-3">
            <p>Number of people who clicked on your website</p>
            <ClicksLineGraph
              id={SearchClicksGsc[0].id}
              SquareBox={SearchClicksGsc[0]}
              startDate={startDate}
              endDate={endDate}
              title={SearchClicksGsc[0].title}
              siteUrl={siteUrl}
            />
          </Col>
          <Col md={6} className="mt-3">
            <p>What people are searching for you - Top 5 Keywords</p>
            {/* Note: Ye chart 'gsc_clicksLineGraph' ke screenshot me aa jayega. Agar alag se chahiye toh naya ID/ref banayein. */}
            <ProgressBar
              siteUrl={siteUrl}
              Progress={Top5SearchQueries[0]}
              startDate={startDate}
              endDate={endDate}
              id={Top5SearchQueries[0].id}
              title={Top5SearchQueries[0].title}
              barColor={"#0073ed"}
              titleSize={"16px"}
            />
          </Col>
        </Row>
      </div>
      
      {/* Note: Top 5 Queries ka dusra chart, gsc_top5QueriesBar, upar wale screenshot me hi aa gaya hai. Agar aapko dono alag alag chahiye, to aapko dono ke liye alag alag wrapper div banana padega. Simplicity ke liye maine dono ko ek me daal diya hai. */}
      {/* Agar gsc_top5QueriesBar ko alag se capture karna hai toh yeh structure use karein:
        <div ref={(el) => setChartRef('gsc_top5QueriesBar', el)}>
          <p>What people are searching for you - Top 5 Keywords</p>
          <ProgressBar ... />
        </div>
      */}

      <div ref={(el) => setChartRef('gsc_performanceMetrices', el)}>
        <Row>
          <Col className="mb-5 g-4 mt-5" md={12}>
            <MetricSquareBox
              id={SearchClicksGscOneMonth[0].id}
              SquareBox={SearchClicksGscOneMonth[0]}
              startDate={startDate}
              endDate={endDate}
              title={SearchClicksGscOneMonth[0].title}
              siteUrl={siteUrl}
            />
          </Col>
        </Row>
      </div>

      {/* <<<<<< CHANGE: REF KO COL PAR MOVE KIYA गया HAI TAAKI HEADING BHI CAPTURE HO >>>>>> */}
      <Row>
        <Col className="mb-5 g-4 mt-3" md={12} ref={(el) => setChartRef('gsc_top50QueriesTable', el)}>
          <div className={`${style.organic_heading} `}>
            <h4 className="mb-0">Top 50 Queries</h4>
          </div>
          <p>What people are searching for you - Top 50 Keywords</p>
          <DeviceTable
            siteUrl={siteUrl}
            SquareBox={GoogleOrganicRanking[0]}
            startDate={startDate}
            endDate={endDate}
            id={GoogleOrganicRanking[0].id}
            title={GoogleOrganicRanking[0].title}
            columns={[
                { key: "query", label: "Keywords" }, { key: "clicks", label: "Clicks" }, { key: "impressions", label: "Impressions" }, { key: "position", label: "Avg Position" }, { key: "ctr", label: "CTR" },
            ]}
          />
        </Col>
      </Row>
      
      <Row>
        <Col md={12} className="mt-3 mb-5 pb-3" ref={(el) => setChartRef('gsc_top5pagesProgressBar', el)}>
          <div className={`${style.organic_heading} `}>
            <h4 className="mb-0"> Top 5 Pages Visited</h4>
          </div>
          <ProgressBar
            siteUrl={siteUrl}
            Progress={Top5Pages[0]}
            startDate={startDate}
            endDate={endDate}
            id={Top5Pages[0].id}
            barColor={"#0073ed"}
            titleSize={"16px"}
          />
        </Col>
      </Row>

      <Row>
        <Col className="mb-5 g-4 mt-3" md={12} ref={(el) => setChartRef('gsc_top50PagesVisited', el)}>
          <div className={`${style.organic_heading} `}>
            <h4 className="mb-0"> Top 50 Pages Visited</h4>
          </div>
          <DeviceTable
            id={PopularContent[0].id}
            title={PopularContent[0].title}
            siteUrl={siteUrl}
            SquareBox={PopularContent[0]}
            startDate={startDate}
            endDate={endDate}
            columns={[
                { key: "page", label: "Pages" }, { key: "clicks", label: "Clicks" }, { key: "impressions", label: "Impressions" }, { key: "position", label: "Avg Position" }, { key: "ctr", label: "CTR" },
            ]}
          />
        </Col>
      </Row>

      <Row>
        <Col className="mb-5 g-4 mt-3" md={12} ref={(el) => setChartRef('gsc_performanceDeviceTable', el)}>
          <div className={`${style.organic_heading} `}>
            <h4 className="mb-0">Performance by Devices</h4>
          </div>
          <DeviceTable
            siteUrl={siteUrl}
            SquareBox={PerformanceByDevices[0]}
            startDate={startDate}
            endDate={endDate}
            id={PerformanceByDevices[0].id}
            title={PerformanceByDevices[0].title}
            columns={[
                { key: "device", label: "Devices" }, { key: "clicks", label: "Clicks" }, { key: "impressions", label: "Impressions" }, { key: "position", label: "Avg Position" }, { key: "ctr", label: "CTR" },
            ]}
          />
        </Col>
      </Row>

      <Row>
        <Col md={12} className="mt-3 mb-3" ref={(el) => setChartRef('gsc_securityIssuesSecurityCheckBox', el)}>
          <div className={`${style.organic_heading} `}>
            <h4 className="mb-0">Security Issues</h4>
          </div>
          <SecurityCheckBox
            siteUrl={siteUrl}
            startDate={startDate}
            endDate={endDate}
            SquareBox={SecurityCheckApi[0]}
          />
        </Col>
      </Row>
      
      <Row>
        <Col className="mb-5 g-4" md={12} ref={(el) => setChartRef('gsc_sitemapTable', el)}>
          <div className={`${style.organic_heading} `}>
            <h4 className="mb-0">Sitemap Table</h4>
          </div>
          <SitemapTable
            propertyid={propertyid}
            siteUrl={siteUrl}
            startDate={startDate}
            endDate={endDate}
            SquareBox={SitemapTableApi[0]}
            id={SitemapTableApi[0].id}
            title={SitemapTableApi[0].title}
          />
        </Col>
      </Row>
    </>
  );
};

export default GoogleConsoleCharts;