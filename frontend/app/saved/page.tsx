"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { MaterialIcon } from "@/components/ui/material-icon";
import { OpportunityCard } from "@/features/opportunities/opportunity-card";
import { OpportunityDetailDrawer } from "@/features/opportunities/opportunity-detail-drawer";
import { sampleOpportunities } from "@/features/opportunities/sample-opportunities";
import { updateOpportunityStatus } from "@/features/opportunities/opportunity-collection";
import type { Opportunity, OpportunityStatus } from "@/types/opportunity";

const closeDelayMs = 300;

export default function SavedPage() {
  const closeTimerRef = useRef<number | null>(null);
  const [opportunities, setOpportunities] = useState<ReadonlyArray<Opportunity>>(sampleOpportunities);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const savedOpportunities = opportunities.filter((opportunity) => opportunity.isSaved);

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current === null) {
      return;
    }

    window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
  }, []);

  const closeDrawer = useCallback(() => {
    clearCloseTimer();
    setDrawerOpen(false);
    closeTimerRef.current = window.setTimeout(() => {
      setSelectedOpportunity(null);
      closeTimerRef.current = null;
    }, closeDelayMs);
  }, [clearCloseTimer]);

  const openDrawer = useCallback(
    (opportunity: Opportunity) => {
      clearCloseTimer();
      setSelectedOpportunity(opportunity);
      window.requestAnimationFrame(() => setDrawerOpen(true));
    },
    [clearCloseTimer]
  );

  useEffect(() => clearCloseTimer, [clearCloseTimer]);

  useEffect(() => {
    if (selectedOpportunity === null) {
      return;
    }

    const nextSelected = opportunities.find((opportunity) => opportunity.id === selectedOpportunity.id);

    if (nextSelected !== undefined && nextSelected !== selectedOpportunity) {
      setSelectedOpportunity(nextSelected);
    }
  }, [opportunities, selectedOpportunity]);

  function handleStatusChange(opportunityId: string, status: OpportunityStatus): void {
    setOpportunities((currentOpportunities) => updateOpportunityStatus(currentOpportunities, opportunityId, status));
  }

  function handleToggleSaved(opportunityId: string): void {
    setOpportunities((currentOpportunities) =>
      currentOpportunities.map((opportunity) => {
        if (opportunity.id !== opportunityId) {
          return opportunity;
        }

        return { ...opportunity, isSaved: !opportunity.isSaved };
      })
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-container-max flex-col gap-10 px-margin-mobile py-12 md:px-margin-desktop md:py-20">
      <header className="max-w-3xl">
        <p className="text-label-sm uppercase tracking-[0.16em] text-secondary">Veille personnelle</p>
        <h1 className="mt-3 font-display text-headline-lg-mobile text-primary md:text-display-lg">Sauvegardées</h1>
        <p className="mt-4 text-body-lg text-on-surface-variant">
          Les opportunités à garder sous la main avant de décider si elles méritent un dossier complet.
        </p>
      </header>

      {savedOpportunities.length > 0 ? (
        <section className="grid grid-cols-1 gap-gutter md:grid-cols-12">
          {savedOpportunities.map((opportunity, index) => (
            <OpportunityCard
              key={opportunity.id}
              opportunity={opportunity}
              isFeatured={index === 0 && opportunity.score >= 80}
              isSelected={selectedOpportunity?.id === opportunity.id && drawerOpen}
              className={index === 0 ? "md:col-span-8" : "md:col-span-4"}
              onOpen={openDrawer}
              onToggleSaved={handleToggleSaved}
            />
          ))}
        </section>
      ) : (
        <section className="flex min-h-[420px] flex-col items-center justify-center rounded border border-outline-variant bg-surface-container-lowest p-12 text-center">
          <MaterialIcon name="bookmark_border" className="text-on-surface-variant" size={64} />
          <h2 className="mt-4 font-display text-headline-md text-primary">Aucune opportunité sauvegardée</h2>
          <p className="mt-3 max-w-md text-body-md text-on-surface-variant">
            Sauvegarde une carte depuis la page Opportunités pour la retrouver ici.
          </p>
        </section>
      )}

      <OpportunityDetailDrawer
        opportunity={selectedOpportunity}
        isOpen={drawerOpen}
        onClose={closeDrawer}
        onStatusChange={handleStatusChange}
      />
    </main>
  );
}
