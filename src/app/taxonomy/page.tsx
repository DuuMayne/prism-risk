'use client';

import { useEffect, useState } from 'react';
import { TaxonomyEntry } from '@/lib/types';
import Tooltip, { InfoIcon } from '@/components/Tooltip';

const DIMENSIONS = [
  'Scenario Family', 'Threat Community', 'Threat Action',
  'Loss Event Family', 'Loss Form', 'Control Type',
];

const DIMENSION_DESCRIPTIONS: Record<string, string> = {
  'Scenario Family': 'Portfolio rollup categories for risk scenarios',
  'Threat Community': 'Sources of threat events that drive loss scenarios',
  'Threat Action': 'Specific actions or methods that create loss events',
  'Loss Event Family': 'Categories of loss events by their primary nature',
  'Loss Form': 'How losses materialize in financial terms',
  'Control Type': 'Categories of controls by their function in the risk model',
};

const DIMENSION_TOOLTIPS: Record<string, string> = {
  'Scenario Family': 'High-level grouping used for portfolio rollups and aggregate reporting. Each scenario belongs to one family.',
  'Threat Community': 'Who or what drives this type of event. Helps determine frequency assumptions and relevant controls.',
  'Threat Action': 'The specific action or method used. Drives vulnerability estimates and control mapping.',
  'Loss Event Family': 'What type of loss occurs. Frames the magnitude estimation and downstream impacts.',
  'Loss Form': 'How the loss shows up financially. Multiple forms can apply to a single scenario.',
  'Control Type': 'Functional role of a control in the risk model. Determines whether it reduces frequency or magnitude.',
};

const DIMENSION_COLORS: Record<string, string> = {
  'Scenario Family': 'badge-blue',
  'Threat Community': 'badge-red',
  'Threat Action': 'badge-yellow',
  'Loss Event Family': 'badge-purple',
  'Loss Form': 'badge-green',
  'Control Type': 'badge-gray',
};

interface FormState {
  id?: number;
  dimension: string;
  code: string;
  value: string;
  definition: string;
  usage_notes: string;
  example: string;
}

const emptyForm = (dimension: string): FormState => ({
  dimension,
  code: '',
  value: '',
  definition: '',
  usage_notes: '',
  example: '',
});

