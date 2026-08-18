import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { downloadBlob } from '@/lib/utils';
import type { Complaint } from '@/types';
import { formatDate, formatDateTime, getComplaintStats, getCleanlinessScore } from '@/lib/utils';

export function exportComplaintsPDF(complaints: Complaint[], title = 'Waste Collection Report') {
  const doc = new jsPDF({ orientation: 'landscape' });
  const stats = getComplaintStats(complaints);
  const score = getCleanlinessScore(complaints);

  // Header
  doc.setFillColor(22, 163, 74);
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Smart Waste Collection Tracker', 14, 15);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(title, 14, 23);
  doc.text(`Generated: ${formatDateTime(new Date())}`, doc.internal.pageSize.getWidth() - 14, 23, { align: 'right' });

  // Summary stats
  doc.setTextColor(31, 41, 55);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Summary', 14, 42);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const summary = [
    `Total Complaints: ${stats.total}`,
    `Pending: ${stats.pending}`,
    `Assigned: ${stats.assigned}`,
    `In Progress: ${stats.inProgress}`,
    `Completed: ${stats.completed}`,
    `Rejected: ${stats.rejected}`,
    `Village Cleanliness Score: ${score}/100`,
  ];
  summary.forEach((s, i) => {
    doc.text(s, 14 + (i % 4) * 70, 50 + Math.floor(i / 4) * 7);
  });

  // Table
  autoTable(doc, {
    startY: 62,
    head: [['Complaint ID', 'Waste Type', 'Urgency', 'Status', 'Location', 'Citizen', 'Collector', 'Reported On', 'Completed On']],
    body: complaints.map((c) => [
      c.complaint_code,
      c.waste_type,
      c.urgency,
      c.status,
      c.address || '—',
      c.citizen?.full_name || '—',
      c.assigned_collector?.full_name || '—',
      formatDate(c.created_at),
      c.completed_at ? formatDate(c.completed_at) : '—',
    ]),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [22, 163, 74], textColor: 255, fontSize: 8 },
    alternateRowStyles: { fillColor: [240, 253, 244] },
  });

  doc.save(`waste-report-${formatDate(new Date())}.pdf`);
}

export function exportComplaintsExcel(complaints: Complaint[], title = 'Waste Collection Report') {
  const stats = getComplaintStats(complaints);
  const score = getCleanlinessScore(complaints);

  // Summary sheet
  const summaryData = [
    ['Smart Waste Collection Tracker'],
    [title],
    [`Generated: ${formatDateTime(new Date())}`],
    [],
    ['Metric', 'Value'],
    ['Total Complaints', stats.total],
    ['Pending', stats.pending],
    ['Assigned', stats.assigned],
    ['In Progress', stats.inProgress],
    ['Completed', stats.completed],
    ['Rejected', stats.rejected],
    ['Village Cleanliness Score', `${score}/100`],
  ];

  // Complaints sheet
  const complaintsData = [
    ['Complaint ID', 'Waste Type', 'Description', 'Urgency', 'Status', 'Latitude', 'Longitude', 'Address', 'Citizen', 'Collector', 'Reported On', 'Completed On'],
    ...complaints.map((c) => [
      c.complaint_code,
      c.waste_type,
      c.description,
      c.urgency,
      c.status,
      c.latitude || '',
      c.longitude || '',
      c.address || '',
      c.citizen?.full_name || '',
      c.assigned_collector?.full_name || '',
      formatDateTime(c.created_at),
      c.completed_at ? formatDateTime(c.completed_at) : '',
    ]),
  ];

  const wb = XLSX.utils.book_new();

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  wsSummary['!cols'] = [{ wch: 30 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

  const wsComplaints = XLSX.utils.aoa_to_sheet(complaintsData);
  wsComplaints['!cols'] = [
    { wch: 20 }, { wch: 14 }, { wch: 40 }, { wch: 10 }, { wch: 12 },
    { wch: 12 }, { wch: 12 }, { wch: 30 }, { wch: 18 }, { wch: 18 },
    { wch: 20 }, { wch: 20 },
  ];
  XLSX.utils.book_append_sheet(wb, wsComplaints, 'Complaints');

  const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  downloadBlob(buffer, `waste-report-${formatDate(new Date())}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
}
