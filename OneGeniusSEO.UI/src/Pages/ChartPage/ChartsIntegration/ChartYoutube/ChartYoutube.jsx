import React from "react";
import { Row, Col } from "react-bootstrap";
import SubscriberTrendChart from "../../TotalCharts/YoutubeCharts/SubscriberTrendchart/SubscriberTrendChart";
import YoutubeCards from "../../TotalCharts/YoutubeCharts/SquareIconBox/YoutubeCards";
import { FaPlayCircle, FaThumbsUp, FaEye } from "react-icons/fa";
import { TiGroup } from "react-icons/ti";
import SocialPostTable from "../../TotalCharts/TopPostFB/FBPostTable";
import ChannelLikesChart from "../../TotalCharts/YoutubeCharts/LineGraph/DoubleLineChart";

const ChartYoutube = ({
  startDate,
  endDate,
  ytChannel_Id,
  SubscriberGainsAndLosses,
  statistics,
  channelLifetimeLikes,
  ChannelLikesMonthly,
  engagementByCountry,
  setChartRef,  //pdf 
}) => {
  return (
    <>
      <div className={`text-center mt-5 `}>
        <h4 className="mb-4 fw-bold" style={{ fontSize: "35px" }}>
          Youtube Reports
        </h4>
      </div>
      
      <Row>
        <Col md={6} lg={6} sm={12} className="mb-3 mt-3">
          <div ref={(el) => setChartRef('yt_totalViewsCard', el)}>
            <YoutubeCards
              title="Total Views"
              icon={<FaEye />}
              ytChannel_Id={ytChannel_Id}
              startDate={startDate}
              data={statistics[0]}
              id={statistics[0].id}
              endDate={endDate}
              metricType="views"
            />
          </div>
        </Col>
        <Col md={6} lg={6} sm={12} className="mb-3 mt-3">
          <div ref={(el) => setChartRef('yt_totalVideosCard', el)}>
            <YoutubeCards
              title="Total Videos"
              icon={<FaPlayCircle />}
              ytChannel_Id={ytChannel_Id}
              startDate={startDate}
              endDate={endDate}
              data={statistics[0]}
              id={statistics[0].id}
              metricType="videos"
            />
          </div>
        </Col>
      </Row>
      <Row>
        <Col md={6} lg={6} sm={12} className="mb-3 mt-3">
          <div ref={(el) => setChartRef('yt_subscribersCard', el)}>
            <YoutubeCards
              title="Subscribers"
              icon={<TiGroup />}
              ytChannel_Id={ytChannel_Id}
              startDate={startDate}
              endDate={endDate}
              data={statistics[0]}
              id={statistics[0].id}
              metricType="subscribers"
            />
          </div>
        </Col>
        <Col md={6} lg={6} sm={12} className="mb-3 mt-3">
          <div ref={(el) => setChartRef('yt_likesCard', el)}>
            <YoutubeCards
              title={channelLifetimeLikes[0].title}
              icon={<FaThumbsUp />}
              ytChannel_Id={ytChannel_Id}
              startDate={startDate}
              endDate={endDate}
              data={channelLifetimeLikes[0]}
              id={channelLifetimeLikes[0].id}
            />
          </div>
        </Col>
      </Row>

      <Row>
        <Col md={12} lg={12} sm={12} className="mb-3 mt-3">
          <div ref={(el) => setChartRef('yt_subscriberTrend', el)}>
            <SubscriberTrendChart
              ytChannel_Id={ytChannel_Id}
              startDate={startDate}
              endDate={endDate}
              id={SubscriberGainsAndLosses[0].id}
              data={SubscriberGainsAndLosses[0]}
              title={SubscriberGainsAndLosses[0].title}
            />
          </div>
        </Col>
      </Row>

      <Row>
        <Col md={12} lg={12} sm={12} className="mb-3 mt-3">
          <div ref={(el) => setChartRef('yt_likesTrend', el)}>
            <ChannelLikesChart
              ytChannel_Id={ytChannel_Id}
              startDate={startDate}
              endDate={endDate}
              id={ChannelLikesMonthly[0].id}
              data={ChannelLikesMonthly[0]}
              title={ChannelLikesMonthly[0].title}
            />
          </div>
        </Col>
      </Row>

      <Row>
        <Col md={12} lg={12} sm={12} className="mb-3 mt-3">
          <div ref={(el) => setChartRef('yt_engagementTable', el)}>
            <SocialPostTable
              platform="youtube"
              ytChannelId={ytChannel_Id}
              startDate={startDate}
              endDate={endDate}
              data={engagementByCountry[0]}
              id={engagementByCountry[0].id}
            />
          </div>
        </Col>
      </Row>
    </>
  );
};

export default ChartYoutube;