const LIVE_API_URL = 'https://survey-production-7290.up.railway.app/api';
const API_BASE_URL = process.env.SEED_API_URL || LIVE_API_URL;
const TOTAL = Number(process.argv[2] || 1);
const WAIT_MS = Number(process.env.SEED_WAIT_MS || 22000);

const matricYears = ['2022', '2023', '2024', '2025'];
const departmentCodes = ['CSC', 'POS', 'MCB', 'BCH', 'ACC', 'BKF', 'MAC', 'NUR', 'BUS', 'HIR', 'ECO'];

const levels = ['100 Level', '200 Level', '300 Level', '400 Level', '500 Level'];
const genders = ['Male', 'Female'];
const hoursPerDay = ['Less than 1 hour', '1-3 hours', '4-6 hours', '7-9 hours', '10+ hours'];
const primaryUses = [
  'Academic research',
  'Social media',
  'Entertainment (videos, games)',
  'Communication (calls, messages)',
  'Online learning',
  'Banking & Shopping',
  'News'
];
const lectureDistraction = ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'];
const academicPerformance = [
  'Significantly improved',
  'Somewhat improved',
  'No effect',
  'Somewhat decreased',
  'Significantly decreased'
];
const concentration = ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'];
const sleepImpact = [
  'No, I sleep fine',
  'Slightly, I sometimes sleep late',
  'Yes, I often stay up too late',
  'Seriously, it affects my next day'
];
const socialImpact = ['Not at all', 'A little', 'Somewhat', 'A lot'];
const healthIssues = [
  'Eye strain',
  'Headaches',
  'Neck/back pain',
  'Poor sleep',
  'Anxiety when without phone',
  'None of these'
];
const dependency = ['Totally fine', 'A bit uncomfortable', 'Very uncomfortable', 'Cannot imagine it'];

const pickOne = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pickMany = (arr, min = 1, max = 3) => {
  const copy = [...arr].sort(() => Math.random() - 0.5);
  const count = Math.max(min, Math.min(max, Math.floor(Math.random() * (max - min + 1)) + min));
  return copy.slice(0, count);
};
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const makeMatric = (index) => {
  const year = pickOne(matricYears);
  const dept = pickOne(departmentCodes);
  const serial = String(((Date.now() + index) % 1000)).padStart(3, '0');
  return `${year}/${dept}/${serial}`;
};

const buildPayload = (index) => ({
  matric_number: makeMatric(index),
  department: pickOne(departmentCodes),
  level: pickOne(levels),
  gender: pickOne(genders),
  hours_per_day: pickOne(hoursPerDay),
  primary_uses: pickMany(primaryUses, 1, 3),
  lecture_distraction: pickOne(lectureDistraction),
  academic_performance: pickOne(academicPerformance),
  concentration: pickOne(concentration),
  sleep_impact: pickOne(sleepImpact),
  social_impact: pickOne(socialImpact),
  health_issues: pickMany(healthIssues, 1, 2),
  dependency: pickOne(dependency),
  recommendations: `Automated test response ${index + 1}`
});

const submitOne = async (payload, index) => {
  const res = await fetch(`${API_BASE_URL}/responses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  let result = null;
  try {
    result = await res.json();
  } catch {
    // Ignore JSON parse errors and show raw status below
  }

  if (!res.ok) {
    const msg = result?.error || `HTTP ${res.status}`;
    throw new Error(`Submission ${index + 1} failed: ${msg}`);
  }

  return result;
};

const run = async () => {
  console.log(`Seeding ${TOTAL} survey response(s) to ${API_BASE_URL}/responses`);
  console.log(`Wait between submissions: ${WAIT_MS}ms`);

  let successCount = 0;

  for (let i = 0; i < TOTAL; i += 1) {
    const payload = buildPayload(i);
    try {
      const result = await submitOne(payload, i);
      successCount += 1;
      console.log(
        `[${i + 1}/${TOTAL}] Submitted: ${payload.matric_number} (id: ${result?.id ?? 'n/a'})`
      );
    } catch (error) {
      const details = error?.cause?.message ? ` (${error.cause.message})` : '';
      console.error(`[${i + 1}/${TOTAL}] ${error.message}${details}`);
    }

    if (i < TOTAL - 1 && WAIT_MS > 0) {
      await sleep(WAIT_MS);
    }
  }

  console.log(`Done. Success: ${successCount}/${TOTAL}`);
};

run().catch((error) => {
  console.error('Seeder crashed:', error.message);
  process.exit(1);
});
