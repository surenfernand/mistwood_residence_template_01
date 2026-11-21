/** Country dial codes for contact and booking forms (E.164 prefix without spaces). */

export const DEFAULT_PHONE_DIAL_CODE = "+94";

const RAW_CODES = [
  { name: "Sri Lanka", dial: "+94" },
  { name: "India", dial: "+91" },
  { name: "United Kingdom", dial: "+44" },
  { name: "United States", dial: "+1" },
  { name: "Canada", dial: "+1" },
  { name: "Australia", dial: "+61" },
  { name: "New Zealand", dial: "+64" },
  { name: "Singapore", dial: "+65" },
  { name: "Malaysia", dial: "+60" },
  { name: "United Arab Emirates", dial: "+971" },
  { name: "Saudi Arabia", dial: "+966" },
  { name: "Qatar", dial: "+974" },
  { name: "Kuwait", dial: "+965" },
  { name: "Bahrain", dial: "+973" },
  { name: "Oman", dial: "+968" },
  { name: "Germany", dial: "+49" },
  { name: "France", dial: "+33" },
  { name: "Italy", dial: "+39" },
  { name: "Spain", dial: "+34" },
  { name: "Netherlands", dial: "+31" },
  { name: "Switzerland", dial: "+41" },
  { name: "Sweden", dial: "+46" },
  { name: "Norway", dial: "+47" },
  { name: "Denmark", dial: "+45" },
  { name: "Finland", dial: "+358" },
  { name: "Ireland", dial: "+353" },
  { name: "Belgium", dial: "+32" },
  { name: "Austria", dial: "+43" },
  { name: "Portugal", dial: "+351" },
  { name: "Poland", dial: "+48" },
  { name: "Czech Republic", dial: "+420" },
  { name: "Hungary", dial: "+36" },
  { name: "Russia", dial: "+7" },
  { name: "China", dial: "+86" },
  { name: "Japan", dial: "+81" },
  { name: "South Korea", dial: "+82" },
  { name: "Hong Kong", dial: "+852" },
  { name: "Taiwan", dial: "+886" },
  { name: "Thailand", dial: "+66" },
  { name: "Indonesia", dial: "+62" },
  { name: "Philippines", dial: "+63" },
  { name: "Vietnam", dial: "+84" },
  { name: "Bangladesh", dial: "+880" },
  { name: "Pakistan", dial: "+92" },
  { name: "Nepal", dial: "+977" },
  { name: "Maldives", dial: "+960" },
  { name: "South Africa", dial: "+27" },
  { name: "Kenya", dial: "+254" },
  { name: "Nigeria", dial: "+234" },
  { name: "Egypt", dial: "+20" },
  { name: "Israel", dial: "+972" },
  { name: "Turkey", dial: "+90" },
  { name: "Brazil", dial: "+55" },
  { name: "Argentina", dial: "+54" },
  { name: "Mexico", dial: "+52" },
];

const defaultEntry = RAW_CODES.find((row) => row.dial === DEFAULT_PHONE_DIAL_CODE);
const rest = RAW_CODES.filter((row) => row.dial !== DEFAULT_PHONE_DIAL_CODE).sort((a, b) => a.name.localeCompare(b.name));

export const PHONE_DIAL_CODES = defaultEntry ? [defaultEntry, ...rest] : RAW_CODES;

export function dialCodeLabel(row) {
  return `${row.name} (${row.dial})`;
}