/**
 * Mehfil - Serverless Offline Rule-Based Fallback Engine
 * Activated whenever GEMINI_API_KEY is missing, unauthorized, or timed out.
 */

import type { OccasionType, MehfilPlan } from '../../src/types';

export function fallbackParseIntake(
  description: string,
  today: string
): {
  title: string;
  occasion: OccasionType;
  eventDate: string;
  location: string;
  guestCount: number;
  totalBudgetMinor: number;
  currency: string;
  isFallback: boolean;
} {
  const lower = description.toLowerCase();

  let occasion: OccasionType = 'milestone';
  if (
    lower.includes('wedding') ||
    lower.includes('shaadi') ||
    lower.includes('marriage') ||
    lower.includes('reception')
  ) {
    occasion = 'wedding';
  } else if (lower.includes('birthday') || lower.includes('bday') || lower.includes('kids')) {
    occasion = 'birthday';
  } else if (
    lower.includes('community') ||
    lower.includes('society') ||
    lower.includes('puja') ||
    lower.includes('festival') ||
    lower.includes('meetup')
  ) {
    occasion = 'community';
  }

  const guestMatch = lower.match(/(\d+)\s*(?:guests?|people|kids|attendees|pax)/);
  const guestCount = guestMatch?.[1]
    ? Math.max(10, parseInt(guestMatch[1], 10))
    : occasion === 'wedding'
      ? 150
      : 40;

  let totalBudgetMinor = 5000000;
  const kMatch = lower.match(/(\d+)\s*k\b/);
  const lakhMatch = lower.match(/(\d+)\s*(?:lakh|lac|l)\b/);
  const directNumMatch = lower.match(/(?:rs\.?|inr|budget\s*of|₹)\s*([\d,]+)/);

  if (kMatch?.[1]) {
    totalBudgetMinor = parseInt(kMatch[1], 10) * 1000 * 100;
  } else if (lakhMatch?.[1]) {
    totalBudgetMinor = parseInt(lakhMatch[1], 10) * 100000 * 100;
  } else if (directNumMatch?.[1]) {
    const rawVal = parseInt(directNumMatch[1].replace(/,/g, ''), 10);
    if (!isNaN(rawVal)) totalBudgetMinor = rawVal * 100;
  }

  let location = 'Bengaluru';
  const cities = [
    'bengaluru',
    'bangalore',
    'mumbai',
    'delhi',
    'hyderabad',
    'chennai',
    'pune',
    'kolkata',
    'goa',
    'jaipur',
  ];
  for (const city of cities) {
    if (lower.includes(city)) {
      location = city.charAt(0).toUpperCase() + city.slice(1);
      break;
    }
  }

  const [y, m, d] = today.split('-').map(Number);
  const dateObj = new Date(Date.UTC(y ?? 2026, (m ?? 1) - 1, d ?? 1));
  dateObj.setUTCDate(dateObj.getUTCDate() + (occasion === 'wedding' ? 90 : 30));
  const eventDate = dateObj.toISOString().split('T')[0] ?? today;

  const occasionLabel = occasion.charAt(0).toUpperCase() + occasion.slice(1);
  const title = `${location} ${occasionLabel} Celebration`;

  return {
    title,
    occasion,
    eventDate,
    location,
    guestCount,
    totalBudgetMinor,
    currency: 'INR',
    isFallback: true,
  };
}

export function fallbackSuggestIdeas(
  occasion: OccasionType,
  location: string
): {
  theme: string;
  ideas: {
    category: string;
    title: string;
    description: string;
    budgetTip: string;
    diyAlternative?: string;
  }[];
  proTips: string[];
  isFallback: boolean;
} {
  const themes = {
    wedding: {
      theme: 'Traditional Elegance with Sustainable Botanical Accents',
      ideas: [
        {
          category: 'decor',
          title: 'Marigold & Brass Lamp Stage',
          description:
            'Timeless floral arches with sustainable potted greens and heritage brass urlis.',
          budgetTip: 'Rent brass heritage items from local cultural trusts rather than buying.',
          diyAlternative: 'Arrange hanging marigold strings with family the evening prior.',
        },
        {
          category: 'catering',
          title: 'Regional Live Chat & Filter Coffee Counter',
          description:
            'Interactive food stations featuring hot freshly poured filter coffee and seasonal delicacies.',
          budgetTip: 'Limit live counters to 2 signature regional specialties.',
        },
      ],
      proTips: [
        'Finalize headcount with caterer 7 days prior to prevent food waste.',
        'Always verify backup power generators for sound and lighting in outdoor lawns.',
      ],
    },
    birthday: {
      theme: 'Carnival & Adventure Quest',
      ideas: [
        {
          category: 'entertainment',
          title: 'Scavenger Hunt & Balloon Workshop',
          description:
            'Interactive team challenges that keep children actively engaged for 60 minutes.',
          budgetTip:
            'Design printable clue cards at home rather than hiring commercial coordinators.',
          diyAlternative: 'Create DIY origami or clay crafting tables.',
        },
      ],
      proTips: [
        'Schedule games before cake cutting while kid energy is peak.',
        'Keep dietary-safe fruit skewers and eggless options clearly labeled.',
      ],
    },
    community: {
      theme: 'Heritage Cultural Fair & Sustainability Drive',
      ideas: [
        {
          category: 'activities',
          title: 'Eco-Swap & Artisan Stalls',
          description:
            'Community members showcase homemade crafts, books, and eco-friendly products.',
          budgetTip: 'Invite local community volunteers to manage booth tables.',
        },
      ],
      proTips: [
        'Secure municipal and loudspeaker clearance permits at least 3 weeks in advance.',
        'Designate a certified first-aid station and clear emergency exit path.',
      ],
    },
    milestone: {
      theme: 'Golden Heritage Retrospective',
      ideas: [
        {
          category: 'decor',
          title: 'Decade Memory Lane Wall',
          description:
            'Framed photographs, vintage letters, and milestone timelines celebrating life chapters.',
          budgetTip: 'Print standard photos and mount on fairy light boards.',
        },
      ],
      proTips: [
        'Ensure venue seating is comfortable with priority accessibility for elders.',
        'Keep music at conversational volume levels throughout dining.',
      ],
    },
  };

  const selected = themes[occasion] ?? themes.milestone;
  return {
    theme: `${selected.theme} (${location})`,
    ideas: selected.ideas,
    proTips: selected.proTips,
    isFallback: true,
  };
}

