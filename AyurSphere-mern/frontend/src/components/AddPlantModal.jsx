import { useState } from 'react';
import { request } from '../api/client.js';
import '../styles/addPlantModal.css';

const categoryOptions = [
  'Medicinal', 'Adaptogen', 'Purifier', 'Brain Tonic', 'Healing',
  'Digestive', 'Anti-inflammatory', 'Immunity', 'Respiratory', 'Cardiac',
  'Calming', 'Hair Care', 'Kidney Health', 'Women Health', 'Metabolic',
  'Nervine', 'Rejuvenation', 'Soothing', 'Skin Care', 'Cooling', 'Energy',
  'Liver Health', 'Urinary Health',
];

const emptyForm = {
  plantName: '',
  scientificName: '',
  category: '',
  region: 'South Asia, India',
  uses: '',
  description: '',
  aka: '',
  imagePath: '',

  /* Overview points */
  overview1: '', overview2: '', overview3: '',
  overview4: '', overview5: '', overview6: '',

  /* Diseases */
  diseasesText: '',

  /* Parts used (up to 4) */
  part1Name: '', part1Uses: '',
  part2Name: '', part2Uses: '',
  part3Name: '', part3Uses: '',
  part4Name: '', part4Uses: '',

  /* Usage methods (up to 4) */
  method1Emoji: '🍵', method1Name: '', method1Desc: '',
  method2Emoji: '💊', method2Name: '', method2Desc: '',
  method3Emoji: '🧃', method3Name: '', method3Desc: '',
  method4Emoji: '🧴', method4Name: '', method4Desc: '',

  /* Ayurvedic profile */
  rasa: '', virya: '', vipaka: '', dosha: '',

  /* Contraindications */
  contraindications: '',
};

