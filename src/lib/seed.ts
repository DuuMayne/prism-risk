import { getDb } from './db';

const TAXONOMY = [
  // === Scenario Family (unchanged) ===
  { dimension: 'Scenario Family', code: 'SF01', value: 'Identity compromise', definition: 'Unauthorized acquisition or misuse of identities used to access systems or data', usage_notes: 'Use for portfolio rollups', example: 'Workforce phishing leads to SaaS admin takeover' },
  { dimension: 'Scenario Family', code: 'SF02', value: 'Endpoint compromise', definition: 'Compromise of laptops, workstations, or mobile devices', usage_notes: 'Covers malware, unmanaged devices, local data exposure', example: 'Malware on engineer laptop enables credential theft' },
  { dimension: 'Scenario Family', code: 'SF03', value: 'Cloud / platform misconfiguration', definition: 'Security or resilience loss caused by insecure cloud or SaaS configuration', usage_notes: 'Use when configuration error is primary driver', example: 'Public bucket exposes borrower data' },
  { dimension: 'Scenario Family', code: 'SF04', value: 'Application security failure', definition: 'Software defect or insecure design enables unauthorized action or loss', usage_notes: 'Use for exploitable code, authz failure, injection', example: 'IDOR exposes account data' },
  { dimension: 'Scenario Family', code: 'SF05', value: 'Data disclosure', definition: 'Unauthorized exposure of sensitive or regulated data', usage_notes: 'Can be caused by many vectors; use when disclosure is dominant loss event', example: 'Misrouted file reveals PII' },
  { dimension: 'Scenario Family', code: 'SF06', value: 'Data integrity corruption', definition: 'Unauthorized or erroneous modification of business-critical data', usage_notes: 'Use for fraud, pipeline corruption, model data poisoning', example: 'Underwriting data modified incorrectly' },
  { dimension: 'Scenario Family', code: 'SF07', value: 'Service outage / resilience failure', definition: 'Service degradation or outage affecting critical business processes', usage_notes: 'Covers internal and external outages', example: 'Loan servicing unavailable during payment window' },
  { dimension: 'Scenario Family', code: 'SF08', value: 'Third-party dependency failure', definition: 'External provider failure creates material operational or security loss', usage_notes: 'Use when third party is primary dependency', example: 'Vendor API outage stops verification workflow' },
  { dimension: 'Scenario Family', code: 'SF09', value: 'Fraud / abuse', definition: 'Intentional misuse for financial gain or policy circumvention', usage_notes: 'Include customer, insider, or external abuse', example: 'Synthetic identity abuse increases charge-offs' },
  { dimension: 'Scenario Family', code: 'SF10', value: 'Regulatory obligation failure', definition: 'Failure to meet legal, regulatory, or contractual requirements', usage_notes: 'Use when non-compliance is dominant loss event', example: 'Missed statutory notice requirement' },
  { dimension: 'Scenario Family', code: 'SF11', value: 'Change / release failure', definition: 'Bad change, deployment, or configuration release causes loss', usage_notes: 'Use for SDLC / DevOps induced incidents', example: 'Bad release causes origination outage' },
  { dimension: 'Scenario Family', code: 'SF12', value: 'Privileged access misuse', definition: 'Misuse of elevated permissions by insider or compromised account', usage_notes: 'Separate from general identity compromise when elevation is central', example: 'Admin account disables logging' },
  { dimension: 'Scenario Family', code: 'SF13', value: 'AI / model governance failure', definition: 'Model, feature, or AI governance weakness causes harmful decisioning or compliance issues', usage_notes: 'Use for decision systems and generative AI use cases', example: 'Model drift harms approval fairness' },
  { dimension: 'Scenario Family', code: 'SF14', value: 'Physical / environmental disruption', definition: 'Facility, utility, or environmental event causes service or people disruption', usage_notes: 'Use when non-digital root cause dominates', example: 'Power loss impacts operations' },

  // === Threat Community (updated) ===
  { dimension: 'Threat Community', code: 'TC01', value: 'External attacker', definition: 'Financially or ideologically motivated external actor targeting systems, data, or credentials', usage_notes: 'Use for phishing, intrusion, ransomware, credential theft campaigns', example: 'Credential stuffing attack against customer portal' },
  { dimension: 'Threat Community', code: 'TC02', value: 'Organized fraud ring', definition: 'Coordinated group executing systematic fraud schemes at scale', usage_notes: 'Use when multiple actors work together in a structured operation', example: 'Ring submitting hundreds of synthetic identity applications' },
  { dimension: 'Threat Community', code: 'TC03', value: 'First-party fraud applicant', definition: 'Individual applicant misrepresenting their own information for financial gain', usage_notes: 'Use for income inflation, straw borrowers, bust-out schemes', example: 'Applicant inflates income to qualify for larger loan' },
  { dimension: 'Threat Community', code: 'TC04', value: 'Account takeover', definition: 'External actor who gains unauthorized control of a legitimate customer or employee account', usage_notes: 'Use when compromised account is the primary attack vector, not the end goal', example: 'Stolen credentials used to redirect payment disbursement' },
  { dimension: 'Threat Community', code: 'TC05', value: 'Malicious insider', definition: 'Employee or contractor acting with harmful intent to steal data, commit fraud, or cause damage', usage_notes: 'Use when intent is deliberate; separate from negligent insider', example: 'Employee exports borrower data before resignation' },
  { dimension: 'Threat Community', code: 'TC06', value: 'Negligent insider', definition: 'Employee or contractor who unintentionally causes loss through error, ignorance, or carelessness', usage_notes: 'Use for misconfigurations, misrouted data, skipped procedures', example: 'Analyst sends unencrypted PII to wrong recipient' },
  { dimension: 'Threat Community', code: 'TC07', value: 'Privileged administrator', definition: 'User with elevated system permissions whose actions (intentional or accidental) create outsized impact', usage_notes: 'Use when administrative privilege amplifies the consequence of the action', example: 'DBA accidentally drops production table during maintenance' },
  { dimension: 'Threat Community', code: 'TC08', value: 'Vendor / subservice provider', definition: 'Third-party service provider whose failure, breach, or error directly impacts operations', usage_notes: 'Use when vendor action or inaction is the primary cause of loss', example: 'KYC vendor breach exposes applicant documents' },
  { dimension: 'Threat Community', code: 'TC09', value: 'Cloud platform dependency', definition: 'Major cloud infrastructure provider (AWS, GCP, Azure) whose outage or misconfiguration causes cascading impact', usage_notes: 'Use when the root cause is platform-level, not tenant configuration', example: 'AWS regional outage takes down loan origination system' },
  { dimension: 'Threat Community', code: 'TC10', value: 'Payment / banking partner', definition: 'Bank, payment processor, or financial network partner whose failure disrupts money movement', usage_notes: 'Use for ACH failures, wire processing errors, bank connectivity issues', example: 'ACH processor outage delays disbursements for 48 hours' },
  { dimension: 'Threat Community', code: 'TC11', value: 'Customer / borrower', definition: 'End customer or borrower whose actions (intentional or inadvertent) create operational or financial loss', usage_notes: 'Use for dispute abuse, payment fraud, or customer-driven data loss scenarios', example: 'Borrower disputes legitimate ACH debit causing chargeback cascade' },
  { dimension: 'Threat Community', code: 'TC12', value: 'Process failure', definition: 'Breakdown in defined business processes, procedures, or human workflows without a specific threat actor', usage_notes: 'Use when no individual is at fault; the process design or execution failed', example: 'Reconciliation step skipped due to ambiguous runbook' },
  { dimension: 'Threat Community', code: 'TC13', value: 'System failure', definition: 'Hardware, software, or infrastructure fault that causes loss without human action as a trigger', usage_notes: 'Use for hardware failures, software bugs, capacity exhaustion, data corruption', example: 'Database replication lag causes stale data in servicing decisions' },

  // === Threat Action (updated) ===
  { dimension: 'Threat Action', code: 'TA01', value: 'Phishing / credential harvesting', definition: 'Social engineering or technical attack to steal authentication credentials', usage_notes: 'Includes email phishing, SMS, voice, adversary-in-the-middle proxy attacks', example: 'Targeted phishing email with fake SSO login page' },
  { dimension: 'Threat Action', code: 'TA02', value: 'Account takeover', definition: 'Unauthorized access to and control of a legitimate user account', usage_notes: 'Use as the action when credential compromise leads to account control', example: 'Attacker uses leaked credentials to access servicing admin panel' },
  { dimension: 'Threat Action', code: 'TA03', value: 'Privilege misuse', definition: 'Use of legitimately granted elevated permissions for unauthorized purposes', usage_notes: 'Covers both intentional abuse and accidental over-reach of privilege', example: 'Admin queries production PII outside of job function' },
  { dimension: 'Threat Action', code: 'TA04', value: 'Misconfiguration', definition: 'Incorrect system, service, or security settings that create vulnerability or cause outage', usage_notes: 'Use for cloud IAM, network rules, application settings, CI/CD pipeline errors', example: 'S3 bucket policy set to public during migration' },
  { dimension: 'Threat Action', code: 'TA05', value: 'Insecure change / release', definition: 'Deployment of code or configuration that introduces vulnerability, instability, or data loss', usage_notes: 'Use when the change management or release process is the primary driver', example: 'Feature flag misconfiguration exposes beta endpoint to production traffic' },
  { dimension: 'Threat Action', code: 'TA06', value: 'Data exfiltration', definition: 'Unauthorized extraction or transfer of sensitive data outside of approved boundaries', usage_notes: 'Use when data leaves the environment, not just unauthorized viewing', example: 'Malware exfiltrates borrower SSNs to external C2 server' },
  { dimension: 'Threat Action', code: 'TA07', value: 'Data disclosure / misdelivery', definition: 'Unintentional exposure of data to unauthorized recipients through misdirection or access control failure', usage_notes: 'Use for email to wrong recipient, shared link exposure, report leaks', example: 'Loan file emailed to wrong broker due to autofill error' },
  { dimension: 'Threat Action', code: 'TA08', value: 'Vendor service outage', definition: 'External vendor or SaaS provider experiences downtime that disrupts dependent business processes', usage_notes: 'Use when the action is the outage itself, not a security breach at the vendor', example: 'Credit bureau API returns errors for 4 hours during peak origination' },
  { dimension: 'Threat Action', code: 'TA09', value: 'Dependency failure', definition: 'Failure of a shared internal service, infrastructure component, or integration that others rely on', usage_notes: 'Use for internal platform failures, shared service outages, integration breakdowns', example: 'Internal event bus failure stops loan status updates across systems' },
  { dimension: 'Threat Action', code: 'TA10', value: 'Reporting / filing failure', definition: 'Failure to submit required regulatory reports, disclosures, or notices within mandated timelines', usage_notes: 'Use for missed filing deadlines, incorrect report content, late customer notices', example: 'State licensing renewal filed 3 days late due to workflow gap' },
  { dimension: 'Threat Action', code: 'TA11', value: 'Access provisioning failure', definition: 'Granting of excessive, incorrect, or unauthorized access during onboarding or role changes', usage_notes: 'Use when over-provisioning or incorrect access creates the risk condition', example: 'New hire granted production database write access by default' },
  { dimension: 'Threat Action', code: 'TA12', value: 'Access deprovisioning failure', definition: 'Failure to revoke access upon termination, role change, or vendor offboarding', usage_notes: 'Use for orphan accounts, stale credentials, lingering vendor access', example: 'Terminated contractor retains VPN access for 60 days' },
  { dimension: 'Threat Action', code: 'TA13', value: 'Backup / recovery failure', definition: 'Inability to restore systems or data from backup when needed due to failed backups, corruption, or untested procedures', usage_notes: 'Use when the recovery process itself is the failure point', example: 'Backup restoration fails due to untested encryption key rotation' },
  { dimension: 'Threat Action', code: 'TA14', value: 'Fraudulent application submission', definition: 'Submission of a loan or account application containing materially false information', usage_notes: 'Use as the action in origination fraud scenarios; pair with appropriate threat community', example: 'Application submitted with fabricated employment verification letter' },
  { dimension: 'Threat Action', code: 'TA15', value: 'Synthetic identity creation', definition: 'Construction of a fictitious identity using a combination of real and fabricated identity elements', usage_notes: 'Use for fraud rings building credit profiles over time before bust-out', example: 'CPN paired with real SSN fragment to build 18-month credit history' },
  { dimension: 'Threat Action', code: 'TA16', value: 'Income / employment misrepresentation', definition: 'Falsification of income, employment status, or financial position in loan applications', usage_notes: 'Use for stated income fraud, fake pay stubs, inflated bank statements', example: 'Applicant submits doctored bank statements showing 3x actual income' },
  { dimension: 'Threat Action', code: 'TA17', value: 'Document forgery / verification evasion', definition: 'Creation or modification of documents to pass identity, income, or asset verification controls', usage_notes: 'Use when document fraud is the primary method of bypassing controls', example: 'Forged utility bill used to satisfy address verification requirement' },
  { dimension: 'Threat Action', code: 'TA18', value: 'Payment diversion', definition: 'Redirecting loan disbursements, customer payments, or internal transfers to unauthorized accounts', usage_notes: 'Use for BEC, ACH redirect fraud, and disbursement manipulation', example: 'BEC attack changes wire instructions for closing funds' },

  // === Loss Event Family (updated - 2 new entries) ===
  { dimension: 'Loss Event Family', code: 'LE01', value: 'Confidentiality loss', definition: 'Unauthorized disclosure or access to protected information', usage_notes: 'Map to privacy, contractual, and trust impacts', example: 'PII exposed' },
  { dimension: 'Loss Event Family', code: 'LE02', value: 'Integrity loss', definition: 'Unauthorized or erroneous alteration of data, code, or decisions', usage_notes: 'Map to decision quality and financial downstream effects', example: 'Incorrect loan status data' },
  { dimension: 'Loss Event Family', code: 'LE03', value: 'Availability loss', definition: 'Service or process unavailable or materially degraded', usage_notes: 'Map to downtime and operational disruption', example: 'Origination service outage' },
  { dimension: 'Loss Event Family', code: 'LE04', value: 'Fraud loss', definition: 'Direct financial loss from deception or abuse', usage_notes: 'Map to charge-offs, reimbursement, collections cost', example: 'Identity fraud' },
  { dimension: 'Loss Event Family', code: 'LE05', value: 'Compliance / obligation failure', definition: 'Failure to meet legal, regulatory, or contractual obligations', usage_notes: 'Map to notices, fines, remediation, monitorship', example: 'Missed notice deadline' },
  { dimension: 'Loss Event Family', code: 'LE06', value: 'Third-party / dependency failure', definition: 'Loss event driven by the failure of an external provider or critical dependency', usage_notes: 'Use when loss stems from vendor/partner inability to perform, not internal failure', example: 'Payment processor outage prevents disbursements' },
  { dimension: 'Loss Event Family', code: 'LE07', value: 'Operational process failure', definition: 'Loss event caused by breakdown in internal business processes without external threat actor involvement', usage_notes: 'Use when the root cause is procedural or workflow-based rather than technical or adversarial', example: 'Manual reconciliation error causes duplicate payments' },

  // === Loss Forms (updated - 12 entries) ===
  { dimension: 'Loss Form', code: 'LF01', value: 'Technology restoration / rebuild cost', definition: 'Cost to restore, rebuild, or replace compromised or failed technology systems', usage_notes: 'Includes infrastructure rebuild, data restoration, system re-deployment, emergency vendor support', example: 'Emergency rebuild of compromised servicing environment' },
  { dimension: 'Loss Form', code: 'LF02', value: 'Model remediation / re-underwriting cost', definition: 'Cost to remediate flawed models, re-underwrite affected loans, or correct decisioning errors', usage_notes: 'Use for model revalidation, portfolio re-scoring, manual re-review of affected decisions', example: 'Re-underwriting 2,000 loans after model drift discovered' },
  { dimension: 'Loss Form', code: 'LF03', value: 'Contractual liability / partner indemnification', definition: 'Financial obligation arising from breach of contract, SLA failure, or partner indemnification clauses', usage_notes: 'Use for warehouse facility breaches, investor putback risk, partner SLA penalties', example: 'Investor putback demand due to rep and warranty breach' },
  { dimension: 'Loss Form', code: 'LF04', value: 'Reputation / brand harm', definition: 'Downstream business impact from trust erosion with customers, partners, investors, or regulators', usage_notes: 'Use only when decision-relevant and evidence-based; avoid speculative reputational claims', example: 'Partner refuses renewal after publicized data breach' },
  { dimension: 'Loss Form', code: 'LF05', value: 'Incident response and investigation cost', definition: 'Cost of detection, containment, forensics, legal counsel, and breach notification', usage_notes: 'Includes internal labor diversion, external IR firm, forensic analysis, legal guidance', example: 'Engaging external IR firm and breach counsel after credential compromise' },
  { dimension: 'Loss Form', code: 'LF06', value: 'Customer reimbursement / restitution', definition: 'Direct payments to customers for losses, errors, or harm caused by the event', usage_notes: 'Includes refunds, credit monitoring, fee reversals, goodwill payments', example: 'Providing 2 years credit monitoring to 50K affected borrowers' },
  { dimension: 'Loss Form', code: 'LF07', value: 'Fines, penalties, and settlements', definition: 'Regulatory fines, civil penalties, class action settlements, or consent order costs', usage_notes: 'Use for enforcement actions, AG settlements, CFPB penalties', example: 'State AG settlement for notice timing violations' },
  { dimension: 'Loss Form', code: 'LF08', value: 'Regulatory response and examination cost', definition: 'Cost of responding to regulatory inquiries, examinations, or consent orders triggered by the event', usage_notes: 'Includes document production, outside counsel for exam support, remediation plan development', example: 'Six-month enhanced examination following data breach notification' },
  { dimension: 'Loss Form', code: 'LF09', value: 'Operational backlog and productivity loss', definition: 'Internal labor cost and business disruption from diverted staff, manual workarounds, and delayed processing', usage_notes: 'Use for quantifying the internal friction and throughput loss during and after an event', example: 'Operations team working overtime for 3 weeks to clear backlog after system outage' },
  { dimension: 'Loss Form', code: 'LF10', value: 'Revenue loss from servicing disruption', definition: 'Lost fee income, late payment revenue, or servicing transfer penalties from service interruption', usage_notes: 'Use when servicing operations are disrupted, causing missed collections or fee loss', example: 'Missed autopay processing window causes 5-day revenue delay' },
  { dimension: 'Loss Form', code: 'LF11', value: 'Revenue loss from origination disruption', definition: 'Lost loan volume, rate lock expirations, or pipeline fallout from origination system downtime', usage_notes: 'Use when origination or application processing is interrupted', example: 'Two-day origination outage causes $15M pipeline fallout' },
  { dimension: 'Loss Form', code: 'LF12', value: 'Fraud loss / unrecoverable funds', definition: 'Direct financial loss from fraud that cannot be recovered through collections or insurance', usage_notes: 'Use for net charge-offs, unrecoverable disbursements, and write-downs', example: 'Synthetic identity ring causes $2M in charge-offs before detection' },

  // === Control Type (unchanged) ===
  { dimension: 'Control Type', code: 'CT01', value: 'Preventive', definition: 'Reduces event occurrence or successful compromise rate', usage_notes: 'Example: MFA, secure defaults', example: 'MFA' },
  { dimension: 'Control Type', code: 'CT02', value: 'Detective', definition: 'Improves discovery and reduces dwell time', usage_notes: 'Example: logging, alerting', example: 'SIEM detection' },
  { dimension: 'Control Type', code: 'CT03', value: 'Corrective', definition: 'Restores secure or normal state after event', usage_notes: 'Example: patching, account disablement', example: 'Credential reset playbook' },
  { dimension: 'Control Type', code: 'CT04', value: 'Resilience / recovery', definition: 'Reduces outage duration or magnitude', usage_notes: 'Example: DR, failover, backups', example: 'Regional failover' },
  { dimension: 'Control Type', code: 'CT05', value: 'Governance / assurance', definition: 'Improves process quality and oversight', usage_notes: 'Example: reviews, attestations, standards', example: 'Quarterly access review' },
];

