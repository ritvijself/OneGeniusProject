import React, { useState } from "react";
import { Row, Col } from "react-bootstrap";
import ProgressBar from "../../TotalCharts/ProgressBar/ProgressBar";
import DeviceTable from "../../TotalCharts/DeviceTable/DeviceTable";
import PieChartGA4 from "../../TotalCharts/GA4Charts/PieChartGA4";
import LineChartGA4 from "../../TotalCharts/GA4Charts/LineChartGA4";
import MetricSquareBoxGA4 from "../../TotalCharts/GA4Charts/MetricSquareBoxGA4";
import LineCharfilledGA4 from "../../TotalCharts/GA4Charts/LineChartfilledGA4";
import ConversionData from "../../TotalCharts/GA4Charts/ConversionData";
import DeviceBrowserChart from "../../TotalCharts/GA4Charts/DeviceBrowserChart";
import WorldMapChart from "../../TotalCharts/GA4Charts/WorldMapChart";
import DeviceSessionsChart from "../../TotalCharts/GA4Charts/DevicesSessionsChart";
import DeviceBounceBarChart from "../../TotalCharts/GA4Charts/DeviceBounceBarChart";
import MultiLineChartGA4 from "../../TotalCharts/GA4Charts/MultiLineChartGA4";
import ChannelTable from "../../TotalCharts/DeviceTable/ChannelTable";
import AvgEngagementBarChart from "../../TotalCharts/GA4Charts/AverageEngagementBarChart";
import BarChartActiveUser from "../../TotalCharts/GA4Charts/BarChartActiveUser/BarChartActiveUser";
import LineChartGA4ThreeMonth from "../../TotalCharts/GA4Charts/LineChartGA4ThreeMonth";
import BounceEngagementMetricBox from "../../TotalCharts/GA4Charts/BounceEngagementMetricBox";
import ContactFormChart from "../../TotalCharts/GA4Charts/ContactFormChart";
import ChannelSessionTable from "../../TotalCharts/DeviceTable/ChannelSessionTable";
import MetricDisplayGA4 from "../../TotalCharts/GA4Charts/MetricDisplayGA4/MetricDisplayGA4";

