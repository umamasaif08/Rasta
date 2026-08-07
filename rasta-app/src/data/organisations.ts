export type OrgCategory = "shelter" | "food" | "clinic" | "legal" | "multi";

export interface Organisation {
  id:          string;
  name:        string;
  tagline:     string;       // short front-face label
  category:    OrgCategory;
  description: string;       // shown on card back
  founded:     string;
  website:     string;
  phone:       string;
  serves:      string[];     // audience tags
  color:       string;       // CSS variable name for accent
  initials:    string;       // 2-letter avatar fallback
}

export const ORGANISATIONS: Organisation[] = [
  {
    id:          "edhi",
    name:        "Edhi Foundation",
    tagline:     "Pakistan's largest welfare org",
    category:    "multi",
    description:
      "Founded by Abdul Sattar Edhi in 1951, the Edhi Foundation operates the world's largest volunteer ambulance network, free shelters, orphanages, maternity homes, and rehabilitation centres. No one is turned away.",
    founded:     "1951",
    website:     "https://edhi.org",
    phone:       "021-111-111-911",
    serves:      ["Men", "Women", "Children", "Elderly"],
    color:       "var(--color-teal)",
    initials:    "EF",
  },
  {
    id:          "saylani",
    name:        "Saylani Welfare International Trust",
    tagline:     "Mass food & skills programmes",
    category:    "food",
    description:
      "Saylani runs one of Karachi's largest free meal programmes, serving thousands of hot meals daily. They also offer vocational training, free medical camps, and interest-free microfinance loans for low-income families.",
    founded:     "1999",
    website:     "https://saylaniwelfare.com",
    phone:       "021-111-729-526",
    serves:      ["Men", "Women", "Children", "Families"],
    color:       "var(--color-terracotta)",
    initials:    "SW",
  },
  {
    id:          "chhipa",
    name:        "Chhipa Welfare Association",
    tagline:     "24-hour emergency & food services",
    category:    "multi",
    description:
      "Chhipa provides 24/7 emergency rescue, ambulance services, free food distribution, women's shelters, and blood bank services. Their helpline operates round the clock and is one of the most recognised emergency numbers in Karachi.",
    founded:     "1981",
    website:     "https://chhipa.org",
    phone:       "021-111-020-020",
    serves:      ["Men", "Women", "Children"],
    color:       "var(--color-sage)",
    initials:    "CW",
  },
  {
    id:          "indus",
    name:        "Indus Hospital & Health Network",
    tagline:     "Completely free tertiary care",
    category:    "clinic",
    description:
      "Indus Hospital provides 100% free healthcare — no charge for any service, ever. From emergency surgery to cancer treatment and dialysis, it serves hundreds of thousands of patients each year across its network of hospitals.",
    founded:     "2005",
    website:     "https://indushospital.org.pk",
    phone:       "021-35110000",
    serves:      ["Men", "Women", "Children", "Elderly"],
    color:       "var(--color-teal)",
    initials:    "IH",
  },
  {
    id:          "aghs",
    name:        "AGHS Legal Aid Cell",
    tagline:     "Free legal help for the marginalised",
    category:    "legal",
    description:
      "AGHS Legal Aid Cell provides free legal representation and consultation for women, minorities, and economically vulnerable citizens. They handle domestic violence, labour disputes, family law, and civil rights cases across Sindh.",
    founded:     "1986",
    website:     "https://aghslegal.org",
    phone:       "021-35831902",
    serves:      ["Women", "Minorities", "Labour workers"],
    color:       "var(--color-sand)",
    initials:    "AG",
  },
  {
    id:          "siut",
    name:        "SIUT — Sindh Institute of Urology",
    tagline:     "Free kidney care for all",
    category:    "clinic",
    description:
      "SIUT is a fully self-funded, free kidney and urology treatment centre. It provides dialysis, kidney transplants, and all urological procedures at no cost. It is one of the largest centres of its kind in Asia.",
    founded:     "1975",
    website:     "https://siut.org",
    phone:       "021-99215740",
    serves:      ["Men", "Women", "Children", "Elderly"],
    color:       "var(--color-terracotta)",
    initials:    "SI",
  },
  {
    id:          "war",
    name:        "War Against Rape (WAR)",
    tagline:     "Crisis & legal support for survivors",
    category:    "legal",
    description:
      "WAR provides free legal representation, police reporting assistance, counselling, and medical referrals for survivors of sexual violence. Their 24-hour helpline is a lifeline for women in crisis across Karachi.",
    founded:     "1990",
    website:     "https://war.org.pk",
    phone:       "0800-70806",
    serves:      ["Women"],
    color:       "var(--color-sage)",
    initials:    "WR",
  },
  {
    id:          "opp",
    name:        "Orangi Pilot Project",
    tagline:     "Community development from the ground up",
    category:    "multi",
    description:
      "OPP is one of the world's most celebrated community development experiments. Starting in Orangi Town, it empowers low-income communities to build their own sanitation, housing, and schools through participatory planning and micro-credit.",
    founded:     "1980",
    website:     "https://oppinstitutions.org",
    phone:       "021-36626484",
    serves:      ["Families", "Communities"],
    color:       "var(--color-teal)",
    initials:    "OP",
  },
];

export const CATEGORY_LABEL: Record<OrgCategory, string> = {
  shelter: "Shelter",
  food:    "Food",
  clinic:  "Clinic",
  legal:   "Legal Aid",
  multi:   "Multiple Services",
};
