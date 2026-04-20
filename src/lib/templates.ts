export interface ScenarioTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  scenario_family: string;
  scenario_pattern: string;
  scenario_statement: string;
  threat_community: string;
  threat_action: string;
  loss_event_type: string;
  loss_forms: string;
  existing_controls_hint: string;
  tef_low: number;
  tef_ml: number;
  tef_high: number;
  vuln_low: number;
  vuln_ml: number;
  vuln_high: number;
  primary_loss_low: number;
  primary_loss_ml: number;
  primary_loss_high: number;
  secondary_event_prob: number;
  secondary_loss_low: number;
  secondary_loss_ml: number;
  secondary_loss_high: number;
}

export const SCENARIO_TEMPLATES: ScenarioTemplate[] = [
  {
    id: 'tmpl-phishing-admin',
    name: 'Admin Account Takeover via Phishing',
    description: 'External attacker compromises an administrator account through phishing, gaining elevated access to critical systems.',
    category: 'Identity & Access',
    scenario_family: 'Identity compromise',
    scenario_pattern: 'Phishing-driven admin account takeover',
    scenario_statement: 'External attacker uses phishing to compromise an administrator account, enabling unauthorized access to sensitive systems and data.',
    threat_community: 'External attacker',
    threat_action: 'Phishing / credential harvesting',
    loss_event_type: 'Confidentiality loss',
    loss_forms: 'Incident response and investigation cost; Operational backlog and productivity loss; Reputation / brand harm',
    existing_controls_hint: 'MFA, phishing-resistant MFA for admins, email security gateway, anomaly detection, PAM',
    tef_low: 3, tef_ml: 8, tef_high: 20,
    vuln_low: 0.03, vuln_ml: 0.10, vuln_high: 0.25,
    primary_loss_low: 20000, primary_loss_ml: 125000, primary_loss_high: 800000,
    secondary_event_prob: 0.15,
    secondary_loss_low: 0, secondary_loss_ml: 250000, secondary_loss_high: 3000000,
  },
  {
    id: 'tmpl-synthetic-fraud',
    name: 'Synthetic Identity Fraud',
    description: 'Organized fraud ring creates fake identities to obtain loans or accounts that will never be repaid.',
    category: 'Fraud',
    scenario_family: 'Fraud / abuse',
    scenario_pattern: 'Synthetic identity creation for loan fraud',
    scenario_statement: 'Organized fraud ring creates synthetic identities to submit fraudulent applications, resulting in funded accounts that default.',
    threat_community: 'Organized fraud ring',
    threat_action: 'Synthetic identity creation',
    loss_event_type: 'Fraud loss',
    loss_forms: 'Fraud loss / unrecoverable funds; Incident response and investigation cost; Model remediation / re-underwriting cost',
    existing_controls_hint: 'Identity verification (KYC), credit bureau checks, fraud scoring model, velocity rules, manual review queue',
    tef_low: 5, tef_ml: 20, tef_high: 60,
    vuln_low: 0.02, vuln_ml: 0.06, vuln_high: 0.12,
    primary_loss_low: 10000, primary_loss_ml: 40000, primary_loss_high: 100000,
    secondary_event_prob: 0.08,
    secondary_loss_low: 25000, secondary_loss_ml: 150000, secondary_loss_high: 1000000,
  },
  {
    id: 'tmpl-vendor-outage',
    name: 'Critical Vendor Service Outage',
    description: 'A key third-party vendor experiences an extended outage that disrupts your business operations.',
    category: 'Third Party',
    scenario_family: 'Third-party dependency failure',
    scenario_pattern: 'Vendor service outage disrupts business process',
    scenario_statement: 'Critical vendor experiences an extended service outage, disrupting dependent business processes and causing operational backlog.',
    threat_community: 'Vendor / subservice provider',
    threat_action: 'Vendor service outage',
    loss_event_type: 'Availability loss',
    loss_forms: 'Operational backlog and productivity loss; Revenue loss from servicing disruption; Contractual liability / partner indemnification',
    existing_controls_hint: 'Vendor SLA monitoring, business continuity plan, alternative vendor relationships, degraded-mode procedures',
    tef_low: 1, tef_ml: 3, tef_high: 8,
    vuln_low: 0.20, vuln_ml: 0.50, vuln_high: 0.80,
    primary_loss_low: 10000, primary_loss_ml: 75000, primary_loss_high: 400000,
    secondary_event_prob: 0.05,
    secondary_loss_low: 0, secondary_loss_ml: 100000, secondary_loss_high: 500000,
  },
  {
    id: 'tmpl-data-misdelivery',
    name: 'Sensitive Data Sent to Wrong Recipient',
    description: 'An employee accidentally sends sensitive customer data to the wrong person via email or file share.',
    category: 'Data Protection',
    scenario_family: 'Data disclosure',
    scenario_pattern: 'Accidental data disclosure via misdelivery',
    scenario_statement: 'Negligent insider accidentally sends sensitive data to an unauthorized recipient, triggering breach notification obligations.',
    threat_community: 'Negligent insider',
    threat_action: 'Data disclosure / misdelivery',
    loss_event_type: 'Confidentiality loss',
    loss_forms: 'Incident response and investigation cost; Customer reimbursement / restitution; Regulatory response and examination cost',
    existing_controls_hint: 'DLP rules, email encryption, sensitivity labels, outbound content inspection, security awareness training',
    tef_low: 5, tef_ml: 15, tef_high: 40,
    vuln_low: 0.10, vuln_ml: 0.30, vuln_high: 0.60,
    primary_loss_low: 5000, primary_loss_ml: 30000, primary_loss_high: 150000,
    secondary_event_prob: 0.20,
    secondary_loss_low: 10000, secondary_loss_ml: 100000, secondary_loss_high: 750000,
  },
  {
    id: 'tmpl-cloud-misconfig',
    name: 'Cloud Storage Misconfiguration Exposes Data',
    description: 'A cloud storage bucket or database is misconfigured with public access, exposing sensitive data.',
    category: 'Cloud & Infrastructure',
    scenario_family: 'Cloud / platform misconfiguration',
    scenario_pattern: 'Cloud misconfiguration exposes sensitive data',
    scenario_statement: 'Cloud storage is misconfigured with overly permissive access controls, exposing sensitive data to unauthorized parties.',
    threat_community: 'Negligent insider',
    threat_action: 'Misconfiguration',
    loss_event_type: 'Confidentiality loss',
    loss_forms: 'Incident response and investigation cost; Customer reimbursement / restitution; Fines, penalties, and settlements; Reputation / brand harm',
    existing_controls_hint: 'Cloud security posture management (CSPM), infrastructure-as-code reviews, access policy automation, periodic access audits',
    tef_low: 2, tef_ml: 6, tef_high: 15,
    vuln_low: 0.05, vuln_ml: 0.15, vuln_high: 0.35,
    primary_loss_low: 15000, primary_loss_ml: 100000, primary_loss_high: 500000,
    secondary_event_prob: 0.25,
    secondary_loss_low: 50000, secondary_loss_ml: 500000, secondary_loss_high: 5000000,
  },
  {
    id: 'tmpl-access-deprov',
    name: 'Terminated Employee Retains Access',
    description: 'A terminated employee or contractor retains system access due to failed deprovisioning, enabling unauthorized actions.',
    category: 'Identity & Access',
    scenario_family: 'Privileged access misuse',
    scenario_pattern: 'Deprovisioning failure enables unauthorized access',
    scenario_statement: 'Former employee retains system access after termination due to deprovisioning failure, enabling data theft or unauthorized changes.',
    threat_community: 'Malicious insider',
    threat_action: 'Access deprovisioning failure',
    loss_event_type: 'Confidentiality loss',
    loss_forms: 'Incident response and investigation cost; Operational backlog and productivity loss; Reputation / brand harm',
    existing_controls_hint: 'Automated deprovisioning workflows, HR-IT integration, periodic access reviews, activity monitoring for dormant accounts',
    tef_low: 2, tef_ml: 5, tef_high: 12,
    vuln_low: 0.05, vuln_ml: 0.15, vuln_high: 0.30,
    primary_loss_low: 10000, primary_loss_ml: 60000, primary_loss_high: 300000,
    secondary_event_prob: 0.10,
    secondary_loss_low: 0, secondary_loss_ml: 150000, secondary_loss_high: 1000000,
  },
  {
    id: 'tmpl-bad-release',
    name: 'Bad Code Release Causes Outage',
    description: 'A flawed deployment or configuration change causes a production outage affecting customers.',
    category: 'Change Management',
    scenario_family: 'Change / release failure',
    scenario_pattern: 'Insecure or unstable release causes outage',
    scenario_statement: 'A code deployment introduces a defect that causes production outage, disrupting customer-facing services.',
    threat_community: 'Process failure',
    threat_action: 'Insecure change / release',
    loss_event_type: 'Availability loss',
    loss_forms: 'Operational backlog and productivity loss; Revenue loss from origination disruption; Technology restoration / rebuild cost',
    existing_controls_hint: 'CI/CD pipeline gates, automated testing, canary deployments, rollback procedures, change advisory board',
    tef_low: 3, tef_ml: 8, tef_high: 20,
    vuln_low: 0.10, vuln_ml: 0.25, vuln_high: 0.50,
    primary_loss_low: 10000, primary_loss_ml: 50000, primary_loss_high: 250000,
    secondary_event_prob: 0.05,
    secondary_loss_low: 0, secondary_loss_ml: 75000, secondary_loss_high: 500000,
  },
  {
    id: 'tmpl-regulatory-miss',
    name: 'Missed Regulatory Filing or Notice',
    description: 'A required regulatory filing, disclosure, or customer notice is missed or delivered late.',
    category: 'Compliance',
    scenario_family: 'Regulatory obligation failure',
    scenario_pattern: 'Missed regulatory deadline or notice requirement',
    scenario_statement: 'Internal process failure results in missed regulatory filing or late customer notice, triggering examination or enforcement action.',
    threat_community: 'Process failure',
    threat_action: 'Reporting / filing failure',
    loss_event_type: 'Compliance / obligation failure',
    loss_forms: 'Fines, penalties, and settlements; Regulatory response and examination cost; Operational backlog and productivity loss',
    existing_controls_hint: 'Compliance calendar, automated filing reminders, dual-review of submissions, regulatory change management process',
    tef_low: 1, tef_ml: 3, tef_high: 8,
    vuln_low: 0.10, vuln_ml: 0.25, vuln_high: 0.50,
    primary_loss_low: 20000, primary_loss_ml: 100000, primary_loss_high: 500000,
    secondary_event_prob: 0.30,
    secondary_loss_low: 50000, secondary_loss_ml: 300000, secondary_loss_high: 2000000,
  },
];

export const TEMPLATE_CATEGORIES = [...new Set(SCENARIO_TEMPLATES.map((t) => t.category))];
