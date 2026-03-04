import { EnrichedContact } from "./types";

const SIZE_MAP: Record<string, string> = {
  Google:"Enterprise", Salesforce:"Enterprise", Adobe:"Enterprise", Slack:"Enterprise",
  DocuSign:"Enterprise", "T-Mobile":"Enterprise", Comcast:"Enterprise", "AT&T":"Enterprise",
  SAP:"Enterprise", Microsoft:"Enterprise", "Cox Communications":"Enterprise",
  Experian:"Enterprise", "Avery Dennison":"Enterprise", NetApp:"Enterprise",
  "Konica Minolta Business Solutions U.s.a. Inc.":"Enterprise",
  Stripe:"Enterprise", Docusign:"Enterprise", Yahoo:"Enterprise",
  Nutanix:"Large", Datadog:"Large", MongoDB:"Large", Elastic:"Large",
  Qualtrics:"Large", Okta:"Large", Snowflake:"Large", Databricks:"Large",
  Twilio:"Large", Zendesk:"Large", Intercom:"Large", Zoom:"Large",
  Marketo:"Large", Mulesoft:"Large", Medallia:"Large", Acquia:"Large",
  "SHI International Corp.":"Large", "Palo Alto Networks":"Large",
  Alteryx:"Large", GitLab:"Large", "New Relic":"Large", Salesloft:"Large",
  PagerDuty:"Large", Fullstory:"Large", ThoughtSpot:"Large", Starburst:"Large",
  Smartsheet:"Large", Zscaler:"Large", Rubrik:"Large", Snyk:"Large",
  "8x8":"Large", "Sprout Social Inc.":"Large", Delinea:"Large",
  "Aveva":"Large", "Niit Technologies Limited":"Large", "Telus Digital":"Large",
  Lumen:"Large", Fortinet:"Large", Equinix:"Enterprise", Procore:"Large",
  Gong:"Mid", Rippling:"Mid", "Apollo.io":"Mid", Outreach:"Mid",
  Drift:"Mid", Amplitude:"Mid", Klaviyo:"Mid", Attentive:"Mid",
  Pendo:"Mid", Greenhouse:"Mid", Lattice:"Mid", ZoomInfo:"Mid",
  "6sense":"Mid", Brex:"Mid", Plaid:"Mid", Gusto:"Mid", Zuora:"Mid",
  Calendly:"Mid", Airtable:"Mid", Zapier:"Mid", Segment:"Mid",
  Gainsight:"Mid", Figma:"Mid", Notion:"Mid", Asana:"Mid", Webflow:"Mid",
  Mailchimp:"Mid", Confluent:"Mid", Mixpanel:"Mid", Crossbeam:"Mid",
  Deel:"Mid", JFrog:"Mid", Miro:"Mid", Marqeta:"Mid", Skillsoft:"Mid",
  Seismic:"Mid", Highspot:"Mid", Clari:"Mid", Sprinklr:"Mid",
  Orum:"Small", "Orum.io":"Small", Chargebee:"Small", "Close.io":"Small",
  Totango:"Small", Workato:"Small", Heap:"Small", Terminus:"Small",
  "Revenue.io":"Small", Front:"Small", Ironclad:"Small", ChurnZero:"Small",
  Carta:"Small", Typeform:"Small", Contentful:"Small", Linear:"Small",
  Loom:"Small", Vercel:"Small", Bombora:"Small", Lever:"Small",
  "Culture Amp":"Small", "Chorus.ai":"Small", "Placer.ai":"Small",
  Haptik:"Small", Teleport:"Small", "Predictable Revenue Inc.":"Small",
  "Prophet Security":"Small", Supio:"Small", ContractPodAi:"Small",
  "1Path":"Small", "Pendo.io":"Small", HiBob:"Small", Astronomer:"Small",
  "Model N":"Small", Zenoti:"Small", Druva:"Small", Mendix:"Small",
  Nexthink:"Small", "Clearwater Analytics":"Small", "Elastic Suite":"Small",
  "Klaar":"Small", "Qualitest":"Small", Nasuni:"Small",
};

