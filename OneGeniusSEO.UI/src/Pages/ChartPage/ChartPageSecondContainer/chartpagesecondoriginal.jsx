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

  // / REFS FOR ALL SECTIONS
  const refExecutiveSummary = useRef(null);
  const refGa4 = useRef(null);
  const refGmb = useRef(null);
  const refGAds = useRef(null);
  const refFb = useRef(null);
  const refYoutube = useRef(null);
  const refInsta = useRef(null);
  const refCompareSummary = useRef(null);


  // GSC ke naye refs (labels) for pdf

  const refgsc_clicksLineGraph = useRef(null);
  const refgsc_top5QueriesBar = useRef(null);
  const refgsc_performanceMetrices = useRef(null);
  const refgsc_top50QueriesTable = useRef(null);
  const refgsc_top5pagesProgressBar = useRef(null);
  const refgsc_top50PagesVisited = useRef(null);
  const refgsc_performanceDeviceTable = useRef(null);
  const refgsc_securityIssuesSecurityCheckBox = useRef(null);
  const refgsc_sitemapTable = useRef(null);
  // youtube  ref label for pdf
  const refYt_totalViewsCard = useRef(null);
  const refYt_totalVideosCard = useRef(null);
  const refYt_subscribersCard = useRef(null);
  const refYt_likesCard = useRef(null);
  const refYt_subscriberTrend = useRef(null);
  const refYt_likesTrend = useRef(null);
  const refYt_engagementTable = useRef(null);
  ///ga4 ref labels for pdf 
  const refga4_channelsessiontable = useRef(null);
  const refga4_linechartga4threemonth = useRef(null);
  const refga4_metricdisplayga4 = useRef(null);
  const refga4_linechartga4 = useRef(null);
  const refga4_linechartfilledga4 = useRef(null);
  const refga4_channeltable = useRef(null);
  const refga4_barchartactiveuser = useRef(null);
  const refga4_linechartga41 = useRef(null);
  const refga4_avgengagementbarchart = useRef(null);
  const refga4_bounceengagementmetricbox = useRef(null);
  const refga4_conversiondata = useRef(null);
  const refga4_devicetable = useRef(null);
  const refga4_worldmapchart = useRef(null);
  const refga4_progressbar = useRef(null);
  const refga4_progressbar1 = useRef(null);
  const refga4_progressbar2 = useRef(null);
  const refga4_progressbar6 = useRef(null);
  const refga4_devicesessionschart = useRef(null);
  const refga4_devivebrowserchart = useRef(null);
  const refga4_devicesessionschart1 = useRef(null);
  const refga4_progressbar3 = useRef(null);
  const refga4_progressbar7 = useRef(null);
  const refga4_devicebouncebarchart = useRef(null);
  const refga4_multilinechartga4 = useRef(null);
  const refga4_multilinechartga41 = useRef(null);
  const refga4_devivebrowserchart1 = useRef(null);
  const refga4_contactformchart = useRef(null);
  const refga4_devicetable1 = useRef(null);
  const refga4_linechartga42 = useRef(null);
  const refga4_progressbar4 = useRef(null);
  const refga4_progressbar5 = useRef(null);
  const refga4_linechartga43 = useRef(null);
  const refga4_devicetable2 = useRef(null);


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

  const handlePreviewPdf = async () => {
    setIsGeneratingPdf(true);

    if (!clientName) {
      alert("Client details are loading, please wait before previewing the PDF.");
      setIsGeneratingPdf(false);
      return;
    }

    const captureImage = async (ref, options = {}) => {
      if (!ref.current) return null;
      try {
        const canvas = await html2canvas(ref.current, { ...options, useCORS: true, scale: 3 });
        return canvas.toDataURL('image/png');
      } catch (err) {
        console.error("Error capturing element with html2canvas:", err, ref);
        return null;
      }
    };

    try {
      // GSC Image Variables
      let clicksLineGraph = null, top5QueriesBar = null, top50QueriesTable = null,
        performanceMetrices = null, top5pagesProgressBar = null, top50pagesVisited = null,
        performanceDeviceTable = null, securityIssuesSecurityCheckbox = null, siteMapTable = null;

      // YouTube Image Variables
      let ytTotalViewsCard = null, ytTotalVideosCard = null, ytSubscribersCard = null,
        ytLikesCard = null, ytSubscriberTrend = null, ytLikesTrend = null, ytEngagementTable = null;

      //Ga4 Image Variable
       let ga4Channelsessiontable = null, ga4Linechartga4threemonth = null, ga4Metricdisplayga4 = null,
    ga4Linechartga4 = null, ga4Linechartfilledga4 = null, ga4Channeltable = null, ga4Barchartactiveuser = null,
    ga4Linechartga41 = null, ga4Avgengagementbarchart = null, ga4Bounceengagementmetricbox = null,
    ga4Conversiondata = null, ga4Devicetable = null, ga4Worldmapchart = null, ga4Progressbar = null,
    ga4Progressbar1 = null, ga4Progressbar2 = null, ga4Progressbar6 = null, ga4Devicesessionschart = null,
    ga4Devivebrowserchart = null, ga4Devicesessionschart1 = null, ga4Progressbar3 = null, ga4Progressbar7 = null,
    ga4Devicebouncebarchart = null, ga4Multilinechartga4 = null, ga4Multilinechartga41 = null,
    ga4Devivebrowserchart1 = null, ga4Contactformchart = null, ga4Devicetable1 = null, ga4Linechartga42 = null,
    ga4Progressbar4 = null, ga4Progressbar5 = null, ga4Linechartga43 = null, ga4Devicetable2 = null;
      
    // Configuration variables
      const gscConfig = chartConfigurations['Google Search Console'];
      const ytConfig = chartConfigurations['YouTube'];
       const ga4Config = chartConfigurations['Google Analytics 4'];

      // Capture GSC Images
      if (shouldRenderChart("Google Search Console") && gsC_id) {
        console.log("Capturing GSC images...");
        clicksLineGraph = await captureImage(refgsc_clicksLineGraph);
        top5QueriesBar = await captureImage(refgsc_top5QueriesBar);
        performanceMetrices = await captureImage(refgsc_performanceMetrices);
        top50QueriesTable = await captureImage(refgsc_top50QueriesTable);
        top5pagesProgressBar = await captureImage(refgsc_top5pagesProgressBar);
        top50pagesVisited = await captureImage(refgsc_top50PagesVisited);
        performanceDeviceTable = await captureImage(refgsc_performanceDeviceTable);
        securityIssuesSecurityCheckbox = await captureImage(refgsc_securityIssuesSecurityCheckBox);
        siteMapTable = await captureImage(refgsc_sitemapTable);
        console.log("GSC images captured.");
      }

      // Capture YouTube Images
      if (shouldRenderChart("YouTube") && ytChannelId) {
        console.log("Capturing YouTube images...");
        ytTotalViewsCard = await captureImage(refYt_totalViewsCard);
        ytTotalVideosCard = await captureImage(refYt_totalVideosCard);
        ytSubscribersCard = await captureImage(refYt_subscribersCard);
        ytLikesCard = await captureImage(refYt_likesCard);
        ytSubscriberTrend = await captureImage(refYt_subscriberTrend);
        ytLikesTrend = await captureImage(refYt_likesTrend);
        ytEngagementTable = await captureImage(refYt_engagementTable);
        console.log("YouTube images captured.");
      }
      //capture ga4 images 
 if (shouldRenderChart("Google Analytics 4") && propertyid) {
        console.log("Capturing GA4 images...");
        ga4Channelsessiontable = await captureImage(refga4_channelsessiontable);
        ga4Linechartga4threemonth = await captureImage(refga4_linechartga4threemonth);
        ga4Metricdisplayga4 = await captureImage(refga4_metricdisplayga4);
        ga4Linechartga4 = await captureImage(refga4_linechartga4);
        ga4Linechartfilledga4 = await captureImage(refga4_linechartfilledga4);
        ga4Channeltable = await captureImage(refga4_channeltable);
        ga4Barchartactiveuser = await captureImage(refga4_barchartactiveuser);
        ga4Linechartga41 = await captureImage(refga4_linechartga41);
        ga4Avgengagementbarchart = await captureImage(refga4_avgengagementbarchart);
        ga4Bounceengagementmetricbox = await captureImage(refga4_bounceengagementmetricbox);
        ga4Conversiondata = await captureImage(refga4_conversiondata);
        ga4Devicetable = await captureImage(refga4_devicetable);
        ga4Worldmapchart = await captureImage(refga4_worldmapchart);
        ga4Progressbar = await captureImage(refga4_progressbar);
        ga4Progressbar1 = await captureImage(refga4_progressbar1);
        ga4Progressbar2 = await captureImage(refga4_progressbar2);
        ga4Progressbar6 = await captureImage(refga4_progressbar6);
        ga4Devicesessionschart = await captureImage(refga4_devicesessionschart);
        ga4Devivebrowserchart = await captureImage(refga4_devivebrowserchart);
        ga4Devicesessionschart1 = await captureImage(refga4_devicesessionschart1);
        ga4Progressbar3 = await captureImage(refga4_progressbar3);
        ga4Progressbar7 = await captureImage(refga4_progressbar7);
        ga4Devicebouncebarchart = await captureImage(refga4_devicebouncebarchart);
        ga4Multilinechartga4 = await captureImage(refga4_multilinechartga4);
        ga4Multilinechartga41 = await captureImage(refga4_multilinechartga41);
        ga4Devivebrowserchart1 = await captureImage(refga4_devivebrowserchart1);
        ga4Contactformchart = await captureImage(refga4_contactformchart);
        ga4Devicetable1 = await captureImage(refga4_devicetable1);
        ga4Linechartga42 = await captureImage(refga4_linechartga42);
        ga4Progressbar4 = await captureImage(refga4_progressbar4);
        ga4Progressbar5 = await captureImage(refga4_progressbar5);
        ga4Linechartga43 = await captureImage(refga4_linechartga43);
        ga4Devicetable2 = await captureImage(refga4_devicetable2);
        console.log("GA4 images captured.");
    }
      const reportDate = startDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

      const propsForPdf = {
        clientName,
        websiteAddress,
        reportDate,
        agencyLogo: agencyLogoBase64,
        clientLogo: clientLogoBase64,

        // GSC Data
        clicksLineGraph, top5QueriesBar, top50QueriesTable, performanceMetrices,
        top5pagesProgressBar, top50pagesVisited, performanceDeviceTable,
        securityIssuesSecurityCheckbox, siteMapTable,
        showClicksLineGraph: gscConfig?.['GSCApi007']?.selected ?? true,
        showTop5QueriesBar: gscConfig?.['GSCApi005']?.selected ?? true,
        showPerformanceMetrices: gscConfig?.['GSCApi003']?.selected ?? true,
        showTop5PagesProgressBar: gscConfig?.['GSCApi004']?.selected ?? true,
        showTop50QueriesTable: gscConfig?.['GSCApi002']?.selected ?? true,
        showTop50PagesVisited: gscConfig?.['GSCApi006']?.selected ?? true,
        showPerformanceDeviceTable: gscConfig?.['GSCApi008']?.selected ?? true,
        showSecurityIssues: gscConfig?.['GSCApi009']?.selected ?? true,
        showSitemapTable: gscConfig?.['GSCApi001']?.selected ?? true,

        // ===== YOUTUBE DATA KA SYNTAX  =====
        ytTotalViewsCard,
        ytTotalVideosCard,
        ytSubscribersCard,
        ytLikesCard,
        ytSubscriberTrend,
        ytLikesTrend,
        ytEngagementTable,
        showYtTotalViewsCard: ytConfig?.['YTApi002']?.selected ?? true,
        showYtTotalVideosCard: ytConfig?.['YTApi002']?.selected ?? true,
        showYtSubscribersCard: ytConfig?.['YTApi002']?.selected ?? true,
        showYtLikesCard: ytConfig?.['YTApi003']?.selected ?? true,
        showYtSubscriberTrend: ytConfig?.['YTApi001']?.selected ?? true,
        showYtLikesTrend: ytConfig?.['YTApi004']?.selected ?? true,
        showYtEngagementTable: ytConfig?.['YTApi005']?.selected ?? true,

        ///GA4 syntax
        ga4Channelsessiontable, ga4Linechartga4threemonth, ga4Metricdisplayga4,
      ga4Linechartga4, ga4Linechartfilledga4, ga4Channeltable, ga4Barchartactiveuser,
      ga4Linechartga41, ga4Avgengagementbarchart, ga4Bounceengagementmetricbox,
      ga4Conversiondata, ga4Devicetable, ga4Worldmapchart, ga4Progressbar,
      ga4Progressbar1, ga4Progressbar2, ga4Progressbar6, ga4Devicesessionschart,
      ga4Devivebrowserchart, ga4Devicesessionschart1, ga4Progressbar3, ga4Progressbar7,
      ga4Devicebouncebarchart, ga4Multilinechartga4, ga4Multilinechartga41,
      ga4Devivebrowserchart1, ga4Contactformchart, ga4Devicetable1, ga4Linechartga42,
      ga4Progressbar4, ga4Progressbar5, ga4Linechartga43, ga4Devicetable2,

      //  GA4 CONFIGURATIONS
      showGa4Channelsessiontable: ga4Config?.['Ga4Api022']?.selected ?? true,
      showGa4Linechartga4threemonth: ga4Config?.['Ga4Api007']?.selected ?? true,
      showGa4Metricdisplayga4: ga4Config?.['Ga4Api021']?.selected ?? true,
      showGa4Linechartga4: ga4Config?.['Ga4Api015']?.selected ?? true,
      showGa4Linechartfilledga4: ga4Config?.['Ga4Api009']?.selected ?? true,
      showGa4Channeltable: ga4Config?.['Ga4Api002']?.selected ?? true,
      showGa4Barchartactiveuser: ga4Config?.['Ga4Api004']?.selected ?? true,
      showGa4Linechartga41: ga4Config?.['Ga4Api008']?.selected ?? true,
      showGa4Avgengagementbarchart: ga4Config?.['Ga4Api020']?.selected ?? true,
      showGa4Bounceengagementmetricbox: ga4Config?.['Ga4Api009']?.selected ?? true,
      showGa4Conversiondata: ga4Config?.['Ga4Api001']?.selected ?? true,
      showGa4Devicetable: ga4Config?.['Ga4Api014']?.selected ?? true,
      showGa4Worldmapchart: ga4Config?.['Ga4Api019']?.selected ?? true,
      showGa4Progressbar: ga4Config?.['Ga4Api010']?.selected ?? true,
      showGa4Progressbar1: ga4Config?.['Ga4Api011']?.selected ?? true,
      showGa4Progressbar2: ga4Config?.['Ga4Api012']?.selected ?? true,
      showGa4Progressbar6: ga4Config?.['Ga4Api013']?.selected ?? true,
      showGa4Devicesessionschart: ga4Config?.['Ga4Api013']?.selected ?? true,
      showGa4Devivebrowserchart: ga4Config?.['Ga4Api018']?.selected ?? true,
      showGa4Devicesessionschart1: ga4Config?.['Ga4Api005']?.selected ?? true,
      showGa4Progressbar3: ga4Config?.['Ga4Api016']?.selected ?? true,
      showGa4Progressbar7: ga4Config?.['Ga4Api016']?.selected ?? true,
      showGa4Devicebouncebarchart: ga4Config?.['Ga4Api017']?.selected ?? true,
      showGa4Multilinechartga4: ga4Config?.['Ga4Api018']?.selected ?? true,
      showGa4Multilinechartga41: ga4Config?.['Ga4Api018']?.selected ?? true,
      showGa4Devivebrowserchart1: ga4Config?.['Ga4Api006']?.selected ?? true,
      showGa4Contactformchart: ga4Config?.['Ga4Api018']?.selected ?? true,
      showGa4Devicetable1: ga4Config?.['Ga4Api003']?.selected ?? true,
      showGa4Linechartga42: ga4Config?.['Ga4Api023']?.selected ?? true,
      showGa4Progressbar4: ga4Config?.['Ga4Api014']?.selected ?? true,
      showGa4Progressbar5: ga4Config?.['Ga4Api014']?.selected ?? true,
      showGa4Linechartga43: ga4Config?.['Ga4Api014']?.selected ?? true,
      showGa4Devicetable2: ga4Config?.['Ga4Api024']?.selected ?? true,

      };

      console.log("Showing preview with these props:", propsForPdf);
      setpdfProps(propsForPdf);
      setshowPreview(true);

    } catch (err) {
      console.error("Failed to prepare PDF preview:", err);
      setError("Failed to Prepare Preview. Please Try again");
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
                ///ref for pdf
                refga4_channelsessiontable={refga4_channelsessiontable}
                refga4_linechartga4threemonth={refga4_linechartga4threemonth}
                refga4_metricdisplayga4={refga4_metricdisplayga4}
                refga4_linechartga4={refga4_linechartga4}
                refga4_linechartfilledga4={refga4_linechartfilledga4}
                refga4_channeltable={refga4_channeltable}
                refga4_barchartactiveuser={refga4_barchartactiveuser}
                refga4_linechartga41={refga4_linechartga41}
                refga4_avgengagementbarchart={refga4_avgengagementbarchart}
                refga4_bounceengagementmetricbox={refga4_bounceengagementmetricbox}
                refga4_conversiondata={refga4_conversiondata}
                refga4_devicetable={refga4_devicetable}
                refga4_worldmapchart={refga4_worldmapchart}
                refga4_progressbar={refga4_progressbar}
                refga4_progressbar1={refga4_progressbar1}
                refga4_progressbar2={refga4_progressbar2}
                refga4_progressbar6={refga4_progressbar6}
                refga4_devicesessionschart={refga4_devicesessionschart}
                refga4_devivebrowserchart={refga4_devivebrowserchart}
                refga4_devicesessionschart1={refga4_devicesessionschart1}
                refga4_progressbar3={refga4_progressbar3}
                refga4_progressbar7={refga4_progressbar7}
                refga4_devicebouncebarchart={refga4_devicebouncebarchart}
                refga4_multilinechartga4={refga4_multilinechartga4}
                refga4_multilinechartga41={refga4_multilinechartga41}
                refga4_devivebrowserchart1={refga4_devivebrowserchart1}
                refga4_contactformchart={refga4_contactformchart}
                refga4_devicetable1={refga4_devicetable1}
                refga4_linechartga42={refga4_linechartga42}
                refga4_progressbar4={refga4_progressbar4}
                refga4_progressbar5={refga4_progressbar5}
                refga4_linechartga43={refga4_linechartga43}
                refga4_devicetable2={refga4_devicetable2}
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
                // Yeh saare refs yahan se pass hone zaroori hain pdf
                refgsc_clicksLineGraph={refgsc_clicksLineGraph}
                refgsc_top5QueriesBar={refgsc_top5QueriesBar}
                refgsc_performanceMetrices={refgsc_performanceMetrices}
                refgsc_top50QueriesTable={refgsc_top50QueriesTable}
                refgsc_top5pagesProgressBar={refgsc_top5pagesProgressBar}
                refgsc_top50PagesVisited={refgsc_top50PagesVisited}
                refgsc_performanceDeviceTable={refgsc_performanceDeviceTable}
                refgsc_securityIssuesSecurityCheckBox={refgsc_securityIssuesSecurityCheckBox}
                refgsc_sitemapTable={refgsc_sitemapTable}
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
                // ...baaki props...
                refYt_totalViewsCard={refYt_totalViewsCard}
                refYt_totalVideosCard={refYt_totalVideosCard}
                refYt_subscribersCard={refYt_subscribersCard}
                refYt_likesCard={refYt_likesCard}
                refYt_subscriberTrend={refYt_subscriberTrend}
                refYt_likesTrend={refYt_likesTrend}
                refYt_engagementTable={refYt_engagementTable}
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
