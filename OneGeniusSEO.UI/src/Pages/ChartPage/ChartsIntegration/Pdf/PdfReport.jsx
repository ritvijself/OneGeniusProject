
import React from "react";
import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import { CHART_CONFIG } from "../config/chart.config"; // For YT and GA4


const styles = StyleSheet.create({
    page: {
        padding: 20,
        fontFamily: 'Helvetica',
        // backgroundColor: '#FFFFFF',
         backgroundColor: '#FAFAFA',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
        alignItems: 'center',
    },
    logo: {
        width: 70,
        height: 50,
        objectFit: 'contain',
    },
    titleContainer: {
        textAlign: 'center',
        marginBottom: 25,
        borderBottom: '2px solid #eeeeee',
        paddingBottom: 15,
    },
    clientName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1a1a1a',
    },
    website: {
        fontSize: 12,
        color: '#555555',
        marginTop: 5,
    },
    reportDate: {
        fontSize: 14,
        color: '#333333',
        marginTop: 12,
    },
    sectionHeader: {
        textAlign: 'center',
        marginTop: 20,
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eeeeee',
        paddingBottom: 10,
    },
    sectionHeaderText: {
        fontSize: 16,
        fontFamily: 'Helvetica-Bold',
    },
    sectionSubHeaderText: {
        fontSize: 10,
        color: 'grey',
        marginTop: 4,
    },
    chartImage: {
        width: '100%',
        height: 'auto',
        marginBottom: 15,
    },
    manualChartContainer: {
        marginTop: 15,
        padding: 10,
        backgroundColor: '#f9f9f9',
        borderRadius: 5,
    },
    manualChartTitle: {
        fontSize: 12,
        marginBottom: 10,
        textAlign: 'center',
        fontFamily: 'Helvetica-Bold',
        color: '#333'
    },
});

// Helper function to check for valid image data
const isValidImageData = (imageData) => {
    return imageData && imageData !== 'data:,' && imageData.length > 100;
};