export default function TaxonomyPage() {
  const [taxonomy, setTaxonomy] = useState<TaxonomyEntry[]>([]);
  const [activeDimension, setActiveDimension] = useState('Scenario Family');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm('Scenario Family'));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/taxonomy').then((r) => r.json()).then((data) => {
      setTaxonomy(data);
      setLoading(false);
    });
  }, []);

  const filtered = taxonomy.filter((t) => t.dimension === activeDimension);

  const startCreate = () => {
    setForm(emptyForm(activeDimension));
    setShowForm(true);
  };

  const startEdit = (entry: TaxonomyEntry) => {
    setForm({
      id: entry.id,
      dimension: entry.dimension,
      code: entry.code,
      value: entry.value,
      definition: entry.definition || '',
      usage_notes: entry.usage_notes || '',
      example: entry.example || '',
    });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (form.id) {
        const res = await fetch('/api/taxonomy', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        const updated = await res.json();
        setTaxonomy((prev) => prev.map((t) => t.id === updated.id ? updated : t));
      } else {
        const res = await fetch('/api/taxonomy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        const created = await res.json();
        setTaxonomy((prev) => [...prev, created]);
      }
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (entry: TaxonomyEntry) => {
    if (!confirm(`Delete "${entry.value}" (${entry.code})? This cannot be undone.`)) return;
    await fetch(`/api/taxonomy?id=${entry.id}`, { method: 'DELETE' });
    setTaxonomy((prev) => prev.filter((t) => t.id !== entry.id));
  };

  if (loading) {
    return <div className="text-center py-12 text-[var(--muted)]">Loading taxonomy...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Taxonomy</h1>
          <p className="text-sm text-[var(--muted)] mt-1">Controlled vocabulary for risk scenario classification</p>
        </div>
        <button onClick={startCreate} className="btn btn-primary">+ Add Entry</button>
      </div>

      <div className="flex flex-wrap gap-2">
        {DIMENSIONS.map((d) => (
          <button
            key={d}
            onClick={() => { setActiveDimension(d); setShowForm(false); }}
            className={`btn text-sm ${activeDimension === d ? 'btn-primary' : 'btn-secondary'}`}
          >
            {d}
            <span className={`badge ${DIMENSION_COLORS[d]} ml-1`}>
              {taxonomy.filter((t) => t.dimension === d).length}
            </span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
        <span>{DIMENSION_DESCRIPTIONS[activeDimension]}</span>
        <Tooltip content={DIMENSION_TOOLTIPS[activeDimension]}>
          <InfoIcon />
        </Tooltip>
      </div>

      {/* Create / Edit Form */}
      {showForm && (
        <form onSubmit={handleSave} className="card space-y-3">
          <h3 className="text-sm font-semibold">{form.id ? 'Edit Entry' : 'New Entry'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="label">Dimension</label>
              <select className="input" value={form.dimension}
                onChange={(e) => setForm((f) => ({ ...f, dimension: e.target.value }))}>
                {DIMENSIONS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="label flex items-center gap-1.5">
                Code *
                <Tooltip content="A short unique identifier (e.g., TC01, TA05, LF03). Used for compact reference in tables and exports.">
                  <InfoIcon />
                </Tooltip>
              </label>
              <input className="input" required value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                placeholder="e.g., TC14" />
            </div>
            <div>
              <label className="label flex items-center gap-1.5">
                Value *
                <Tooltip content="The human-readable name that appears in dropdowns and scenario forms.">
                  <InfoIcon />
                </Tooltip>
              </label>
              <input className="input" required value={form.value}
                onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                placeholder="Display name" />
            </div>
          </div>
          <div>
            <label className="label flex items-center gap-1.5">
              Definition
              <Tooltip content="A concise explanation of what this taxonomy value means. Helps users select the correct classification.">
                <InfoIcon />
              </Tooltip>
            </label>
            <textarea className="input" rows={2} value={form.definition}
              onChange={(e) => setForm((f) => ({ ...f, definition: e.target.value }))}
              placeholder="What does this value mean?" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="label flex items-center gap-1.5">
                Usage Notes
                <Tooltip content="Guidance on when to select this value vs. similar alternatives. Helps maintain consistency across analysts.">
                  <InfoIcon />
                </Tooltip>
              </label>
              <input className="input" value={form.usage_notes}
                onChange={(e) => setForm((f) => ({ ...f, usage_notes: e.target.value }))}
                placeholder="When to use this value" />
            </div>
            <div>
              <label className="label flex items-center gap-1.5">
                Example
                <Tooltip content="A concrete real-world example that illustrates this taxonomy value in practice.">
                  <InfoIcon />
                </Tooltip>
              </label>
              <input className="input" value={form.example}
                onChange={(e) => setForm((f) => ({ ...f, example: e.target.value }))}
                placeholder="Real-world example" />
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : form.id ? 'Update' : 'Create'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      {/* Taxonomy entries */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="card text-center py-8 text-[var(--muted)]">
            No entries in this dimension yet.
          </div>
        )}
        {filtered.map((t) => (
          <div key={t.id} className="card p-4 group">
            <div className="flex items-start gap-3">
              <span className="font-mono text-xs text-[var(--muted)] bg-gray-100 px-2 py-0.5 rounded shrink-0 mt-0.5">{t.code}</span>
              <div className="flex-1 min-w-0">
                <div className="font-medium">{t.value}</div>
                {t.definition && (
                  <p className="text-sm text-[var(--muted)] mt-1">{t.definition}</p>
                )}
                {(t.usage_notes || t.example) && (
                  <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2 text-xs">
                    {t.usage_notes && (
                      <span><span className="font-medium text-[var(--foreground)]">Usage:</span> {t.usage_notes}</span>
                    )}
                    {t.example && (
                      <span><span className="font-medium text-[var(--foreground)]">Example:</span> {t.example}</span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button onClick={() => startEdit(t)} className="btn btn-secondary text-xs py-1 px-2">Edit</button>
                <button onClick={() => handleDelete(t)} className="btn btn-danger text-xs py-1 px-2">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
