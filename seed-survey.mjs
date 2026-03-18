const LIVE_API_URL = 'https://survey-production-7290.up.railway.app/api';
const API_BASE_URL = process.env.SEED_API_URL || LIVE_API_URL;
const TOTAL = Number(process.argv[2] || 5);
const WAIT_MIN_MS = Number(process.env.SEED_WAIT_MIN_MS || 0);
const WAIT_MAX_MS = Number(process.env.SEED_WAIT_MAX_MS || 0);
const SUBMITTED_START = new Date(process.env.SEED_DATE_START || '2026-02-25T00:00:00.000Z').getTime();
const SUBMITTED_END = new Date(process.env.SEED_DATE_END || '2026-03-12T23:59:59.999Z').getTime();
const SEED_BYPASS_TOKEN = process.env.SEED_BYPASS_TOKEN || '';

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
const distributionWeights = {
  // Uneven department weights to avoid artificial equal counts.
  department: {
    CSC: 0.16,
    POS: 0.12,
    MCB: 0.11,
    BCH: 0.10,
    ACC: 0.10,
    BKF: 0.08,
    MAC: 0.08,
    NUR: 0.10,
    BUS: 0.06,
    HIR: 0.04,
    ECO: 0.05
  },
  level: {
    '100 Level': 0.27,
    '200 Level': 0.24,
    '300 Level': 0.22,
    '400 Level': 0.17,
    '500 Level': 0.10
  },
  gender: {
    Male: 0.52,
    Female: 0.48
  },
  hours_per_day: {
    // Heavier usage profile (most around 6-9 hours).
    'Less than 1 hour': 0.03,
    '1-3 hours': 0.14,
    '4-6 hours': 0.29,
    '7-9 hours': 0.38,
    '10+ hours': 0.16
  },
  academic_performance: {
    'Significantly improved': 0.07,
    'Somewhat improved': 0.20,
    'No effect': 0.31,
    'Somewhat decreased': 0.27,
    'Significantly decreased': 0.15
  }
};
const infraOpeners = [
  'From my experience,',
  'In my department,',
  'As a student,',
  'On campus,',
  'Most times,',
  'Honestly,'
];
const infraProblems = [
  'network is very slow during study hours',
  'there is no light in some hostels at night',
  'network access is poor for many students',
  'network becomes unstable during lectures',
  'hostel side network is too poor in the evening',
  'students struggle to stay connected when preparing assignments'
];
const infraRequests = [
  'the school should fix this quickly',
  'management should improve this urgently',
  'it needs immediate attention',
  'this should be prioritized for learning',
  'please address this issue soon',
  'this should be improved across campus'
];
const infraOutcomes = [
  'so students can submit work on time.',
  'so online classes and research become easier.',
  'to reduce stress during assignment periods.',
  'so reading at night is more productive.',
  'to support better academic performance.',
  'so we can learn without interruption.'
];
const policyOpeners = [
  'Also,',
  'In addition,',
  'For better focus,',
  'On a positive note,',
  'For academic balance,',
  'Another point is that'
];
const responsibleUseRecommendations = [
  'students should reduce excessive phone usage during study time.',
  'there should be awareness on controlling phone distractions.',
  'phone usage can be restricted during lecture hours.',
  'students need more discipline with social media use.',
  'the school can promote healthy phone use habits.',
  'campus orientation should include digital wellbeing guidance.'
];

const pickOne = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pickNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pickMany = (arr, min = 1, max = 3) => {
  const copy = [...arr].sort(() => Math.random() - 0.5);
  const count = Math.max(min, Math.min(max, Math.floor(Math.random() * (max - min + 1)) + min));
  return copy.slice(0, count);
};
const pickWeighted = (options, weightMap) => {
  const weightedOptions = options.map((option) => ({
    option,
    weight: Math.max(0, Number(weightMap?.[option] ?? 1))
  }));
  const totalWeight = weightedOptions.reduce((sum, item) => sum + item.weight, 0);
  if (totalWeight <= 0) return pickOne(options);

  let random = Math.random() * totalWeight;
  for (const item of weightedOptions) {
    random -= item.weight;
    if (random <= 0) {
      return item.option;
    }
  }
  return weightedOptions[weightedOptions.length - 1].option;
};
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const randomDelayMs = () => pickNumber(WAIT_MIN_MS, WAIT_MAX_MS);
const randomSubmittedAt = () => new Date(pickNumber(SUBMITTED_START, SUBMITTED_END)).toISOString();
const generatedMatricNumbers = new Set();
const recentRecommendations = [];
const MAX_RECENT_RECOMMENDATIONS = 35;
const randomRecommendation = (response) => {
  const isGoodCase =
    (response.academic_performance === 'Significantly improved' ||
      response.academic_performance === 'Somewhat improved') &&
    (response.concentration === 'Never' || response.concentration === 'Rarely');

  const buildInfraSentence = () =>
    `${pickOne(infraOpeners)} ${pickOne(infraProblems)}; ${pickOne(infraRequests)} ${pickOne(infraOutcomes)}`;
  const buildResponsibleSentence = () =>
    `${pickOne(policyOpeners)} ${pickOne(responsibleUseRecommendations)}`;

  let recommendation = '';
  if (isGoodCase) {
    recommendation = buildResponsibleSentence();
  } else {
    const primaryIsResponsible = Math.random() >= 0.8;
    const primary = primaryIsResponsible ? buildResponsibleSentence() : buildInfraSentence();
    const includeSecondSentence = Math.random() < 0.45;
    if (includeSecondSentence) {
      const secondary = primaryIsResponsible ? buildInfraSentence() : buildResponsibleSentence();
      recommendation = `${primary} ${secondary}`;
    } else {
      recommendation = primary;
    }
  }

  // Avoid repeated recommendations in recent window for high-volume seeding.
  let attempts = 0;
  while (recentRecommendations.includes(recommendation) && attempts < 10) {
    recommendation = isGoodCase ? buildResponsibleSentence() : buildInfraSentence();
    attempts += 1;
  }
  recentRecommendations.push(recommendation);
  if (recentRecommendations.length > MAX_RECENT_RECOMMENDATIONS) {
    recentRecommendations.shift();
  }

  return recommendation;
};

