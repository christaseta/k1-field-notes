export type Sentiment = "pos" | "neu" | "neg";

export type Week = { id: string; label: string; dates: string; theme: string };
export type Question = {
  id: string;
  kind: "MC" | "TAGS" | "SHORT" | "LONG" | "PHOTO";
  label: string;
  options?: string[];
};
export type Participant = {
  id: string;
  initials: string;
  name: string;
  role: string;
  biz: string;
  region: string;
  tenure: string;
};
export type Quote = {
  pid: string;
  wid: string;
  qid: string;
  sentiment: Sentiment;
  text: string;
  flagged: boolean;
  media: boolean;
};

export const STUDY = {
  name: "K1 Alpha Program",
  product: "Square Dashboard",
  weeks: 5,
  participants: 19,
  entries: 412,
  responseRate: 0.87,
  flagged: 23,
  withMedia: 89,
};

export const WEEKS: Week[] = [
  { id: "W1", label: "Week 1", dates: "Apr 6–12", theme: "Onboarding & first impressions" },
  { id: "W2", label: "Week 2", dates: "Apr 13–19", theme: "Daily operations" },
  { id: "W3", label: "Week 3", dates: "Apr 20–26", theme: "Pain points & workarounds" },
  { id: "W4", label: "Week 4", dates: "Apr 27–May 3", theme: "Wishlist & feature asks" },
  { id: "W5", label: "Week 5", dates: "May 4–10", theme: "Wrap-up reflections" },
];

export const QUESTIONS: Question[] = [
  {
    id: "Q1",
    kind: "MC",
    label: "How often did you open Dashboard this week?",
    options: ["Daily", "A few times", "Once", "Not at all"],
  },
  {
    id: "Q2",
    kind: "TAGS",
    label: "Which surfaces did you use?",
    options: ["Sales", "Reports", "Items", "Customers", "Payouts", "Team", "Online", "Marketing"],
  },
  { id: "Q3", kind: "SHORT", label: "Quickest win this week?" },
  { id: "Q4", kind: "LONG", label: "Tell us about a frustration." },
  { id: "Q5", kind: "PHOTO", label: "Show us your workspace or a screenshot." },
];

export const PARTICIPANTS: Participant[] = [
  { id: "P01", initials: "AM", name: "Aisha M.", role: "Owner", biz: "Café · 1 loc", region: "SF", tenure: "3 yr" },
  { id: "P02", initials: "BT", name: "Brian T.", role: "GM", biz: "Apparel · 3 loc", region: "NYC", tenure: "5 yr" },
  { id: "P03", initials: "CV", name: "Carla V.", role: "Owner", biz: "Salon · 1 loc", region: "LA", tenure: "1 yr" },
  { id: "P04", initials: "DJ", name: "Dre J.", role: "Owner", biz: "Food truck", region: "ATL", tenure: "2 yr" },
  { id: "P05", initials: "EP", name: "Esme P.", role: "Bookkeeper", biz: "Auto shop", region: "CHI", tenure: "4 yr" },
  { id: "P06", initials: "FK", name: "Farah K.", role: "Owner", biz: "Yoga studio", region: "AUS", tenure: "2 yr" },
  { id: "P07", initials: "GR", name: "Gabe R.", role: "Owner", biz: "Bakery · 2 loc", region: "PDX", tenure: "6 yr" },
  { id: "P08", initials: "HL", name: "Hana L.", role: "Manager", biz: "Boutique", region: "SEA", tenure: "1 yr" },
  { id: "P09", initials: "IO", name: "Idris O.", role: "Owner", biz: "Barbershop", region: "DET", tenure: "8 yr" },
  { id: "P10", initials: "JS", name: "Jamie S.", role: "Owner", biz: "Florist", region: "DEN", tenure: "2 yr" },
  { id: "P11", initials: "KC", name: "Kira C.", role: "Owner", biz: "Restaurant · 2 loc", region: "MIA", tenure: "4 yr" },
  { id: "P12", initials: "LH", name: "Leo H.", role: "Owner", biz: "Bike repair", region: "MSP", tenure: "3 yr" },
  { id: "P13", initials: "MD", name: "Maya D.", role: "Owner", biz: "Pet supplies", region: "PHX", tenure: "1 yr" },
  { id: "P14", initials: "NA", name: "Noor A.", role: "Owner", biz: "Coffee · 2 loc", region: "BOS", tenure: "5 yr" },
  { id: "P15", initials: "OB", name: "Omar B.", role: "GM", biz: "Brewery", region: "SD", tenure: "3 yr" },
  { id: "P16", initials: "PT", name: "Priya T.", role: "Owner", biz: "Tutoring", region: "NSH", tenure: "2 yr" },
  { id: "P17", initials: "QM", name: "Quinn M.", role: "Owner", biz: "Vinyl shop", region: "PHL", tenure: "1 yr" },
  { id: "P18", initials: "RS", name: "Rosa S.", role: "Owner", biz: "Tamale stand", region: "LA", tenure: "2 yr" },
  { id: "P19", initials: "SN", name: "Sami N.", role: "Owner", biz: "Tattoo studio", region: "AUS", tenure: "4 yr" },
];

