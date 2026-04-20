'use client';

import ScenarioForm from '@/components/ScenarioForm';

export default function NewScenarioPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">New Risk Scenario</h1>
      <ScenarioForm />
    </div>
  );
}
