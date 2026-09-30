import { useState, useEffect, useMemo } from "react";
import _ from "lodash";

/* ════════════════════════════════════════════════════════════════
   CHAPTER 7 MATTER STAGES (in order)
   ════════════════════════════════════════════════════════════════ */
const CH7_STAGES = [
  "Hired – Matter Pending Documents and Payments",
  "All Documents In – Paid in Full",
  "Paralegal Review",
  "Attorney Review",
  "Client Signing",
  "File Case",
  "Chapter 7 Case Filed",
  "341 Document Request",
  "341 Preparation",
  "341 Hearing",
  "341 Followup",
  "Discharge Entered",
  "Case Closed",
];

/* ════════════════════════════════════════════════════════════════
   BUILT-IN TASK TEMPLATES
   ════════════════════════════════════════════════════════════════ */
const BUILT_TASKS = [
  { title: "Send Document Request Letter", priority: "High", category: "Intake" },
  { title: "Send Fee Agreement", priority: "High", category: "Intake" },
  { title: "Collect signed Fee Agreement", priority: "High", category: "Intake" },
  { title: "Verify Credit Counseling Certificate", priority: "Medium", category: "Intake" },
  { title: "Run Means Test", priority: "High", category: "Case Prep" },
  { title: "Review Bank Statements (6-month lookback)", priority: "High", category: "Case Prep" },
  { title: "Review Pay Stubs", priority: "Medium", category: "Case Prep" },
  { title: "Review Tax Returns (2 years)", priority: "Medium", category: "Case Prep" },
  { title: "Draft Petition & Schedules", priority: "High", category: "Case Prep" },
  { title: "Attorney Review of Petition", priority: "High", category: "Attorney Review" },
  { title: "Client Signing Appointment", priority: "High", category: "Filing" },
  { title: "File Petition with Court (ECF)", priority: "High", category: "Filing" },
  { title: "Send 341 Preparation Packet to Client", priority: "Medium", category: "341 Meeting" },
  { title: "Prepare for 341 Meeting of Creditors", priority: "High", category: "341 Meeting" },
  { title: "Attend 341 Meeting", priority: "High", category: "341 Meeting" },
  { title: "Respond to Trustee Document Request", priority: "High", category: "Post-Filing" },
  { title: "File Financial Management Certificate", priority: "Medium", category: "Post-Filing" },
  { title: "Monitor for Discharge Entry", priority: "Low", category: "Post-Filing" },
  { title: "Send Closing Letter to Client", priority: "Low", category: "Closing" },
  { title: "Close File", priority: "Low", category: "Closing" },
];

/* ════════════════════════════════════════════════════════════════
   DEMO DATA
   ════════════════════════════════════════════════════════════════ */
