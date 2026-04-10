import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Create styles for the PDF
const styles = StyleSheet.create({
  page: { 
    padding: 40, 
    fontFamily: 'Helvetica', 
    backgroundColor: '#FFFFFF' 
  },
  coverPage: { 
    padding: 40, 
    fontFamily: 'Helvetica', 
    backgroundColor: '#FFFFFF', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  title: { 
    fontSize: 28, 
    fontFamily: 'Helvetica-Bold', 
    marginBottom: 20, 
    textAlign: 'center', 
    color: '#1D1D1F' 
  },
  subtitle: { 
    fontSize: 14, 
    color: '#3b82f6', 
    marginBottom: 40, 
    textAlign: 'center', 
    fontFamily: 'Helvetica-Bold' 
  },
  date: { 
    position: 'absolute', 
    bottom: 40, 
    left: 40, 
    fontSize: 10, 
    color: '#86868B' 
  },
  h1: { 
    fontSize: 20, 
    fontFamily: 'Helvetica-Bold', 
    marginBottom: 15, 
    marginTop: 20, 
    color: '#1D1D1F', 
    borderBottomWidth: 1, 
    borderBottomColor: '#E5E5EA', 
    paddingBottom: 5 
  },
  h2: { 
    fontSize: 14, 
    fontFamily: 'Helvetica-Bold', 
    marginBottom: 10, 
    marginTop: 15, 
    color: '#1D1D1F' 
  },
  p: { 
    fontSize: 10, 
    lineHeight: 1.6, 
    marginBottom: 10, 
    color: '#424245', 
    textAlign: 'justify' 
  },
  bulletRow: { 
    flexDirection: 'row', 
    marginBottom: 5 
  },
  bullet: { 
    width: 15, 
    fontSize: 10, 
    color: '#424245' 
  },
  bulletText: { 
    flex: 1, 
    fontSize: 10, 
    lineHeight: 1.6, 
    color: '#424245', 
    textAlign: 'justify' 
  },
  // Table styles
  table: { 
    width: '100%', 
    borderStyle: 'solid', 
    borderWidth: 1, 
    borderColor: '#E5E5EA', 
    borderRightWidth: 0, 
    borderBottomWidth: 0, 
    marginTop: 15, 
    marginBottom: 15 
  },
  tableRow: { 
    flexDirection: 'row' 
  },
  tableColHeader: { 
    borderStyle: 'solid', 
    borderWidth: 1, 
    borderColor: '#E5E5EA', 
    borderLeftWidth: 0, 
    borderTopWidth: 0, 
    backgroundColor: '#F5F5F7', 
    padding: 5 
  },
  tableCol: { 
    borderStyle: 'solid', 
    borderWidth: 1, 
    borderColor: '#E5E5EA', 
    borderLeftWidth: 0, 
    borderTopWidth: 0, 
    padding: 5 
  },
  tableCellHeader: { 
    fontSize: 9, 
    fontFamily: 'Helvetica-Bold', 
    color: '#1D1D1F' 
  },
  tableCell: { 
    fontSize: 8, 
    lineHeight: 1.4, 
    color: '#424245' 
  },
  col1: { width: '15%' },
  col2: { width: '15%' },
  col3: { width: '10%' },
  col4: { width: '30%' },
  col5: { width: '30%' },
});

const Bullet = ({ children }: { children: React.ReactNode }) => (
  <View style={styles.bulletRow}>
    <Text style={styles.bullet}>•</Text>
    <Text style={styles.bulletText}>{children}</Text>
  </View>
);

export const PdfDocument = () => (
  <Document>
    {/* Cover Page */}
    <Page size="A4" style={styles.coverPage}>
      <Text style={styles.title}>AudioVitality Scientific Evidence</Text>
      <Text style={styles.subtitle}>Science-Backed Low-Frequency Technology for Recovery, Performance and Wellbeing</Text>
      <Text style={styles.date}>AudioVitality 2026/03/05</Text>
    </Page>

    {/* Introduction */}
    <Page size="A4" style={styles.page}>
      <Text style={styles.h1}>Introduction</Text>
      <Text style={styles.p}>AudioVitality is a Swiss-developed technology platform that uses precision low-frequency sound vibrations to help the body recover faster, reduce stress, and improve sleep. Our mission is to make nervous-system recovery measurable, repeatable, and scalable across sport, corporate wellbeing, and longevity markets.</Text>
      <Text style={styles.p}>Modern life creates a chronic recovery deficit. Athletes, executives, and high-performance individuals experience sustained stress, sleep disruption, and autonomic imbalance. While wearables can measure these problems, few technologies reliably improve them without medication.</Text>
      <Text style={styles.p}>Our system delivers calibrated low-frequency vibroacoustic stimulation (40–80 Hz) in a controlled studio environment. During a 40-minute session, gentle sound vibrations stimulate sensory receptors in the body, activating vagal pathways that shift the nervous system from “fight-or-flight” into “rest-and-repair.” This shift is objectively measurable through Heart Rate Variability (HRV), a gold-standard biomarker of recovery readiness.</Text>
      <Text style={styles.p}>In a published randomised controlled trial conducted with Lausanne University Hospital (CHUV), a single session produced approximately a 43% improvement in global HRV compared to control conditions. The intervention generated a stronger parasympathetic rebound effect than passive rest and outperformed common recovery modalities such as cold immersion and massage in autonomic response metrics. No adverse effects were reported.</Text>
      <Text style={styles.p}>Field validation in elite football environments demonstrated consistent acute HRV increases of over 30% per session over 9 weeks, alongside reductions in perceived fatigue and muscle soreness. A full-season study showed cumulative benefits in sleep efficiency and recovery stability across competitive periods. Additional internal mechanistic testing using near-infrared spectroscopy indicated improved local tissue oxygenation, supporting recovery and anti-inflammatory effects.</Text>
    </Page>

    {/* Translational Research */}
    <Page size="A4" style={styles.page}>
      <Text style={styles.h1}>Translational Research & Regulatory Optionality</Text>
      <Text style={styles.p}>Beyond its current positioning in performance, recovery, and autonomic regulation, AudioVitality is progressively building a translational research pathway aimed at exploring regulated medical indications.</Text>
      <Text style={styles.p}>Among the potential clinical applications, tinnitus represents a particularly promising domain. Chronic tinnitus is increasingly understood as a disorder involving dysregulated auditory processing, increased central neural gain, and heightened autonomic stress responses.</Text>
      <Text style={styles.p}>Low-frequency vibroacoustic stimulation may influence several of these mechanisms simultaneously through somatosensory–auditory cross-modal modulation, interaction with brainstem auditory circuits, and activation of parasympathetic pathways involved in autonomic regulation. This multimodal neuromodulatory hypothesis provides a plausible physiological framework for tinnitus modulation.</Text>
      <Text style={styles.p}>To explore this potential, AudioVitality has initiated real-world clinical data collection in collaboration with audiology partners. To date, this program has generated one of the largest observational datasets currently available for vibroacoustic interventions in tinnitus populations, with approximately 191 treated patients. Outcomes are monitored using validated instruments including the Tinnitus Handicap Inventory (THI), enabling structured evaluation of changes in perceived tinnitus burden.</Text>
      
      <Text style={styles.h2}>Regulatory Optionality Strategy</Text>
      <Text style={styles.p}>AudioVitality follows a dual-track development strategy designed to balance immediate commercial deployment with long-term clinical validation.</Text>
      <Bullet>Generate commercial revenue</Bullet>
      <Bullet>Refine stimulation protocols across diverse user populations</Bullet>
      <Bullet>Collect large-scale physiological and usage datasets</Bullet>
      <Bullet>Continuously improve the platform through real-world evidence</Bullet>
    </Page>

    {/* Data Summary Table */}
    <Page size="A4" style={styles.page}>
      <Text style={styles.h1}>Publications & Data Summary</Text>
      <Text style={styles.p}>Scientific Evidence Portfolio — February 2026</Text>
      
      <View style={styles.table}>
        {/* Header */}
        <View style={styles.tableRow}>
          <View style={[styles.tableColHeader, styles.col1]}><Text style={styles.tableCellHeader}>Study</Text></View>
          <View style={[styles.tableColHeader, styles.col2]}><Text style={styles.tableCellHeader}>Status</Text></View>
          <View style={[styles.tableColHeader, styles.col3]}><Text style={styles.tableCellHeader}>N</Text></View>
          <View style={[styles.tableColHeader, styles.col4]}><Text style={styles.tableCellHeader}>Key finding</Text></View>
          <View style={[styles.tableColHeader, styles.col5]}><Text style={styles.tableCellHeader}>Implications</Text></View>
        </View>
        {/* Row 1 */}
        <View style={styles.tableRow}>
          <View style={[styles.tableCol, styles.col1]}><Text style={styles.tableCell}>HRV RCT</Text></View>
          <View style={[styles.tableCol, styles.col2]}><Text style={styles.tableCell}>Published</Text></View>
          <View style={[styles.tableCol, styles.col3]}><Text style={styles.tableCell}>27</Text></View>
          <View style={[styles.tableCol, styles.col4]}><Text style={styles.tableCell}>+43% global HRV / +166% (LF+HF)/HR</Text></View>
          <View style={[styles.tableCol, styles.col5]}><Text style={styles.tableCell}>Provides peer-reviewed proof that the technology produces measurable physiological change after a single session.</Text></View>
        </View>
        {/* Row 2 */}
        <View style={styles.tableRow}>
          <View style={[styles.tableCol, styles.col1]}><Text style={styles.tableCell}>Case Study</Text></View>
          <View style={[styles.tableCol, styles.col2]}><Text style={styles.tableCell}>Completed</Text></View>
          <View style={[styles.tableCol, styles.col3]}><Text style={styles.tableCell}>1</Text></View>
          <View style={[styles.tableCol, styles.col4]}><Text style={styles.tableCell}>+21% HRV / -38% night awake / +15% sleep</Text></View>
          <View style={[styles.tableCol, styles.col5]}><Text style={styles.tableCell}>Demonstrates that AV App can increase sleep performance and recovery during long air travel period.</Text></View>
        </View>
        {/* Row 3 */}
        <View style={styles.tableRow}>
          <View style={[styles.tableCol, styles.col1]}><Text style={styles.tableCell}>NIRS inflammation</Text></View>
          <View style={[styles.tableCol, styles.col2]}><Text style={styles.tableCell}>Completed</Text></View>
          <View style={[styles.tableCol, styles.col3]}><Text style={styles.tableCell}>8</Text></View>
          <View style={[styles.tableCol, styles.col4]}><Text style={styles.tableCell}>+10–15% SmO₂</Text></View>
          <View style={[styles.tableCol, styles.col5]}><Text style={styles.tableCell}>Demonstrates improved local blood flow and tissue oxygenation. Supports claims around muscle recovery.</Text></View>
        </View>
        {/* Row 4 */}
        <View style={styles.tableRow}>
          <View style={[styles.tableCol, styles.col1]}><Text style={styles.tableCell}>Lausanne Sport '24</Text></View>
          <View style={[styles.tableCol, styles.col2]}><Text style={styles.tableCell}>Completed</Text></View>
          <View style={[styles.tableCol, styles.col3]}><Text style={styles.tableCell}>22</Text></View>
          <View style={[styles.tableCol, styles.col4]}><Text style={styles.tableCell}>+31.3% RMSSD (100% sessions improved)</Text></View>
          <View style={[styles.tableCol, styles.col5]}><Text style={styles.tableCell}>Shows real-world reliability in elite sport. Confirms that results are repeatable in competitive environments.</Text></View>
        </View>
      </View>
    </Page>

    {/* Appendix A */}
    <Page size="A4" style={styles.page}>
      <Text style={styles.h1}>Appendix A – Scientific Foundation</Text>
      <Text style={styles.h2}>How Low-Frequency Vibroacoustic Stimulation Acts on the Body</Text>
      <Text style={styles.p}>AudioVitality was developed from a simple but rigorous hypothesis: sound can function as a precise physiological intervention.</Text>
      <Text style={styles.p}>Over 15+ years of research and development in Switzerland, AudioVitality Sounds® technology has been engineered to deliver targeted low-frequency vibroacoustic stimulation (40–80 Hz) in a controlled and reproducible manner.</Text>
      
      <Text style={styles.h2}>Mechanism of Action</Text>
      <Bullet>Mechanical stimulation: 40–80 Hz vibrations activate somatosensory receptors.</Bullet>
      <Bullet>Neural transmission: Signals propagate via spinal pathways to the brainstem.</Bullet>
      <Bullet>Autonomic modulation: Vagal activation promotes parasympathetic dominance.</Bullet>
      <Bullet>Physiological outcome: Increased HRV, Reduced sympathetic tone.</Bullet>
    </Page>
  </Document>
);
