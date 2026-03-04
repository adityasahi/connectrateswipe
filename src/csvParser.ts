export interface ParseResult {
  rows?: Record<string, string>[];
  error?: string;
}

// Maps every known column variation → canonical name the app uses
const ALIASES: Record<string, string> = {
  // Name
  first_name: "First Name", firstname: "First Name",
  last_name:  "Last Name",  lastname:  "Last Name",
  // Title
  "job title": "Title",
  // Company
  "company name": "Company", company_name: "Company",
  // LinkedIn
  "contact li profile url": "LinkedIn",
  "li profile url": "LinkedIn",
  linkedin_url: "LinkedIn",
  linkedin: "LinkedIn",
  "linkedin url": "LinkedIn",
  // Email
  "email 1": "Email",
  email_1: "Email",
  email: "Email",
  "email address": "Email",
  // Phone
  "contact phone 1": "Phone",
  contact_phone_1: "Phone",
  phone: "Phone",
  "phone 1": "Phone",
  "phone number": "Phone",
};

export function parseCSV(text: string): ParseResult {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return { error: "CSV must have a header row and at least one data row." };

  const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
  const mapped: Record<string, string> = {};
  for (const h of headers) mapped[h] = ALIASES[h.toLowerCase()] || h;

  const rows = lines.slice(1).filter(l => l.trim()).map(line => {
    const vals: string[] = [];
    let cur = "", inQ = false;
    for (const ch of line) {
      if (ch === '"') { inQ = !inQ; }
      else if (ch === ',' && !inQ) { vals.push(cur.trim()); cur = ""; }
      else cur += ch;
    }
    vals.push(cur.trim());
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[mapped[h] || h] = vals[i] || ""; });
    return obj;
  });

  const required = ["First Name", "Last Name", "Title", "Company"];
  const missing  = rows[0] ? required.filter(r => !(r in rows[0])) : required;
  if (missing.length) return {
    error: `Missing columns: ${missing.join(", ")}. Found: ${Object.values(mapped).join(", ")}`
  };

  return { rows };
}