const INITIAL_MATTERS = [
  {
    id: 1, matterNumber: "00001", caseNumber: "24-10234", clientName: "Thompson", clientFullName: "James & Sarah Thompson",
    description: "Thompson Ch.7 Bankruptcy", caseType: "Chapter 7", practiceArea: "Chapter 7",
    status: "In Progress", matterStage: "Attorney Review", filingDate: "2024-11-15",
    court: "Central District of California", division: "Los Angeles",
    trustee: "Robert Martinez", responsibleAttorney: "Matt McCune", originatingAttorney: "Matt McCune",
    responsibleStaff: "Tara Salinas", judge: "Hon. Sandra Lee", permissions: "Firm",
    phone: "(562) 555-0147", email: "j.thompson@email.com", address: "1422 Elm St, Long Beach, CA 90802",
    billable: "Yes, hourly", billingMethod: "Hourly",
    totalDebt: 87450, totalAssets: 12300, exemptions: 11800, monthlyIncome: 4200, monthlyExpenses: 3950,
    outstandingBalance: 1750, trustBalance: 0, totalBilled: 2187.50, totalPayments: 437.50,
    customFields: {
      caseNumber: "24-10234", filingDate: "2024-11-15", trustee: "Robert Martinez",
      upFrontFeeQuoted: "$1,500", dateTime341: "2025-01-15 10:00 AM",
      zoomMeetingId341: "845 2901 3847", zoomPasscode341: "341hearing"
    },
    contacts: [
      { id: 1, name: "James Thompson", role: "Client", email: "j.thompson@email.com", phone: "(562) 555-0147" },
      { id: 2, name: "Sarah Thompson", role: "Client (Spouse)", email: "s.thompson@email.com", phone: "(562) 555-0148" }
    ],
    notes: [
      { id: 1, date: "2024-12-01", author: "Tara Salinas", text: "All schedules completed. Ready for attorney review before filing." },
      { id: 2, date: "2024-11-20", author: "Matt McCune", text: "Credit counseling certificate received. Petition drafted and under review." },
      { id: 3, date: "2024-11-15", author: "Matt McCune", text: "Initial consultation completed. Clients qualify for Ch. 7 based on means test. Combined household income below median." }
    ],
    documents: [
      { id: 1, name: "Driver's License - James.pdf", type: "PDF", date: "2024-11-10", size: "1.2 MB", folder: "Intake Document Submissions", subfolder: "Personal Information" },
      { id: 2, name: "Social Security Card - James.pdf", type: "PDF", date: "2024-11-10", size: "890 KB", folder: "Intake Document Submissions", subfolder: "Personal Information" },
      { id: 3, name: "Pay Stubs - Oct 2024.pdf", type: "PDF", date: "2024-11-12", size: "345 KB", folder: "Intake Document Submissions", subfolder: "Income Docs" },
      { id: 4, name: "Pay Stubs - Nov 2024.pdf", type: "PDF", date: "2024-11-18", size: "338 KB", folder: "Intake Document Submissions", subfolder: "Income Docs" },
      { id: 5, name: "Vehicle Title - 2019 Honda.pdf", type: "PDF", date: "2024-11-12", size: "456 KB", folder: "Intake Document Submissions", subfolder: "Asset Docs" },
      { id: 6, name: "2023 Tax Return.pdf", type: "PDF", date: "2024-11-14", size: "1.8 MB", folder: "Intake Document Submissions", subfolder: "Taxes" },
      { id: 7, name: "Credit Counseling Certificate.pdf", type: "PDF", date: "2024-11-18", size: "67 KB", folder: "Intake Document Submissions", subfolder: "Other Docs" },
      { id: 8, name: "Voluntary Petition.pdf", type: "PDF", date: "2024-11-20", size: "245 KB", folder: "ECF Folder", subfolder: "Docket Entries" },
      { id: 9, name: "Schedule A-B - Property.pdf", type: "PDF", date: "2024-11-22", size: "189 KB", folder: "ECF Folder", subfolder: "Docket Entries" },
      { id: 10, name: "Schedule C - Exemptions.pdf", type: "PDF", date: "2024-11-22", size: "134 KB", folder: "ECF Folder", subfolder: "Docket Entries" },
      { id: 11, name: "Schedule D - Secured Claims.pdf", type: "PDF", date: "2024-11-22", size: "98 KB", folder: "ECF Folder", subfolder: "Docket Entries" },
      { id: 12, name: "Schedule E-F - Unsecured Claims.pdf", type: "PDF", date: "2024-11-22", size: "156 KB", folder: "ECF Folder", subfolder: "Docket Entries" },
      { id: 13, name: "Schedule I - Income.pdf", type: "PDF", date: "2024-11-23", size: "87 KB", folder: "ECF Folder", subfolder: "Docket Entries" },
      { id: 14, name: "Schedule J - Expenses.pdf", type: "PDF", date: "2024-11-23", size: "92 KB", folder: "ECF Folder", subfolder: "Docket Entries" },
      { id: 15, name: "Proof of Claim - Capital One.pdf", type: "PDF", date: "2024-12-05", size: "112 KB", folder: "ECF Folder", subfolder: "POC Register" },
      { id: 16, name: "Document Request Letter.pdf", type: "PDF", date: "2024-11-08", size: "78 KB", folder: "Requested Docs", subfolder: "" },
      { id: 17, name: "Fee Agreement Template.docx", type: "DOCX", date: "2024-11-01", size: "45 KB", folder: "Template Documents", subfolder: "" },
      { id: 18, name: "Client Intake Questionnaire.docx", type: "DOCX", date: "2024-11-01", size: "52 KB", folder: "Template Documents", subfolder: "" }
    ],
    tasks: [
      { id: 1, title: "File petition with court", due: "2024-12-10", status: "Pending", priority: "High", assignee: "Matt McCune" },
      { id: 2, title: "Prepare for 341 meeting", due: "2025-01-15", status: "Pending", priority: "High", assignee: "Matt McCune" },
      { id: 3, title: "Gather remaining bank statements", due: "2024-12-05", status: "Completed", priority: "Medium", assignee: "Tara Salinas" },
      { id: 4, title: "Review exemption elections", due: "2024-12-08", status: "Completed", priority: "Medium", assignee: "Matt McCune" },
      { id: 5, title: "Send document checklist to client", due: "2024-11-16", status: "Completed", priority: "High", assignee: "Tara Salinas" }
    ],
    communications: [
      { id: 1, date: "2024-11-15", type: "Phone", direction: "Incoming", subject: "Initial consultation call", from: "James Thompson", duration: "45 min" },
      { id: 2, date: "2024-11-16", type: "Email", direction: "Outgoing", subject: "Welcome packet and document checklist", to: "j.thompson@email.com" },
      { id: 3, date: "2024-11-18", type: "Magic Link", direction: "Outgoing", subject: "Document checklist follow-up", body: "Hi James, just sent over your document checklist via email. Let me know if you have questions!", to: "James Thompson", email: "j.thompson@email.com", phone: "(555) 555-8821", channel: "magic-link" },
      { id: 5, date: "2024-11-20", type: "Email", direction: "Incoming", subject: "RE: Document checklist - pay stubs attached", from: "James Thompson" },
      { id: 6, date: "2024-12-01", type: "Phone", direction: "Outgoing", subject: "Review of petition before filing", to: "James Thompson", duration: "20 min" },
      { id: 7, date: "2024-12-02", type: "Magic Link", direction: "Outgoing", subject: "Filing confirmation", body: "Petition has been filed! You'll receive a confirmation email shortly with next steps.", to: "James Thompson", email: "j.thompson@email.com", phone: "(555) 555-8821", channel: "magic-link" }
    ],
    timeEntries: [
      { id: 1, date: "2024-11-15", description: "Initial client consultation", hours: 1.0, rate: 350, billable: true, attorney: "Matt McCune" },
      { id: 2, date: "2024-11-18", description: "Means test analysis and preparation", hours: 0.75, rate: 350, billable: true, attorney: "Matt McCune" },
      { id: 3, date: "2024-11-20", description: "Draft voluntary petition and schedules", hours: 2.5, rate: 350, billable: true, attorney: "Matt McCune" },
      { id: 4, date: "2024-11-22", description: "Review and finalize all schedules", hours: 1.5, rate: 350, billable: true, attorney: "Matt McCune" },
      { id: 5, date: "2024-11-16", description: "Prepare welcome packet and checklist", hours: 0.5, rate: 150, billable: true, attorney: "Tara Salinas" }
    ],
    calendarEvents: [
      { id: 1, title: "341 Meeting of Creditors", date: "2025-01-15", time: "10:00 AM", location: "USBC - Los Angeles (Zoom)" },
      { id: 2, title: "Filing Deadline", date: "2024-12-10", time: "", location: "" }
    ],
    timeline: [
      { id: 1, date: "2024-12-01", action: "Note added", detail: "All schedules completed", user: "Tara Salinas" },
      { id: 2, date: "2024-11-22", action: "Documents uploaded", detail: "6 schedule documents added", user: "Matt McCune" },
      { id: 3, date: "2024-11-20", action: "Document uploaded", detail: "Voluntary Petition.pdf", user: "Matt McCune" },
      { id: 4, date: "2024-11-18", action: "Time entry", detail: "0.75 hrs — Means test analysis", user: "Matt McCune" },
      { id: 5, date: "2024-11-16", action: "Email sent", detail: "Welcome packet and document checklist", user: "Tara Salinas" },
      { id: 6, date: "2024-11-15", action: "Matter created", detail: "Thompson Ch.7 Bankruptcy", user: "Matt McCune" }
    ]
  },
  {
    id: 2, matterNumber: "00002", caseNumber: "24-10567", clientName: "Gonzalez", clientFullName: "Maria Gonzalez",
    description: "Gonzalez Ch.13 Repayment Plan", caseType: "Chapter 13", practiceArea: "Chapter 13",
    status: "In Progress", matterStage: "341 Preparation", filingDate: "2024-10-08",
    court: "Central District of California", division: "Los Angeles",
    trustee: "Linda Chen", responsibleAttorney: "Matt McCune", originatingAttorney: "Matt McCune",
    responsibleStaff: "Tara Salinas", judge: "Hon. Barry Russell", permissions: "Firm",
    phone: "(310) 555-0293", email: "mgonzalez@email.com", address: "834 Oak Ave, Torrance, CA 90501",
    billable: "Yes, hourly", billingMethod: "Hourly",
    totalDebt: 142000, totalAssets: 285000, exemptions: 195000, monthlyIncome: 6800, monthlyExpenses: 5200,
    outstandingBalance: 875, trustBalance: 0, totalBilled: 3150, totalPayments: 2275,
    customFields: {
      caseNumber: "24-10567", filingDate: "2024-10-08", trustee: "Linda Chen",
      upFrontFeeQuoted: "$3,500", dateTime341: "2024-12-12 2:00 PM",
      zoomMeetingId341: "912 4501 7823", zoomPasscode341: "341ch13",
      ch13FirstPaymentDueDate: "2025-02-01", ch13PaymentAmount: "$850"
    },
    contacts: [
      { id: 1, name: "Maria Gonzalez", role: "Client", email: "mgonzalez@email.com", phone: "(310) 555-0293" }
    ],
    notes: [
      { id: 1, date: "2024-10-15", author: "Matt McCune", text: "Plan proposes 60-month repayment. Disposable income of $1,600/month. Plan payment set at $1,200/month." },
      { id: 2, date: "2024-10-08", author: "Matt McCune", text: "Client wants to save home from foreclosure. Above median income — Chapter 13 plan required. Mortgage arrears ~$18,000." }
    ],
    documents: [
      { id: 1, name: "Mortgage Statement - Oct 2024.pdf", type: "PDF", date: "2024-10-05", size: "156 KB", folder: "Intake Document Submissions", subfolder: "Asset Docs" },
      { id: 2, name: "Voluntary Petition.pdf", type: "PDF", date: "2024-10-10", size: "234 KB", folder: "ECF Folder", subfolder: "Docket Entries" },
      { id: 3, name: "Chapter 13 Plan.pdf", type: "PDF", date: "2024-10-15", size: "312 KB", folder: "ECF Folder", subfolder: "Docket Entries" },
      { id: 4, name: "Means Test (B122C).pdf", type: "PDF", date: "2024-10-10", size: "198 KB", folder: "ECF Folder", subfolder: "Docket Entries" }
    ],
    tasks: [
      { id: 1, title: "Attend plan confirmation hearing", due: "2025-01-20", status: "Pending", priority: "High", assignee: "Matt McCune" },
      { id: 2, title: "File amended plan if needed", due: "2025-01-25", status: "Pending", priority: "Medium", assignee: "Matt McCune" },
      { id: 3, title: "341 Meeting of Creditors", due: "2024-12-12", status: "Completed", priority: "High", assignee: "Matt McCune" }
    ],
    communications: [
      { id: 1, date: "2024-10-08", type: "In Person", direction: "N/A", subject: "Strategy session — Ch. 13 plan overview", from: "Maria Gonzalez", duration: "60 min" },
      { id: 2, date: "2024-10-12", type: "Email", direction: "Outgoing", subject: "Plan draft for review", to: "mgonzalez@email.com" }
    ],
    timeEntries: [
      { id: 1, date: "2024-10-08", description: "Strategy session and case evaluation", hours: 1.5, rate: 350, billable: true, attorney: "Matt McCune" },
      { id: 2, date: "2024-10-10", description: "Draft petition and means test", hours: 3.0, rate: 350, billable: true, attorney: "Matt McCune" },
      { id: 3, date: "2024-10-15", description: "Draft Chapter 13 plan", hours: 2.0, rate: 350, billable: true, attorney: "Matt McCune" }
    ],
    calendarEvents: [
      { id: 1, title: "Plan Confirmation Hearing", date: "2025-01-20", time: "1:30 PM", location: "USBC - Los Angeles" }
    ],
    timeline: [
      { id: 1, date: "2024-10-15", action: "Document uploaded", detail: "Chapter 13 Plan.pdf", user: "Matt McCune" },
      { id: 2, date: "2024-10-10", action: "Matter filed", detail: "Petition filed with court", user: "Matt McCune" },
      { id: 3, date: "2024-10-08", action: "Matter created", detail: "Gonzalez Ch.13 Repayment Plan", user: "Matt McCune" }
    ]
  },
  {
    id: 3, matterNumber: "00003", caseNumber: "24-09821", clientName: "Williams", clientFullName: "Robert Williams",
    description: "Williams Ch.7 — Discharged", caseType: "Chapter 7", practiceArea: "Chapter 7",
    status: "Closed", matterStage: "Case Closed", filingDate: "2024-07-22",
    court: "Central District of California", division: "Los Angeles",
    trustee: "Robert Martinez", responsibleAttorney: "Matt McCune", originatingAttorney: "Matt McCune",
    responsibleStaff: "Tara Salinas", judge: "Hon. Sandra Lee", permissions: "Firm",
    phone: "(714) 555-0188", email: "rwilliams@email.com", address: "2901 Pine St, Anaheim, CA 92801",
    billable: "Yes, hourly", billingMethod: "Hourly",
    totalDebt: 52300, totalAssets: 8500, exemptions: 8500, monthlyIncome: 3100, monthlyExpenses: 2950,
    outstandingBalance: 0, trustBalance: 0, totalBilled: 962.50, totalPayments: 962.50,
    customFields: {
      caseNumber: "24-09821", filingDate: "2024-07-22", trustee: "Robert Martinez",
      upFrontFeeQuoted: "$1,500", dateTime341: "2024-09-05 9:00 AM",
      zoomMeetingId341: "", zoomPasscode341: ""
    },
    contacts: [
      { id: 1, name: "Robert Williams", role: "Client", email: "rwilliams@email.com", phone: "(714) 555-0188" }
    ],
    notes: [
      { id: 1, date: "2024-10-30", author: "Matt McCune", text: "Discharge order entered. Case closed. Client notified." },
      { id: 2, date: "2024-07-22", author: "Matt McCune", text: "Straightforward Ch. 7 case. No assets above exemption limits. All unsecured debt — credit cards and medical bills." }
    ],
    documents: [
      { id: 1, name: "Voluntary Petition.pdf", type: "PDF", date: "2024-07-25", size: "221 KB", folder: "ECF Folder", subfolder: "Docket Entries" },
      { id: 2, name: "Discharge Order.pdf", type: "PDF", date: "2024-10-28", size: "89 KB", folder: "ECF Folder", subfolder: "Docket Entries" }
    ],
    tasks: [
      { id: 1, title: "File petition", due: "2024-07-25", status: "Completed", priority: "High", assignee: "Matt McCune" },
      { id: 2, title: "341 Meeting", due: "2024-09-05", status: "Completed", priority: "High", assignee: "Matt McCune" },
      { id: 3, title: "Send closing letter to client", due: "2024-11-01", status: "Completed", priority: "Medium", assignee: "Tara Salinas" }
    ],
    communications: [
      { id: 1, date: "2024-10-30", type: "Email", direction: "Outgoing", subject: "Congratulations — discharge granted!", to: "rwilliams@email.com" }
    ],
    timeEntries: [
      { id: 1, date: "2024-07-22", description: "Initial consultation", hours: 0.75, rate: 350, billable: true, attorney: "Matt McCune" },
      { id: 2, date: "2024-07-25", description: "Prepare and file petition", hours: 2.0, rate: 350, billable: true, attorney: "Matt McCune" }
    ],
    calendarEvents: [],
    timeline: [
      { id: 1, date: "2024-10-28", action: "Discharge entered", detail: "Case discharged by court", user: "System" },
      { id: 2, date: "2024-09-05", action: "341 Meeting held", detail: "No issues raised by trustee", user: "Matt McCune" },
      { id: 3, date: "2024-07-25", action: "Matter filed", detail: "Petition filed with court", user: "Matt McCune" },
      { id: 4, date: "2024-07-22", action: "Matter created", detail: "Williams Ch.7 — No Asset", user: "Matt McCune" }
    ]
  },
  {
    id: 4, matterNumber: "00004", caseNumber: "25-00112", clientName: "Park", clientFullName: "David & Lisa Park",
    description: "Park Ch.7 — New Intake", caseType: "Chapter 7", practiceArea: "Chapter 7",
    status: "Pending", matterStage: "Hired – Matter Pending Documents and Payments", filingDate: null,
    court: "Central District of California", division: "Los Angeles",
    trustee: null, responsibleAttorney: "Matt McCune", originatingAttorney: "Matt McCune",
    responsibleStaff: "Tara Salinas", judge: null, permissions: "Firm",
    phone: "(626) 555-0341", email: "dpark@email.com", address: "567 Maple Dr, Pasadena, CA 91101",
    billable: "Yes, hourly", billingMethod: "Hourly",
    totalDebt: 95000, totalAssets: 15200, exemptions: 14800, monthlyIncome: 5100, monthlyExpenses: 4900,
    outstandingBalance: 350, trustBalance: 0, totalBilled: 350, totalPayments: 0,
    customFields: {
      caseNumber: "", filingDate: "", trustee: "",
      upFrontFeeQuoted: "$1,500", dateTime341: "",
      zoomMeetingId341: "", zoomPasscode341: ""
    },
    contacts: [
      { id: 1, name: "David Park", role: "Client", email: "dpark@email.com", phone: "(626) 555-0341" },
      { id: 2, name: "Lisa Park", role: "Client (Spouse)", email: "lpark@email.com", phone: "(626) 555-0342" }
    ],
    notes: [
      { id: 1, date: "2025-01-05", author: "Matt McCune", text: "New intake. Couple looking at Ch. 7 for credit card and medical debt. Need to verify income with pay stubs and run means test." }
    ],
    documents: [
      { id: 1, name: "Fee Agreement - Signed.pdf", type: "PDF", date: "2025-01-05", size: "134 KB", folder: "Intake Document Submissions", subfolder: "Other Docs" },
      { id: 2, name: "Intake Questionnaire.pdf", type: "PDF", date: "2025-01-05", size: "267 KB", folder: "Intake Document Submissions", subfolder: "Personal Information" }
    ],
    tasks: [
      { id: 1, title: "Run means test", due: "2025-01-15", status: "Pending", priority: "High", assignee: "Matt McCune" },
      { id: 2, title: "Request credit report", due: "2025-01-10", status: "Pending", priority: "High", assignee: "Tara Salinas" },
      { id: 3, title: "Collect 6 months pay stubs", due: "2025-01-12", status: "Pending", priority: "Medium", assignee: "Tara Salinas" },
      { id: 4, title: "Schedule credit counseling", due: "2025-01-20", status: "Pending", priority: "Medium", assignee: "Tara Salinas" }
    ],
    communications: [
      { id: 1, date: "2025-01-05", type: "In Person", direction: "N/A", subject: "Initial consultation and retainer", from: "David Park", duration: "50 min" }
    ],
    timeEntries: [
      { id: 1, date: "2025-01-05", description: "Initial consultation and case evaluation", hours: 1.0, rate: 350, billable: true, attorney: "Matt McCune" }
    ],
    calendarEvents: [],
    timeline: [
      { id: 1, date: "2025-01-05", action: "Matter created", detail: "Park Ch.7 — New Intake", user: "Matt McCune" }
    ]
  },
  {
    id: 5, matterNumber: "00005", caseNumber: "24-10891", clientName: "Morrison", clientFullName: "Angela Morrison",
    description: "Morrison Ch.13 — Mortgage Restructure", caseType: "Chapter 13", practiceArea: "Chapter 13",
    status: "Submitted", matterStage: "Chapter 7 Case Filed", filingDate: "2024-12-02",
    court: "Central District of California", division: "Los Angeles",
    trustee: "Linda Chen", responsibleAttorney: "Matt McCune", originatingAttorney: "Matt McCune",
    responsibleStaff: "Tara Salinas", judge: "Hon. Barry Russell", permissions: "Firm",
    phone: "(818) 555-0472", email: "amorrison@email.com", address: "1200 Ventura Blvd, Sherman Oaks, CA 91403",
    billable: "Yes, hourly", billingMethod: "Hourly",
    totalDebt: 210000, totalAssets: 340000, exemptions: 275000, monthlyIncome: 8500, monthlyExpenses: 6200,
    outstandingBalance: 1400, trustBalance: 0, totalBilled: 1400, totalPayments: 0,
    customFields: {
      caseNumber: "24-10891", filingDate: "2024-12-02", trustee: "Linda Chen",
      upFrontFeeQuoted: "$4,000", dateTime341: "2025-01-28 11:00 AM",
      zoomMeetingId341: "734 8201 5590", zoomPasscode341: "morrison13",
      ch13FirstPaymentDueDate: "2025-03-01", ch13PaymentAmount: "$1,200"
    },
    contacts: [
      { id: 1, name: "Angela Morrison", role: "Client", email: "amorrison@email.com", phone: "(818) 555-0472" }
    ],
    notes: [
      { id: 1, date: "2024-12-02", author: "Matt McCune", text: "Filed Ch. 13 to restructure mortgage and car loan. Above median — 60 month plan." }
    ],
    documents: [
      { id: 1, name: "Voluntary Petition.pdf", type: "PDF", date: "2024-12-02", size: "245 KB", folder: "ECF Folder", subfolder: "Docket Entries" },
      { id: 2, name: "Chapter 13 Plan.pdf", type: "PDF", date: "2024-12-02", size: "298 KB", folder: "ECF Folder", subfolder: "Docket Entries" },
      { id: 3, name: "Means Test (B122C).pdf", type: "PDF", date: "2024-12-01", size: "187 KB", folder: "ECF Folder", subfolder: "Docket Entries" }
    ],
    tasks: [
      { id: 1, title: "341 Meeting of Creditors", due: "2025-01-28", status: "Pending", priority: "High", assignee: "Matt McCune" },
      { id: 2, title: "Plan confirmation hearing", due: "2025-03-15", status: "Pending", priority: "High", assignee: "Matt McCune" }
    ],
    communications: [
      { id: 1, date: "2024-12-02", type: "Email", direction: "Outgoing", subject: "Filing confirmation and next steps", to: "amorrison@email.com" }
    ],
    timeEntries: [
      { id: 1, date: "2024-11-25", description: "Case analysis and plan preparation", hours: 3.0, rate: 350, billable: true, attorney: "Matt McCune" },
      { id: 2, date: "2024-12-02", description: "File petition and plan with court", hours: 1.0, rate: 350, billable: true, attorney: "Matt McCune" }
    ],
    calendarEvents: [
      { id: 1, title: "341 Meeting of Creditors", date: "2025-01-28", time: "11:00 AM", location: "USBC - Los Angeles (Zoom)" },
      { id: 2, title: "Plan Confirmation Hearing", date: "2025-03-15", time: "9:30 AM", location: "USBC - Los Angeles" }
    ],
    timeline: [
      { id: 1, date: "2024-12-02", action: "Matter filed", detail: "Petition and plan filed", user: "Matt McCune" },
      { id: 2, date: "2024-11-25", action: "Matter created", detail: "Morrison Ch.13 — Mortgage Restructure", user: "Matt McCune" }
    ]
  }
];

const fmt = (n) => new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",minimumFractionDigits:0,maximumFractionDigits:0}).format(n);
const fmtDec = (n) => new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(n);

function useLocalMatters(){
  const [matters,setMatters]=useState(()=>{try{const s=localStorage.getItem("bkfl_matters_v2");return s?JSON.parse(s):INITIAL_MATTERS;}catch{return INITIAL_MATTERS;}});
  useEffect(()=>{localStorage.setItem("bkfl_matters_v2",JSON.stringify(matters));},[matters]);
  return [matters,setMatters];
}

/* ════════════════════════════════════════════════════════════════
   SHARED UI COMPONENTS
   ════════════════════════════════════════════════════════════════ */
const statusColors = {
  Pending:{bg:"#fef3cd",text:"#856404",border:"#ffc107"},
  "In Progress":{bg:"#cce5ff",text:"#004085",border:"#4a90d9"},
  Submitted:{bg:"#e8daef",text:"#6c3483",border:"#8e44ad"},
  Closed:{bg:"#d4edda",text:"#155724",border:"#28a745"},
};
const priorityColors = {High:"#dc3545",Medium:"#fd7e14",Low:"#28a745"};