const PdfReport = ({ documentProps }) => {
    if (!documentProps) {
        return null;
    }

    const { clientName, websiteAddress, reportDate, agencyLogo, clientLogo } = documentProps;

    // Sirf YouTube aur GA4 ke charts dynamic rahenge
    const ytCharts = CHART_CONFIG.filter(chart => chart.integration === 'YouTube');
    const ga4Charts = CHART_CONFIG.filter(chart => chart.integration === 'Google Analytics 4');

    // -- CHANGE YAHAN HAI: Sabhi 9 GSC chart IDs ki list --
    const gscChartIds = [
        'gsc_clicksLineGraph',
        'gsc_top5QueriesBar',
        'gsc_performanceMetrices',
        'gsc_top50QueriesTable',
        'gsc_top5pagesProgressBar',
        'gsc_top50PagesVisited',
        'gsc_performanceDeviceTable',
        'gsc_securityIssuesSecurityCheckBox',
        'gsc_sitemapTable'
    ];
     const ytChartIds = [
        'yt_subscriberTrend',
         'yt_totalViewsCard', 'yt_totalVideosCard',
          'yt_subscribersCard',
           'yt_likesCard', 
           'yt_likesTrend',
            'yt_engagementTable'
    ];
    
    // GSC Section ki visibility in sabhi charts ke आधार par check hogi
    const anyGscVisible = gscChartIds.some(id =>
        documentProps[`show_${id}`] && isValidImageData(documentProps[id])
    );

    // Baki sections ke liye helper function
    const isSectionVisible = (charts) => {
        return charts.some(chart =>
            documentProps[`show_${chart.id}`] && isValidImageData(documentProps[chart.id])
        );
    };

    const anyYtVisible = isSectionVisible(ytCharts);
    const anyGa4Visible = isSectionVisible(ga4Charts);

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Section 1: Header (Logos and Title) */}
                <View style={styles.header}>
                    {isValidImageData(agencyLogo) && <Image style={styles.logo} src={agencyLogo} />}
                    {isValidImageData(clientLogo) && <Image style={styles.logo} src={clientLogo} />}
                </View>
                <View style={styles.titleContainer}>
                    {clientName && <Text style={styles.clientName}>{clientName}</Text>}
                    {websiteAddress && <Text style={styles.website}>({websiteAddress})</Text>}
                    {reportDate && <Text style={styles.reportDate}>Monthly Report - {reportDate}</Text>}
                </View>

                {/* ================================================================= */}
                {/* Section 2: Google Search Console (FULLY MANUAL with 9 charts)   */}
                {/* ================================================================= */}
                {anyGscVisible && (
                    <View style={styles.sectionHeader} break>
                        <Text style={styles.sectionHeaderText}>Website Monitoring and Performance</Text>
                        <Text style={styles.sectionSubHeaderText}>(Data Source - Google Search Console)</Text>
                    </View>
                )}

                {/* Chart 1: Performance Metrices */}
                {documentProps.show_gsc_performanceMetrices && isValidImageData(documentProps.gsc_performanceMetrices) && (
                    <View>
                        <Text style={styles.manualChartTitle}>Performance Metrics</Text>
                        <Image style={styles.chartImage} src={documentProps.gsc_performanceMetrices} />
                    </View>
                )}
                
                {/* Chart 2: Clicks Line Graph */}
                {documentProps.show_gsc_clicksLineGraph && isValidImageData(documentProps.gsc_clicksLineGraph) && (
                    <View>
                        <Text style={styles.manualChartTitle}>Clicks Trend</Text>
                        <Image style={styles.chartImage} src={documentProps.gsc_clicksLineGraph} />
                    </View>
                )}

                {/* Chart 3: Top 5 Queries Bar Chart */}
                {documentProps.show_gsc_top5QueriesBar && isValidImageData(documentProps.gsc_top5QueriesBar) && (
                    <View>
                        <Text style={styles.manualChartTitle}>Top 5 Search Queries</Text>
                        <Image style={styles.chartImage} src={documentProps.gsc_top5QueriesBar} />
                    </View>
                )}

                {/* Chart 4: Top 5 Pages Progress Bar */}
                {documentProps.show_gsc_top5pagesProgressBar && isValidImageData(documentProps.gsc_top5pagesProgressBar) && (
                    <View>
                        <Text style={styles.manualChartTitle}>Top 5 Performing Pages</Text>
                        <Image style={styles.chartImage} src={documentProps.gsc_top5pagesProgressBar} />
                    </View>
                )}

                {/* Chart 5: Performance by Device Table */}
                {documentProps.show_gsc_performanceDeviceTable && isValidImageData(documentProps.gsc_performanceDeviceTable) && (
                    <View>
                        <Text style={styles.manualChartTitle}>Performance by Device</Text>
                        <Image style={styles.chartImage} src={documentProps.gsc_performanceDeviceTable} />
                    </View>
                )}

                {/* Chart 6: Top 50 Queries Table */}
                {documentProps.show_gsc_top50QueriesTable && isValidImageData(documentProps.gsc_top50QueriesTable) && (
                    <View break>
                        <Text style={styles.manualChartTitle}>Top 50 Search Queries (Detailed)</Text>
                        <Image style={styles.chartImage} src={documentProps.gsc_top50QueriesTable} />
                    </View>
                )}

                {/* Chart 7: Top 50 Pages Visited Table */}
                {documentProps.show_gsc_top50PagesVisited && isValidImageData(documentProps.gsc_top50PagesVisited) && (
                    <View break>
                        <Text style={styles.manualChartTitle}>Top 50 Visited Pages (Detailed)</Text>
                        <Image style={styles.chartImage} src={documentProps.gsc_top50PagesVisited} />
                    </View>
                )}

                {/* Chart 8: Sitemap Table */}
                {documentProps.show_gsc_sitemapTable && isValidImageData(documentProps.gsc_sitemapTable) && (
                    <View>
                        <Text style={styles.manualChartTitle}>Sitemap Status</Text>
                        <Image style={styles.chartImage} src={documentProps.gsc_sitemapTable} />
                    </View>
                )}

                {/* Chart 9: Security Issues Checkbox/Status */}
                {documentProps.show_gsc_securityIssuesSecurityCheckBox && isValidImageData(documentProps.gsc_securityIssuesSecurityCheckBox) && (
                    <View style={styles.manualChartContainer}>
                        <Text style={styles.manualChartTitle}>Security Issues</Text>
                        <Image style={styles.chartImage} src={documentProps.gsc_securityIssuesSecurityCheckBox} />
                    </View>
                )}
                 
                {/* ===== CHANGE: Poora YouTube section manual banaya gaya hai ===== */}
                {/* Section 3: YouTube (Manual) */}
                {anyYtVisible && (
                    <View style={styles.sectionHeader} break>
                        <Text style={styles.sectionHeaderText}>YouTube Report</Text>
                        <Text style={styles.sectionSubHeaderText}>(Data Source - YouTube)</Text>
                    </View>
                )}
                {documentProps.show_yt_subscriberTrend === true && isValidImageData(documentProps.yt_subscriberTrend) && (
                    <View><Text style={styles.manualChartTitle}>Subscriber Trend</Text><Image style={styles.chartImage} src={documentProps.yt_subscriberTrend} /></View>
                )}
                {documentProps.show_yt_totalViewsCard === true && isValidImageData(documentProps.yt_totalViewsCard) && (
                    <View><Image style={styles.chartImage} src={documentProps.yt_totalViewsCard} /></View>
                )}
                {documentProps.show_yt_totalVideosCard === true && isValidImageData(documentProps.yt_totalVideosCard) && (
                    <View><Image style={styles.chartImage} src={documentProps.yt_totalVideosCard} /></View>
                )}
                {documentProps.show_yt_subscribersCard === true && isValidImageData(documentProps.yt_subscribersCard) && (
                    <View><Image style={styles.chartImage} src={documentProps.yt_subscribersCard} /></View>
                )}
                {documentProps.show_yt_likesCard === true && isValidImageData(documentProps.yt_likesCard) && (
                    <View><Image style={styles.chartImage} src={documentProps.yt_likesCard} /></View>
                )}
                {documentProps.show_yt_likesTrend === true && isValidImageData(documentProps.yt_likesTrend) && (
                    <View><Text style={styles.manualChartTitle}>Likes Trend</Text><Image style={styles.chartImage} src={documentProps.yt_likesTrend} /></View>
                )}
                {documentProps.show_yt_engagementTable === true && isValidImageData(documentProps.yt_engagementTable) && (
                    <View break><Text style={styles.manualChartTitle}>Engagement by Country</Text><Image style={styles.chartImage} src={documentProps.yt_engagementTable} /></View>
                )}

                {/* ================================================================= */}
                {/* Section 4: Google Analytics 4 (FULLY MANUAL)                    */}
                {/* ================================================================= */}
                {anyGa4Visible && (
                    <View style={styles.sectionHeader} break>
                        <Text style={styles.sectionHeaderText}>Website Traffic Overview</Text>
                        <Text style={styles.sectionSubHeaderText}>(Data Source - Google Analytics 4)</Text>
                    </View>
                )}

                {documentProps.show_ga4_metricdisplayga4 === true && isValidImageData(documentProps.ga4_metricdisplayga4) && (
                    <View><Text style={styles.manualChartTitle}>Key Metrics Overview</Text><Image style={styles.chartImage} src={documentProps.ga4_metricdisplayga4} /></View>
                )}
                {documentProps.show_ga4_bounceengagementmetricbox === true && isValidImageData(documentProps.ga4_bounceengagementmetricbox) && (
                    <View><Text style={styles.manualChartTitle}>Bounce Rate & Engagement</Text><Image style={styles.chartImage} src={documentProps.ga4_bounceengagementmetricbox} /></View>
                )}
                {documentProps.show_ga4_linechartga4threemonth === true && isValidImageData(documentProps.ga4_linechartga4threemonth) && (
                    <View><Text style={styles.manualChartTitle}>3-Month User Trend</Text><Image style={styles.chartImage} src={documentProps.ga4_linechartga4threemonth} /></View>
                )}
                {documentProps.show_ga4_barchartactiveuser === true && isValidImageData(documentProps.ga4_barchartactiveuser) && (
                    <View><Text style={styles.manualChartTitle}>Active Users Trend</Text><Image style={styles.chartImage} src={documentProps.ga4_barchartactiveuser} /></View>
                )}

                {documentProps.show_ga4_worldmapchart === true && isValidImageData(documentProps.ga4_worldmapchart) && (
                    <View break><Text style={styles.manualChartTitle}>Users by Country</Text><Image style={styles.chartImage} src={documentProps.ga4_worldmapchart} /></View>
                )}
                {documentProps.show_ga4_channeltable === true && isValidImageData(documentProps.ga4_channeltable) && (
                    <View><Text style={styles.manualChartTitle}>Traffic by Channel</Text><Image style={styles.chartImage} src={documentProps.ga4_channeltable} /></View>
                )}
                {documentProps.show_ga4_channelsessiontable === true && isValidImageData(documentProps.ga4_channelsessiontable) && (
                    <View><Text style={styles.manualChartTitle}>Sessions by Channel</Text><Image style={styles.chartImage} src={documentProps.ga4_channelsessiontable} /></View>
                )}

                {documentProps.show_ga4_devicetable1 === true && isValidImageData(documentProps.ga4_devicetable1) && (
                    <View break><Text style={styles.manualChartTitle}>Traffic by Device Category</Text><Image style={styles.chartImage} src={documentProps.ga4_devicetable1} /></View>
                )}
                {documentProps.show_ga4_devicetable === true && isValidImageData(documentProps.ga4_devicetable) && (
                    <View><Text style={styles.manualChartTitle}>Device Category Details</Text><Image style={styles.chartImage} src={documentProps.ga4_devicetable} /></View>
                )}
                {documentProps.show_ga4_devicetable2 === true && isValidImageData(documentProps.ga4_devicetable2) && (
                    <View><Text style={styles.manualChartTitle}>Additional Device Data</Text><Image style={styles.chartImage} src={documentProps.ga4_devicetable2} /></View>
                )}
                {documentProps.show_ga4_devicesessionschart1 === true && isValidImageData(documentProps.ga4_devicesessionschart1) && (
                    <View><Text style={styles.manualChartTitle}>Sessions by Device (Chart)</Text><Image style={styles.chartImage} src={documentProps.ga4_devicesessionschart1} /></View>
                )}
                {documentProps.show_ga4_devicesessionschart === true && isValidImageData(documentProps.ga4_devicesessionschart) && (
                    <View><Text style={styles.manualChartTitle}>Device Session Analysis</Text><Image style={styles.chartImage} src={documentProps.ga4_devicesessionschart} /></View>
                )}

                {documentProps.show_ga4_devivebrowserchart1 === true && isValidImageData(documentProps.ga4_devivebrowserchart1) && (
                    <View break><Text style={styles.manualChartTitle}>Traffic by Browser</Text><Image style={styles.chartImage} src={documentProps.ga4_devivebrowserchart1} /></View>
                )}
                {documentProps.show_ga4_devivebrowserchart === true && isValidImageData(documentProps.ga4_devivebrowserchart) && (
                    <View><Text style={styles.manualChartTitle}>Browser Details</Text><Image style={styles.chartImage} src={documentProps.ga4_devivebrowserchart} /></View>
                )}
                {documentProps.show_ga4_devicebouncebarchart === true && isValidImageData(documentProps.ga4_devicebouncebarchart) && (
                    <View><Text style={styles.manualChartTitle}>Bounce Rate by Device</Text><Image style={styles.chartImage} src={documentProps.ga4_devicebouncebarchart} /></View>
                )}

                {documentProps.show_ga4_linechartfilledga4 === true && isValidImageData(documentProps.ga4_linechartfilledga4) && (
                    <View break><Text style={styles.manualChartTitle}>User Engagement Trend</Text><Image style={styles.chartImage} src={documentProps.ga4_linechartfilledga4} /></View>
                )}
                {documentProps.show_ga4_avgengagementbarchart === true && isValidImageData(documentProps.ga4_avgengagementbarchart) && (
                    <View><Text style={styles.manualChartTitle}>Average Engagement Time</Text><Image style={styles.chartImage} src={documentProps.ga4_avgengagementbarchart} /></View>
                )}
                {documentProps.show_ga4_linechartga4 === true && isValidImageData(documentProps.ga4_linechartga4) && (
                    <View><Text style={styles.manualChartTitle}>Analytics Line Chart 1</Text><Image style={styles.chartImage} src={documentProps.ga4_linechartga4} /></View>
                )}
                {documentProps.show_ga4_linechartga41 === true && isValidImageData(documentProps.ga4_linechartga41) && (
                    <View><Text style={styles.manualChartTitle}>Analytics Line Chart 2</Text><Image style={styles.chartImage} src={documentProps.ga4_linechartga41} /></View>
                )}
                {documentProps.show_ga4_linechartga42 === true && isValidImageData(documentProps.ga4_linechartga42) && (
                    <View><Text style={styles.manualChartTitle}>Analytics Line Chart 3</Text><Image style={styles.chartImage} src={documentProps.ga4_linechartga42} /></View>
                )}
                {documentProps.show_ga4_linechartga43 === true && isValidImageData(documentProps.ga4_linechartga43) && (
                    <View><Text style={styles.manualChartTitle}>Analytics Line Chart 4</Text><Image style={styles.chartImage} src={documentProps.ga4_linechartga43} /></View>
                )}
                
                {documentProps.show_ga4_multilinechartga4 === true && isValidImageData(documentProps.ga4_multilinechartga4) && (
                    <View break><Text style={styles.manualChartTitle}>Multi-line Trend 1</Text><Image style={styles.chartImage} src={documentProps.ga4_multilinechartga4} /></View>
                )}
                {documentProps.show_ga4_multilinechartga41 === true && isValidImageData(documentProps.ga4_multilinechartga41) && (
                    <View><Text style={styles.manualChartTitle}>Multi-line Trend 2</Text><Image style={styles.chartImage} src={documentProps.ga4_multilinechartga41} /></View>
                )}
                {documentProps.show_ga4_conversiondata === true && isValidImageData(documentProps.ga4_conversiondata) && (
                    <View><Text style={styles.manualChartTitle}>Conversions Overview</Text><Image style={styles.chartImage} src={documentProps.ga4_conversiondata} /></View>
                )}
                {documentProps.show_ga4_contactformchart === true && isValidImageData(documentProps.ga4_contactformchart) && (
                    <View><Text style={styles.manualChartTitle}>Contact Form Submissions</Text><Image style={styles.chartImage} src={documentProps.ga4_contactformchart} /></View>
                )}

                {documentProps.show_ga4_progressbar === true && isValidImageData(documentProps.ga4_progressbar) && (
                    <View break><Text style={styles.manualChartTitle}>Performance Snapshot A</Text><Image style={styles.chartImage} src={documentProps.ga4_progressbar} /></View>
                )}
                {documentProps.show_ga4_progressbar1 === true && isValidImageData(documentProps.ga4_progressbar1) && (
                    <View><Text style={styles.manualChartTitle}>Performance Snapshot B</Text><Image style={styles.chartImage} src={documentProps.ga4_progressbar1} /></View>
                )}
                {documentProps.show_ga4_progressbar2 === true && isValidImageData(documentProps.ga4_progressbar2) && (
                    <View><Text style={styles.manualChartTitle}>Performance Snapshot C</Text><Image style={styles.chartImage} src={documentProps.ga4_progressbar2} /></View>
                )}
                {documentProps.show_ga4_progressbar3 === true && isValidImageData(documentProps.ga4_progressbar3) && (
                    <View><Text style={styles.manualChartTitle}>Performance Snapshot D</Text><Image style={styles.chartImage} src={documentProps.ga4_progressbar3} /></View>
                )}
                {documentProps.show_ga4_progressbar4 === true && isValidImageData(documentProps.ga4_progressbar4) && (
                    <View><Text style={styles.manualChartTitle}>Performance Snapshot E</Text><Image style={styles.chartImage} src={documentProps.ga4_progressbar4} /></View>
                )}
                {documentProps.show_ga4_progressbar5 === true && isValidImageData(documentProps.ga4_progressbar5) && (
                    <View><Text style={styles.manualChartTitle}>Performance Snapshot F</Text><Image style={styles.chartImage} src={documentProps.ga4_progressbar5} /></View>
                )}
                {documentProps.show_ga4_progressbar6 === true && isValidImageData(documentProps.ga4_progressbar6) && (
                    <View><Text style={styles.manualChartTitle}>Performance Snapshot G</Text><Image style={styles.chartImage} src={documentProps.ga4_progressbar6} /></View>
                )}
                {documentProps.show_ga4_progressbar7 === true && isValidImageData(documentProps.ga4_progressbar7) && (
                    <View><Text style={styles.manualChartTitle}>Performance Snapshot H</Text><Image style={styles.chartImage} src={documentProps.ga4_progressbar7} /></View>
                )}
               
                

            </Page>
        </Document>
    );
};

export default PdfReport;