const SEED_SCENARIO = {
  id: 'SCN-0001',
  scenario_family: 'Identity compromise',
  scenario_title: '[EXAMPLE] Workforce IdP admin account takeover',
  scenario_pattern: 'Phishing-driven workforce admin account takeover',
  scenario_statement: 'External criminal uses social engineering to compromise a workforce identity provider administrator account, enabling unauthorized access to borrower servicing data and elevated system control.',
  threat_community: 'External attacker',
  threat_action: 'Phishing / credential harvesting',
  loss_event_type: 'Confidentiality loss',
  affected_asset_or_service: 'Identity provider and servicing admin consoles',
  business_process: 'Loan Servicing',
  loss_forms: 'Incident response and investigation cost; Reputation / brand harm; Operational backlog and productivity loss; Revenue loss from servicing disruption; Fraud loss / unrecoverable funds',
  existing_controls: 'SSO, MFA, phishing-resistant MFA for admins, anomaly detection, PAM, centralized logging',
  control_gaps_or_assumptions: 'Assumes one privileged admin is successfully phished and persistence is limited to less than 24 hours before containment.',
  data_quality: 'Low',
  input_sources: 'Internal incident trends, phishing exercise results, IAM control assessment, SME judgment',
  owner: 'John Cyberman',
  treatment_status: 'Assessing',
  time_horizon_months: 12,
  tef_low: 2, tef_ml: 6, tef_high: 18,
  vuln_low: 0.05, vuln_ml: 0.15, vuln_high: 0.35,
  primary_loss_low: 25000, primary_loss_ml: 150000, primary_loss_high: 1200000,
  secondary_event_prob: 0.20,
  secondary_loss_low: 0, secondary_loss_ml: 300000, secondary_loss_high: 5000000,
  quant_readiness: 'Seeded',
  review_cadence: 'Quarterly',
};

