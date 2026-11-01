/**
 * Mehfil - Serverless Offline Rule-Based Fallback Engine
 * Activated whenever GEMINI_API_KEY is missing, unauthorized, or timed out.
 */

import type { OccasionType } from '../../src/types';
export { fallbackParseIntake } from '../../src/engine/intake';

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