export const SAMPLE_QUOTES: Quote[] = [
  { pid: "P01", wid: "W1", qid: "Q4", sentiment: "neu", text: "Setup was fine but I kept hitting the same nav twice — couldn't tell which 'Reports' I wanted.", flagged: true, media: false },
  { pid: "P02", wid: "W1", qid: "Q3", sentiment: "pos", text: "Bulk-applied a discount to 14 SKUs in under a minute. Saved me my whole morning.", flagged: false, media: false },
  { pid: "P03", wid: "W2", qid: "Q4", sentiment: "neg", text: "Tip-out screen still doesn't match what my staff actually see on the iPad. Manual reconciliation again.", flagged: true, media: true },
  { pid: "P04", wid: "W2", qid: "Q3", sentiment: "pos", text: "Mobile payouts saved my Sunday. I was at a festival and just checked it on my phone between rushes.", flagged: false, media: false },
  { pid: "P05", wid: "W3", qid: "Q4", sentiment: "neg", text: "Exporting the weekly summary for our accountant: still a 6-click thing. I wrote a sticky note.", flagged: true, media: true },
  { pid: "P06", wid: "W3", qid: "Q3", sentiment: "pos", text: "Auto-categorization on the new sale tags — actually got it right on yoga packs vs. drop-ins.", flagged: false, media: false },
  { pid: "P07", wid: "W3", qid: "Q4", sentiment: "neu", text: "I want to be able to compare two weeks side by side without going to a spreadsheet.", flagged: true, media: false },
  { pid: "P08", wid: "W4", qid: "Q3", sentiment: "pos", text: "Found the inventory low-stock alert by accident. Now I check it every morning with coffee.", flagged: false, media: true },
  { pid: "P09", wid: "W4", qid: "Q4", sentiment: "neg", text: "Search is okay until I search a customer name with an apostrophe. Then it returns nothing.", flagged: true, media: false },
  { pid: "P10", wid: "W4", qid: "Q3", sentiment: "neu", text: "I like that the bell notification icon stops dancing once I've opened it. Small thing.", flagged: false, media: false },
  { pid: "P11", wid: "W5", qid: "Q4", sentiment: "neg", text: "Five weeks in and I still don't know what 'Net new customers' counts. Repeat? Walk-ins? Email opt-in?", flagged: true, media: false },
  { pid: "P12", wid: "W5", qid: "Q3", sentiment: "pos", text: "Print receipt re-templating. Took me 3 minutes, now the bottom says my actual hours.", flagged: false, media: true },
  { pid: "P13", wid: "W2", qid: "Q3", sentiment: "neu", text: "Honestly nothing exciting. It worked. That is the win.", flagged: false, media: false },
  { pid: "P14", wid: "W3", qid: "Q4", sentiment: "neg", text: "Two stores, two payouts schedules. Switching between them is one too many clicks.", flagged: true, media: false },
  { pid: "P15", wid: "W1", qid: "Q4", sentiment: "neu", text: "Onboarding called my brewery a 'restaurant.' I get why but it nudged me toward the wrong setup.", flagged: false, media: false },
  { pid: "P16", wid: "W4", qid: "Q3", sentiment: "pos", text: "Booked five sessions in a row from the calendar drag-handle. Felt like a real tool.", flagged: false, media: false },
  { pid: "P17", wid: "W5", qid: "Q3", sentiment: "pos", text: "Reordering item categories with the grip handle. Finally.", flagged: false, media: true },
  { pid: "P18", wid: "W2", qid: "Q4", sentiment: "neg", text: "I sell tamales in three sizes. The variant UI assumes I sell a size + a flavor. I don't.", flagged: true, media: true },
  { pid: "P19", wid: "W5", qid: "Q4", sentiment: "neu", text: "I'd love an end-of-week digest in email. I forgot to check 2 of 5 weeks.", flagged: false, media: false },
];

export const TAGS = [
  { label: "navigation", count: 38 },
  { label: "reports & exports", count: 31 },
  { label: "onboarding", count: 27 },
  { label: "multi-location", count: 22 },
  { label: "inventory", count: 19 },
  { label: "payouts", count: 17 },
  { label: "search", count: 14 },
  { label: "notifications", count: 12 },
  { label: "customers", count: 11 },
  { label: "tips & tip-out", count: 9 },
  { label: "mobile", count: 8 },
  { label: "items & variants", count: 7 },
];

export const Q1_DIST: Record<string, Record<string, number>> = {
  W1: { Daily: 11, "A few times": 5, Once: 2, "Not at all": 1 },
  W2: { Daily: 13, "A few times": 4, Once: 2, "Not at all": 0 },
  W3: { Daily: 14, "A few times": 3, Once: 2, "Not at all": 0 },
  W4: { Daily: 12, "A few times": 5, Once: 1, "Not at all": 1 },
  W5: { Daily: 10, "A few times": 6, Once: 2, "Not at all": 1 },
};
