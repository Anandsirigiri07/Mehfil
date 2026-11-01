/**
 * Mehfil - Deterministic Offline Intake Parsing Engine
 * Pure TypeScript, zero clock inside (`today` is passed in).
 * Extracts event parameters deterministically from natural language descriptions.
 */

import type { OccasionType, ParsedIntakeResponse } from '../types';

export function fallbackParseIntake(description: string, today: string): ParsedIntakeResponse {
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
