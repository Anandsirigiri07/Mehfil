import { useState, useCallback, useEffect } from 'react';
import type {
  MehfilPlan,
  OccasionType,
  VendorPayment,
  TimelineTask,
  GuestRSVP,
  CommunityPermit,
  CommunityVolunteer,
} from '../types';
import { initializeBudgetCategories, calculateBudgetSplit } from '../engine/budget';
import { initializeTimeline, calculateTimeline } from '../engine/timeline';
import { initializeVendors } from '../engine/checklist';
import { generateSampleRSVPs } from '../engine/rsvp';
import { generateSampleCommunityData } from '../engine/community';
import { decodeShareablePlan } from '../engine/export';

const DEFAULT_TODAY = '2026-11-01';

export function usePlanState() {
  const [today] = useState<string>(DEFAULT_TODAY);
  const [plan, setPlan] = useState<MehfilPlan | null>(null);

  // Initialize plan from parameters
  const createPlanFromParams = useCallback(
    (params: {
      title: string;
      occasion: OccasionType;
      eventDate: string;
      location: string;
      guestCount: number;
      totalBudgetMinor: number;
      currency: string;
    }) => {
      const budgetInit = initializeBudgetCategories(params.occasion, params.totalBudgetMinor, 10);
      const timelineInit = initializeTimeline(params.occasion, params.eventDate);
      const vendorsInit = initializeVendors(params.occasion);
      const rsvpsInit = generateSampleRSVPs();
      const communityData = generateSampleCommunityData();

      const newPlan: MehfilPlan = {
        id: `plan-${Date.now()}`,
        title: params.title,
        occasion: params.occasion,
        eventDate: params.eventDate,
        location: params.location,
        guestCount: params.guestCount,
        budget: {
          totalMinor: params.totalBudgetMinor,
          currency: params.currency,
          contingencyPercent: 10,
          contingencyMinor: budgetInit.contingencyMinor,
          categories: budgetInit.categories,
        },
        timeline: timelineInit,
        vendors: vendorsInit,
        rsvps: rsvpsInit,
        volunteers: communityData.volunteers,
        permits: communityData.permits,
        sponsors: communityData.sponsors,
        notes: '',
        createdAt: today,
        updatedAt: today,
      };

      setPlan(newPlan);
    },
    [today]
  );

  // Load shared plan from URL hash if present
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#plan=')) {
      try {
        const encoded = hash.replace('#plan=', '');
        const decoded = decodeShareablePlan(encoded);
        setPlan(decoded);
      } catch {
        // Fallback to default
      }
    }
  }, []);

  const toggleCategoryLock = useCallback((categoryId: string) => {
    setPlan((prev) => {
      if (!prev) return null;
      const updatedCategories = prev.budget.categories.map((c) =>
        c.id === categoryId ? { ...c, isLocked: !c.isLocked } : c
      );
      const split = calculateBudgetSplit(
        prev.budget.totalMinor,
        prev.budget.contingencyPercent,
        updatedCategories
      );
      return {
        ...prev,
        budget: {
          ...prev.budget,
          categories: split.categories,
          contingencyMinor: split.contingencyMinor,
        },
      };
    });
  }, []);

  const updateContingency = useCallback((contingencyPercent: number) => {
    setPlan((prev) => {
      if (!prev) return null;
      const split = calculateBudgetSplit(
        prev.budget.totalMinor,
        contingencyPercent,
        prev.budget.categories
      );
      return {
        ...prev,
        budget: {
          ...prev.budget,
          contingencyPercent,
          categories: split.categories,
          contingencyMinor: split.contingencyMinor,
        },
      };
    });
  }, []);

  const updateTaskStatus = useCallback((taskId: string, status: TimelineTask['status']) => {
    setPlan((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        timeline: prev.timeline.map((t) => (t.id === taskId ? { ...t, status } : t)),
      };
    });
  }, []);

  const simulateDelay = useCallback((taskId: string, delayDays: number) => {
    setPlan((prev) => {
      if (!prev) return null;
      const tasksWithDelay = prev.timeline.map((t) =>
        t.id === taskId ? { ...t, delayDays: t.delayDays + delayDays } : t
      );
      const updated = calculateTimeline(tasksWithDelay, prev.eventDate);
      return { ...prev, timeline: updated };
    });
  }, []);

  const updateVendor = useCallback((vendor: VendorPayment) => {
    setPlan((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        vendors: prev.vendors.map((v) => (v.id === vendor.id ? vendor : v)),
      };
    });
  }, []);

  const addGuest = useCallback((guest: GuestRSVP) => {
    setPlan((prev) => (prev ? { ...prev, rsvps: [guest, ...prev.rsvps] } : null));
  }, []);

  const updateGuest = useCallback((guest: GuestRSVP) => {
    setPlan((prev) =>
      prev ? { ...prev, rsvps: prev.rsvps.map((g) => (g.id === guest.id ? guest : g)) } : null
    );
  }, []);

  const removeGuest = useCallback((id: string) => {
    setPlan((prev) => (prev ? { ...prev, rsvps: prev.rsvps.filter((g) => g.id !== id) } : null));
  }, []);

  const updatePermitStatus = useCallback((id: string, status: CommunityPermit['status']) => {
    setPlan((prev) =>
      prev
        ? { ...prev, permits: prev.permits.map((p) => (p.id === id ? { ...p, status } : p)) }
        : null
    );
  }, []);

  const updateVolunteerStatus = useCallback((id: string, status: CommunityVolunteer['status']) => {
    setPlan((prev) =>
      prev
        ? { ...prev, volunteers: prev.volunteers.map((v) => (v.id === id ? { ...v, status } : v)) }
        : null
    );
  }, []);

  return {
    today,
    plan,
    setPlan,
    createPlanFromParams,
    toggleCategoryLock,
    updateContingency,
    updateTaskStatus,
    simulateDelay,
    updateVendor,
    addGuest,
    updateGuest,
    removeGuest,
    updatePermitStatus,
    updateVolunteerStatus,
  };
}
