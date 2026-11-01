import React, { useState, useEffect } from 'react';
import { SkipLink } from './components/common/SkipLink';
import { Header } from './components/common/Header';
import { ErrorSummary } from './components/common/ErrorSummary';
import { ToastContainer, type ToastMessage } from './components/common/ToastContainer';
import { IntakeHero } from './components/intake/IntakeHero';
import { BudgetSection } from './components/budget/BudgetSection';
import { TimelineSection } from './components/timeline/TimelineSection';
import { VendorChecklistSection } from './components/checklist/VendorChecklistSection';
import { RSVPTrackerSection } from './components/rsvp/RSVPTrackerSection';
import { CommunitySection } from './components/community/CommunitySection';
import { AIAssistantDrawer } from './components/assistant/AIAssistantDrawer';
import { ScenarioCompareModal } from './components/scenario/ScenarioCompareModal';
import { ExportShareModal } from './components/export/ExportShareModal';
import { usePlanState } from './hooks/usePlanState';

export const App: React.FC = () => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [activeTab, setActiveTab] = useState<
    'budget' | 'timeline' | 'vendors' | 'rsvp' | 'community'
  >('budget');
  const [showAssistant, setShowAssistant] = useState(false);
  const [showScenario, setShowScenario] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const planState = usePlanState();
  const { plan } = planState;

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const addToast = (type: ToastMessage['type'], text: string) => {
    const newToast: ToastMessage = { id: `toast-${Date.now()}`, type, text };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 4000);
  };

  const navTabs = [
    { id: 'budget', label: 'Budget Split' },
    { id: 'timeline', label: 'Timeline & Delays' },
    { id: 'vendors', label: 'Vendor Checklist' },
    { id: 'rsvp', label: 'RSVP & Catering' },
    { id: 'community', label: 'Community Hub' },
  ] as const;

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col font-sans">
      <SkipLink />
      <Header
        plan={plan}
        isDark={isDark}
        onToggleTheme={() => setIsDark((prev) => !prev)}
        onOpenAssistant={() => setShowAssistant(true)}
        onOpenScenario={() => setShowScenario(true)}
        onOpenExport={() => setShowExport(true)}
        onEditIntake={() => planState.setPlan(null)}
      />

      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ErrorSummary errors={errors} onDismiss={() => setErrors([])} />

        {!plan ? (
          <IntakeHero
            today={planState.today}
            onPlanCreated={(params) => {
              planState.createPlanFromParams(params);
              addToast('success', `Plan "${params.title}" initialized!`);
            }}
            onError={(msg) => setErrors([msg])}
          />
        ) : (
          <div className="space-y-6">
            {/* Celebration Title Banner */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-mehfil-500/10 via-rose-500/5 to-amber-500/10 border border-mehfil-200 dark:border-mehfil-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-mehfil-600 dark:text-mehfil-400">
                  {plan.occasion} in {plan.location}
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-stone-50 mt-1">
                  {plan.title}
                </h1>
                <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                  Target Celebration: {plan.eventDate} • Headcount: {plan.guestCount} guests • Total
                  Budget: ₹{(plan.budget.totalMinor / 100).toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div
              className="flex overflow-x-auto border-b border-stone-200 dark:border-stone-800 gap-1 pb-px"
              role="tablist"
              aria-label="Celebration management sections"
            >
              {navTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`touch-target px-4 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-mehfil-600 text-mehfil-600 dark:text-mehfil-400'
                      : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Views */}
            {activeTab === 'budget' && (
              <BudgetSection
                budget={plan.budget}
                onToggleCategoryLock={planState.toggleCategoryLock}
                onUpdateContingency={planState.updateContingency}
              />
            )}

            {activeTab === 'timeline' && (
              <TimelineSection
                tasks={plan.timeline}
                eventDate={plan.eventDate}
                today={planState.today}
                onUpdateTaskStatus={planState.updateTaskStatus}
                onSimulateDelay={planState.simulateDelay}
              />
            )}

            {activeTab === 'vendors' && (
              <VendorChecklistSection
                vendors={plan.vendors}
                today={planState.today}
                onUpdateVendor={planState.updateVendor}
              />
            )}

            {activeTab === 'rsvp' && (
              <RSVPTrackerSection
                rsvps={plan.rsvps}
                onAddGuest={planState.addGuest}
                onUpdateGuest={planState.updateGuest}
                onRemoveGuest={planState.removeGuest}
              />
            )}

            {activeTab === 'community' && (
              <CommunitySection
                volunteers={plan.volunteers}
                permits={plan.permits}
                sponsors={plan.sponsors}
                onUpdatePermitStatus={planState.updatePermitStatus}
                onUpdateVolunteerStatus={planState.updateVolunteerStatus}
              />
            )}
          </div>
        )}
      </main>

      {/* Modals & Drawers */}
      {plan && (
        <>
          <AIAssistantDrawer
            isOpen={showAssistant}
            onClose={() => setShowAssistant(false)}
            plan={plan}
            today={planState.today}
          />

          {showScenario && (
            <ScenarioCompareModal
              currentPlan={plan}
              onApplyScenario={(newPlan) => {
                planState.setPlan(newPlan);
                setShowScenario(false);
                addToast('success', 'Scenario B adopted successfully!');
              }}
              onClose={() => setShowScenario(false)}
            />
          )}

          {showExport && <ExportShareModal plan={plan} onClose={() => setShowExport(false)} />}
        </>
      )}

      <ToastContainer
        toasts={toasts}
        onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />

      {/* Accessible Footer */}
      <footer className="border-t border-stone-200 dark:border-stone-800 py-6 text-center text-xs text-stone-500 dark:text-stone-400">
        <p>Mehfil • PromptWars Challenge 5 • Built with React, TypeScript & Google Gemini</p>
      </footer>
    </div>
  );
};

export default App;
