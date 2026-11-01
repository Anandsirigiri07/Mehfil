/**
 * Mehfil - Export Engine
 * Generates RFC 5545 iCalendar (.ics) files, printable summaries,
 * and compact shareable URL payloads with size limits and Zod verification.
 */

import type { MehfilPlan } from '../types';
import { MehfilPlanSchema } from '../types/schemas';

/**
 * Generates a standard RFC 5545 .ics iCalendar file string for all milestones and tasks.
 */
export function generateICalendar(plan: MehfilPlan): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Mehfil Celebration Planner//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:Mehfil - ${escapeICS(plan.title)}`,
  ];

  // Add each milestone or task as a calendar event
  for (const task of plan.timeline) {
    const dateCompact = task.calculatedDate.replace(/-/g, '');
    const uid = `${task.id}-${dateCompact}@mehfil.app`;

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${dateCompact}T000000Z`);
    lines.push(`DTSTART;VALUE=DATE:${dateCompact}`);
    lines.push(`SUMMARY:${escapeICS(task.title)}`);
    lines.push(`DESCRIPTION:${escapeICS(`${task.description} [Category: ${task.category}]`)}`);
    lines.push(`LOCATION:${escapeICS(plan.location)}`);
    lines.push('STATUS:CONFIRMED');
    lines.push('END:VEVENT');
  }

  // Add the main event itself
  const eventDateCompact = plan.eventDate.replace(/-/g, '');
  lines.push('BEGIN:VEVENT');
  lines.push(`UID:main-event-${plan.id}-${eventDateCompact}@mehfil.app`);
  lines.push(`DTSTAMP:${eventDateCompact}T000000Z`);
  lines.push(`DTSTART;VALUE=DATE:${eventDateCompact}`);
  lines.push(`SUMMARY:★ ${escapeICS(plan.title)}`);
  lines.push(
    `DESCRIPTION:${escapeICS(`Official celebration day! Guest count: ${plan.guestCount}`)}`
  );
  lines.push(`LOCATION:${escapeICS(plan.location)}`);
  lines.push('CLASS:PUBLIC');
  lines.push('PRIORITY:1');
  lines.push('END:VEVENT');

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

/**
 * Escapes characters for iCalendar format according to RFC 5545.
 */
function escapeICS(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

/**
 * Encodes a plan into a URL-safe Base64 string, enforcing a 32 KB maximum size limit.
 */
export function encodeShareablePlan(plan: MehfilPlan): string {
  const jsonStr = JSON.stringify(plan);
  if (jsonStr.length > 32768) {
    throw new Error('Plan payload exceeds 32 KB size cap.');
  }

  // Use UTF-8 safe base64 encoding
  const utf8Bytes = new TextEncoder().encode(jsonStr);
  let binary = '';
  for (let i = 0; i < utf8Bytes.length; i++) {
    binary += String.fromCharCode(utf8Bytes[i] ?? 0);
  }
  const base64 = btoa(binary);
  return encodeURIComponent(base64);
}

/**
 * Decodes and validates a shared URL payload back into a MehfilPlan.
 */
export function decodeShareablePlan(encoded: string): MehfilPlan {
  const rawBase64 = decodeURIComponent(encoded);
  const binary = atob(rawBase64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const jsonStr = new TextDecoder().decode(bytes);

  if (jsonStr.length > 32768) {
    throw new Error('Shared payload exceeds 32 KB limit.');
  }

  const rawObj = JSON.parse(jsonStr);
  return MehfilPlanSchema.parse(rawObj);
}