function StatusBadge({status}){
  const c=statusColors[status]||statusColors.Pending;
  return <span style={{background:c.bg,color:c.text,border:`1px solid ${c.border}`,borderRadius:4,padding:"2px 10px",fontSize:12,fontWeight:500,whiteSpace:"nowrap"}}>{status}</span>;
}

function StageBadge({stage}){
  if(!stage) return null;
  return <span style={{background:"#e8f4fd",color:"#1a73e8",border:"1px solid #a8d4f7",borderRadius:4,padding:"2px 10px",fontSize:12,fontWeight:500}}>{stage}</span>;
}

/* ════════════════════════════════════════════════════════════════
   CLIO-STYLE SIDEBAR (blue)
   ════════════════════════════════════════════════════════════════ */
const sidebarItems = [
  {key:"dashboard",label:"Dashboard",icon:"M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"},
  {key:"calendar",label:"Calendar",icon:"M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"},
  {key:"tasks",label:"Tasks",icon:"M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"},
  {key:"matters",label:"Matters",icon:"M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"},
  {key:"contacts",label:"Contacts",icon:"M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"},
  {key:"activities",label:"Activities",icon:"M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"},
  {key:"billing",label:"Billing",icon:"M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"},
];

function Sidebar({page,setPage,setSelectedMatter}){
  const navClick=(p)=>{setPage(p);setSelectedMatter(null);};
  return(
    <aside style={{width:250,minHeight:"100vh",background:"#1a3a5c",display:"flex",flexDirection:"column",position:"fixed",top:0,left:0,bottom:0,zIndex:20}}>
      <div style={{padding:"16px 20px",display:"flex",alignItems:"center",gap:10,borderBottom:"1px solid rgba(255,255,255,0.1)"}}>
        <div style={{width:32,height:32,borderRadius:8,background:"#2d8cf0",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <div>
          <div style={{color:"#fff",fontSize:15,fontWeight:600,letterSpacing:0.5}}>BK FastLane</div>
          <div style={{color:"rgba(255,255,255,0.5)",fontSize:11}}>Manage</div>
        </div>
      </div>

      <nav style={{flex:1,padding:"12px 0",overflowY:"auto"}}>
        {sidebarItems.map(n=>{
          const active = page===n.key || (n.key==="matters" && page==="matter-detail");
          return(
          <a key={n.key} onClick={()=>navClick(n.key)} style={{
            display:"flex",alignItems:"center",gap:14,padding:"11px 20px",cursor:"pointer",
            fontSize:14,fontWeight:active?500:400,transition:"all 0.15s",
            color:active?"#fff":"rgba(255,255,255,0.7)",
            background:active?"rgba(255,255,255,0.12)":"transparent",
            borderLeft:active?"3px solid #4a90d9":"3px solid transparent",
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d={n.icon} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            {n.label}
          </a>);
        })}
      </nav>

      <div style={{padding:"16px 20px",borderTop:"1px solid rgba(255,255,255,0.1)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:34,height:34,borderRadius:"50%",background:"#4a90d9",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:600}}>MM</div>
          <div>
            <div style={{color:"#fff",fontSize:13,fontWeight:500}}>Matt McCune</div>
            <div style={{color:"rgba(255,255,255,0.5)",fontSize:11}}>BK FastLane</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

/* ════════════════════════════════════════════════════════════════
   TOP BAR (Clio-style with search)
   ════════════════════════════════════════════════════════════════ */
function TopBar({setPage,setSelectedMatter}){
  return(
    <header style={{height:56,background:"#1a3a5c",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 24px",position:"sticky",top:0,zIndex:15,borderBottom:"1px solid rgba(255,255,255,0.1)"}}>
      <div style={{flex:1,maxWidth:500}}>
        <div style={{display:"flex",alignItems:"center",background:"rgba(255,255,255,0.12)",borderRadius:8,padding:"7px 14px",gap:8}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="rgba(255,255,255,0.6)" strokeWidth="1.8"/><path d="M21 21l-4.35-4.35" stroke="rgba(255,255,255,0.6)" strokeWidth="1.8" strokeLinecap="round"/></svg>
          <span style={{color:"rgba(255,255,255,0.5)",fontSize:13}}>Search BK FastLane - Elite Bankruptcy Attorneys</span>
        </div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <button style={{background:"#28a745",color:"#fff",border:"none",borderRadius:6,padding:"7px 18px",fontSize:13,fontWeight:500,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
          Create new <span style={{fontSize:16}}>+</span>
        </button>
        <div style={{position:"relative",cursor:"pointer"}}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9zM13.73 21a2 2 0 01-3.46 0" stroke="rgba(255,255,255,0.7)" strokeWidth="1.8" strokeLinecap="round"/></svg>
          <div style={{position:"absolute",top:-2,right:-4,width:16,height:16,borderRadius:"50%",background:"#dc3545",color:"#fff",fontSize:9,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>5</div>
        </div>
      </div>
    </header>
  );
}

/* ════════════════════════════════════════════════════════════════
   COLLAPSIBLE WIDGET (Clio Dashboard style)
   ════════════════════════════════════════════════════════════════ */
function Widget({title,defaultOpen=true,actions,children}){
  const [open,setOpen]=useState(defaultOpen);
  return(
    <div style={{background:"#fff",borderRadius:8,border:"1px solid #e0e0e0",marginBottom:16,overflow:"hidden"}}>
      <div onClick={()=>setOpen(!open)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 20px",cursor:"pointer",background:"#fafafa",borderBottom:open?"1px solid #e0e0e0":"none"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{transform:open?"rotate(90deg)":"rotate(0deg)",transition:"transform 0.2s"}}><path d="M9 18l6-6-6-6" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <h3 style={{fontSize:15,fontWeight:600,color:"#333",margin:0}}>{title}</h3>
        </div>
        {actions && <div onClick={e=>e.stopPropagation()}>{actions}</div>}
      </div>
      {open && <div style={{padding:20}}>{children}</div>}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   DETAIL ROW — Clio-style label/value pair
   ════════════════════════════════════════════════════════════════ */
function DetailRow({label,value,isLink}){
  return(
    <div style={{display:"flex",padding:"8px 0",borderBottom:"1px solid #f5f5f5",fontSize:14}}>
      <div style={{width:220,fontWeight:500,color:"#333",flexShrink:0}}>{label}</div>
      <div style={{color:isLink?"#1a73e8":"#555",flex:1}}>{value||"—"}</div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   MATTERS LIST PAGE
   ════════════════════════════════════════════════════════════════ */
function MatterList({matters,setMatters,setPage,setSelectedMatter}){
  const [search,setSearch]=useState("");
  const [filterStatus,setFilterStatus]=useState("All");
  const [filterType,setFilterType]=useState("All");

  const filtered=useMemo(()=>matters.filter(m=>{
    const ms=m.clientFullName.toLowerCase().includes(search.toLowerCase())||m.matterNumber.includes(search)||m.caseNumber.includes(search)||m.description.toLowerCase().includes(search.toLowerCase());
    const fs=filterStatus==="All"||m.status===filterStatus;
    const ft=filterType==="All"||m.caseType===filterType;
    return ms&&fs&&ft;
  }),[matters,search,filterStatus,filterType]);

  return(
    <div style={{padding:"24px 28px",flex:1}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <h1 style={{fontSize:22,fontWeight:700,color:"#333"}}>Matters</h1>
      </div>

      <div style={{display:"flex",gap:10,marginBottom:16}}>
        <div style={{flex:1,position:"relative"}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)"}}><circle cx="11" cy="11" r="7" stroke="#999" strokeWidth="1.8"/><path d="M21 21l-4.35-4.35" stroke="#999" strokeWidth="1.8" strokeLinecap="round"/></svg>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search matters..."
            style={{width:"100%",padding:"9px 12px 9px 36px",borderRadius:6,border:"1px solid #d0d0d0",fontSize:13,outline:"none"}}/>
        </div>
        <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{padding:"9px 14px",borderRadius:6,border:"1px solid #d0d0d0",fontSize:13,background:"#fff"}}>
          <option value="All">All Statuses</option><option>Pending</option><option>In Progress</option><option>Submitted</option><option>Closed</option></select>
        <select value={filterType} onChange={e=>setFilterType(e.target.value)} style={{padding:"9px 14px",borderRadius:6,border:"1px solid #d0d0d0",fontSize:13,background:"#fff"}}>
          <option value="All">All Types</option><option>Chapter 7</option><option>Chapter 13</option></select>
      </div>

      <div style={{background:"#fff",borderRadius:8,border:"1px solid #e0e0e0",overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead>
            <tr style={{background:"#fafafa",borderBottom:"2px solid #e0e0e0"}}>
              {["Matter #","Client","Description","Practice Area","Stage","Status","Outstanding"].map(h=>
                <th key={h} style={{textAlign:"left",padding:"10px 14px",color:"#666",fontWeight:600,fontSize:12,textTransform:"uppercase",letterSpacing:0.5}}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {filtered.map(m=>(
              <tr key={m.id} onClick={()=>{setSelectedMatter(m.id);setPage("matter-detail");}}
                style={{borderBottom:"1px solid #f0f0f0",cursor:"pointer",transition:"background 0.1s"}}
                onMouseEnter={e=>e.currentTarget.style.background="#f8f9fa"}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <td style={{padding:"12px 14px",fontWeight:500,color:"#1a73e8"}}>{m.matterNumber}-{m.clientName}</td>
                <td style={{padding:"12px 14px",fontWeight:500}}>{m.clientFullName}</td>
                <td style={{padding:"12px 14px",color:"#666"}}>{m.description}</td>
                <td style={{padding:"12px 14px"}}>{m.practiceArea}</td>
                <td style={{padding:"12px 14px"}}><StageBadge stage={m.matterStage}/></td>
                <td style={{padding:"12px 14px"}}><StatusBadge status={m.status}/></td>
                <td style={{padding:"12px 14px",fontWeight:500,color:m.outstandingBalance>0?"#dc3545":"#28a745"}}>{fmt(m.outstandingBalance)}</td>
              </tr>
            ))}
            {filtered.length===0&&<tr><td colSpan={7} style={{padding:40,textAlign:"center",color:"#999"}}>No matters found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   MATTER DETAIL — CLIO-STYLE with tabs
   ════════════════════════════════════════════════════════════════ */
function MatterDetail({matter,setMatters,setPage,setSelectedMatter}){
  const [tab,setTab]=useState("dashboard");
  const [calFilter,setCalFilter]=useState("upcoming");
  const [commFilter,setCommFilter]=useState("all");
  const [showCompose,setShowCompose]=useState(false);
  const [composeMsg,setComposeMsg]=useState("");
  const [composeSubject,setComposeSubject]=useState("");
  const [showEmailCompose,setShowEmailCompose]=useState(false);
  const [emailSubject,setEmailSubject]=useState("");
  const [emailBody,setEmailBody]=useState("");
  const [showTextCompose,setShowTextCompose]=useState(false);
  const [textBody,setTextBody]=useState("");
  const [showPhoneLog,setShowPhoneLog]=useState(false);
  const [phoneNote,setPhoneNote]=useState("");
  const [phoneDuration,setPhoneDuration]=useState("");
  const [newNote,setNewNote]=useState("");
  const [newTaskTitle,setNewTaskTitle]=useState("");
  const [newTaskDue,setNewTaskDue]=useState("");
  const [newTaskPriority,setNewTaskPriority]=useState("Medium");
  const [taskMode,setTaskMode]=useState("custom");
  const [selectedBuiltTask,setSelectedBuiltTask]=useState("");
  const [builtTaskAssignee,setBuiltTaskAssignee]=useState("Matt McCune");
  const [builtTaskDue,setBuiltTaskDue]=useState("");
  const [newTimeDesc,setNewTimeDesc]=useState("");
  const [newTimeHours,setNewTimeHours]=useState("");
  const [newTimeDate,setNewTimeDate]=useState(new Date().toISOString().split("T")[0]);
  const [editField,setEditField]=useState(null);
  const [editVal,setEditVal]=useState("");
  const [openFolder,setOpenFolder]=useState(null);
  const [openSub,setOpenSub]=useState(null);
  const [docSort,setDocSort]=useState("recent");
  const [showNewEvent,setShowNewEvent]=useState(false);
  const [newEvTitle,setNewEvTitle]=useState("");
  const [newEvStartDate,setNewEvStartDate]=useState("");
  const [newEvStartTime,setNewEvStartTime]=useState("");
  const [newEvEndDate,setNewEvEndDate]=useState("");
  const [newEvEndTime,setNewEvEndTime]=useState("");
  const [newEvAllDay,setNewEvAllDay]=useState(false);
  const [newEvLocation,setNewEvLocation]=useState("");
  const [newEvAssignee,setNewEvAssignee]=useState("Matt McCune");

  if(!matter) return <div style={{padding:40,textAlign:"center",color:"#999"}}>Matter not found.</div>;

  const update=(updates)=>setMatters(prev=>prev.map(m=>m.id===matter.id?{...m,...updates}:m));
  const updateCustomField=(key,val)=>update({customFields:{...matter.customFields,[key]:val}});

  const startEdit=(f,v)=>{setEditField(f);setEditVal(v||"");};
  const saveEdit=(f,isCustom)=>{
    if(isCustom) updateCustomField(f,editVal);
    else update({[f]:editVal});
    setEditField(null);
  };

  const addNote=()=>{if(!newNote.trim())return;update({notes:[{id:Date.now(),date:new Date().toISOString().split("T")[0],author:"Matt McCune",text:newNote},...matter.notes]});setNewNote("");};
  const sendMessage=()=>{
    if(!composeMsg.trim()||!composeSubject.trim())return;
    const clientContact=matter.contacts.find(c=>c.role==="Client")||matter.contacts[0]||{};
    const newComm={id:Date.now(),date:new Date().toISOString().split("T")[0],type:"Magic Link",direction:"Outgoing",subject:composeSubject,body:composeMsg,to:clientContact.name||matter.clientFullName||"",email:clientContact.email||matter.email||"",phone:clientContact.phone||matter.phone||"",channel:"magic-link"};
    update({communications:[newComm,...matter.communications]});
    setComposeMsg("");setComposeSubject("");setShowCompose(false);
  };
  const sendEmail=()=>{
    if(!emailBody.trim()||!emailSubject.trim())return;
    const clientContact=matter.contacts.find(c=>c.role==="Client")||matter.contacts[0]||{};
    const newComm={id:Date.now(),date:new Date().toISOString().split("T")[0],type:"Email",direction:"Outgoing",subject:emailSubject,body:emailBody,to:clientContact.name||matter.clientFullName||"",email:clientContact.email||matter.email||""};
    update({communications:[newComm,...matter.communications]});
    setEmailBody("");setEmailSubject("");setShowEmailCompose(false);
  };
  const sendText=()=>{
    if(!textBody.trim())return;
    const clientContact=matter.contacts.find(c=>c.role==="Client")||matter.contacts[0]||{};
    const newComm={id:Date.now(),date:new Date().toISOString().split("T")[0],type:"Text",direction:"Outgoing",subject:textBody.slice(0,50)+(textBody.length>50?"...":""),body:textBody,to:clientContact.name||matter.clientFullName||"",phone:clientContact.phone||matter.phone||""};
    update({communications:[newComm,...matter.communications]});
    setTextBody("");setShowTextCompose(false);
  };
  const logPhoneCall=()=>{
    if(!phoneNote.trim())return;
    const clientContact=matter.contacts.find(c=>c.role==="Client")||matter.contacts[0]||{};
    const newComm={id:Date.now(),date:new Date().toISOString().split("T")[0],type:"Phone",direction:"N/A",subject:"Phone call"+(phoneDuration?" ("+phoneDuration+")":""),body:phoneNote,to:clientContact.name||matter.clientFullName||"",phone:clientContact.phone||matter.phone||"",duration:phoneDuration||"",from:"Matt McCune"};
    update({communications:[newComm,...matter.communications]});
    setPhoneNote("");setPhoneDuration("");setShowPhoneLog(false);
  };
  const addEvent=()=>{
    if(!newEvTitle.trim()||!newEvStartDate)return;
    const ev={id:Date.now(),title:newEvTitle,date:newEvStartDate,endDate:newEvEndDate||newEvStartDate,time:newEvAllDay?"All day":newEvStartTime||"",endTime:newEvAllDay?"All day":newEvEndTime||"",allDay:newEvAllDay,location:newEvLocation,assignee:newEvAssignee};
    update({calendarEvents:[...(matter.calendarEvents||[]),ev]});
    setNewEvTitle("");setNewEvStartDate("");setNewEvStartTime("");setNewEvEndDate("");setNewEvEndTime("");setNewEvAllDay(false);setNewEvLocation("");setNewEvAssignee("Matt McCune");setShowNewEvent(false);
  };
  const deleteEvent=(id)=>update({calendarEvents:(matter.calendarEvents||[]).filter(e=>e.id!==id)});
  const addTask=()=>{if(!newTaskTitle.trim())return;update({tasks:[...matter.tasks,{id:Date.now(),title:newTaskTitle,due:newTaskDue,status:"Pending",priority:newTaskPriority,assignee:"Matt McCune"}]});setNewTaskTitle("");setNewTaskDue("");};
  const addBuiltTask=()=>{if(!selectedBuiltTask)return;const bt=BUILT_TASKS.find(t=>t.title===selectedBuiltTask);if(!bt)return;update({tasks:[...matter.tasks,{id:Date.now(),title:bt.title,due:builtTaskDue,status:"Pending",priority:bt.priority,assignee:builtTaskAssignee}]});setSelectedBuiltTask("");setBuiltTaskDue("");setBuiltTaskAssignee("Matt McCune");};
  const toggleTask=(id)=>update({tasks:matter.tasks.map(t=>t.id===id?{...t,status:t.status==="Completed"?"Pending":"Completed"}:t)});
  const deleteTask=(id)=>update({tasks:matter.tasks.filter(t=>t.id!==id)});
  const addTime=()=>{if(!newTimeDesc.trim()||!newTimeHours)return;const hrs=parseFloat(newTimeHours);update({timeEntries:[...matter.timeEntries,{id:Date.now(),date:newTimeDate,description:newTimeDesc,hours:hrs,rate:350,billable:true,attorney:"Matt McCune"}],totalBilled:matter.totalBilled+(hrs*350)});setNewTimeDesc("");setNewTimeHours("");};

  const totalHours=matter.timeEntries.reduce((s,t)=>s+t.hours,0);
  const totalBilledCalc=matter.timeEntries.reduce((s,t)=>s+(t.hours*t.rate),0);

  const matterTabs=[
    {key:"dashboard",label:"Dashboard"},
    {key:"activities",label:"Activities"},
    {key:"calendar",label:"Calendar"},
    {key:"communications",label:"Communications"},
    {key:"notes",label:"Notes"},
    {key:"documents",label:"Documents"},
    {key:"tasks",label:"Tasks"},
    {key:"bills",label:"Bills"},
    {key:"transactions",label:"Transactions"},
  ];

  const EditableValue=({field,value,isCustom})=>{
    if(editField===field){
      if(field==="matterStage") return(
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          <select value={editVal} onChange={e=>{setEditVal(e.target.value);}} autoFocus
            style={{padding:"4px 8px",borderRadius:4,border:"1px solid #1a73e8",fontSize:13,outline:"none",flex:1}}>
            {CH7_STAGES.map(s=><option key={s} value={s}>{s}</option>)}
          </select>
          <button onClick={()=>saveEdit(field,isCustom)} style={{background:"#1a73e8",color:"#fff",border:"none",borderRadius:4,padding:"4px 10px",fontSize:12,cursor:"pointer"}}>Save</button>
          <button onClick={()=>setEditField(null)} style={{background:"#f0f0f0",border:"none",borderRadius:4,padding:"4px 10px",fontSize:12,cursor:"pointer"}}>Cancel</button>
        </div>);
      return(
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          <input value={editVal} onChange={e=>setEditVal(e.target.value)} autoFocus onKeyDown={e=>e.key==="Enter"&&saveEdit(field,isCustom)}
            style={{padding:"4px 8px",borderRadius:4,border:"1px solid #1a73e8",fontSize:13,outline:"none",flex:1}}/>
          <button onClick={()=>saveEdit(field,isCustom)} style={{background:"#1a73e8",color:"#fff",border:"none",borderRadius:4,padding:"4px 10px",fontSize:12,cursor:"pointer"}}>Save</button>
          <button onClick={()=>setEditField(null)} style={{background:"#f0f0f0",border:"none",borderRadius:4,padding:"4px 10px",fontSize:12,cursor:"pointer"}}>Cancel</button>
        </div>);
    }
    return <span onClick={()=>startEdit(field,value)} style={{cursor:"pointer"}} title="Click to edit">{value||"—"}</span>;
  };

  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",minHeight:"100vh"}}>
      {/* Matter Header */}
      <div style={{background:"#fff",borderBottom:"1px solid #e0e0e0",padding:"20px 28px 0"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:4}}>
          <button onClick={()=>{setPage("matters");setSelectedMatter(null);}} style={{background:"none",border:"none",cursor:"pointer",padding:0,display:"flex"}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="#1a73e8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <h1 style={{fontSize:22,fontWeight:700,color:"#333",margin:0}}>{matter.matterNumber}-{matter.clientName}</h1>
          <StatusBadge status={matter.status}/>
          <StageBadge stage={matter.matterStage}/>
        </div>
        <p style={{color:"#666",fontSize:13,marginBottom:16,paddingLeft:32}}>{matter.description}</p>

        <div style={{display:"flex",gap:8,marginBottom:16,paddingLeft:32}}>
          {[{label:"Customize",variant:"outline"},{label:"Duplicate",variant:"outline"},{label:"Share",variant:"outline"},{label:"Edit matter",variant:"primary"}].map(b=>(
            <button key={b.label} onClick={()=>{if(b.label==="Edit matter"){/* could open edit modal */}}} style={{
              padding:"7px 16px",borderRadius:6,fontSize:13,fontWeight:500,cursor:"pointer",
              background:b.variant==="primary"?"#1a73e8":"#fff",
              color:b.variant==="primary"?"#fff":"#333",
              border:b.variant==="primary"?"none":"1px solid #d0d0d0",
            }}>{b.label}</button>
          ))}
          <select value={matter.status} onChange={e=>update({status:e.target.value})} style={{marginLeft:"auto",padding:"7px 14px",borderRadius:6,border:"1px solid #d0d0d0",fontSize:13,background:"#fff"}}>
            <option>Pending</option><option>In Progress</option><option>Submitted</option><option>Closed</option>
          </select>
        </div>

        {/* Tab Bar */}
        <div style={{display:"flex",gap:0,overflowX:"auto",paddingLeft:32}}>
          {matterTabs.map(t=>(
            <button key={t.key} onClick={()=>setTab(t.key)} style={{
              padding:"10px 18px",fontSize:13,fontWeight:tab===t.key?600:400,cursor:"pointer",
              color:tab===t.key?"#1a73e8":"#666",background:"none",border:"none",
              borderBottom:tab===t.key?"3px solid #1a73e8":"3px solid transparent",
              transition:"all 0.15s",whiteSpace:"nowrap"
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div style={{padding:"20px 28px",flex:1,background:"#f5f5f5",overflowY:"auto"}}>

        {/* ─── DASHBOARD TAB ─── */}
        {tab==="dashboard"&&(
          <div>
            {/* Financial Widget */}
            <Widget title="Financial Summary" actions={<button style={{background:"#28a745",color:"#fff",border:"none",borderRadius:6,padding:"6px 14px",fontSize:12,cursor:"pointer"}}>Manage payment methods</button>}>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16}}>
                {[
                  {label:"Outstanding",value:fmtDec(matter.outstandingBalance),color:matter.outstandingBalance>0?"#dc3545":"#28a745"},
                  {label:"Total Billed",value:fmtDec(totalBilledCalc),color:"#333"},
                  {label:"Total Payments",value:fmtDec(matter.totalPayments),color:"#28a745"},
                  {label:"Trust Balance",value:fmtDec(matter.trustBalance),color:"#333"},
                ].map((s,i)=>(
                  <div key={i} style={{textAlign:"center",padding:16}}>
                    <div style={{fontSize:12,color:"#888",marginBottom:6,textTransform:"uppercase",letterSpacing:0.5}}>{s.label}</div>
                    <div style={{fontSize:24,fontWeight:700,color:s.color}}>{s.value}</div>
                  </div>
                ))}
              </div>
            </Widget>

            {/* Details Widget */}
            <Widget title="Details">
              <DetailRow label="Matter description" value={<EditableValue field="description" value={matter.description}/>}/>
              <DetailRow label="Responsible attorney" value={matter.responsibleAttorney} isLink/>
              <DetailRow label="Responsible staff" value={matter.responsibleStaff||"—"}/>
              <DetailRow label="Permissions" value={matter.permissions}/>
              <DetailRow label="Originating attorney" value={matter.originatingAttorney} isLink/>
              <DetailRow label="Practice area" value={matter.practiceArea}/>
              <DetailRow label="Matter stage" value={<EditableValue field="matterStage" value={matter.matterStage}/>}/>
              <DetailRow label="Court" value={matter.court}/>
              <DetailRow label="Judge" value={<EditableValue field="judge" value={matter.judge}/>}/>
              <DetailRow label="Billable" value={matter.billable}/>
            </Widget>

            {/* Custom Fields Widget */}
            <Widget title={`${matter.practiceArea} Custom Fields`}>
              {[
                {key:"caseNumber",label:"Case Number"},
                {key:"filingDate",label:"Filing Date"},
                {key:"trustee",label:"Trustee"},
                {key:"upFrontFeeQuoted",label:"Up Front Fee Quoted"},
                {key:"dateTime341",label:"341 Date and Time"},
                {key:"zoomMeetingId341",label:"341 Zoom Meeting ID"},
                {key:"zoomPasscode341",label:"341 Zoom Passcode"},
                ...(matter.practiceArea==="Chapter 13"?[
                  {key:"ch13FirstPaymentDueDate",label:"Chapter 13 First Payment Due Date"},
                  {key:"ch13PaymentAmount",label:"Chapter 13 Payment Amount"},
                ]:[]),
              ].map(f=>(
                <div key={f.key} style={{padding:"12px 0",borderBottom:"1px solid #f5f5f5"}}>
                  <div style={{fontSize:13,fontWeight:600,color:"#333",marginBottom:4}}>{f.label}</div>
                  <div style={{fontSize:14,color:"#555"}}>
                    <EditableValue field={f.key} value={matter.customFields[f.key]} isCustom/>
                  </div>
                </div>
              ))}
            </Widget>

            {/* Contacts Widget */}
            <Widget title="Contacts">
              {matter.contacts.map(c=>(
                <div key={c.id} style={{display:"flex",alignItems:"center",gap:14,padding:"10px 0",borderBottom:"1px solid #f5f5f5"}}>
                  <div style={{width:38,height:38,borderRadius:"50%",background:"#e8f4fd",color:"#1a73e8",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:600}}>
                    {c.name.split(" ").map(n=>n[0]).join("").slice(0,2)}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14,fontWeight:500,color:"#1a73e8"}}>{c.name}</div>
                    <div style={{fontSize:12,color:"#888"}}>{c.role}</div>
                  </div>
                  <div style={{fontSize:14,color:"#555",userSelect:"all",cursor:"text"}}>{c.email}</div>
                  <div style={{fontSize:14,color:"#555",userSelect:"all",cursor:"text"}}>{c.phone}</div>
                </div>
              ))}
            </Widget>

            {/* Timeline Widget */}
            <Widget title="Timeline">
              {matter.timeline.map((t,i)=>(
                <div key={t.id} style={{display:"flex",gap:16,padding:"10px 0",borderBottom:i<matter.timeline.length-1?"1px solid #f5f5f5":"none"}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:"#4a90d9",marginTop:6,flexShrink:0}}/>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:500,color:"#333"}}>{t.action}</div>
                    <div style={{fontSize:12,color:"#888"}}>{t.detail}</div>
                  </div>
                  <div style={{fontSize:12,color:"#999",whiteSpace:"nowrap"}}>{t.date} &middot; {t.user}</div>
                </div>
              ))}
            </Widget>
          </div>
        )}

        {/* ─── NOTES TAB ─── */}
        {tab==="notes"&&(
          <div>
            <div style={{background:"#fff",borderRadius:8,border:"1px solid #e0e0e0",padding:20,marginBottom:16}}>
              <textarea value={newNote} onChange={e=>setNewNote(e.target.value)} placeholder="Add a note..."
                rows={3} style={{width:"100%",padding:12,borderRadius:6,border:"1px solid #d0d0d0",fontSize:14,outline:"none",resize:"vertical",fontFamily:"inherit"}}/>
              <div style={{display:"flex",justifyContent:"flex-end",marginTop:8}}>
                <button onClick={addNote} disabled={!newNote.trim()} style={{background:newNote.trim()?"#1a73e8":"#ccc",color:"#fff",border:"none",borderRadius:6,padding:"8px 20px",fontSize:13,cursor:newNote.trim()?"pointer":"default"}}>Save Note</button>
              </div>
            </div>
            {matter.notes.map(note=>(
              <div key={note.id} style={{background:"#fff",borderRadius:8,border:"1px solid #e0e0e0",padding:20,marginBottom:12}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                  <span style={{fontSize:14,fontWeight:600,color:"#333"}}>{note.author}</span>
                  <span style={{fontSize:12,color:"#999"}}>{note.date}</span>
                </div>
                <p style={{fontSize:14,color:"#555",lineHeight:1.6,margin:0}}>{note.text}</p>
              </div>
            ))}
          </div>
        )}

        {/* ─── DOCUMENTS TAB ─── */}
        {tab==="documents"&&(()=>{
          const DOC_FOLDERS=[
            {name:"Intake Document Submissions",icon:"inbox",subs:["Personal Information","Income Docs","Asset Docs","Taxes","Other Docs"]},
            {name:"ECF Folder",icon:"gavel",subs:["Docket Entries","POC Register"]},
            {name:"Requested Docs",icon:"file-request",subs:[]},
            {name:"Template Documents",icon:"template",subs:[]}
          ];
          const docs=matter.documents||[];
          const folderIcon=(icon)=>{
            if(icon==="inbox")return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22 12H16L14 15H10L8 12H2" stroke="#1a73e8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" stroke="#1a73e8" strokeWidth="1.5" fill="none"/></svg>;
            if(icon==="gavel")return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M14 10l-1.5 1.5M9.5 14.5L8 16" stroke="#1a73e8" strokeWidth="1.5" strokeLinecap="round"/><rect x="2" y="18" width="20" height="3" rx="1" stroke="#1a73e8" strokeWidth="1.5" fill="none"/><path d="M12 2l6 6-8 8-6-6 8-8z" stroke="#1a73e8" strokeWidth="1.5" fill="none"/></svg>;
            if(icon==="file-request")return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="#1a73e8" strokeWidth="1.5" fill="none"/><path d="M14 2v6h6M12 18v-6M9 15l3 3 3-3" stroke="#1a73e8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
            return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="#1a73e8" strokeWidth="1.5" fill="none"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="#1a73e8" strokeWidth="1.5" strokeLinecap="round"/></svg>;
          };
          const countInFolder=(folderName)=>docs.filter(d=>d.folder===folderName).length;
          const countInSub=(folderName,subName)=>docs.filter(d=>d.folder===folderName&&d.subfolder===subName).length;
          const filesRaw=openSub!==null?docs.filter(d=>d.folder===openFolder&&d.subfolder===openSub):openFolder?docs.filter(d=>d.folder===openFolder&&(!d.subfolder||d.subfolder==="")):[];
          const filesInView=docSort==="recent"?[...filesRaw].sort((a,b)=>b.date.localeCompare(a.date)):[...filesRaw].sort((a,b)=>a.name.localeCompare(b.name));
          const showFiles=openFolder!==null&&(DOC_FOLDERS.find(f=>f.name===openFolder)?.subs.length===0||openSub!==null);
          return(<div>
            {/* Breadcrumb */}
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:16,fontSize:13,color:"#888"}}>
              <span onClick={()=>{setOpenFolder(null);setOpenSub(null);}} style={{cursor:"pointer",color:openFolder?"#1a73e8":"#333",fontWeight:openFolder?400:600}}>Documents</span>
              {openFolder&&<><span>/</span><span onClick={()=>setOpenSub(null)} style={{cursor:openSub?"pointer":"default",color:openSub?"#1a73e8":"#333",fontWeight:openSub?400:600}}>{openFolder}</span></>}
              {openSub!==null&&<><span>/</span><span style={{color:"#333",fontWeight:600}}>{openSub}</span></>}
              <span style={{marginLeft:"auto",fontSize:12,color:"#999"}}>{docs.length} total documents</span>
            </div>

            {/* Folder grid or subfolder list or file list */}
            {openFolder===null?(
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                {DOC_FOLDERS.map(f=>(
                  <div key={f.name} onClick={()=>{setOpenFolder(f.name);setOpenSub(f.subs.length?null:null);}} style={{background:"#fff",borderRadius:8,border:"1px solid #e0e0e0",padding:20,cursor:"pointer",transition:"all 0.15s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor="#1a73e8";e.currentTarget.style.boxShadow="0 2px 8px rgba(26,115,232,0.15)";}} onMouseLeave={e=>{e.currentTarget.style.borderColor="#e0e0e0";e.currentTarget.style.boxShadow="none";}}>
                    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
                      <div style={{width:40,height:40,borderRadius:8,background:"#e8f4fd",display:"flex",alignItems:"center",justifyContent:"center"}}>{folderIcon(f.icon)}</div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:14,fontWeight:600,color:"#333"}}>{f.name}</div>
                        <div style={{fontSize:12,color:"#999"}}>{countInFolder(f.name)} file{countInFolder(f.name)!==1?"s":""}{f.subs.length?" · "+f.subs.length+" subfolder"+(f.subs.length!==1?"s":""):""}</div>
                      </div>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  </div>
                ))}
              </div>
            ):!showFiles?(
              <div style={{background:"#fff",borderRadius:8,border:"1px solid #e0e0e0",overflow:"hidden"}}>
                {DOC_FOLDERS.find(f=>f.name===openFolder)?.subs.map((sub,i,arr)=>(
                  <div key={sub} onClick={()=>setOpenSub(sub)} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 20px",borderBottom:i<arr.length-1?"1px solid #f0f0f0":"none",cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.background="#f8f9fa"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <div style={{width:34,height:34,borderRadius:6,background:"#e8f4fd",display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" stroke="#1a73e8" strokeWidth="1.5" fill="none"/></svg>
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:14,fontWeight:500,color:"#333"}}>{sub}</div>
                      <div style={{fontSize:12,color:"#999"}}>{countInSub(openFolder,sub)} file{countInSub(openFolder,sub)!==1?"s":""}</div>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                ))}
              </div>
            ):(
              <div style={{background:"#fff",borderRadius:8,border:"1px solid #e0e0e0",overflow:"hidden"}}>
                <div style={{padding:"12px 20px",borderBottom:"1px solid #e0e0e0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <span style={{fontSize:13,color:"#888"}}>{filesInView.length} file{filesInView.length!==1?"s":""}</span>
                    <div style={{display:"flex",gap:4}}>
                      <button onClick={()=>setDocSort("recent")} style={{padding:"4px 10px",fontSize:11,fontWeight:docSort==="recent"?600:400,border:docSort==="recent"?"1.5px solid #1a73e8":"1px solid #d0d0d0",borderRadius:4,background:docSort==="recent"?"#e8f4fd":"#fff",color:docSort==="recent"?"#1a73e8":"#888",cursor:"pointer"}}>Most Recent</button>
                      <button onClick={()=>setDocSort("name")} style={{padding:"4px 10px",fontSize:11,fontWeight:docSort==="name"?600:400,border:docSort==="name"?"1.5px solid #1a73e8":"1px solid #d0d0d0",borderRadius:4,background:docSort==="name"?"#e8f4fd":"#fff",color:docSort==="name"?"#1a73e8":"#888",cursor:"pointer"}}>Name</button>
                    </div>
                  </div>
                  <button style={{background:"#1a73e8",color:"#fff",border:"none",borderRadius:6,padding:"6px 14px",fontSize:12,cursor:"pointer"}}>+ Upload</button>
                </div>
                {filesInView.length===0?<div style={{padding:40,textAlign:"center",color:"#999"}}>No files in this folder yet.</div>:
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                  <thead><tr style={{background:"#fafafa",borderBottom:"1px solid #e0e0e0"}}>{["Name","Type","Date","Size"].map(h=><th key={h} style={{textAlign:"left",padding:"10px 14px",color:"#666",fontWeight:600,fontSize:12,textTransform:"uppercase",letterSpacing:0.5}}>{h}</th>)}</tr></thead>
                  <tbody>{filesInView.map(d=>(<tr key={d.id} style={{borderBottom:"1px solid #f5f5f5"}} onMouseEnter={e=>e.currentTarget.style.background="#f8f9fa"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <td style={{padding:"10px 14px"}}><div style={{display:"flex",alignItems:"center",gap:8}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="#1a73e8" strokeWidth="1.5" fill="none"/><path d="M14 2v6h6" stroke="#1a73e8" strokeWidth="1.5"/></svg><span style={{fontWeight:500,color:"#1a73e8"}}>{d.name}</span></div></td>
                    <td style={{padding:"10px 14px",color:"#888"}}>{d.type}</td>
                    <td style={{padding:"10px 14px",color:"#888"}}>{d.date}</td>
                    <td style={{padding:"10px 14px",color:"#888"}}>{d.size}</td>
                  </tr>))}</tbody>
                </table>}
              </div>
            )}
          </div>);
        })()}

        {/* ─── TASKS TAB ─── */}
        {tab==="tasks"&&(
          <div>
            <div style={{background:"#fff",borderRadius:8,border:"1px solid #e0e0e0",padding:20,marginBottom:16}}>
              {/* Task Mode Toggle */}
              <div style={{display:"flex",gap:0,marginBottom:16}}>
                <button onClick={()=>setTaskMode("custom")} style={{flex:1,padding:"10px 16px",fontSize:13,fontWeight:600,border:"1px solid #d0d0d0",borderRadius:"6px 0 0 6px",background:taskMode==="custom"?"#1a73e8":"#fff",color:taskMode==="custom"?"#fff":"#555",cursor:"pointer",transition:"all 0.15s"}}>Assign Custom Task</button>
                <button onClick={()=>setTaskMode("built")} style={{flex:1,padding:"10px 16px",fontSize:13,fontWeight:600,border:"1px solid #d0d0d0",borderLeft:"none",borderRadius:"0 6px 6px 0",background:taskMode==="built"?"#1a73e8":"#fff",color:taskMode==="built"?"#fff":"#555",cursor:"pointer",transition:"all 0.15s"}}>Assign Built Task</button>
              </div>

              {/* Custom Task Form */}
              {taskMode==="custom"&&(
              <div style={{display:"flex",gap:10,alignItems:"end"}}>
                <div style={{flex:1}}><label style={{display:"block",fontSize:12,color:"#888",marginBottom:4}}>Task</label>
                  <input value={newTaskTitle} onChange={e=>setNewTaskTitle(e.target.value)} placeholder="New task..." style={{width:"100%",padding:"8px 12px",borderRadius:6,border:"1px solid #d0d0d0",fontSize:13,outline:"none"}}/></div>
                <div style={{width:140}}><label style={{display:"block",fontSize:12,color:"#888",marginBottom:4}}>Due Date</label>
                  <input type="date" value={newTaskDue} onChange={e=>setNewTaskDue(e.target.value)} style={{width:"100%",padding:"8px 12px",borderRadius:6,border:"1px solid #d0d0d0",fontSize:13}}/></div>
                <div style={{width:100}}><label style={{display:"block",fontSize:12,color:"#888",marginBottom:4}}>Priority</label>
                  <select value={newTaskPriority} onChange={e=>setNewTaskPriority(e.target.value)} style={{width:"100%",padding:"8px 12px",borderRadius:6,border:"1px solid #d0d0d0",fontSize:13,background:"#fff"}}>
                    <option>High</option><option>Medium</option><option>Low</option></select></div>
                <button onClick={addTask} disabled={!newTaskTitle.trim()} style={{background:newTaskTitle.trim()?"#1a73e8":"#ccc",color:"#fff",border:"none",borderRadius:6,padding:"8px 16px",fontSize:13,cursor:newTaskTitle.trim()?"pointer":"default",height:36}}>Add</button>
              </div>
              )}

              {/* Built Task Form */}
              {taskMode==="built"&&(
              <div style={{display:"flex",gap:10,alignItems:"end",flexWrap:"wrap"}}>
                <div style={{flex:2,minWidth:200}}><label style={{display:"block",fontSize:12,color:"#888",marginBottom:4}}>Select Task</label>
                  <select value={selectedBuiltTask} onChange={e=>setSelectedBuiltTask(e.target.value)} style={{width:"100%",padding:"8px 12px",borderRadius:6,border:"1px solid #d0d0d0",fontSize:13,background:"#fff"}}>
                    <option value="">Choose a task...</option>
                    {Object.entries(_.groupBy(BUILT_TASKS,"category")).map(([cat,tasks])=>(
                      <optgroup key={cat} label={cat}>{tasks.map(t=><option key={t.title} value={t.title}>{t.title}</option>)}</optgroup>
                    ))}
                  </select></div>
                <div style={{width:140}}><label style={{display:"block",fontSize:12,color:"#888",marginBottom:4}}>Due Date</label>
                  <input type="date" value={builtTaskDue} onChange={e=>setBuiltTaskDue(e.target.value)} style={{width:"100%",padding:"8px 12px",borderRadius:6,border:"1px solid #d0d0d0",fontSize:13}}/></div>
                <div style={{width:150}}><label style={{display:"block",fontSize:12,color:"#888",marginBottom:4}}>Assignee</label>
                  <select value={builtTaskAssignee} onChange={e=>setBuiltTaskAssignee(e.target.value)} style={{width:"100%",padding:"8px 12px",borderRadius:6,border:"1px solid #d0d0d0",fontSize:13,background:"#fff"}}>
                    <option>Matt McCune</option><option>Tara Salinas</option></select></div>
                <button onClick={addBuiltTask} disabled={!selectedBuiltTask} style={{background:selectedBuiltTask?"#1a73e8":"#ccc",color:"#fff",border:"none",borderRadius:6,padding:"8px 16px",fontSize:13,cursor:selectedBuiltTask?"pointer":"default",height:36}}>Add</button>
              </div>
              )}
              {taskMode==="built"&&selectedBuiltTask&&(
                <div style={{marginTop:10,fontSize:12,color:"#666",background:"#f8f9fa",padding:"8px 12px",borderRadius:6}}>
                  Priority: <strong>{BUILT_TASKS.find(t=>t.title===selectedBuiltTask)?.priority}</strong> · Category: <strong>{BUILT_TASKS.find(t=>t.title===selectedBuiltTask)?.category}</strong>
                </div>
              )}
            </div>
            <div style={{background:"#fff",borderRadius:8,border:"1px solid #e0e0e0",overflow:"hidden"}}>
              {_.orderBy(matter.tasks,[t=>t.status==="Completed"?1:0,"due"],["asc","asc"]).map(task=>(
                <div key={task.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 20px",borderBottom:"1px solid #f0f0f0",opacity:task.status==="Completed"?0.6:1}}>
                  <div onClick={()=>toggleTask(task.id)} style={{width:20,height:20,borderRadius:4,border:`2px solid ${task.status==="Completed"?"#28a745":"#ccc"}`,background:task.status==="Completed"?"#28a745":"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}>
                    {task.status==="Completed"&&<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14,fontWeight:500,textDecoration:task.status==="Completed"?"line-through":"none",color:"#333"}}>{task.title}</div>
                    <div style={{fontSize:12,color:"#999",marginTop:2}}>{task.assignee}{task.due?` · Due ${task.due}`:""}</div>
                  </div>
                  <span style={{fontSize:11,fontWeight:600,color:priorityColors[task.priority],background:`${priorityColors[task.priority]}18`,padding:"2px 10px",borderRadius:4}}>{task.priority}</span>
                  <button onClick={()=>deleteTask(task.id)} style={{background:"none",border:"none",cursor:"pointer",padding:4,opacity:0.4}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><polyline points="3,6 5,6 21,6" stroke="#666" strokeWidth="1.5" strokeLinecap="round"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="#666" strokeWidth="1.5" fill="none"/></svg></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── COMMUNICATIONS TAB ─── */}
        {tab==="communications"&&(()=>{
          const comms=matter.communications||[];
          const filtered=commFilter==="all"?comms:commFilter==="magic-link"?comms.filter(c=>c.type==="Magic Link"):comms.filter(c=>c.type.toLowerCase()===commFilter);
          const counts={all:comms.length,email:comms.filter(c=>c.type==="Email").length,text:comms.filter(c=>c.type==="Text").length,phone:comms.filter(c=>c.type==="Phone").length};
          const clientContact=matter.contacts.find(c=>c.role==="Client")||matter.contacts[0]||{};
          return(<div>
            {/* Magic Link Compose */}
            <div style={{background:"#fff",borderRadius:8,border:"1px solid #e0e0e0",padding:20,marginBottom:16}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:showCompose?16:0}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:32,height:32,borderRadius:"50%",background:"linear-gradient(135deg,#1a73e8,#1557b0)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" stroke="#fff" strokeWidth="2" strokeLinecap="round"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
                  </div>
                  <div>
                    <div style={{fontSize:14,fontWeight:600,color:"#333"}}>Magic Link</div>
                    <div style={{fontSize:12,color:"#888"}}>Sends email + text simultaneously to {clientContact.name||matter.clientFullName||"client"}</div>
                  </div>
                </div>
                <button onClick={()=>setShowCompose(!showCompose)} style={{padding:"8px 18px",fontSize:13,fontWeight:500,border:"none",borderRadius:6,background:showCompose?"#f0f0f0":"#1a73e8",color:showCompose?"#666":"#fff",cursor:"pointer"}}>{showCompose?"Cancel":"Compose"}</button>
              </div>
              {showCompose&&(
                <div style={{borderTop:"1px solid #eee",paddingTop:16}}>
                  <div style={{display:"flex",gap:16,marginBottom:12,fontSize:12,color:"#888"}}>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="2" y="4" width="20" height="16" rx="2" stroke="#1a73e8" strokeWidth="1.5" fill="none"/><path d="M22 6L12 13 2 6" stroke="#1a73e8" strokeWidth="1.5"/></svg>
                      <strong style={{color:"#333"}}>{clientContact.email||matter.email||"—"}</strong>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="#1a73e8" strokeWidth="1.5" fill="none"/></svg>
                      <strong style={{color:"#333"}}>{clientContact.phone||matter.phone||"—"}</strong>
                    </div>
                  </div>
                  <input value={composeSubject} onChange={e=>setComposeSubject(e.target.value)} placeholder="Subject" style={{width:"100%",padding:"8px 12px",borderRadius:6,border:"1px solid #d0d0d0",fontSize:13,outline:"none",marginBottom:8,boxSizing:"border-box"}}/>
                  <textarea value={composeMsg} onChange={e=>setComposeMsg(e.target.value)} placeholder="Write your message... (sent as both email and text)" rows={4} style={{width:"100%",padding:"8px 12px",borderRadius:6,border:"1px solid #d0d0d0",fontSize:13,outline:"none",resize:"vertical",fontFamily:"inherit",boxSizing:"border-box"}}/>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:8}}>
                    <div style={{fontSize:11,color:"#999"}}>This message will be delivered via email and text</div>
                    <button onClick={sendMessage} disabled={!composeMsg.trim()||!composeSubject.trim()} style={{padding:"8px 20px",fontSize:13,fontWeight:600,border:"none",borderRadius:6,background:(composeMsg.trim()&&composeSubject.trim())?"#1a73e8":"#ccc",color:"#fff",cursor:(composeMsg.trim()&&composeSubject.trim())?"pointer":"default",display:"flex",alignItems:"center",gap:6}}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      Send via Magic Link
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Filter bar */}
            <div style={{display:"flex",gap:6,marginBottom:16}}>
              {[{key:"all",label:"All"},{key:"email",label:"Email"},{key:"text",label:"Text"},{key:"magic-link",label:"Magic Link"},{key:"phone",label:"Phone"}].map(f=>(
                <button key={f.key} onClick={()=>setCommFilter(f.key)} style={{padding:"7px 16px",fontSize:13,fontWeight:commFilter===f.key?600:400,cursor:"pointer",borderRadius:6,border:commFilter===f.key?"2px solid #1a73e8":"1px solid #d0d0d0",background:commFilter===f.key?"#e8f4fd":"#fff",color:commFilter===f.key?"#1a73e8":"#888",transition:"all 0.15s"}}>{f.label} ({f.key==="magic-link"?comms.filter(c=>c.type==="Magic Link").length:counts[f.key]})</button>
              ))}
            </div>

            {/* Send Email compose */}
            {commFilter==="email"&&(
              <div style={{background:"#fff",borderRadius:8,border:"1px solid #e0e0e0",padding:20,marginBottom:16}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:showEmailCompose?16:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:32,height:32,borderRadius:"50%",background:"#e8f4fd",display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="2" y="4" width="20" height="16" rx="2" stroke="#1a73e8" strokeWidth="2" fill="none"/><path d="M22 6L12 13 2 6" stroke="#1a73e8" strokeWidth="2"/></svg>
                    </div>
                    <div>
                      <div style={{fontSize:14,fontWeight:600,color:"#333"}}>Send Email</div>
                      <div style={{fontSize:12,color:"#888"}}>Email to {(matter.contacts.find(c=>c.role==="Client")||matter.contacts[0]||{}).email||matter.email||"client"}</div>
                    </div>
                  </div>
                  <button onClick={()=>setShowEmailCompose(!showEmailCompose)} style={{padding:"8px 18px",fontSize:13,fontWeight:500,border:"none",borderRadius:6,background:showEmailCompose?"#f0f0f0":"#1a73e8",color:showEmailCompose?"#666":"#fff",cursor:"pointer"}}>{showEmailCompose?"Cancel":"Compose"}</button>
                </div>
                {showEmailCompose&&(
                  <div style={{borderTop:"1px solid #eee",paddingTop:16}}>
                    <div style={{display:"flex",gap:16,marginBottom:12,fontSize:12,color:"#888"}}>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        <span style={{fontWeight:600,color:"#333"}}>To:</span>
                        <strong style={{color:"#333"}}>{(matter.contacts.find(c=>c.role==="Client")||matter.contacts[0]||{}).email||matter.email||"—"}</strong>
                      </div>
                    </div>
                    <input value={emailSubject} onChange={e=>setEmailSubject(e.target.value)} placeholder="Subject" style={{width:"100%",padding:"8px 12px",borderRadius:6,border:"1px solid #d0d0d0",fontSize:13,outline:"none",marginBottom:8,boxSizing:"border-box"}}/>
                    <textarea value={emailBody} onChange={e=>setEmailBody(e.target.value)} placeholder="Write your email..." rows={4} style={{width:"100%",padding:"8px 12px",borderRadius:6,border:"1px solid #d0d0d0",fontSize:13,outline:"none",resize:"vertical",fontFamily:"inherit",boxSizing:"border-box"}}/>
                    <div style={{display:"flex",justifyContent:"flex-end",marginTop:8}}>
                      <button onClick={sendEmail} disabled={!emailBody.trim()||!emailSubject.trim()} style={{padding:"8px 20px",fontSize:13,fontWeight:600,border:"none",borderRadius:6,background:(emailBody.trim()&&emailSubject.trim())?"#1a73e8":"#ccc",color:"#fff",cursor:(emailBody.trim()&&emailSubject.trim())?"pointer":"default",display:"flex",alignItems:"center",gap:6}}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        Send Email
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Send Text compose */}
            {commFilter==="text"&&(
              <div style={{background:"#fff",borderRadius:8,border:"1px solid #e0e0e0",padding:20,marginBottom:16}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:showTextCompose?16:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:32,height:32,borderRadius:"50%",background:"#E3F2FD",display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="#1565C0" strokeWidth="2" fill="none"/></svg>
                    </div>
                    <div>
                      <div style={{fontSize:14,fontWeight:600,color:"#333"}}>Send Text</div>
                      <div style={{fontSize:12,color:"#888"}}>Text to {(matter.contacts.find(c=>c.role==="Client")||matter.contacts[0]||{}).phone||matter.phone||"client"}</div>
                    </div>
                  </div>
                  <button onClick={()=>setShowTextCompose(!showTextCompose)} style={{padding:"8px 18px",fontSize:13,fontWeight:500,border:"none",borderRadius:6,background:showTextCompose?"#f0f0f0":"#1a73e8",color:showTextCompose?"#666":"#fff",cursor:"pointer"}}>{showTextCompose?"Cancel":"Compose"}</button>
                </div>
                {showTextCompose&&(
                  <div style={{borderTop:"1px solid #eee",paddingTop:16}}>
                    <div style={{display:"flex",gap:16,marginBottom:12,fontSize:12,color:"#888"}}>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        <span style={{fontWeight:600,color:"#333"}}>To:</span>
                        <strong style={{color:"#333"}}>{(matter.contacts.find(c=>c.role==="Client")||matter.contacts[0]||{}).phone||matter.phone||"—"}</strong>
                      </div>
                    </div>
                    <textarea value={textBody} onChange={e=>setTextBody(e.target.value)} placeholder="Write your text message..." rows={3} style={{width:"100%",padding:"8px 12px",borderRadius:6,border:"1px solid #d0d0d0",fontSize:13,outline:"none",resize:"vertical",fontFamily:"inherit",boxSizing:"border-box"}}/>
                    <div style={{display:"flex",justifyContent:"flex-end",marginTop:8}}>
                      <button onClick={sendText} disabled={!textBody.trim()} style={{padding:"8px 20px",fontSize:13,fontWeight:600,border:"none",borderRadius:6,background:textBody.trim()?"#1a73e8":"#ccc",color:"#fff",cursor:textBody.trim()?"pointer":"default",display:"flex",alignItems:"center",gap:6}}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        Send Text
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Log Phone Call */}
            {commFilter==="phone"&&(
              <div style={{background:"#fff",borderRadius:8,border:"1px solid #e0e0e0",padding:20,marginBottom:16}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:showPhoneLog?16:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:32,height:32,borderRadius:"50%",background:"#dce8de",display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke="#5a7e60" strokeWidth="2" fill="none"/></svg>
                    </div>
                    <div>
                      <div style={{fontSize:14,fontWeight:600,color:"#333"}}>Log Phone Call</div>
                      <div style={{fontSize:12,color:"#888"}}>Record notes from a phone call with {(matter.contacts.find(c=>c.role==="Client")||matter.contacts[0]||{}).name||matter.clientFullName||"client"}</div>
                    </div>
                  </div>
                  <button onClick={()=>setShowPhoneLog(!showPhoneLog)} style={{padding:"8px 18px",fontSize:13,fontWeight:500,border:"none",borderRadius:6,background:showPhoneLog?"#f0f0f0":"#1a73e8",color:showPhoneLog?"#666":"#fff",cursor:"pointer"}}>{showPhoneLog?"Cancel":"Log Call"}</button>
                </div>
                {showPhoneLog&&(
                  <div style={{borderTop:"1px solid #eee",paddingTop:16}}>
                    <div style={{display:"flex",gap:16,marginBottom:12,fontSize:12,color:"#888"}}>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        <span style={{fontWeight:600,color:"#333"}}>With:</span>
                        <strong style={{color:"#333"}}>{(matter.contacts.find(c=>c.role==="Client")||matter.contacts[0]||{}).name||matter.clientFullName||"—"}</strong>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        <span style={{fontWeight:600,color:"#333"}}>Phone:</span>
                        <strong style={{color:"#333"}}>{(matter.contacts.find(c=>c.role==="Client")||matter.contacts[0]||{}).phone||matter.phone||"—"}</strong>
                      </div>
                    </div>
                    <div style={{marginBottom:8}}>
                      <input value={phoneDuration} onChange={e=>setPhoneDuration(e.target.value)} placeholder="Duration (e.g. 15 min)" style={{width:200,padding:"8px 12px",borderRadius:6,border:"1px solid #d0d0d0",fontSize:13,outline:"none",boxSizing:"border-box"}}/>
                    </div>
                    <textarea value={phoneNote} onChange={e=>setPhoneNote(e.target.value)} placeholder="Call notes... what was discussed?" rows={4} style={{width:"100%",padding:"8px 12px",borderRadius:6,border:"1px solid #d0d0d0",fontSize:13,outline:"none",resize:"vertical",fontFamily:"inherit",boxSizing:"border-box"}}/>
                    <div style={{display:"flex",justifyContent:"flex-end",marginTop:8}}>
                      <button onClick={logPhoneCall} disabled={!phoneNote.trim()} style={{padding:"8px 20px",fontSize:13,fontWeight:600,border:"none",borderRadius:6,background:phoneNote.trim()?"#1a73e8":"#ccc",color:"#fff",cursor:phoneNote.trim()?"pointer":"default",display:"flex",alignItems:"center",gap:6}}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        Save Call Log
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Communication list */}
            <div style={{background:"#fff",borderRadius:8,border:"1px solid #e0e0e0",overflow:"hidden"}}>
              {filtered.length===0?
                <div style={{padding:40,textAlign:"center",color:"#999"}}>No {commFilter==="all"?"communications":commFilter+" messages"} logged.</div>:
                filtered.map((c,i)=>(
                  <div key={c.id} style={{display:"flex",gap:16,padding:"16px 20px",borderBottom:i<filtered.length-1?"1px solid #f0f0f0":"none"}}
                    onMouseEnter={e=>e.currentTarget.style.background="#f8f9fa"}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <div style={{width:38,height:38,borderRadius:"50%",background:c.type==="Magic Link"?"linear-gradient(135deg,#e8f4fd,#d0e8ff)":c.type==="Email"?"#e8f4fd":c.type==="Text"?"#E3F2FD":c.type==="Phone"?"#d4edda":"#f3e8ff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        {c.type==="Magic Link"?<><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" stroke="#1557b0" strokeWidth="1.8" strokeLinecap="round"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" stroke="#1557b0" strokeWidth="1.8" strokeLinecap="round"/></>:
                         c.type==="Email"?<><rect x="2" y="4" width="20" height="16" rx="2" stroke="#1a73e8" strokeWidth="1.5" fill="none"/><path d="M22 6L12 13 2 6" stroke="#1a73e8" strokeWidth="1.5"/></>:
                         c.type==="Text"?<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="#1565C0" strokeWidth="1.5" fill="none"/>:
                         c.type==="Phone"?<path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke="#28a745" strokeWidth="1.5" fill="none"/>:
                         <><circle cx="12" cy="7" r="4" stroke="#8b5cf6" strokeWidth="1.5" fill="none"/><path d="M4 21v-2a4 4 0 014-4h8a4 4 0 014 4v2" stroke="#8b5cf6" strokeWidth="1.5" fill="none"/></>}
                      </svg>
                    </div>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <span style={{fontSize:14,fontWeight:500,color:"#333"}}>{c.subject}</span>
                          {c.type==="Magic Link"&&<span style={{fontSize:10,fontWeight:600,background:"linear-gradient(135deg,#e8f4fd,#d0e8ff)",color:"#1557b0",padding:"2px 8px",borderRadius:10,display:"flex",alignItems:"center",gap:3}}><svg width="10" height="10" viewBox="0 0 24 24" fill="none"><rect x="2" y="4" width="20" height="16" rx="2" stroke="#1557b0" strokeWidth="2" fill="none"/></svg>+<svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="#1557b0" strokeWidth="2" fill="none"/></svg></span>}
                        </div>
                        <span style={{fontSize:12,color:"#999",whiteSpace:"nowrap",marginLeft:12}}>{c.date}</span>
                      </div>
                      <div style={{fontSize:13,color:"#888"}}>{c.type==="Magic Link"?"Email + Text · "+c.direction+(c.to?" · "+c.to:""):(c.type+(c.direction!=="N/A"?` · ${c.direction}`:"")+(c.from?` · ${c.from}`:"")+(c.to?` · ${c.to}`:"")+(c.duration?` · ${c.duration}`:""))}</div>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>);
        })()}

        {/* ─── CALENDAR TAB ─── */}
        {tab==="calendar"&&(()=>{
          const today=new Date().toISOString().split("T")[0];
          const events=[...(matter.calendarEvents||[])].sort((a,b)=>a.date.localeCompare(b.date));
          const upcoming=events.filter(ev=>ev.date>=today);
          const past=events.filter(ev=>ev.date<today);
          const filtered=calFilter==="upcoming"?upcoming:calFilter==="past"?past:events;
          return(<div>
            {/* Header with New Event button */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <h3 style={{fontSize:16,fontWeight:600,color:"#333",margin:0}}>Calendar Events</h3>
              <button onClick={()=>setShowNewEvent(!showNewEvent)} style={{padding:"8px 20px",fontSize:13,fontWeight:600,border:"none",borderRadius:6,background:showNewEvent?"#f0f0f0":"#1a73e8",color:showNewEvent?"#666":"#fff",cursor:"pointer"}}>{showNewEvent?"Cancel":"New Event"}</button>
            </div>

            {/* New Event Form */}
            {showNewEvent&&(
              <div style={{background:"#fff",borderRadius:8,border:"1px solid #e0e0e0",padding:20,marginBottom:16}}>
                <div style={{fontSize:14,fontWeight:600,color:"#333",marginBottom:16}}>Create New Event</div>
                <div style={{display:"flex",flexDirection:"column",gap:12}}>
                  <div>
                    <label style={{display:"block",fontSize:12,color:"#888",marginBottom:4}}>Title</label>
                    <input value={newEvTitle} onChange={e=>setNewEvTitle(e.target.value)} placeholder="Event title..." style={{width:"100%",padding:"8px 12px",borderRadius:6,border:"1px solid #d0d0d0",fontSize:13,outline:"none",boxSizing:"border-box"}}/>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <label style={{display:"flex",alignItems:"center",gap:6,fontSize:13,color:"#333",cursor:"pointer"}}>
                      <input type="checkbox" checked={newEvAllDay} onChange={e=>setNewEvAllDay(e.target.checked)} style={{accentColor:"#1a73e8"}}/>
                      All day
                    </label>
                  </div>
                  <div style={{display:"flex",gap:12}}>
                    <div style={{flex:1}}>
                      <label style={{display:"block",fontSize:12,color:"#888",marginBottom:4}}>Start Date</label>
                      <input type="date" value={newEvStartDate} onChange={e=>{setNewEvStartDate(e.target.value);if(!newEvEndDate)setNewEvEndDate(e.target.value);}} style={{width:"100%",padding:"8px 12px",borderRadius:6,border:"1px solid #d0d0d0",fontSize:13,boxSizing:"border-box"}}/>
                    </div>
                    {!newEvAllDay&&<div style={{flex:1}}>
                      <label style={{display:"block",fontSize:12,color:"#888",marginBottom:4}}>Start Time</label>
                      <input type="time" value={newEvStartTime} onChange={e=>setNewEvStartTime(e.target.value)} style={{width:"100%",padding:"8px 12px",borderRadius:6,border:"1px solid #d0d0d0",fontSize:13,boxSizing:"border-box"}}/>
                    </div>}
                    <div style={{flex:1}}>
                      <label style={{display:"block",fontSize:12,color:"#888",marginBottom:4}}>End Date</label>
                      <input type="date" value={newEvEndDate} onChange={e=>setNewEvEndDate(e.target.value)} style={{width:"100%",padding:"8px 12px",borderRadius:6,border:"1px solid #d0d0d0",fontSize:13,boxSizing:"border-box"}}/>
                    </div>
                    {!newEvAllDay&&<div style={{flex:1}}>
                      <label style={{display:"block",fontSize:12,color:"#888",marginBottom:4}}>End Time</label>
                      <input type="time" value={newEvEndTime} onChange={e=>setNewEvEndTime(e.target.value)} style={{width:"100%",padding:"8px 12px",borderRadius:6,border:"1px solid #d0d0d0",fontSize:13,boxSizing:"border-box"}}/>
                    </div>}
                  </div>
                  <div style={{display:"flex",gap:12}}>
                    <div style={{flex:1}}>
                      <label style={{display:"block",fontSize:12,color:"#888",marginBottom:4}}>Location</label>
                      <input value={newEvLocation} onChange={e=>setNewEvLocation(e.target.value)} placeholder="Location (optional)" style={{width:"100%",padding:"8px 12px",borderRadius:6,border:"1px solid #d0d0d0",fontSize:13,outline:"none",boxSizing:"border-box"}}/>
                    </div>
                  </div>
                  <div>
                    <label style={{display:"block",fontSize:12,color:"#888",marginBottom:6}}>Assign To</label>
                    <div style={{display:"flex",gap:6}}>
                      {[{name:"Matt McCune",color:"#7a9c80"},{name:"Bob Stevens",color:"#214e5f"},{name:"Angie Sullivan",color:"#e67e22"},{name:"Andrea Rubino",color:"#8e44ad"}].map(u=>(
                        <button key={u.name} onClick={()=>setNewEvAssignee(u.name)} style={{padding:"6px 14px",fontSize:12,fontWeight:newEvAssignee===u.name?600:400,border:newEvAssignee===u.name?"2px solid "+u.color:"1px solid #d0d0d0",borderRadius:6,background:newEvAssignee===u.name?u.color+"18":"#fff",color:newEvAssignee===u.name?u.color:"#888",cursor:"pointer",transition:"all 0.15s"}}>{u.name.split(" ")[0]}</button>
                      ))}
                    </div>
                  </div>
                  <div style={{display:"flex",justifyContent:"flex-end",marginTop:4}}>
                    <button onClick={addEvent} disabled={!newEvTitle.trim()||!newEvStartDate} style={{padding:"8px 24px",fontSize:13,fontWeight:600,border:"none",borderRadius:6,background:(newEvTitle.trim()&&newEvStartDate)?"#1a73e8":"#ccc",color:"#fff",cursor:(newEvTitle.trim()&&newEvStartDate)?"pointer":"default"}}>Save Event</button>
                  </div>
                </div>
              </div>
            )}

            {/* Filter bar */}
            <div style={{display:"flex",gap:6,marginBottom:16}}>
              {[{key:"upcoming",label:"Upcoming",count:upcoming.length},{key:"past",label:"Past",count:past.length},{key:"all",label:"All",count:events.length}].map(f=>(
                <button key={f.key} onClick={()=>setCalFilter(f.key)} style={{padding:"7px 16px",fontSize:13,fontWeight:calFilter===f.key?600:400,cursor:"pointer",borderRadius:6,border:calFilter===f.key?"2px solid #1a73e8":"1px solid #d0d0d0",background:calFilter===f.key?"#e8f4fd":"#fff",color:calFilter===f.key?"#1a73e8":"#888",transition:"all 0.15s"}}>{f.label} ({f.count})</button>
              ))}
            </div>

            {/* Events table */}
            <div style={{background:"#fff",borderRadius:8,border:"1px solid #e0e0e0",overflow:"hidden"}}>
              {filtered.length===0?<div style={{padding:40,textAlign:"center",color:"#999"}}>{calFilter==="upcoming"?"No upcoming events.":calFilter==="past"?"No past events.":"No events."}</div>:(
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                <thead><tr style={{background:"#fafafa",borderBottom:"1px solid #e0e0e0"}}>
                  {["Start Date","Start Time","End Date","End Time","Title","Assignee","Location",""].map(h=><th key={h} style={{textAlign:"left",padding:"10px 14px",color:"#666",fontWeight:600,fontSize:12,textTransform:"uppercase",letterSpacing:0.5}}>{h}</th>)}
                </tr></thead>
                <tbody>{filtered.map(ev=>{
                  const formatDate=(d)=>{if(!d)return"—";const dt=new Date(d+"T12:00:00");return dt.toLocaleDateString("en-US",{month:"2-digit",day:"2-digit",year:"numeric"});};
                  const formatTime=(t,allDay)=>{if(allDay||t==="All day")return"All day";if(!t)return"—";try{const[h,m]=t.split(":");const hr=parseInt(h);return(hr>12?hr-12:hr||12)+":"+m+(hr>=12?" PM":" AM");}catch{return t;}};
                  return(<tr key={ev.id} style={{borderBottom:"1px solid #f0f0f0",opacity:ev.date<today?0.6:1}} onMouseEnter={e=>e.currentTarget.style.background="#f8f9fa"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <td style={{padding:"12px 14px"}}>{formatDate(ev.date)}</td>
                    <td style={{padding:"12px 14px"}}>{formatTime(ev.time,ev.allDay)}</td>
                    <td style={{padding:"12px 14px"}}>{formatDate(ev.endDate||ev.date)}</td>
                    <td style={{padding:"12px 14px"}}>{formatTime(ev.endTime,ev.allDay)}</td>
                    <td style={{padding:"12px 14px",fontWeight:500,color:"#333"}}>{ev.title}</td>
                    <td style={{padding:"12px 14px",color:"#555"}}>{ev.assignee||"—"}</td>
                    <td style={{padding:"12px 14px",color:"#888"}}>{ev.location||"—"}</td>
                    <td style={{padding:"12px 14px"}}><button onClick={()=>deleteEvent(ev.id)} style={{background:"none",border:"none",cursor:"pointer",padding:4,opacity:0.4}} title="Delete event"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><polyline points="3,6 5,6 21,6" stroke="#666" strokeWidth="1.5" strokeLinecap="round"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="#666" strokeWidth="1.5" fill="none"/></svg></button></td>
                  </tr>);
                })}</tbody>
              </table>)}
            </div>
          </div>);
        })()}

        {/* ─── ACTIVITIES TAB ─── */}
        {tab==="activities"&&(
          <div style={{background:"#fff",borderRadius:8,border:"1px solid #e0e0e0",overflow:"hidden"}}>
            <div style={{padding:"14px 20px",borderBottom:"1px solid #e0e0e0"}}><span style={{fontSize:13,color:"#888"}}>All activities for this matter</span></div>
            {_.orderBy([
              ...matter.timeEntries.map(t=>({...t,actType:"Time Entry",sortDate:t.date})),
              ...matter.communications.map(c=>({...c,actType:"Communication",sortDate:c.date})),
            ],"sortDate","desc").map((a,i)=>(
              <div key={i} style={{display:"flex",gap:14,padding:"12px 20px",borderBottom:"1px solid #f5f5f5",alignItems:"center"}}>
                <div style={{width:32,height:32,borderRadius:"50%",background:a.actType==="Time Entry"?"#eff6ff":"#f0fdf4",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  {a.actType==="Time Entry"?
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#1a73e8" strokeWidth="1.5"/><path d="M12 7v5l3 3" stroke="#1a73e8" strokeWidth="1.5" strokeLinecap="round"/></svg>:
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="2" y="4" width="20" height="16" rx="2" stroke="#28a745" strokeWidth="1.5" fill="none"/><path d="M22 6L12 13 2 6" stroke="#28a745" strokeWidth="1.5"/></svg>
                  }
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:500,color:"#333"}}>{a.description||a.subject}</div>
                  <div style={{fontSize:12,color:"#999"}}>{a.actType}{a.hours?` · ${a.hours.toFixed(2)} hrs`:""}{a.attorney?` · ${a.attorney}`:""}</div>
                </div>
                <div style={{fontSize:12,color:"#999"}}>{a.sortDate}</div>
              </div>
            ))}
          </div>
        )}

        {/* ─── BILLS TAB ─── */}
        {tab==="bills"&&(
          <div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,marginBottom:20}}>
              <div style={{background:"#fff",borderRadius:8,border:"1px solid #e0e0e0",padding:20,textAlign:"center"}}>
                <div style={{fontSize:12,color:"#888",marginBottom:6,textTransform:"uppercase"}}>Total Hours</div>
                <div style={{fontSize:24,fontWeight:700,color:"#333"}}>{totalHours.toFixed(1)}</div>
              </div>
              <div style={{background:"#fff",borderRadius:8,border:"1px solid #e0e0e0",padding:20,textAlign:"center"}}>
                <div style={{fontSize:12,color:"#888",marginBottom:6,textTransform:"uppercase"}}>Total Billed</div>
                <div style={{fontSize:24,fontWeight:700,color:"#333"}}>{fmtDec(totalBilledCalc)}</div>
              </div>
              <div style={{background:"#fff",borderRadius:8,border:"1px solid #e0e0e0",padding:20,textAlign:"center"}}>
                <div style={{fontSize:12,color:"#888",marginBottom:6,textTransform:"uppercase"}}>Outstanding</div>
                <div style={{fontSize:24,fontWeight:700,color:matter.outstandingBalance>0?"#dc3545":"#28a745"}}>{fmtDec(matter.outstandingBalance)}</div>
              </div>
            </div>

            <div style={{background:"#fff",borderRadius:8,border:"1px solid #e0e0e0",padding:20,marginBottom:16}}>
              <h3 style={{fontSize:14,fontWeight:600,marginBottom:12}}>New Time Entry</h3>
              <div style={{display:"flex",gap:10,alignItems:"end"}}>
                <div style={{width:120}}><label style={{display:"block",fontSize:12,color:"#888",marginBottom:4}}>Date</label>
                  <input type="date" value={newTimeDate} onChange={e=>setNewTimeDate(e.target.value)} style={{width:"100%",padding:"8px 10px",borderRadius:6,border:"1px solid #d0d0d0",fontSize:13}}/></div>
                <div style={{flex:1}}><label style={{display:"block",fontSize:12,color:"#888",marginBottom:4}}>Description</label>
                  <input value={newTimeDesc} onChange={e=>setNewTimeDesc(e.target.value)} placeholder="Work description..." style={{width:"100%",padding:"8px 12px",borderRadius:6,border:"1px solid #d0d0d0",fontSize:13,outline:"none"}}/></div>
                <div style={{width:80}}><label style={{display:"block",fontSize:12,color:"#888",marginBottom:4}}>Hours</label>
                  <input type="number" step="0.25" min="0" value={newTimeHours} onChange={e=>setNewTimeHours(e.target.value)} placeholder="0.00" style={{width:"100%",padding:"8px 10px",borderRadius:6,border:"1px solid #d0d0d0",fontSize:13}}/></div>
                <button onClick={addTime} disabled={!newTimeDesc.trim()||!newTimeHours} style={{background:newTimeDesc.trim()&&newTimeHours?"#1a73e8":"#ccc",color:"#fff",border:"none",borderRadius:6,padding:"8px 16px",fontSize:13,cursor:newTimeDesc.trim()&&newTimeHours?"pointer":"default",height:36}}>Add</button>
              </div>
            </div>

            <div style={{background:"#fff",borderRadius:8,border:"1px solid #e0e0e0",overflow:"hidden"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                <thead>
                  <tr style={{background:"#fafafa",borderBottom:"1px solid #e0e0e0"}}>
                    {["Date","Description","Attorney","Hours","Rate","Amount"].map(h=><th key={h} style={{textAlign:["Hours","Rate","Amount"].includes(h)?"right":"left",padding:"10px 14px",color:"#666",fontWeight:600,fontSize:12,textTransform:"uppercase",letterSpacing:0.5}}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {_.orderBy(matter.timeEntries,"date","desc").map(e=>(
                    <tr key={e.id} style={{borderBottom:"1px solid #f5f5f5"}}>
                      <td style={{padding:"10px 14px",color:"#888"}}>{e.date}</td>
                      <td style={{padding:"10px 14px"}}>{e.description}</td>
                      <td style={{padding:"10px 14px",color:"#888"}}>{e.attorney}</td>
                      <td style={{padding:"10px 14px",textAlign:"right",fontWeight:500}}>{e.hours.toFixed(2)}</td>
                      <td style={{padding:"10px 14px",textAlign:"right",color:"#888"}}>{fmtDec(e.rate)}</td>
                      <td style={{padding:"10px 14px",textAlign:"right",fontWeight:600}}>{fmtDec(e.hours*e.rate)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{borderTop:"2px solid #e0e0e0",fontWeight:700}}>
                    <td colSpan={3} style={{padding:"10px 14px"}}>Total</td>
                    <td style={{padding:"10px 14px",textAlign:"right"}}>{totalHours.toFixed(2)}</td>
                    <td style={{padding:"10px 14px"}}></td>
                    <td style={{padding:"10px 14px",textAlign:"right",color:"#28a745"}}>{fmtDec(totalBilledCalc)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* ─── TRANSACTIONS TAB ─── */}
        {tab==="transactions"&&(
          <div style={{background:"#fff",borderRadius:8,border:"1px solid #e0e0e0",padding:40,textAlign:"center",color:"#999"}}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style={{margin:"0 auto 12px"}}><path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <h3 style={{fontSize:15,fontWeight:600,color:"#555",marginBottom:4}}>No Transactions</h3>
            <p style={{fontSize:13}}>No payment transactions recorded for this matter.</p>
          </div>
        )}

      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   MAIN DASHBOARD PAGE
   ════════════════════════════════════════════════════════════════ */
function DashboardPage({matters,setPage,setSelectedMatter}){
  const stats=useMemo(()=>({
    total:matters.length,
    pending:matters.filter(m=>m.status==="Pending").length,
    inProgress:matters.filter(m=>m.status==="In Progress").length,
    submitted:matters.filter(m=>m.status==="Submitted").length,
    closed:matters.filter(m=>m.status==="Closed").length,
    totalOutstanding:matters.reduce((s,m)=>s+m.outstandingBalance,0),
    totalBilled:matters.reduce((s,m)=>s+m.totalBilled,0),
  }),[matters]);

  const upcoming=useMemo(()=>{
    const events=[];
    matters.forEach(m=>{
      (m.calendarEvents||[]).forEach(ev=>events.push({...ev,matterName:`${m.matterNumber}-${m.clientName}`,matterId:m.id}));
      m.tasks.filter(t=>t.status!=="Completed"&&t.due).forEach(t=>events.push({title:t.title,date:t.due,type:"Task",matterName:`${m.matterNumber}-${m.clientName}`,matterId:m.id}));
    });
    return _.orderBy(events,"date","asc").slice(0,8);
  },[matters]);

  return(
    <div style={{padding:"24px 28px",flex:1}}>
      <h1 style={{fontSize:22,fontWeight:700,color:"#333",marginBottom:4}}>Dashboard</h1>
      <p style={{fontSize:13,color:"#888",marginBottom:24}}>Welcome back, Matt. Here's your firm overview.</p>

      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:14,marginBottom:24}}>
        {[
          {label:"Total Matters",value:stats.total,bg:"#e8f4fd",color:"#1a73e8"},
          {label:"Pending",value:stats.pending,bg:"#fef3cd",color:"#856404"},
          {label:"In Progress",value:stats.inProgress,bg:"#cce5ff",color:"#004085"},
          {label:"Submitted",value:stats.submitted,bg:"#e8daef",color:"#6c3483"},
          {label:"Closed",value:stats.closed,bg:"#d4edda",color:"#155724"},
        ].map((s,i)=>(
          <div key={i} style={{background:"#fff",borderRadius:8,border:"1px solid #e0e0e0",padding:"18px 20px"}}>
            <div style={{fontSize:12,color:"#888",marginBottom:6,textTransform:"uppercase",letterSpacing:0.5}}>{s.label}</div>
            <div style={{fontSize:28,fontWeight:700,color:s.color}}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:24}}>
        <div style={{background:"#fff",borderRadius:8,border:"1px solid #e0e0e0",padding:"18px 20px"}}>
          <div style={{fontSize:12,color:"#888",marginBottom:6,textTransform:"uppercase",letterSpacing:0.5}}>Outstanding Balance</div>
          <div style={{fontSize:28,fontWeight:700,color:stats.totalOutstanding>0?"#dc3545":"#28a745"}}>{fmtDec(stats.totalOutstanding)}</div>
        </div>
        <div style={{background:"#fff",borderRadius:8,border:"1px solid #e0e0e0",padding:"18px 20px"}}>
          <div style={{fontSize:12,color:"#888",marginBottom:6,textTransform:"uppercase",letterSpacing:0.5}}>Total Billed</div>
          <div style={{fontSize:28,fontWeight:700,color:"#333"}}>{fmtDec(stats.totalBilled)}</div>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 400px",gap:20}}>
        {/* Recent Matters */}
        <div style={{background:"#fff",borderRadius:8,border:"1px solid #e0e0e0",overflow:"hidden"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 20px",borderBottom:"1px solid #e0e0e0"}}>
            <h2 style={{fontSize:15,fontWeight:600,color:"#333"}}>Recent Matters</h2>
            <button onClick={()=>setPage("matters")} style={{background:"none",border:"none",color:"#1a73e8",fontSize:13,cursor:"pointer",fontWeight:500}}>View all</button>
          </div>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <tbody>
              {_.orderBy(matters,m=>m.filingDate||"9999","desc").slice(0,5).map(m=>(
                <tr key={m.id} onClick={()=>{setSelectedMatter(m.id);setPage("matter-detail");}} style={{borderBottom:"1px solid #f5f5f5",cursor:"pointer"}}
                  onMouseEnter={e=>e.currentTarget.style.background="#f8f9fa"}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <td style={{padding:"12px 20px",fontWeight:500,color:"#1a73e8"}}>{m.matterNumber}-{m.clientName}</td>
                  <td style={{padding:"12px 14px",color:"#666"}}>{m.practiceArea}</td>
                  <td style={{padding:"12px 14px"}}><StatusBadge status={m.status}/></td>
                  <td style={{padding:"12px 14px",color:"#888"}}>{m.filingDate||"Not filed"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Upcoming */}
        <div style={{background:"#fff",borderRadius:8,border:"1px solid #e0e0e0",overflow:"hidden"}}>
          <div style={{padding:"14px 20px",borderBottom:"1px solid #e0e0e0"}}>
            <h2 style={{fontSize:15,fontWeight:600,color:"#333"}}>Upcoming Deadlines & Events</h2>
          </div>
          <div style={{maxHeight:400,overflowY:"auto"}}>
            {upcoming.length===0?
              <div style={{padding:30,textAlign:"center",color:"#999",fontSize:13}}>No upcoming events.</div>:
              upcoming.map((ev,i)=>(
                <div key={i} onClick={()=>{setSelectedMatter(ev.matterId);setPage("matter-detail");}}
                  style={{display:"flex",gap:12,padding:"12px 20px",borderBottom:"1px solid #f5f5f5",cursor:"pointer",alignItems:"center"}}
                  onMouseEnter={e=>e.currentTarget.style.background="#f8f9fa"}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <div style={{width:6,height:6,borderRadius:"50%",background:ev.type==="Hearing"?"#dc3545":ev.type==="Deadline"?"#fd7e14":"#1a73e8",flexShrink:0}}/>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:500,color:"#333"}}>{ev.title}</div>
                    <div style={{fontSize:12,color:"#999"}}>{ev.matterName}</div>
                  </div>
                  <div style={{fontSize:12,color:"#888"}}>{ev.date}</div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   PLACEHOLDER PAGES
   ════════════════════════════════════════════════════════════════ */
function PlaceholderPage({title}){
  return(
    <div style={{padding:"24px 28px",flex:1}}>
      <h1 style={{fontSize:22,fontWeight:700,color:"#333",marginBottom:20}}>{title}</h1>
      <div style={{background:"#fff",borderRadius:8,border:"1px solid #e0e0e0",padding:60,textAlign:"center",color:"#999"}}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style={{margin:"0 auto 12px"}}><circle cx="12" cy="12" r="3" stroke="#ccc" strokeWidth="1.5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round"/></svg>
        <h3 style={{fontSize:15,fontWeight:600,color:"#555",marginBottom:4}}>Coming Soon</h3>
        <p style={{fontSize:13}}>This section is under development.</p>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   APP ROOT
   ════════════════════════════════════════════════════════════════ */
export default function App(){
  const [matters,setMatters]=useLocalMatters();
  const [page,setPage]=useState("dashboard");
  const [selectedMatter,setSelectedMatter]=useState(null);
  const currentMatter=useMemo(()=>matters.find(m=>m.id===selectedMatter),[matters,selectedMatter]);

  return(
    <div style={{fontFamily:"'Inter','Segoe UI',Roboto,sans-serif",background:"#f5f5f5",color:"#333",display:"flex",minHeight:"100vh"}}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
      <Sidebar page={page} setPage={setPage} setSelectedMatter={setSelectedMatter}/>
      <div style={{marginLeft:250,flex:1,display:"flex",flexDirection:"column",minHeight:"100vh"}}>
        {page!=="matter-detail"&&<TopBar setPage={setPage} setSelectedMatter={setSelectedMatter}/>}
        {page==="dashboard"&&<DashboardPage matters={matters} setPage={setPage} setSelectedMatter={setSelectedMatter}/>}
        {page==="matters"&&<MatterList matters={matters} setMatters={setMatters} setPage={setPage} setSelectedMatter={setSelectedMatter}/>}
        {page==="matter-detail"&&<MatterDetail matter={currentMatter} setMatters={setMatters} setPage={setPage} setSelectedMatter={setSelectedMatter}/>}
        {page==="calendar"&&<PlaceholderPage title="Calendar"/>}
        {page==="tasks"&&<PlaceholderPage title="Tasks"/>}
        {page==="contacts"&&<PlaceholderPage title="Contacts"/>}
        {page==="activities"&&<PlaceholderPage title="Activities"/>}
        {page==="billing"&&<PlaceholderPage title="Billing"/>}
      </div>
    </div>
  );
}