const AddPlantModal = ({ isOpen, onClose, onPlantAdded }) => {
  const [form, setForm] = useState({ ...emptyForm });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  if (!isOpen) return null;

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (!form.plantName.trim() || !form.scientificName.trim()) {
      setError('Plant name and scientific name are required.');
      return;
    }

    setSubmitting(true);
    setError('');

    /* Build the structured data for the API */
    const overview = [form.overview1, form.overview2, form.overview3, form.overview4, form.overview5, form.overview6]
      .filter(Boolean);

    const diseases = form.diseasesText
      .split(',').map(d => d.trim()).filter(Boolean);

    const partsUsed = [
      { part: form.part1Name, uses: form.part1Uses },
      { part: form.part2Name, uses: form.part2Uses },
      { part: form.part3Name, uses: form.part3Uses },
      { part: form.part4Name, uses: form.part4Uses },
    ].filter(p => p.part.trim());

    const usageMethods = [
      { emoji: form.method1Emoji, name: form.method1Name, desc: form.method1Desc },
      { emoji: form.method2Emoji, name: form.method2Name, desc: form.method2Desc },
      { emoji: form.method3Emoji, name: form.method3Name, desc: form.method3Desc },
      { emoji: form.method4Emoji, name: form.method4Name, desc: form.method4Desc },
    ].filter(m => m.name.trim());

    const ayurvedicProfile = {
      rasa: form.rasa, virya: form.virya, vipaka: form.vipaka, dosha: form.dosha,
    };

    const body = {
      plantName: form.plantName.trim(),
      scientificName: form.scientificName.trim(),
      description: form.description.trim(),
      uses: form.uses.trim(),
      imagePath: form.imagePath.trim(),
      category: form.category,
      aka: form.aka.trim(),
      overview,
      diseases,
      partsUsed,
      usageMethods,
      ayurvedicProfile,
    };

    try {
      await request('/plants', { method: 'POST', body });
      setForm({ ...emptyForm });
      setStep(1);
      onPlantAdded?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to add plant');
    } finally {
      setSubmitting(false);
    }
  };

  const totalSteps = 4;

  return (
    <div className="apm-overlay" onClick={onClose}>
      <div className="apm-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="apm-header">
          <div className="apm-header-left">
            <i className="fas fa-seedling apm-header-icon" />
            <div>
              <h2>Add New Plant</h2>
              <p>Share your knowledge about medicinal plants</p>
            </div>
          </div>
          <button className="apm-close" onClick={onClose}>
            <i className="fas fa-times" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="apm-steps">
          {['Basic Info', 'Overview & Diseases', 'Parts & Usage', 'Ayurvedic Profile'].map((label, i) => (
            <button
              key={i}
              className={`apm-step ${step === i + 1 ? 'apm-step--active' : ''} ${step > i + 1 ? 'apm-step--done' : ''}`}
              onClick={() => setStep(i + 1)}
            >
              <span className="apm-step-num">{step > i + 1 ? '✓' : i + 1}</span>
              <span className="apm-step-label">{label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="apm-body">
          {error && <div className="apm-error"><i className="fas fa-exclamation-circle" /> {error}</div>}

          {/* ── STEP 1: Basic Info ── */}
          {step === 1 && (
            <div className="apm-step-panel apm-animate">
              <div className="apm-row">
                <div className="apm-field">
                  <label><i className="fas fa-leaf" /> Plant Name <span className="apm-req">*</span></label>
                  <input placeholder="e.g., Turmeric" value={form.plantName} onChange={e => update('plantName', e.target.value)} />
                </div>
                <div className="apm-field">
                  <label><i className="fas fa-flask" /> Scientific Name <span className="apm-req">*</span></label>
                  <input placeholder="e.g., Curcuma longa" value={form.scientificName} onChange={e => update('scientificName', e.target.value)} />
                </div>
              </div>

              <div className="apm-row">
                <div className="apm-field">
                  <label><i className="fas fa-tag" /> Category</label>
                  <select value={form.category} onChange={e => update('category', e.target.value)}>
                    <option value="">Select category...</option>
                    {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="apm-field">
                  <label><i className="fas fa-map-marker-alt" /> Also Known As</label>
                  <input placeholder="e.g., Holy Basil, Queen of Herbs" value={form.aka} onChange={e => update('aka', e.target.value)} />
                </div>
              </div>

              <div className="apm-field">
                <label><i className="fas fa-tags" /> Therapeutic Uses</label>
                <input placeholder="e.g., Anti-inflammatory, Immunity, Joint health (comma separated)" value={form.uses} onChange={e => update('uses', e.target.value)} />
                <small>Separate multiple uses with commas</small>
              </div>

              <div className="apm-field">
                <label><i className="fas fa-align-left" /> Short Description</label>
                <textarea placeholder="Brief description of the plant..." rows={3} value={form.description} onChange={e => update('description', e.target.value)} />
              </div>

              <div className="apm-field">
                <label><i className="fas fa-image" /> Image Path</label>
                <input placeholder="e.g., images/turmeric.jpg" value={form.imagePath} onChange={e => update('imagePath', e.target.value)} />
                <small>Path to plant image in the public folder</small>
              </div>
            </div>
          )}

          {/* ── STEP 2: Overview & Diseases ── */}
          {step === 2 && (
            <div className="apm-step-panel apm-animate">
              <div className="apm-section-title">
                <i className="fas fa-book-open" /> Overview / Key Facts
                <span className="apm-hint">Add detailed points about this plant (at least 3 recommended)</span>
              </div>

              {[1, 2, 3, 4, 5, 6].map(n => (
                <div key={n} className="apm-field apm-field--numbered">
                  <span className="apm-field-num">{n}</span>
                  <input
                    placeholder={n <= 3 ? `Key fact #${n} about this plant...` : `Additional fact #${n} (optional)...`}
                    value={form[`overview${n}`]}
                    onChange={e => update(`overview${n}`, e.target.value)}
                  />
                </div>
              ))}

              <div className="apm-divider" />

              <div className="apm-field">
                <label><i className="fas fa-notes-medical" /> Diseases & Conditions It Treats</label>
                <textarea
                  placeholder="e.g., Common cold & flu, Diabetes, Arthritis, Skin disorders..."
                  rows={3}
                  value={form.diseasesText}
                  onChange={e => update('diseasesText', e.target.value)}
                />
                <small>Separate each disease/condition with a comma</small>
              </div>
            </div>
          )}

          {/* ── STEP 3: Parts & Usage ── */}
          {step === 3 && (
            <div className="apm-step-panel apm-animate">
              <div className="apm-section-title">
                <i className="fas fa-cut" /> Parts Used
                <span className="apm-hint">Which parts of the plant are used and for what</span>
              </div>

              {[1, 2, 3, 4].map(n => (
                <div key={n} className="apm-part-row">
                  <div className="apm-field apm-field--sm">
                    <label>Part {n}</label>
                    <input placeholder="e.g., Root, Leaves" value={form[`part${n}Name`]} onChange={e => update(`part${n}Name`, e.target.value)} />
                  </div>
                  <div className="apm-field apm-field--lg">
                    <label>What it's used for</label>
                    <input placeholder="e.g., Used as powder for strength and immunity" value={form[`part${n}Uses`]} onChange={e => update(`part${n}Uses`, e.target.value)} />
                  </div>
                </div>
              ))}

              <div className="apm-divider" />

              <div className="apm-section-title">
                <i className="fas fa-mortar-pestle" /> How to Use / Home Remedies
                <span className="apm-hint">Add specific preparation methods</span>
              </div>

              {[1, 2, 3, 4].map(n => (
                <div key={n} className="apm-method-row">
                  <div className="apm-field apm-field--emoji">
                    <label>Icon</label>
                    <input value={form[`method${n}Emoji`]} onChange={e => update(`method${n}Emoji`, e.target.value)} maxLength={2} />
                  </div>
                  <div className="apm-field apm-field--md">
                    <label>Method Name</label>
                    <input placeholder={`e.g., ${['Herbal Tea', 'Powder Form', 'Fresh Juice', 'External Paste'][n - 1]}`} value={form[`method${n}Name`]} onChange={e => update(`method${n}Name`, e.target.value)} />
                  </div>
                  <div className="apm-field apm-field--xl">
                    <label>Instructions</label>
                    <input placeholder="How to prepare and use..." value={form[`method${n}Desc`]} onChange={e => update(`method${n}Desc`, e.target.value)} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── STEP 4: Ayurvedic Profile ── */}
          {step === 4 && (
            <div className="apm-step-panel apm-animate">
              <div className="apm-section-title">
                <i className="fas fa-om" /> Ayurvedic Profile
                <span className="apm-hint">Classical Ayurvedic properties of the plant</span>
              </div>

              <div className="apm-row">
                <div className="apm-field">
                  <label>Rasa (Taste)</label>
                  <input placeholder="e.g., Pungent, Bitter" value={form.rasa} onChange={e => update('rasa', e.target.value)} />
                </div>
                <div className="apm-field">
                  <label>Virya (Potency)</label>
                  <input placeholder="e.g., Heating or Cooling" value={form.virya} onChange={e => update('virya', e.target.value)} />
                </div>
              </div>

              <div className="apm-row">
                <div className="apm-field">
                  <label>Vipaka (Post-digestive)</label>
                  <input placeholder="e.g., Sweet, Pungent" value={form.vipaka} onChange={e => update('vipaka', e.target.value)} />
                </div>
                <div className="apm-field">
                  <label>Dosha Effect</label>
                  <input placeholder="e.g., Balances Kapha & Vata" value={form.dosha} onChange={e => update('dosha', e.target.value)} />
                </div>
              </div>

              <div className="apm-divider" />

              <div className="apm-field">
                <label><i className="fas fa-exclamation-triangle" /> Contraindications / Warnings</label>
                <textarea
                  placeholder="e.g., Avoid during pregnancy, May interact with blood thinners..."
                  rows={3}
                  value={form.contraindications}
                  onChange={e => update('contraindications', e.target.value)}
                />
              </div>

              {/* Summary preview */}
              <div className="apm-preview">
                <h4><i className="fas fa-eye" /> Preview</h4>
                <div className="apm-preview-card">
                  <strong>{form.plantName || 'Plant Name'}</strong>
                  <em>{form.scientificName || 'Scientific Name'}</em>
                  {form.aka && <span className="apm-preview-aka">— {form.aka}</span>}
                  <p>{form.description || 'Description will appear here...'}</p>
                  {form.uses && (
                    <div className="apm-preview-tags">
                      {form.uses.split(',').map((u, i) => <span key={i} className="apm-preview-tag">{u.trim()}</span>)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="apm-footer">
          <div className="apm-footer-left">
            {step > 1 && (
              <button className="apm-btn apm-btn--outline" onClick={() => setStep(step - 1)}>
                <i className="fas fa-arrow-left" /> Previous
              </button>
            )}
          </div>
          <div className="apm-footer-right">
            <button className="apm-btn apm-btn--ghost" onClick={onClose}>
              <i className="fas fa-times" /> Cancel
            </button>
            {step < totalSteps ? (
              <button className="apm-btn apm-btn--primary" onClick={() => setStep(step + 1)}>
                Next <i className="fas fa-arrow-right" />
              </button>
            ) : (
              <button className="apm-btn apm-btn--primary apm-btn--submit" onClick={handleSubmit} disabled={submitting}>
                {submitting ? <><i className="fas fa-spinner fa-spin" /> Adding...</> : <><i className="fas fa-plus" /> Add Plant</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPlantModal;
