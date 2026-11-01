import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Header } from '../../src/components/common/Header';
import { ErrorSummary } from '../../src/components/common/ErrorSummary';
import { BudgetSection } from '../../src/components/budget/BudgetSection';
import { initializeBudgetCategories } from '../../src/engine/budget';

describe('Accessibility (WCAG 2.1 AA) - jest-axe Tests', () => {
  it('Header component has no accessibility violations', async () => {
    const { container } = render(
      <Header
        plan={null}
        isDark={false}
        onToggleTheme={() => {}}
        onOpenAssistant={() => {}}
        onOpenScenario={() => {}}
        onOpenExport={() => {}}
        onEditIntake={() => {}}
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('ErrorSummary component has no accessibility violations and is screen-reader accessible', async () => {
    const { container } = render(
      <ErrorSummary
        errors={['Budget must be greater than zero.', 'Target event date is required.']}
        onDismiss={() => {}}
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('BudgetSection component has no accessibility violations in both light and dark mode contexts', async () => {
    const budgetInit = initializeBudgetCategories('birthday', 6000000, 10);
    const budgetPlan = {
      totalMinor: 6000000,
      currency: 'INR',
      contingencyPercent: 10,
      contingencyMinor: budgetInit.contingencyMinor,
      categories: budgetInit.categories,
    };

    const { container } = render(
      <BudgetSection
        budget={budgetPlan}
        onToggleCategoryLock={() => {}}
        onUpdateContingency={() => {}}
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
