import React, { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import {
  Traffic,
  BounceRatePercentage,
  Devices,
  ConversionRate,
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
  EnagementRateChannel,
  SessionTable,
  GA4HighLight,
  SessionByDevice,
  AverageEngagement,
  TotalUserMap,
  sessions,
} from "../../../api/Ga4Apis";
import style from "./ChartPageSecond.module.css";
import { generatePdfFromElement } from "../../../utils/PdfGenerator";
import GoogleConsoleCharts from "../ChartsIntegration/ChartsGSC/GoogleConsoleCharts";
import ChartsFb from "../ChartsIntegration/ChartsFb/ChartsFb";
import {
  FacebookUniqueImpressionApi,
  TopFivePost,
  totalFollowers,
  totalPageLikes,
  totalPost_Like_cmnt_share,
} from "../../../api/FacebookApis";
import {
  ExcelSearchQueries,
  GoogleMapRanking,
  GoogleOrganicRanking,
  PerformanceByCountry,
  PerformanceByDevices,
  PopularContent,
  SearchClicksGsc,
  SearchClicksGscOneMonth,
  SecurityCheckApi,
  SitemapTableApi,
  Top5Pages,
  Top5SearchQueries,
} from "../../../api/GscChartsApis";
import ChartGMB from "../ChartsIntegration/ChartGMB/ChartGMB";
import {
  BusinessInteractions,
  DesktopMaps,
  SearchKeywords,
  TotalProfileImpression,
} from "../../../api/GmbApis";
import ChartYoutube from "../ChartsIntegration/ChartYoutube/ChartYoutube";
import {
  channelLifetimeLikes,
  ChannelLikesMonthly,
  engagementByCountry,
  statistics,
  SubscriberGainsAndLosses,
} from "../../../api/YoutubeApis";
import { LighthouseScoreApi } from "../../../api/GoogleLightHouseApis";
import ChartInstagram from "../ChartsIntegration/ChartInstagram/ChartInstagram";
import {
  GetPostsByDateRange,
  TotalFollowers,
} from "../../../api/InstagramApis";
import ChartGA4 from "../ChartsIntegration/ChartGoogleA4/ChartGA4";
import GoogleLightHouse from "../ChartsIntegration/ChartGoogleLightHouse/ChartGoogleLightHouse";
import ExecutiveSummary from "../ExecutiveSummary/ExecutiveSummary";
import { useLocation, useNavigate } from "react-router-dom";
import ExecutiveSummaryContainer from "../ExecutiveSummary/ExecutiveSummaryConatiner";
import ChartGAds from "../ChartsIntegration/ChartGAds/ChartGAds";
import { ClicksConversionCost } from "../../../api/GoogleAdsReport";
import ChartsLinkedIn from "../ChartsIntegration/ChartLinkedIn/ChartsLinkedIn";
import ChartShopify from "../ChartsIntegration/ChartShopify/ChartShopify";
import CompareExecutiveSummary from "../ExecutiveSummary/CompareExecutiveSummary";
import ChartGAdsense from "../ChartsIntegration/ChartGAdsense/ChartGAdsense";
import { GAdsenseReport } from "../../../api/GAdsenseReport";
import { ShopifyReports } from "../../../api/ShopifyApis";
// ===== YEH DO LINES ADD KARNI HAIN =====pdf
import html2canvas from 'html2canvas';
import PdfPreview from '../../ChartPage/ChartsIntegration/Pdf/pdfPreview';
///pdf customization 
import useDashboardCustomization from "../../CustomizeDashboard/UseDashboardCustomization";
import { CHART_CONFIG } from "../ChartsIntegration/config/chart.config";
const ChartPageSecond = ({
  propertyid,
  gsC_id,
  fbPage_Id,
  gmbAccount_Id,
  gmbLocation_Id,
  ytChannelId,
  insta_Id,
  startDate,
  endDate,
  selectedIntegration,
  showSummary,
  summaryText,
  summaryImages,
  onSaveSummary,
  onDeleteSummary,
  googleAdsCustomerId,
  gAdsensePublisherId,
  linkedInUserId,
  shopifyId,
}) => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [clientName, setClientName] = useState("");
  const [clientColor, setClientColor] = useState("");
  const [websiteAddress, setWebsiteAddress] = useState("");
  const [clientLogo, setClientLogo] = useState("");
  const location = useLocation();
  const visibleRef = useRef();
  const pdfContentRef = useRef();
  const clientSeq =
    location.state?.clientSeq || localStorage.getItem("selectedClientSeq");

  ////States for Pdf Preview & Props 
  const [showPreview, setshowPreview] = useState(false);
  const [pdfProps, setpdfProps] = useState(null);
   // <<<<<< pfd  >>>>>>
  const chartRefs = useRef({});
  const setChartRef = (id, element) => {
    chartRefs.current[id] = element;
  };

  // / REFS FOR ALL SECTIONS
  const refExecutiveSummary = useRef(null);
  const refGa4 = useRef(null);
  const refGmb = useRef(null);
  const refGAds = useRef(null);
  const refFb = useRef(null);
  const refYoutube = useRef(null);
  const refInsta = useRef(null);
  const refCompareSummary = useRef(null);


  const [clientLogoBase64, setClientLogoBase64] = useState("");
  const [agencyLogoBase64, setAgencyLogoBase64] = useState("");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [reportType, setReportType] = useState("SEO");

  const apibaseurl = import.meta.env.VITE_API_BASE_URL;
  // const handleDownloadPdf = async () => {
  //   try {
  //     setIsGeneratingPdf(true); // Disable the button and show loader

  //     const monthYear = startDate.toLocaleDateString("en-US", {
  //       month: "long",
  //       year: "numeric",
  //     });

  //     const [month, year] = monthYear.split(" ");
  //     const fileName = `${clientName || "dashboard"} ${
  //       reportType || "SEO"
  //     } Report ${month}_${year}.pdf`;

  //     await generatePdfFromElement(pdfContentRef.current, fileName, {
  //       logging: true,
  //     });

  //     setIsGeneratingPdf(false); // Re-enable after generation
  //   } catch (err) {
  //     setIsGeneratingPdf(false); // Ensure re-enabled on error
  //     setError("Failed to generate PDF. Please try again.");
  //   }
  // };

  {/*  Pdf update */ }
  const token = localStorage.getItem("token");
  const { chartConfigurations } = useDashboardCustomization(apibaseurl, token);

  // ChartPageSecond.jsx ke andar...
// Purane 'handlePreviewPdf' ko update kiya 
  const handlePreviewPdf = async () => {
    setIsGeneratingPdf(true);
    if (!clientName) {
        alert("Client details loading, please wait.");
        setIsGeneratingPdf(false);
        return;
    }

    const captureImage = async (ref) => {
        if (!ref) return null;
        try {
            const canvas = await html2canvas(ref, { useCORS: true, scale: 3 });
            return canvas.toDataURL('image/png');
        } catch (err) {
            console.error("Error capturing element:", ref.id || ref, err);
            return null; // Ek chart fail ho toh baaki chalte rahein
        }
    };

    try {
        // Sirf visible charts ko capture karne ke liye filter karein
        const chartsToCapture = CHART_CONFIG.filter(chart => {
            const isIntegrationSelected = shouldRenderChart(chart.integration);
            const hasRequiredId = 
                (chart.integration === 'Google Analytics 4' && propertyid) ||
                (chart.integration === 'Google Search Console' && gsC_id) ||
                (chart.integration === 'YouTube' && ytChannelId) ||
                !['Google Analytics 4', 'Google Search Console', 'YouTube'].includes(chart.integration);
            return isIntegrationSelected && hasRequiredId && chartRefs.current[chart.id];
        });

        // Promise.all se sabhi screenshots ek saath (parallel) lein
        const imagePromises = chartsToCapture.map(chart => 
            captureImage(chartRefs.current[chart.id]).then(imageData => ({
                id: chart.id,
                image: imageData
            }))
        );
        const capturedImagesData = await Promise.all(imagePromises);

        const capturedImages = capturedImagesData.reduce((acc, data) => {
            if(data.image) acc[data.id] = data.image;
            return acc;
        }, {});

        // PDF props ko dynamically generate karein
        const propsForPdf = CHART_CONFIG.reduce((props, chart) => {
            const integrationConfig = chartConfigurations[chart.integration];
            
            // Image Data
            props[chart.id] = capturedImages[chart.id] || null;

            // Customization (Show/Hide) Data
            props[`show_${chart.id}`] = integrationConfig?.[chart.configKey]?.selected ?? true;
            
            return props;
        }, {
            // Common data
            clientName,
            websiteAddress,
            reportDate: startDate.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
            agencyLogo: agencyLogoBase64,
            clientLogo: clientLogoBase64,
        });
        
        setpdfProps(propsForPdf);
        setshowPreview(true);

    } catch (err) {
        setError("Failed to prepare PDF preview. Please try again.");
        console.error(err);
    } finally {
        setIsGeneratingPdf(false);
    }
  };


  useEffect(() => {
    const fetchClientDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!clientSeq) {
          console.warn("No clientSeq found, skipping client details fetch");
          setClientName("");
          setWebsiteAddress("");
          setClientColor("");
          setClientLogo("");
          return;
        }
        const response = await fetch(
          `${apibaseurl}/api/AgencyClient/client-Details-by-user&ClientId?clientSeq=${clientSeq}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            },
          }
        );
        const data = await response.json();

        if (data[0]?.isSuccess) {
          setClientName(data[0].clientName || "");
          setWebsiteAddress(data[0].webSiteAddress || "");
          setClientColor(data[0].clientColor || "");
          setClientLogo(data[0].clientLogo || "");
          setReportType(data[0].reportType || "SEO");
        } else {
          console.error("Failed to fetch client details:", data.message);
          setClientName("");
          setWebsiteAddress("");
          setClientColor("");
          setClientLogo("");
        }
      } catch (err) {
        console.error("Error fetching client details:", err);
        setClientName("");
        setWebsiteAddress("");
        setClientColor("");
        setClientLogo("");
      }
    };

    fetchClientDetails();
  }, [location.state?.clientSeq, clientSeq]);

  useEffect(() => {
    const convertImageToBase64 = async (imageUrl) => {
      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();

        const reader = new FileReader();
        reader.onloadend = () => {
          setClientLogoBase64(reader.result);
        };
        reader.readAsDataURL(blob);
      } catch (error) {
        console.error("Error converting image to base64:", error);
        setClientLogoBase64("");
      }
    };

    if (clientLogo) {
      const logoUrl = `${apibaseurl}/${clientLogo}`;
      convertImageToBase64(logoUrl);
    }
  }, [clientLogo]);

  useEffect(() => {
    const fetchAgencyLogo = async () => {
      try {
        const token = localStorage.getItem("daToken");
        if (!token) return;

        const response = await fetch(
          `${apibaseurl}/api/DigitalAgency/get-user-profile`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (response.ok && data.isSuccess) {
          const logoPath = data.data.logoPath;
          if (logoPath) {
            const logoUrl = `${apibaseurl}/${logoPath}`;
            const imgRes = await fetch(logoUrl);
            const blob = await imgRes.blob();
            const reader = new FileReader();
            reader.onloadend = () => {
              setAgencyLogoBase64(reader.result);
            };
            reader.readAsDataURL(blob);
          }
        } else {
          console.error("Failed to fetch agency logo");
        }
      } catch (error) {
        console.error("Error fetching agency logo:", error);
      }
    };

    fetchAgencyLogo();
  }, []);

  const renderAllCharts = selectedIntegration === "";
  const shouldRenderChart = (integration) =>
    renderAllCharts || selectedIntegration === integration;

  if (!clientSeq) {
    return (
      <Container
        fluid
        className="d-flex justify-content-center align-items-center"
        style={{ height: "70vh" }}
      >
        <div className="text-center">
          <h4>
            No client selected. Please create a client to view the dashboard.
          </h4>
          <Button
            variant="primary"
            className="mt-3"
            onClick={() => navigate("/clientdashboard")}
          >
            Create Client
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <>
      {/* ////pdffffffffffffffffff  */}
      {showPreview && pdfProps && (
        <PdfPreview documentProps={pdfProps} onClose={() => setshowPreview(false)} />
      )}
      {error && (
        <div className="mt-4 text-red-600 bg-red-100 p-4 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div ref={visibleRef} className={style.chart_container}>
        <div className="d-flex justify-content-end">
          {/* <Button
            variant=""
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className={`${style.downloadButton} ${
              isGeneratingPdf ? "disabled" : ""
            }`}
          >
            {isGeneratingPdf ? (
              <span>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Generating PDF...
              </span>
            ) : (
              "Download PDF"
            )}
          </Button> */}

          {/* new button for pdf  */}
          <Button
            variant=""
            onClick={handlePreviewPdf}
            disabled={isGeneratingPdf}
            className={`${style.downloadButton} ${isGeneratingPdf ? "disabled" : ""}`}
          >
            {isGeneratingPdf ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true">Generating Preview </span>
              </>
            ) : ("Preview PDF"
            )}

          </Button>

        </div>

        <div ref={pdfContentRef}>
          <Container
            fluid
            style={{
              width: "100%",
              backgroundColor: "#fafafa",
              padding: "30px 30px",
            }}
          >
            <div
              className="d-flex justify-content-between"
              style={{ paddingTop: "20px" }}
            >
              {/* Left: Agency Logo */}
              <div>
                {agencyLogoBase64 && (
                  <img
                    src={agencyLogoBase64}
                    alt="Agency Logo"
                    style={{ width: "70px", height: "50px" }}
                  />
                )}
              </div>

              {/* Right: Client Logo */}
              <div style={{ direction: "rtl" }}>
                {clientLogoBase64 && (
                  <img
                    src={clientLogoBase64}
                    alt="Client Logo"
                    style={{ height: "50px" }}
                  />
                )}
              </div>
            </div>

            <Row className="text-center mb-2">
              <div className={style.property_name}>
                {clientName || "Loading..."}
              </div>
              <div style={{ fontSize: "13px" }}>
                ({websiteAddress || "Loading..."})
              </div>
            </Row>

            <div className={style.banner_container}>
              <div
                className={style.banner}
                style={{
                  paddingBottom: "10px",
                }}
              >
                Monthly {reportType} Report -{" "}
                {startDate.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}{" "}
                <p style={{ margin: "3px", fontSize: "12px" }}>
                  Report Generated on{" "}
                  {new Date().toLocaleDateString("en-US", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
            <div className={style.report_title_box}>
              <ExecutiveSummary
                showSummary={showSummary}
                summaryText={summaryText}
                summaryImages={summaryImages}
                onSaveSummary={onSaveSummary}
                onDeleteSummary={onDeleteSummary}
              />
            </div>

            {shouldRenderChart("Google Analytics 4") && propertyid && (
              <ChartGA4
                propertyid={propertyid}
                startDate={startDate}
                endDate={endDate}
                ConversionRate={ConversionRate}
                Traffic={Traffic}
                BounceRatePercentage={BounceRatePercentage}
                Devices={Devices}
                style={style}
                DayBydDayUser={DayBydDayUser}
                activeUser={activeUser}
                newUserDayByDay={newUserDayByDay}
                UserEngagementDayByDay={UserEngagementDayByDay}
                TotalUserByCountry={TotalUserByCountry}
                TotalUserByCity={TotalUserByCity}
                TotalUserByLanguage={TotalUserByLanguage}
                TotalUserByDeviceBrowser={TotalUserByDeviceBrowser}
                UserEngagementByCountry={UserEngagementByCountry}
                KeyEventCountry={KeyEventCountry}
                TotalPageUsers={TotalPageUsers}
                PageViewPerDay={PageViewPerDay}
                TrafficSourcePerPage={TrafficSourcePerPage}
                engSessions={engSessions}
                engSessionsDevices={engSessionsDevices}
                CampaignTable={CampaignTable}
                BounceRateDevices={BounceRateDevices}
                TotalDeviceUsersDayWise={TotalDeviceUsersDayWise}
                CountByDevice={CountByDevice}
                KeyEventsByDevice={KeyEventsByDevice}
                EnagementRateChannel={EnagementRateChannel}
                SessionTable={SessionTable}
                GA4HighLight={GA4HighLight}
                SessionByDevice={SessionByDevice}
                AverageEngagement={AverageEngagement}
                TotalUserMap={TotalUserMap}
                sessions={sessions}
                setChartRef={setChartRef} //pdf 
              />
            )}

            {shouldRenderChart("Google Search Console") && gsC_id && (
              <GoogleConsoleCharts
                propertyid={propertyid}
                siteUrl={gsC_id}
                startDate={startDate}
                endDate={endDate}
                style={style}
                GoogleOrganicRanking={GoogleOrganicRanking}
                PopularContent={PopularContent}
                PerformanceByCountry={PerformanceByCountry}
                PerformanceByDevices={PerformanceByDevices}
                SearchClicksGsc={SearchClicksGsc}
                SitemapTableApi={SitemapTableApi}
                SecurityCheckApi={SecurityCheckApi}
                GoogleMapRanking={GoogleMapRanking}
                SearchClicksGscOneMonth={SearchClicksGscOneMonth}
                ExcelSearchQueries={ExcelSearchQueries}
                Top5SearchQueries={Top5SearchQueries}
                Top5Pages={Top5Pages}
                 setChartRef={setChartRef}  //pdf prop
              />
            )}

            {shouldRenderChart("Google My Business") && gmbLocation_Id && (
              <ChartGMB
                GMBLocation_Id={gmbLocation_Id}
                startDate={startDate}
                endDate={endDate}
                style={style}
                DesktopMaps={DesktopMaps}
                SearchKeywords={SearchKeywords}
                GMBAccount_Id={gmbAccount_Id}
                TotalProfileImpression={TotalProfileImpression}
                BusinessInteractions={BusinessInteractions}
              />
            )}

            {shouldRenderChart("Google Ads") && googleAdsCustomerId && (
              <ChartGAds
                startDate={startDate}
                endDate={endDate}
                style={style}
                googleAdsCustomerId={googleAdsCustomerId}
                ClicksConversionCost={ClicksConversionCost}
              />
            )}
            {shouldRenderChart("Google Adsense") && gAdsensePublisherId && (
              <>
                {GAdsenseReport.map((apiData) => (
                  <ChartGAdsense
                    key={apiData.id}
                    startDate={startDate}
                    endDate={endDate}
                    style={style}
                    gAdsensePublisherId={gAdsensePublisherId}
                    ApiData={apiData}
                  />
                ))}
              </>
            )}

            {shouldRenderChart("Facebook") && fbPage_Id && (
              <ChartsFb
                startDate={startDate}
                endDate={endDate}
                pageId={fbPage_Id}
                FacebookUniqueImpressionApi={FacebookUniqueImpressionApi}
                totalFollowers={totalFollowers}
                totalPageLikes={totalPageLikes}
                totalPost_Like_cmnt_share={totalPost_Like_cmnt_share}
                TopFivePost={TopFivePost}
              />
            )}

            {shouldRenderChart("YouTube") && ytChannelId && (
              <ChartYoutube
                ytChannel_Id={ytChannelId}
                startDate={startDate}
                endDate={endDate}
                style={style}
                SubscriberGainsAndLosses={SubscriberGainsAndLosses}
                statistics={statistics}
                channelLifetimeLikes={channelLifetimeLikes}
                ChannelLikesMonthly={ChannelLikesMonthly}
                engagementByCountry={engagementByCountry}
                setChartRef={setChartRef} //pdf
              />
            )}

            {shouldRenderChart("Instagram") && insta_Id && (
              <ChartInstagram
                insta_Id={insta_Id}
                startDate={startDate}
                endDate={endDate}
                style={style}
                TotalFollowers={TotalFollowers}
                GetPostsByDateRange={GetPostsByDateRange}
              />
            )}
            {shouldRenderChart("LinkedIn") && linkedInUserId && (
              <ChartsLinkedIn
                linkedInUserId={linkedInUserId}
                startDate={startDate}
                endDate={endDate}
                style={style}
              />
            )}
            {shouldRenderChart("Shopify") && shopifyId && (
              <ChartShopify
                shopifyId={shopifyId}
                startDate={startDate}
                endDate={endDate}
                style={style}
                ShopifyReports={ShopifyReports}
              />
            )}

            {/* {shouldRenderChart("Google Lighthouse") && websiteAddress && (
              <GoogleLightHouse
                lighthouseurl={websiteAddress}
                style={style}
                LighthouseScoreApi={LighthouseScoreApi}
              />
            )} */}
            {/* <ChartsLinkedIn /> */}

            <CompareExecutiveSummary
              startDate={startDate}
              clientSeq={clientSeq}
            />
            <ExecutiveSummaryContainer
              startDate={startDate}
              clientSeq={clientSeq}
            />
          </Container>
        </div>
      </div>
    </>
  );
};

export default ChartPageSecond;