export function seedDatabase() {
  const db = getDb();

  const taxCount = db.prepare('SELECT COUNT(*) as count FROM taxonomy').get() as { count: number };
  if (taxCount.count === 0) {
    const insert = db.prepare(
      'INSERT INTO taxonomy (dimension, code, value, definition, usage_notes, example) VALUES (?, ?, ?, ?, ?, ?)'
    );
    const tx = db.transaction(() => {
      for (const t of TAXONOMY) {
        insert.run(t.dimension, t.code, t.value, t.definition || null, t.usage_notes || null, t.example || null);
      }
    });
    tx();
  }

  const scnCount = db.prepare('SELECT COUNT(*) as count FROM scenarios').get() as { count: number };
  if (scnCount.count === 0) {
    const s = SEED_SCENARIO;
    const aleLow = (s.tef_low * s.vuln_low) * (s.primary_loss_low + s.secondary_event_prob * s.secondary_loss_low);
    const aleMl = (s.tef_ml * s.vuln_ml) * (s.primary_loss_ml + s.secondary_event_prob * s.secondary_loss_ml);
    const aleHigh = (s.tef_high * s.vuln_high) * (s.primary_loss_high + s.secondary_event_prob * s.secondary_loss_high);

    db.prepare(`INSERT INTO scenarios (
      id, scenario_family, scenario_title, scenario_pattern, scenario_statement,
      threat_community, threat_action, loss_event_type, affected_asset_or_service,
      business_process, loss_forms, existing_controls, control_gaps_or_assumptions,
      data_quality, input_sources, owner, treatment_status, time_horizon_months,
      tef_low, tef_ml, tef_high, vuln_low, vuln_ml, vuln_high,
      primary_loss_low, primary_loss_ml, primary_loss_high,
      secondary_event_prob, secondary_loss_low, secondary_loss_ml, secondary_loss_high,
      ale_low_bound, ale_ml_bound, ale_high_bound, quant_readiness, review_cadence
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )`).run(
      s.id, s.scenario_family, s.scenario_title, s.scenario_pattern, s.scenario_statement,
      s.threat_community, s.threat_action, s.loss_event_type, s.affected_asset_or_service,
      s.business_process, s.loss_forms, s.existing_controls, s.control_gaps_or_assumptions,
      s.data_quality, s.input_sources, s.owner, s.treatment_status, s.time_horizon_months,
      s.tef_low, s.tef_ml, s.tef_high, s.vuln_low, s.vuln_ml, s.vuln_high,
      s.primary_loss_low, s.primary_loss_ml, s.primary_loss_high,
      s.secondary_event_prob, s.secondary_loss_low, s.secondary_loss_ml, s.secondary_loss_high,
      aleLow, aleMl, aleHigh, s.quant_readiness, s.review_cadence
    );
  }
}
