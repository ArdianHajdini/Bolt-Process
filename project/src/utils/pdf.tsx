import React from 'react';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  Link,
  pdf 
} from '@react-pdf/renderer';
import { format } from 'date-fns';
import { Process } from '../context/ProcessContext';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 5,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 10,
    backgroundColor: '#f3f4f6',
    padding: 5,
  },
  stepContainer: {
    marginBottom: 15,
    borderBottom: '1pt solid #e5e7eb',
    paddingBottom: 10,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepStatus: {
    fontSize: 12,
    color: '#666666',
  },
  stepDetails: {
    marginLeft: 15,
    fontSize: 11,
  },
  detailRow: {
    marginBottom: 3,
  },
  attachmentLink: {
    color: '#2563eb',
    textDecoration: 'underline',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 10,
    color: '#666666',
  },
  signature: {
    marginTop: 50,
    borderTop: '1pt solid #000000',
    paddingTop: 10,
  },
});

interface ProcessPDFProps {
  process: Process;
}

const ProcessPDF: React.FC<ProcessPDFProps> = ({ process }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>{process.name}</Text>
        <Text style={styles.subtitle}>Department: {process.department}</Text>
        <Text style={styles.subtitle}>
          Created: {format(new Date(process.createdAt), 'PPpp')}
        </Text>
        <Text style={styles.subtitle}>Status: {process.status.toUpperCase()}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Process Description</Text>
        <Text>{process.description}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Steps</Text>
        {process.steps.map((step, index) => (
          <View key={step.id} style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <Text style={styles.stepTitle}>
                {index + 1}. {step.title}
              </Text>
              <Text style={styles.stepStatus}>{step.status.toUpperCase()}</Text>
            </View>
            
            <View style={styles.stepDetails}>
              <Text style={styles.detailRow}>Assignee: {step.assignee}</Text>
              <Text style={styles.detailRow}>Description: {step.description}</Text>
              
              {step.completedAt && (
                <Text style={styles.detailRow}>
                  Completed: {format(new Date(step.completedAt), 'PPpp')}
                </Text>
              )}
              
              {step.completedBy && (
                <Text style={styles.detailRow}>
                  Completed by: {step.completedBy}
                </Text>
              )}
              
              {step.completionNotes && (
                <Text style={styles.detailRow}>
                  Notes: {step.completionNotes}
                </Text>
              )}
              
              {step.attachments && step.attachments.length > 0 && (
                <View style={styles.detailRow}>
                  <Text>Attachments:</Text>
                  {step.attachments.map((attachment, i) => (
                    <Link
                      key={i}
                      style={styles.attachmentLink}
                      src={`/attachments/${attachment}`}
                    >
                      {attachment}
                    </Link>
                  ))}
                </View>
              )}
            </View>
          </View>
        ))}
      </View>

      {process.status === 'completed' && (
        <View style={styles.signature}>
          <Text>Approved by: {process.approvedBy}</Text>
          <Text>
            Date: {process.approvedAt && format(new Date(process.approvedAt), 'PPpp')}
          </Text>
        </View>
      )}

      <View style={styles.footer} fixed>
        <Text>
          Generated on {format(new Date(), 'PPpp')} • ProcessFlow System
        </Text>
      </View>
    </Page>
  </Document>
);

export const generateProcessPDF = async (process: Process): Promise<Blob> => {
  return pdf(<ProcessPDF process={process} />).toBlob();
};