const IND_MAP: Record<string, string> = {
  Salesloft:"Sales Tech", Outreach:"Sales Tech", Gong:"Sales Tech",
  "Apollo.io":"Sales Tech", "Chorus.ai":"Sales Tech", Seismic:"Sales Tech",
  Highspot:"Sales Tech", Clari:"Sales Tech", "6sense":"Sales Tech",
  Bombora:"Sales Tech", ZoomInfo:"Sales Tech", "Revenue.io":"Sales Tech",
  "Placer.ai":"Sales Tech", Orum:"Sales Tech", "Orum.io":"Sales Tech",
  "Predictable Revenue Inc.":"Sales Tech", Crossbeam:"Sales Tech",
  Stripe:"Fintech", Brex:"Fintech", Gusto:"Fintech", Carta:"Fintech",
  Plaid:"Fintech", Chargebee:"Fintech", Zuora:"Fintech", Marqeta:"Fintech",
  "Clearwater Analytics":"Fintech",
  Twilio:"Dev Tools", Vercel:"Dev Tools", Confluent:"Dev Tools",
  MongoDB:"Dev Tools", Linear:"Dev Tools", JFrog:"Dev Tools", Mendix:"Dev Tools",
  Mulesoft:"Integration", Zapier:"Automation", Workato:"Integration",
  Databricks:"Data/AI", Snowflake:"Data/AI", Elastic:"Data/AI",
  "Elastic Suite":"Data/AI", Astronomer:"Data/AI", Starburst:"Data/AI",
  Alteryx:"Analytics", Amplitude:"Analytics", Mixpanel:"Analytics",
  Pendo:"Analytics", Heap:"Analytics", "Pendo.io":"Analytics",
  Fullstory:"Analytics", ThoughtSpot:"Analytics",
  HubSpot:"CRM/MarTech", Salesforce:"CRM/MarTech", Marketo:"MarTech",
  Drift:"MarTech", Intercom:"MarTech", Zendesk:"CRM/Support",
  Sprinklr:"MarTech", Klaviyo:"MarTech", Attentive:"MarTech",
  Terminus:"MarTech", "Close.io":"CRM", Segment:"MarTech",
  "Sprout Social Inc.":"MarTech",
  Notion:"Productivity", Airtable:"Productivity", Asana:"Productivity",
  Loom:"Productivity", Calendly:"Productivity", Typeform:"Productivity",
  Webflow:"No-Code", Figma:"Design", Canva:"Design", Smartsheet:"Productivity",
  Miro:"Productivity", Slack:"Productivity",
  Greenhouse:"HR Tech", Lattice:"HR Tech", "Culture Amp":"HR Tech",
  Lever:"HR Tech", Rippling:"HR Tech", Deel:"HR Tech", HiBob:"HR Tech",
  Workday:"HR Tech", Skillsoft:"HR Tech", "Klaar":"HR Tech",
  Gainsight:"CS Tech", ChurnZero:"CS Tech", Totango:"CS Tech",
  Okta:"Security", Zscaler:"Security", Delinea:"Security",
  "Palo Alto Networks":"Security", Rubrik:"Security", Snyk:"DevOps",
  Druva:"Security", Teleport:"Security", "Prophet Security":"Security",
  Datadog:"DevOps", PagerDuty:"DevOps", GitLab:"DevOps", "New Relic":"DevOps",
  Google:"Tech (FAANG)", Microsoft:"Tech (FAANG)", Adobe:"Design/Creative",
  DocuSign:"Legal Tech", Docusign:"Legal Tech", Ironclad:"Legal Tech",
  Supio:"Legal Tech", ContractPodAi:"Legal Tech",
  Zoom:"Video/Collab", Front:"CRM/Support", Contentful:"CMS", Acquia:"CMS",
  Medallia:"CX", SAP:"Enterprise Tech", Experian:"Data/Analytics",
  Nutanix:"Infrastructure", Equinix:"Infrastructure", Nasuni:"Infrastructure",
  "AT&T":"Telco", Comcast:"Telco", "T-Mobile":"Telco",
  "Cox Communications":"Telco", "Telus Digital":"Telco",
  "Aveva":"Industrial Tech", "Niit Technologies Limited":"IT Services",
  "1Path":"IT Services", "SHI International Corp.":"IT Services",
  "Konica Minolta Business Solutions U.s.a. Inc.":"Hardware",
  "Avery Dennison":"Manufacturing", "Qualitest":"QA/Testing",
  "Model N":"RevOps Tech", Nexthink:"IT Ops",
  Zenoti:"Vertical SaaS", Procore:"Vertical SaaS",
  Fortinet:"Security", Yahoo:"Media", Netflix:"Media", Airbnb:"Travel",
  Spotify:"Media", Haptik:"AI/Chatbot", "8x8":"Comms",
};