const ChartGA4 = ({
  propertyid,
  startDate,
  endDate,
  ConversionRate,
  Traffic,
  SessionByDevice,
  Devices,
  style,
  DayBydDayUser,
  activeUser,
  newUserDayByDay,
  UserEngagementDayByDay,
  TotalUserByCountry,
  TotalUserByCity,
  TotalUserByLanguage,
  TotalUserByDeviceBrowser,
  UserEngagementByCountry,
  KeyEventCountry,
  TotalPageUsers,
  PageViewPerDay,
  TrafficSourcePerPage,
  engSessions,
  engSessionsDevices,
  CampaignTable,
  BounceRateDevices,
  TotalDeviceUsersDayWise,
  CountByDevice,
  KeyEventsByDevice,
  SessionTable,
  GA4HighLight,
  AverageEngagement,
  TotalUserMap,
  sessions,
  setChartRef ///pdf
}) => {
  const safeTraffic = Traffic?.[0] || { id: "traffic-fallback" };

  const [totalUsers, setTotalUsers] = useState(0);

  return (
    <>
      {/* Total Channel */}
      <div className={`${style.table_heading} mb-3`}>
        <h4 className="mb-0">Website Traffic Overview</h4>
        <p className={`${style.table_subheading}`}>
          (Data Source - Google Analytics 4)
        </p>
      </div>
      <p>How people are finding you on Google</p>
      <Row className="mt-3">
        <Col md={6} key={SessionTable[0].id}>
        <div ref={(el) => setChartRef('ga4_channelsessiontable', el)}>
           <ChannelSessionTable
            propertyId={propertyid}
            SquareBox={SessionTable[0]}
            id={SessionTable[0].id}
            startDate={startDate}
            endDate={endDate}
            title={SessionTable[0].title}
          />
         </div>
        </Col>

        <Col md={6} key={DayBydDayUser[0].id}>
         <div ref={(el) => setChartRef('ga4_linechartga4threemonth', el)}>
          <LineChartGA4ThreeMonth
            propertyId={propertyid}
            startDate={startDate}
            id={DayBydDayUser[0].id}
            endDate={endDate}
            SquareBox={DayBydDayUser[0]}
            title={DayBydDayUser[0].title}
          />
          </div>
        </Col>
      </Row>
      <Row className="mt-3">
        <Col key={GA4HighLight[0].id} style={{ flex: 1 }}>
         <div ref={(el) => setChartRef('ga4_metricdisplayga4', el)}>
          <MetricDisplayGA4
            propertyId={propertyid}
            startDate={startDate}
            endDate={endDate}
            SquareBox={GA4HighLight[0]}
            title={GA4HighLight[0].title}
            code={GA4HighLight[0].code}
          /></div>
        </Col>
      </Row>
      <Row className="mt-3" style={{ marginBottom: "50px" }}>
        <Col md={6} key={engSessions[0].id}>
          <div ref={(el) => setChartRef('ga4_linechartga4', el)}>
          <LineChartGA4
            propertyId={propertyid}
            startDate={startDate}
            endDate={endDate}
            SquareBox={engSessions[0]}
            title={engSessions[0].title}
          /></div>
        </Col>
        <Col md={6} key={UserEngagementDayByDay[0].id}>
         <div ref={(el) => setChartRef('ga4_linechartfilledga4', el)}>
          <LineCharfilledGA4
            propertyId={propertyid}
            startDate={startDate}
            endDate={endDate}
            id={UserEngagementDayByDay[0].id}
            SquareBox={UserEngagementDayByDay[0]}
            title={UserEngagementDayByDay[0].title}
          /></div>
        </Col>
      </Row>
      <Row className="mt-3" style={{ marginBottom: "50px" }}>
        <Col md={12}>
        <div ref={(el) => setChartRef('ga4_channeltable', el)}>
          <ChannelTable
            propertyid={propertyid}
            SquareBox={safeTraffic}
            startDate={startDate}
            endDate={endDate}
            columns={[
              { key: "channel", label: "Channel" },
              { key: "sessions", label: "Sessions" },
              { key: "totalUsers", label: "Total Users" },
              { key: "userEngagementDuration", label: "User Engagement" },
              { key: "screenPageViews", label: "Views" },
              { key: "eventCount", label: "Event Count" },
              { key: "keyEvents", label: "Key Events" },
              { key: "ecommercePurchases", label: "Total Purchasers" },
            ]}
          /></div>
        </Col>
      </Row>

      {/* Conversions */}
      <div className={`${style.table_heading} mb-5`}>
        <h4 className="mb-0">Conversions</h4>
      </div>
      <Row>
        <Col md={6} key={activeUser[0].id}>
        <div ref={(el) => setChartRef('ga4_barchartactiveuser', el)}>
          <BarChartActiveUser
            propertyId={propertyid}
            id={activeUser[0].id}
            SquareBox={activeUser[0]}
            startDate={startDate}
            endDate={endDate}
            title={activeUser[0].title}
            code={activeUser[0].code}
          /></div>
        </Col>
        <Col md={6} key={newUserDayByDay[0].id}>
         <div ref={(el) => setChartRef('ga4_linechartga41', el)}>
          <LineChartGA4
            id={newUserDayByDay[0].id}
            propertyId={propertyid}
            startDate={startDate}
            endDate={endDate}
            SquareBox={newUserDayByDay[0]}
            title={newUserDayByDay[0].title}
            // height={"110px"}
          /></div>
        </Col>
      </Row>

      <Row className="mt-3" style={{ marginBottom: "50px" }}>
        <Col md={8} key={AverageEngagement[0].id}>
         <div ref={(el) => setChartRef('ga4_avgengagementbarchart', el)}>
          <AvgEngagementBarChart
            propertyId={propertyid}
            id={AverageEngagement[0].id}
            SquareBox={AverageEngagement[0]}
            startDate={startDate}
            endDate={endDate}
            title={" User Engagement Duration Per User"}
          /></div>
        </Col>
        <Col md={4} key={ConversionRate[0].id}>
          <Col md={12} key={UserEngagementDayByDay[0].id} className="mb-3">
           <div ref={(el) => setChartRef('ga4_bounceengagementmetricbox', el)} className="mb-3">
            <BounceEngagementMetricBox
              propertyId={propertyid}
              startDate={startDate}
              endDate={endDate}
              id={UserEngagementDayByDay[0].id}
              SquareBox={UserEngagementDayByDay}
              title={UserEngagementDayByDay[0].title}
              metricType="engagementDuration"
            /></div>
          </Col>
          <Col md={12}>
           <div ref={(el) => setChartRef('ga4_conversiondata', el)}>
            <ConversionData
              propertyId={propertyid}
              startDate={startDate}
              endDate={endDate}
              id={ConversionRate[0].id}
              SquareBox={ConversionRate[0]}
              title={ConversionRate[0].title}
            /></div>{" "}
          </Col>
        </Col>
      </Row>
      <Row className="mt-3" style={{ marginBottom: "50px" }}>
        <Col md={12}>
         <div ref={(el) => setChartRef('ga4_devicetable', el)}>
          <DeviceTable
            propertyid={propertyid}
            id={CampaignTable[0].id}
            SquareBox={CampaignTable[0]}
            startDate={startDate}
            endDate={endDate}
            title={CampaignTable[0].title}
            columns={[
              { key: "campaign", label: "Campaign" },
              { key: "conversions", label: "Conversions" },
              { key: "newUsers", label: "New Users" },
              { key: "totalUsers", label: "Total Users" },
              { key: "userEngagementDuration", label: "Engagement Duration" },
            ]}
          /></div>
        </Col>
      </Row>
      {/* where your vistiors are located section  */}
      <div className={`${style.table_heading} mb-5`}>
        <h4 className="mb-0">Where your Vistors are Located</h4>
      </div>
      <Row className="mt-3">
        <Col md={6} key={TotalUserMap[0].id}>
         <div ref={(el) => setChartRef('ga4_worldmapchart', el)}>
          <WorldMapChart
            propertyid={propertyid}
            Progress={TotalUserMap[0]}
            startDate={startDate}
            endDate={endDate}
            id={TotalUserMap[0].id}
            title={"Total Users By Country"}
            totalUser={totalUsers}
          /></div>
        </Col>
        <Col md={3} key={TotalUserByCountry[0].id}>
         <div ref={(el) => setChartRef('ga4_progressbar', el)}>
          <ProgressBar
            propertyid={propertyid}
            Progress={TotalUserByCountry[0]}
            startDate={startDate}
            endDate={endDate}
            id={TotalUserByCountry[0].id}
            title={TotalUserByCountry[0].title}
            barColor={"#0073ed"}
            titleSize={"16px"}
          /></div>
        </Col>
        <Col md={3} key={TotalUserByCity[0].id}>
         <div ref={(el) => setChartRef('ga4_progressbar1', el)}>
          <ProgressBar
            propertyid={propertyid}
            Progress={TotalUserByCity[0]}
            startDate={startDate}
            endDate={endDate}
            id={TotalUserByCity[0].id}
            title={TotalUserByCity[0].title}
            barColor={"#0073ed"}
            titleSize={"16px"}
          /></div>
        </Col>
      </Row> 
      <Row className="mt-3">
        {TotalUserByLanguage.map((Data , index) => (
          <Col md={4} key={Data.id}>
             <div ref={(el) => setChartRef(`ga4_language_progress_${index}`, el)}>
            <ProgressBar
              propertyid={propertyid}
              Progress={Data}
              startDate={startDate}
              endDate={endDate}
              title={Data.title}
              id={Data.id}
              barColor={"#0073ed"}
              titleSize={"16px"}
            /></div>
          </Col> 
        ))} 
        <Col md={4} key={UserEngagementByCountry[0].id}>
         <div ref={(el) => setChartRef('ga4_progressbar6', el)}>
          <ProgressBar
            propertyid={propertyid}
            Progress={UserEngagementByCountry[0]}
            startDate={startDate}
            endDate={endDate}
            title={UserEngagementByCountry[0].title}
            id={UserEngagementByCountry[0].id}
            barColor={"#0073ed"}
            titleSize={"16px"}
          /></div>
        </Col>
        <Col md={4}>
          <Col md={12} key={KeyEventCountry[0].id}>
           <div ref={(el) => setChartRef('ga4_devicesessionschart', el)}>
            <DeviceSessionsChart
              propertyId={propertyid}
              id={KeyEventCountry[0].id}
              startDate={startDate}
              endDate={endDate}
              SquareBox={KeyEventCountry[0]}
              title={KeyEventCountry[0].title}
              totalText={"Sessions"}
              dataType="device"
            /></div>
          </Col>
        </Col>
      </Row>

 <div ref={(el) => setChartRef('ga4_devivebrowserchart', el)}>
      <Row className="mt-3" style={{ marginBottom: "50px" }}>
        {TotalUserByDeviceBrowser.map((Data) => (
          <Col md={6} key={Data.id}>
            <DeviceBrowserChart
              propertyId={propertyid}
              id={Data.id}
              SquareBox={Data}
              startDate={startDate}
              endDate={endDate}
              title={Data.title}
              barColor={"#0073ed"}
              titleSize={"16px"}
            />
          </Col>
        ))}
      </Row></div>

      {/* Devices */}

      <div className={`${style.table_heading} mb-5`}>
        <h4 className="mb-0">Devices</h4>
      </div>
      <Row className="mt-3">
        <Col md={4} key={SessionByDevice[0].id}>
         <div ref={(el) => setChartRef('ga4_devicesessionschart1', el)}>
          <DeviceSessionsChart
            id={SessionByDevice[0].id}
            propertyId={propertyid}
            startDate={startDate}
            endDate={endDate}
            SquareBox={SessionByDevice[0]}
            title={"Sessions"}
            totalText={"Sessions"}
            dataType="device"
          /></div>
        </Col>
        <Col md={4} key={engSessionsDevices[0].id}>
         <div ref={(el) => setChartRef('ga4_progressbar3', el)}>
          <ProgressBar
            propertyid={propertyid}
            Progress={engSessionsDevices[0]}
            startDate={startDate}
            endDate={endDate}
            title={engSessionsDevices[0].title}
            id={engSessionsDevices[0].id}
            barColor={"#0073ed"}
            titleSize={"16px"}
          /></div>
        </Col>
        <Col md={4} key={engSessionsDevices[1].id}>
        <div ref={(el) => setChartRef('ga4_progressbar7', el)}>
          <ProgressBar
            propertyid={propertyid}
            Progress={engSessionsDevices[1]}
            startDate={startDate}
            endDate={endDate}
            title={engSessionsDevices[1].title}
            id={engSessionsDevices[1].id}
            barColor={"#0073ed"}
            titleSize={"16px"}
          /></div>
        </Col>
      </Row>

      <Row className="mt-3">
        <Col md={5} key={BounceRateDevices[0].id}>
          <div ref={(el) => setChartRef('ga4_devicebouncebarchart', el)}>
          <DeviceBounceBarChart
            propertyId={propertyid}
            id={BounceRateDevices[0].id}
            SquareBox={BounceRateDevices[0]}
            startDate={startDate}
            endDate={endDate}
            title={BounceRateDevices[0].title}
            barColor={"#0073ed"}
            titleSize={"16px"}
          /></div>
        </Col>

        <Col md={7} key={TotalDeviceUsersDayWise[0].id}>
        <div ref={(el) => setChartRef('ga4_multilinechartga4', el)}>
          <MultiLineChartGA4
            propertyId={propertyid}
            id={TotalDeviceUsersDayWise[0].id}
            SquareBox={TotalDeviceUsersDayWise[0]}
            startDate={startDate}
            endDate={endDate}
            title={TotalDeviceUsersDayWise[0].title}
          /></div>
        </Col>
      </Row>

      <Row className="mt-3">
        <Col md={4} key={TotalDeviceUsersDayWise[1].id}>
        <div ref={(el) => setChartRef('ga4_multilinechartga41', el)}>
          <MultiLineChartGA4
            propertyId={propertyid}
            id={TotalDeviceUsersDayWise[1].id}
            SquareBox={TotalDeviceUsersDayWise[1]}
            startDate={startDate}
            endDate={endDate}
            title={TotalDeviceUsersDayWise[1].title}
          /></div>
        </Col>
        <Col md={4} key={CountByDevice[0].id}>
         <div ref={(el) => setChartRef('ga4_devivebrowserchart1', el)}>
          <DeviceBrowserChart
            propertyId={propertyid}
            SquareBox={CountByDevice[0]}
            startDate={startDate}
            endDate={endDate}
            title={CountByDevice[0].title}
            id={CountByDevice[0].id}
            barColor={"#0073ed"}
            titleSize={"16px"}
          /></div>
        </Col>
        <Col md={4} key={KeyEventsByDevice[0].id}>
         <div ref={(el) => setChartRef('ga4_contactformchart', el)}>
          <ContactFormChart
            propertyId={propertyid}
            Progress={KeyEventsByDevice[0]}
            startDate={startDate}
            endDate={endDate}
            title={KeyEventsByDevice[0].title}
            id={KeyEventsByDevice[0].id}
            barColor={"#0073ed"}
            titleSize={"16px"}
          /></div>
        </Col>
      </Row>

      <Row className="mt-3" style={{ marginBottom: "50px" }}>
        <Col md={12}>
        <div ref={(el) => setChartRef('ga4_devicetable1', el)}>
          <DeviceTable
            propertyid={propertyid}
            id={Devices[0].id}
            SquareBox={Devices[0]}
            startDate={startDate}
            endDate={endDate}
            title={Devices[0].title}
            textTransform={"capitalize"}
            columns={[
              { key: "deviceCategory", label: "Device Category" },
              { key: "sessions", label: "Session" },
              { key: "totalUsers", label: "Total Users" },
              {
                key: "userEngagementDuration",
                label: "User Engagement (s)",
              },
              { key: "views", label: " Views" },
              { key: "engagementRate", label: "Key Events" },
              { key: "eventCount", label: "Event Count" },
            ]}
          /></div>
        </Col>
      </Row>

      {/* Pages */}
      <div className={`${style.table_heading} mb-5`}>
        <h4 className="mb-0">Website Pages Accessed By The User</h4>
      </div>
      <Row className="mt-3">
        <Col md={6} key={sessions[0].id}>
        <div ref={(el) => setChartRef('ga4_linechartga42', el)}>
          <LineChartGA4
            propertyId={propertyid}
            startDate={startDate}
            id={sessions[0].id}
            endDate={endDate}
            SquareBox={sessions[0]}
            title={"Sessions"}
            height={"200px"}
          /></div>
        </Col>
        <Col md={6} key={TotalPageUsers[0].id}>
         <div ref={(el) => setChartRef('ga4_progressbar4', el)}>
          <ProgressBar
            propertyid={propertyid}
            Progress={TotalPageUsers[0]}
            startDate={startDate}
            endDate={endDate}
            title={TotalPageUsers[0].title}
            id={TotalPageUsers[0].id}
            barColor={"#0073ed"}
            titleSize={"16px"}
          /></div>{" "}
        </Col>
      </Row>

      <Row className="mt-3">
        <Col md={6} key={TotalPageUsers[1].id}>
         <div ref={(el) => setChartRef('ga4_progressbar5', el)}>
          <ProgressBar
            propertyid={propertyid}
            Progress={TotalPageUsers[1]}
            startDate={startDate}
            endDate={endDate}
            title={"Number of Time your website sepecific page are views"}
            id={TotalPageUsers[1].id}
            barColor={"#0073ed"}
            titleSize={"16px"}
          /></div>{" "}
        </Col>

        <Col md={6} key={PageViewPerDay[0].id}>
         <div ref={(el) => setChartRef('ga4_linechartga43', el)}>
          <LineChartGA4
            propertyId={propertyid}
            startDate={startDate}
            id={PageViewPerDay[0].id}
            endDate={endDate}
            height={"270px"}
            SquareBox={PageViewPerDay[0]}
            title={PageViewPerDay[0].title}
          /></div>
        </Col>
      </Row>

      <Row className="mt-3" style={{ marginBottom: "50px" }}>
        <Col md={12}>
         <div ref={(el) => setChartRef('ga4_devicetable2', el)}>
          <DeviceTable
            propertyid={propertyid}
            SquareBox={TrafficSourcePerPage[0]}
            startDate={startDate}
            endDate={endDate}
            columns={[
              { key: "pagePath", label: "Pages" },
              { key: "sessions", label: "Sessions" },
              { key: "totalUsers", label: "Total Users" },
              { key: "userEngagementDuration", label: "User Engagement" },
              { key: "screenPageViews", label: "Views" },
              { key: "eventCount", label: "Event Count" },
              { key: "keyEvents", label: "Key Events" },
              { key: "ecommercePurchases", label: "Purchases" },
            ]}
          /></div>
        </Col>
      </Row>
    </>
  );
};

export default ChartGA4;
