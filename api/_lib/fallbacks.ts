/**
 * Mehfil - Serverless Offline Rule-Based Fallback Engine
 * Activated whenever GEMINI_API_KEY is missing, unauthorized, or timed out.
 */

import type { OccasionType } from '../../src/types';

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

export { fallbackReviewPlan, fallbackAskPlanner } from './fallbacks-advisor';
