
import React from "react";
import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import { CHART_CONFIG } from "../config/chart.config";
const styles = StyleSheet.create({
    page: {
        padding: 20,
        fontFamily: 'Helvetica',
        backgroundColor: '#FFFFFF',
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
    section: {
        marginTop: 20,
        paddingTop: 10,
        pageBreakBefore: 'auto',
    },
    sectionTitle: {
        fontSize: 12,
        marginBottom: 5,
        textAlign: 'center',
        color: '#000000',
        backgroundColor: '#f5f5f5',
        padding: 5,
        borderRadius: 3,
    },
    chartImage: {
        width: '100%',
        height: 'auto',
        marginBottom: 15,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 10,
        alignItems: 'flex-start',
    },
    column: {
        flex: 1,
        paddingHorizontal: 5,
    },
});

// Helper function to check if image data is valid
const isValidImageData = (imageData) => {
    return imageData && imageData !== 'data:,' && imageData.length > 100;
};


const PdfReport = ({ documentProps }) => {
    if (!documentProps) {
        return null;
    }

    const { clientName, websiteAddress, reportDate, agencyLogo, clientLogo } = documentProps;

    // Har integration (platform) ke liye charts ko group karein
    const gscCharts = CHART_CONFIG.filter(chart => chart.integration === 'Google Search Console');
    const ytCharts = CHART_CONFIG.filter(chart => chart.integration === 'YouTube');
    const ga4Charts = CHART_CONFIG.filter(chart => chart.integration === 'Google Analytics 4');

    // Helper function to check if any chart in a group is visible
    const isSectionVisible = (charts) => {
        return charts.some(chart => 
            documentProps[`show_${chart.id}`] && isValidImageData(documentProps[chart.id])
        );
    };
    
    const anyGscVisible = isSectionVisible(gscCharts);
    const anyYtVisible = isSectionVisible(ytCharts);
    const anyGa4Visible = isSectionVisible(ga4Charts);

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Section 1: Header (Logos and Title) - Isme koi change nahi */}
                <View style={styles.header}>
                    {isValidImageData(agencyLogo) && <Image style={styles.logo} src={agencyLogo} />}
                    {isValidImageData(clientLogo) && <Image style={styles.logo} src={clientLogo} />}
                </View>
                <View style={styles.titleContainer}>
                    {clientName && <Text style={styles.clientName}>{clientName}</Text>}
                    {websiteAddress && <Text style={styles.website}>({websiteAddress})</Text>}
                    {reportDate && <Text style={styles.reportDate}>Monthly Report - {reportDate}</Text>}
                </View>

                {/* Section 2: Google Search Console (Dynamically Rendered) */}
                {anyGscVisible && (
                    <View style={styles.sectionHeader} break>
                        <Text style={styles.sectionHeaderText}>Website Monitoring and Performance</Text>
                        <Text style={styles.sectionSubHeaderText}>(Data Source - Google Search Console)</Text>
                    </View>
                )}
                {gscCharts.map(chart => {
                    const image = documentProps[chart.id];
                    const show = documentProps[`show_${chart.id}`];
                    if (show && isValidImageData(image)) {
                        return <Image key={chart.id} style={styles.chartImage} src={image} />;
                    }
                    return null;
                })}

                {/* Section 3: YouTube (Dynamically Rendered) */}
                {anyYtVisible && (
                    <View style={styles.sectionHeader} break>
                        <Text style={styles.sectionHeaderText}>YouTube Report</Text>
                    </View>
                )}
                {ytCharts.map(chart => {
                    const image = documentProps[chart.id];
                    const show = documentProps[`show_${chart.id}`];
                    if (show && isValidImageData(image)) {
                        return <Image key={chart.id} style={styles.chartImage} src={image} />;
                    }
                    return null;
                })}

                {/* Section 4: Google Analytics 4 (Dynamically Rendered) */}
                {anyGa4Visible && (
                    <View style={styles.sectionHeader} break>
                        <Text style={styles.sectionHeaderText}>Website Traffic Overview</Text>
                        <Text style={styles.sectionSubHeaderText}>(Data Source - Google Analytics 4)</Text>
                    </View>
                )}
                {ga4Charts.map(chart => {
                    const image = documentProps[chart.id];
                    const show = documentProps[`show_${chart.id}`];
                    if (show && isValidImageData(image)) {
                        return <Image key={chart.id} style={styles.chartImage} src={image} />;
                    }
                    return null;
                })}

            </Page>
        </Document>
    );
};

export default PdfReport;