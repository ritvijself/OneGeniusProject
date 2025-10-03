import React, { useState, useEffect, useCallback } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import style from "./DashboardPage.module.css";
import DashboardHeaderContent from "./DashboardHeader/DashboardHeaderContent";
import { useNavigate, useLocation } from "react-router-dom";
import ChartPageSecond from "../ChartPage/ChartPageSecondContainer/ChartPageSecond";
import { formatDateLocal } from "../../utils/FormatDate";
import { getUserRoleFromToken } from "../../utils/Auth";

function DashboardPage() {
  const [integrations, setIntegrations] = useState({
    propertyId: "",
    gsC_id: "",
    gmbAccountId: "",
    gmbLocationId: "",
    fbPageId: "",
    ytChannelId: "",
    instaId: "",
    gAdsensePublisherId: "",
    linkedInUserId: "",
    shopifyId: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [hasIntegrations, setHasIntegrations] = useState(true);
  const today = new Date();
  const lastMonth = today.getMonth() - 1;
  const yearOfLastMonth =
    lastMonth < 0 ? today.getFullYear() - 1 : today.getFullYear();
  const firstDayLastMonth = new Date(yearOfLastMonth, (lastMonth + 12) % 12, 1);
  const lastDayLastMonth = new Date(
    yearOfLastMonth,
    ((lastMonth + 12) % 12) + 1,
    0
  );
  const [startDate, setStartDate] = useState(firstDayLastMonth);
  const [endDate, setEndDate] = useState(lastDayLastMonth);
  const [selectedIntegration, setSelectedIntegration] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [summaryText, setSummaryText] = useState("");
  const [summarySeq, setSummarySeq] = useState("");
  const [summaryImages, setSummaryImages] = useState([]);
  const [SummaryFlag, setSummaryFlag] = useState("executivesummary");
  const apibaseurl = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const clientSeq =
    location.state?.clientSeq || localStorage.getItem("selectedClientSeq");
  const [role, setRole] = useState("");
  useEffect(() => {
    const currentToken =
      localStorage.getItem("datoken") || localStorage.getItem("token");
    if (currentToken) {
      const userRole = getUserRoleFromToken(currentToken);
      setRole(userRole);
    }
  }, []);
  const handleDateChange = useCallback((newStartDate, newEndDate) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  }, []);
  const handleAddSummary = () => {
    setShowSummary(true);
    if (!summaryText) {
      setSummaryText("");
      setSummarySeq("");
    }
  };
  const handleSaveSummary = async (text, imageFiles = []) => {
    if (!token || !clientSeq) {
      navigate("/signin");
      return;
    }
    try {
      let response;
      const formattedStart = formatDateLocal(startDate);
      const createdDate = formattedStart;
      const formData = new FormData();
      formData.append("summary", text || "");
      formData.append("summaryFlag", SummaryFlag || "executivesummary");
      formData.append("createdDate", createdDate);
      // Append files
      if (Array.isArray(imageFiles)) {
        imageFiles.forEach((file) => {
          if (file) formData.append("Images", file);
        });
      }

      if (summarySeq) {
        response = await fetch(
          `${apibaseurl}/api/ExecutiveSummary/update/${summarySeq}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );
      } else {
        response = await fetch(`${apibaseurl}/api/ExecutiveSummary/create`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
      }
      if (response.ok) {
        const data = await response.json();
        setSummaryText(text);
        const imagesResp = data.imageUrls || data.images || data.Images || [];
        if (Array.isArray(imagesResp)) {
          setSummaryImages(imagesResp);
        }
        if (!summarySeq && data.summarySeq) {
          setSummarySeq(data.summarySeq);
        }
        setShowSummary(true);
      } else {
        console.error(
          `Failed to ${summarySeq ? "update" : "create"} executive summary:`,
          response.statusText
        );
      }
    } catch (err) {
      console.error(
        `Error ${summarySeq ? "updating" : "creating"} executive summary:`,
        err
      );
    }
  };
  const handleDeleteSummary = async () => {
    if (!token || !clientSeq || !summarySeq) {
      navigate("/signin");
      return;
    }
    try {
      const formattedStart = formatDateLocal(startDate);
      const createdDate = formattedStart;
      const response = await fetch(
        `${apibaseurl}/api/ExecutiveSummary/delete/${summarySeq}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ clientSeq, createdDate }),
        }
      );
      if (response.ok) {
        setSummaryText("");
        setSummarySeq("");
        setSummaryImages([]);
        setShowSummary(false);
      } else {
        console.error(
          "Failed to delete executive summary:",
          response.statusText
        );
      }
    } catch (err) {
      console.error("Error deleting executive summary:", err);
    }
  };
  const supportedIntegrationNames = [
    "Google Analytics 4",
    "Google Search Console",
    "Google My Business",
    "Google Ads",
    "YouTube",
    "Google Adsense",
    "Shopify",
  ];

  const checkAnyIntegrationExists = async () => {
    try {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };
      const [googleRes, metaRes, shopifyRes] = await Promise.all([
        fetch(`${apibaseurl}/api/UserIntegration`, { headers }),
        fetch(`${apibaseurl}/api/FacebookUserIntegration`, { headers }),
        fetch(`${apibaseurl}/api/ShopifyUserIntegration`, { headers }),
      ]);

      let hasIntegration = false;

      if (googleRes.ok) {
        const googleData = await googleRes.json();
        if (googleData.isSuccess && Array.isArray(googleData.data)) {
          hasIntegration = googleData.data.some((item) =>
            supportedIntegrationNames.includes(item.projectName)
          );
        }
      }

      if (!hasIntegration && metaRes.ok) {
        const metaData = await metaRes.json();
        if (metaData.isSuccess && Array.isArray(metaData.data)) {
          hasIntegration = metaData.data.length > 0;
        }
      }

      if (!hasIntegration && shopifyRes.ok) {
        const shopifyData = await shopifyRes.json();
        if (shopifyData.isSuccess && Array.isArray(shopifyData.data)) {
          hasIntegration = shopifyData.data.length > 0;
        }
      }

      return hasIntegration;
    } catch (e) {
      console.error("Error checking user integrations:", e);
      return false;
    }
  };

  const fetchIntegrations = useCallback(async () => {
    if (!clientSeq || !token) return;
    setIsLoading(true);
    try {
      let propertyId = "";
      let gmbAccountId = "";
      let gmbLocationId = "";
      let gscId = "";
      let fbPageId = "";
      let instaId = "";
      let googleAdsCustomerId = "";
      let ytChannelId = "";
      let gAdsensePublisherId = "";

      // GA4
      const ga4Res = await fetch(
        `${apibaseurl}/api/GoogleAnalytics4Api/GetByUser`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (ga4Res.ok) {
        const ga4Data = await ga4Res.json();
        if (ga4Data.length > 0 && ga4Data[0].properties.length > 0) {
          propertyId = ga4Data[0].properties[0].propertyId.split("/").pop();
        }
      }
      // GMB
      const gmbRes = await fetch(
        `${apibaseurl}/api/GoogleMyBusiness/GetAccountByUser`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (gmbRes.ok) {
        const gmbData = await gmbRes.json();
        if (
          gmbData.datas &&
          gmbData.datas.length > 0 &&
          gmbData.datas[0].locations.length > 0
        ) {
          gmbAccountId = gmbData.datas[0].accountNameID.split("/").pop();
          gmbLocationId = gmbData.datas[0].locations[0].gmB_LocationName
            .split("/")
            .pop();
        }
      }
      // GSC
      const gscRes = await fetch(
        `${apibaseurl}/api/GoogleSearchConsole/GetByUser`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (gscRes.ok) {
        const gscData = await gscRes.json();
        if (
          gscData.datas &&
          gscData.datas.length > 0 &&
          gscData.datas[0].siteUrl
        ) {
          gscId = gscData.datas[0].siteUrl;
        }
      }
      // youtube
      const ytRes = await fetch(
        `${apibaseurl}/api/GoogleYouTube/GetAccountByUser`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (ytRes.ok) {
        const ytData = await ytRes.json();
        if (
          ytData.data &&
          ytData.data.length > 0 &&
          ytData.data[0].gyT_ChannelID
        ) {
          ytChannelId = ytData.data[0].gyT_ChannelID;
        }
      }
      // Facebook Page
      try {
        const fbRes = await fetch(
          `${apibaseurl}/api/FacebookInsightsPage/getPageByUser`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (fbRes.ok) {
          const fbData = await fbRes.json();
          if (fbData.data && fbData.data.length > 0) {
            fbPageId = fbData.data[0].page_Id;
          }
        }
      } catch (err) {
        console.error("Error fetching Facebook Page ID:", err);
      }
      // Instagram
      try {
        const instaRes = await fetch(
          `${apibaseurl}/api/FacebookInstagram/user`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (instaRes.ok) {
          const instaData = await instaRes.json();
          if (instaData.length > 0 && instaData[0].fbUserId) {
            instaId = instaData[0].fbUserId;
          }
        }
      } catch (err) {
        console.error("Error fetching Instagram ID:", err);
      }
      //GoogleAds
      try {
        const googleAdsRes = await fetch(
          `${apibaseurl}/api/GoogleAdsApi/user`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (googleAdsRes.ok) {
          const googleAdsData = await googleAdsRes.json();
          if (
            googleAdsData.isSuccess &&
            googleAdsData.data &&
            googleAdsData.data.length > 0
          ) {
            googleAdsCustomerId = googleAdsData.data[0].customerId;
          }
        }
      } catch (err) {
        console.error("Error fetching Google Ads Customer ID:", err);
      }
      // Google Adsense
      try {
        const gAdsenseRes = await fetch(
          `${apibaseurl}/api/GoogleAdsenseApi/GetByUser`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (gAdsenseRes.ok) {
          const gAdsenseData = await gAdsenseRes.json();

          if (gAdsenseData.data && gAdsenseData.data.length > 0) {
            gAdsensePublisherId = gAdsenseData.data[0].displayName;
          }
        }
      } catch (err) {
        console.error("Error fetching Google Adsense Publisher ID:", err);
      }
      // LinkedIn

      let linkedInUserId = "";
      try {
        const linkedInRes = await fetch(
          `${apibaseurl}/api/LinkedInApi/GetAllPages`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (linkedInRes.ok) {
          const linkedInData = await linkedInRes.json();

          if (linkedInData.pages && linkedInData.pages.length > 0) {
            // assuming first page has linkedInUserId or id
            linkedInUserId =
              linkedInData.pages[0].organizationId || linkedInData.data[0].id;
          }
        }
      } catch (err) {
        console.error("Error fetching LinkedIn ID:", err);
      }

      // Shopify
      let shopifyId = "";

      try {
        const shopifyRes = await fetch(
          `${apibaseurl}/api/ShopifyProfileApi/profiles`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (shopifyRes.ok) {
          const shopifyData = await shopifyRes.json();
          if (
            shopifyData.isSuccess &&
            Array.isArray(shopifyData.data) &&
            shopifyData.data.length > 0
          ) {
            shopifyId =
              shopifyData.data[0].shop_Domain || shopifyData.data[0].shop_Email; // adjust based on API response
          }
        }
      } catch (err) {
        console.error("Error fetching Shopify ID:", err);
      }

      setIntegrations({
        propertyId,
        gsC_id: gscId,
        gmbAccountId,
        gmbLocationId,
        fbPageId,
        instaId,
        googleAdsCustomerId,
        ytChannelId,
        gAdsensePublisherId,
        linkedInUserId,
        shopifyId,
      });

      const directHasIntegrations = Boolean(
        propertyId ||
          gscId ||
          gmbAccountId ||
          gmbLocationId ||
          fbPageId ||
          instaId ||
          googleAdsCustomerId ||
          ytChannelId ||
          gAdsensePublisherId ||
          linkedInUserId ||
          shopifyId
      );

      let finalHasIntegrations = directHasIntegrations;
      if (!finalHasIntegrations) {
        finalHasIntegrations = await checkAnyIntegrationExists();
      }
      setHasIntegrations(finalHasIntegrations);
      const formattedStart = formatDateLocal(startDate);
      const response = await fetch(
        `${apibaseurl}/api/ExecutiveSummary/executive-Summary?_startDate=${formattedStart}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        const summaryData = await response.json();
        if (summaryData.length > 0 && summaryData[0].summary) {
          setSummaryText(summaryData[0].summary);
          setSummarySeq(summaryData[0].summarySeq);
          setSummaryImages(
            summaryData[0].images || summaryData[0].imageUrls || summaryData[0].Images || []
          );
          setShowSummary(true);
        } else {
          setSummaryText("");
          setSummarySeq("");
          setSummaryImages([]);
          setShowSummary(false);
        }
      } else {
        setSummaryText("");
        setSummarySeq("");
        setSummaryImages([]);
        setShowSummary(false);
      }
    } catch (err) {
      console.error("Error fetching integrations:", err);
      // Fallback: check global user integrations list
      const fallbackHas = await checkAnyIntegrationExists();
      setHasIntegrations(fallbackHas);
      setSummaryText("");
      setSummarySeq("");
      setSummaryImages([]);
      setShowSummary(false);
    } finally {
      setIsLoading(false);
    }
  }, [apibaseurl, token, clientSeq, startDate]);
  useEffect(() => {
    if (!token || !clientSeq) return;
    fetchIntegrations();
  }, [token, clientSeq, fetchIntegrations]);
  const rightHeaderTitle = "Dashboards";
  return (
    <Container fluid className={style.dashboard_container}>
      {isLoading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
            pointerEvents: "none",
          }}
        >
          <div
            className="spinner-border text-primary"
            role="status"
            style={{ width: "3rem", height: "3rem", borderWidth: "0.25em" }}
          >
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}
      <Row style={{ height: "100%" }}>
        <Col md={12} lg={12} className={`${style.main_content} p-0`}>
          <DashboardHeaderContent
            title={rightHeaderTitle}
            startDate={startDate}
            endDate={endDate}
            onDateChange={handleDateChange}
            selectedIntegration={selectedIntegration}
            setSelectedIntegration={setSelectedIntegration}
            onAddSummary={handleAddSummary}
          />
          <div className={style.rightContent}></div>
          {hasIntegrations ? (
            <ChartPageSecond
              propertyid={integrations.propertyId}
              gsC_id={integrations.gsC_id}
              fbPage_Id={integrations.fbPageId}
              gmbAccount_Id={integrations.gmbAccountId}
              gmbLocation_Id={integrations.gmbLocationId}
              insta_Id={integrations.instaId}
              googleAdsCustomerId={integrations.googleAdsCustomerId}
              ytChannelId={integrations.ytChannelId}
              gAdsensePublisherId={integrations.gAdsensePublisherId}
              linkedInUserId={integrations.linkedInUserId}
              shopifyId={integrations.shopifyId}
              startDate={startDate}
              endDate={endDate}
              selectedIntegration={selectedIntegration}
              showSummary={showSummary}
              summaryText={summaryText}
              summaryImages={summaryImages}
              onSaveSummary={handleSaveSummary}
              onDeleteSummary={handleDeleteSummary}
            />
          ) : (
            <div className="text-center mt-5">
              <p style={{ fontSize: "21px" }}>
                Go ahead and set up the necessary integrations to unlock your
                reports. Super quick and easy!
              </p>
              <h6>No Integrations Available</h6>
              {role !== "TeamMember" && (
                <Button
                  variant="primary"
                  onClick={() => navigate("/integrations")}
                >
                  Set Up Integrations
                </Button>
              )}
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
}
export default DashboardPage;
