'use client';

import { useEffect, useState, use } from 'react';
import ScenarioForm from '@/components/ScenarioForm';
import { Scenario } from '@/lib/types';

export default function EditScenarioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [scenario, setScenario] = useState<Scenario | null>(null);

  useEffect(() => {
    fetch(`/api/scenarios/${id}`).then((r) => r.json()).then(setScenario);
  }, [id]);

  if (!scenario) {
    return <div className="text-center py-12 text-[var(--muted)]">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Edit {scenario.id}: {scenario.scenario_title}</h1>
      <ScenarioForm scenario={scenario} isEdit />
    </div>
  );
}