export function fallbackReviewPlan(
  plan: MehfilPlan,
  today: string
): {
  overallHealthScore: number;
  summary: string;
  findings: {
    severity: 'critical' | 'warning' | 'tip';
    area: string;
    message: string;
    actionableRecommendation: string;
  }[];
  isFallback: boolean;
} {
  const findings: {
    severity: 'critical' | 'warning' | 'tip';
    area: string;
    message: string;
    actionableRecommendation: string;
  }[] = [];

  const [y, m, d] = today.split('-').map(Number);
  const [ey, em, ed] = plan.eventDate.split('-').map(Number);
  const daysUntil = Math.round(
    (Date.UTC(ey ?? 2026, (em ?? 1) - 1, ed ?? 1) - Date.UTC(y ?? 2026, (m ?? 1) - 1, d ?? 1)) /
      (1000 * 60 * 60 * 24)
  );

  if (daysUntil < 14) {
    findings.push({
      severity: 'critical',
      area: 'Timeline',
      message: `Event date is only ${daysUntil} days away. High risk of vendor booking conflicts.`,
      actionableRecommendation: 'Immediately prioritize locking venue and catering contracts.',
    });
  } else if (daysUntil < 45 && plan.occasion === 'wedding') {
    findings.push({
      severity: 'warning',
      area: 'Timeline',
      message: 'Weddings typically need 60-90 days for bespoke invitations and attire fittings.',
      actionableRecommendation:
        'Send digital save-the-dates this week to confirm guest headcounts early.',
    });
  }

  if (plan.budget.contingencyPercent < 5) {
    findings.push({
      severity: 'warning',
      area: 'Budget',
      message:
        'Contingency reserve is under 5%. Unexpected costs may strain individual category budgets.',
      actionableRecommendation:
        'Set contingency to at least 10% to absorb last-minute taxes and overtime.',
    });
  }

  const unbookedVendors = plan.vendors.filter((v) => v.status === 'not_started');
  if (unbookedVendors.length > 2) {
    findings.push({
      severity: 'warning',
      area: 'Vendors',
      message: `${unbookedVendors.length} key vendor categories are still in "Not Started" status.`,
      actionableRecommendation:
        'Request quotes for pending categories to prevent rate escalations.',
    });
  }

  const overallHealthScore = Math.max(
    40,
    100 -
      findings.filter((f) => f.severity === 'critical').length * 25 -
      findings.filter((f) => f.severity === 'warning').length * 10
  );

  return {
    overallHealthScore,
    summary: `Plan evaluated with ${findings.length} actionable health checks. Overall score is ${overallHealthScore}/100.`,
    findings,
    isFallback: true,
  };
}

export function fallbackAskPlanner(
  plan: MehfilPlan,
  question: string
): {
  answer: string;
  referencedItems: string[];
  suggestedAction: string;
  isFallback: boolean;
} {
  const q = question.toLowerCase();
  const referenced: string[] = [];

  if (q.includes('budget') || q.includes('cost') || q.includes('money') || q.includes('spend')) {
    const total = (plan.budget.totalMinor / 100).toLocaleString('en-IN');
    const contingency = (plan.budget.contingencyMinor / 100).toLocaleString('en-IN');
    referenced.push('Budget Allocation', 'Contingency Reserve');
    return {
      answer: `Total event budget is ₹${total} (${plan.budget.currency}) with a ${plan.budget.contingencyPercent}% contingency reserve (₹${contingency}). All category splits use largest-remainder rounding.`,
      referencedItems: referenced,
      suggestedAction: 'Review category allocations in the Budget tab.',
      isFallback: true,
    };
  }

  if (q.includes('guest') || q.includes('rsvp') || q.includes('food') || q.includes('diet')) {
    referenced.push('Guest Count', 'RSVP Tracker');
    return {
      answer: `The event is planned for ${plan.guestCount} guests in ${plan.location}. The RSVP engine automatically calculates dietary portions for veg, vegan, jain, and allergies.`,
      referencedItems: referenced,
      suggestedAction: 'Check confirmed dietary headcounts in the RSVP tab.',
      isFallback: true,
    };
  }

  return {
    answer: `Facts for "${plan.title}": ${plan.occasion} on ${plan.eventDate} in ${plan.location} with ${plan.guestCount} guests and budget ₹${(plan.budget.totalMinor / 100).toLocaleString('en-IN')}.`,
    referencedItems: ['Overview', 'Event Facts'],
    suggestedAction: 'Ask about budget splits, timeline tasks, or dietary requirements.',
    isFallback: true,
  };
}