const DEPT_RULES = [
  { k:["sales","account executive","account manager","sdr","bdr","revenue","cro","closing","enablement","commercial"], d:"Sales" },
  { k:["marketing","demand gen","growth","content","brand","campaign"], d:"Marketing" },
  { k:["product","cto","engineering","software","developer","solutions"], d:"Product/Eng" },
  { k:["finance","cfo","financial","treasury","accounting"], d:"Finance" },
  { k:["operations","revops","salesops","ops","revenue operations"], d:"Operations" },
  { k:["customer success","onboarding","retention","customer experience","cx"], d:"Customer Success" },
  { k:["partnership","alliances","channel","business development"], d:"Partnerships/BD" },
  { k:["people","talent","hr","recruiting","culture"], d:"People/HR" },
];

export function getSeniority(title: string): { l: string; s: number } {
  const tl = title.toLowerCase();
  if (/\b(ceo|cto|cfo|coo|cmo|cro|cso|cpo|chief|president)\b/.test(tl)) return { l:"C-Suite", s:5 };
  if (/\b(evp|svp|vp|vice president|senior vice president|executive vice president)\b/.test(tl)) return { l:"VP", s:4 };
  if (/\b(director|head of|head)\b/.test(tl))               return { l:"Director/Head", s:3 };
  if (/\b(manager|lead|senior|sr\.|principal)\b/.test(tl)) return { l:"Manager / Sr IC", s:2 };
  return { l:"IC / Junior", s:1 };
}

export function getDepartment(title: string): string {
  const tl = title.toLowerCase();
  for (const { k, d } of DEPT_RULES) if (k.some(x => tl.includes(x))) return d;
  return "Other";
}

export function getPersonaTags(sen: string, dept: string, size: string, ind: string): string[] {
  const tags: string[] = [];
  if (sen === "C-Suite")                          tags.push("Executive Sponsor");
  if (["VP","Director/Head"].includes(sen))       tags.push("Decision Maker");
  if (dept === "Sales")                           tags.push("Revenue Leader");
  if (dept === "Operations")                      tags.push("Process Owner");
  if (dept === "Partnerships/BD")                 tags.push("Ecosystem Builder");
  if (dept === "Marketing")                       tags.push("Pipeline Generator");
  if (dept === "Customer Success")                tags.push("Retention Owner");
  if (["Enterprise","Large"].includes(size))      tags.push("Enterprise Account");
  if (size === "Small")                           tags.push("SMB");
  if (["Sales Tech","CRM/MarTech"].includes(ind)) tags.push("Sells to Sales");
  if (ind === "Fintech")                          tags.push("FinServ");
  if (["Data/AI","Analytics"].includes(ind))      tags.push("Data Stack");
  if (ind === "HR Tech")                          tags.push("People-led");
  return (tags.length ? tags : ["General B2B"]).slice(0, 4);
}

export function getICPScore(senS: number, dept: string, size: string, ind: string): number {
  const senW:  Record<number, number> = { 5:30, 4:25, 3:20, 2:12, 1:5 };
  const deptW: Record<string, number> = { Sales:25, Operations:20, "Customer Success":18, "Partnerships/BD":15, Marketing:12, Finance:8, "Product/Eng":8, "People/HR":5, Other:3 };
  const sizeW: Record<string, number> = { Enterprise:20, Large:25, Mid:20, Small:10, Unknown:5 };
  const indW:  Record<string, number> = { "Sales Tech":15, "CRM/MarTech":12, "Data/AI":10, Analytics:10, Fintech:10, "HR Tech":8, "Dev Tools":8 };
  return Math.min((senW[senS]||5)+(deptW[dept]||5)+(sizeW[size]||5)+(indW[ind]||5), 100);
}

export function enrichRow(row: Record<string, string>, index: number): EnrichedContact {
  const fn       = row["First Name"]  || row["first_name"]  || "";
  const ln       = row["Last Name"]   || row["last_name"]   || "";
  const title    = row["Title"]       || row["title"]       || row["Job Title"] || "";
  const co       = row["Company"]     || row["company"]     || row["Company Name"] || "";
  const linkedin = row["LinkedIn"]    || row["Contact LI Profile URL"] || "";
  const email    = row["Email"]       || row["Email 1"]     || "";
  const phone    = row["Phone"]       || row["Contact Phone 1"] || "";

  const { l: sen, s: senS } = getSeniority(title);
  const dept = getDepartment(title);
  const size = SIZE_MAP[co] || "Unknown";
  const ind  = IND_MAP[co]  || "B2B Software";
  const tags = getPersonaTags(sen, dept, size, ind);
  const icp  = getICPScore(senS, dept, size, ind);

  return { id: index + 1, fn, ln, title, co, linkedin, email, phone, sen, senS, dept, size, ind, tags, icp };
}