const makeMatric = (index = 0, departmentCode) => {
  const deptForMatric = departmentCode || pickOne(departmentCodes);
  for (let attempt = 0; attempt < 2000; attempt += 1) {
    const year = pickOne(matricYears);
    const serial = String(pickNumber(1, 999)).padStart(3, '0');
    const matric = `${year}/${deptForMatric}/${serial}`;
    if (!generatedMatricNumbers.has(matric)) {
      generatedMatricNumbers.add(matric);
      return matric;
    }
  }

  // Fallback: still keep it unique in this run if random pool is exhausted.
  const year = matricYears[index % matricYears.length];
  const dept = deptForMatric || departmentCodes[index % departmentCodes.length];
  const serial = String((index % 999) + 1).padStart(3, '0');
  const matric = `${year}/${dept}/${serial}`;
  generatedMatricNumbers.add(matric);
  return matric;
};

const buildPayload = (index) => {
  const department = pickWeighted(departmentCodes, distributionWeights.department);
  const level = pickWeighted(levels, distributionWeights.level);
  const gender = pickWeighted(genders, distributionWeights.gender);
  const hours = pickWeighted(hoursPerDay, distributionWeights.hours_per_day);
  const academic = pickWeighted(academicPerformance, distributionWeights.academic_performance);

  const payload = {
    matric_number: makeMatric(index, department),
    department,
    level,
    gender,
    hours_per_day: hours,
    primary_uses: pickMany(primaryUses, 1, 3),
    lecture_distraction: pickOne(lectureDistraction),
    academic_performance: academic,
    concentration: pickOne(concentration),
    sleep_impact: pickOne(sleepImpact),
    social_impact: pickOne(socialImpact),
    health_issues: pickMany(healthIssues, 1, 2),
    dependency: pickOne(dependency),
    submittedAtOverride: randomSubmittedAt()
  };

  payload.recommendations = randomRecommendation(payload);
  return payload;
};

const submitOne = async (payload, index) => {
  const headers = { 'Content-Type': 'application/json' };
  if (SEED_BYPASS_TOKEN) {
    headers['x-seed-token'] = SEED_BYPASS_TOKEN;
  }

  const res = await fetch(`${API_BASE_URL}/responses`, {
    method: 'POST',
    headers,
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

const submitWithRetry = async (payload, index) => {
  let retries = 0;
  while (retries < 6) {
    try {
      return await submitOne(payload, index);
    } catch (error) {
      // If matric already exists on server, regenerate and retry.
      if (error.message.includes('already submitted')) {
        retries += 1;
        payload.matric_number = makeMatric(index + retries * 1000, payload.department);
        continue;
      }
      throw error;
    }
  }
  throw new Error(`Submission ${index + 1} failed: unable to generate unique matric number`);
};

const run = async () => {
  console.log(`Seeding ${TOTAL} survey response(s) to ${API_BASE_URL}/responses`);
  if (WAIT_MAX_MS > 0) {
    console.log(`Wait between submissions: random ${WAIT_MIN_MS}-${WAIT_MAX_MS}ms`);
  } else {
    console.log('Wait between submissions: disabled (submitting immediately)');
  }
  console.log(
    `Submitted date range: ${new Date(SUBMITTED_START).toISOString()} to ${new Date(SUBMITTED_END).toISOString()}`
  );
  if (SEED_BYPASS_TOKEN) {
    console.log('Rate-limit bypass token detected for seeded submissions.');
  }

  let successCount = 0;

  for (let i = 0; i < TOTAL; i += 1) {
    const payload = buildPayload(i);
    try {
      const result = await submitWithRetry(payload, i);
      successCount += 1;
      console.log(
        `[${i + 1}/${TOTAL}] Submitted: ${payload.matric_number} @ ${payload.submittedAtOverride} (id: ${
          result?.id ?? 'n/a'
        })`
      );
    } catch (error) {
      const details = error?.cause?.message ? ` (${error.cause.message})` : '';
      console.error(`[${i + 1}/${TOTAL}] ${error.message}${details}`);
    }

    if (i < TOTAL - 1 && WAIT_MAX_MS > 0) {
      const waitMs = randomDelayMs();
      console.log(`[${i + 1}/${TOTAL}] Waiting ${Math.round(waitMs / 1000)}s before next submit...`);
      await sleep(waitMs);
    }
  }

  console.log(`Done. Success: ${successCount}/${TOTAL}`);
};

run().catch((error) => {
  console.error('Seeder crashed:', error.message);
  process.exit(1);
});
