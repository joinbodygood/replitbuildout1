'use client';

import { CheckCircle, Clock, XCircle, HelpCircle, Lightbulb, ChevronDown, ChevronUp, ArrowRight, Phone, Shield } from 'lucide-react';
import { useState } from 'react';
import type { CoverageResult, MedicationResult } from '@/lib/insurance/confidence-engine';

interface Props {
  results: CoverageResult;
  onStartReview?: () => void;
}

const STATUS_CONFIG = {
  eligible: {
    label: 'Likely Covered',
    icon: CheckCircle,
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
  },
  pa_required: {
    label: 'PA Required',
    icon: Clock,
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
  },
  not_covered: {
    label: 'Not Covered',
    icon: XCircle,
    color: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
    dot: 'bg-red-500',
  },
  inconclusive: {
    label: 'Needs Review',
    icon: HelpCircle,
    color: 'text-slate-600',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    dot: 'bg-slate-400',
  },
};

const BUCKET_CONFIG = {
  green: {
    label: 'Good Coverage Outlook',
    description: 'Multiple high-confidence sources indicate coverage is likely. Proceed with your medical review.',
    bg: 'bg-emerald-50',
    border: 'border-emerald-300',
    text: 'text-emerald-800',
    icon: CheckCircle,
  },
  yellow: {
    label: 'Mixed Coverage Signals',
    description: "Results are mixed across sources. Our team will personally verify and identify your best pathway within 3 business days.",
    bg: 'bg-amber-50',
    border: 'border-amber-300',
    text: 'text-amber-800',
    icon: Clock,
  },
  red: {
    label: 'Coverage Unlikely with Your Plan',
    description: 'Your plan appears to exclude these medications. Self-pay options are available starting at $169/mo.',
    bg: 'bg-red-50',
    border: 'border-red-300',
    text: 'text-red-800',
    icon: XCircle,
  },
  processing: {
    label: 'Analysis Complete',
    description: 'Coverage check complete. Review your results below.',
    bg: 'bg-slate-50',
    border: 'border-slate-300',
    text: 'text-slate-800',
    icon: CheckCircle,
  },
};

function ConfidenceMeter({ score }: { score: number }) {
  const color =
    score >= 80 ? 'bg-emerald-500' :
    score >= 60 ? 'bg-amber-500' :
    score >= 40 ? 'bg-orange-500' :
    'bg-red-500';

  const textColor =
    score >= 80 ? 'text-emerald-700' :
    score >= 60 ? 'text-amber-700' :
    score >= 40 ? 'text-orange-700' :
    'text-red-700';

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-700`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className={`text-xs font-bold ${textColor} w-8 text-right`}>{score}%</span>
    </div>
  );
}

function MedCard({ med, index }: { med: MedicationResult; index: number }) {
  const [docsOpen, setDocsOpen] = useState(false);
  const s = STATUS_CONFIG[med.status] || STATUS_CONFIG.inconclusive;
  const Icon = s.icon;

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200 p-6 mb-4 shadow-sm`}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex justify-between items-start gap-3 mb-4 flex-wrap">
        <div>
          <h3 className="text-lg font-extrabold text-slate-900">{med.displayName}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{med.generic} · {med.manufacturer}</p>
          <p className="text-xs text-rose-500 font-semibold mt-1">{med.fdaIndication}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${s.color} ${s.bg} border ${s.border}`}>
            <Icon size={13} />
            {s.label}
          </span>
          <div className={`text-xl font-extrabold ${s.color} mt-1`}>{med.probabilityDisplay}</div>
          <div className="text-[10px] text-slate-400">est. approval probability</div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Confidence ({med.sourcesAgreeing}/{med.sourcesTotal} sources agree)
          </span>
          <span className="text-[10px] text-slate-400 capitalize">{med.confidenceLevel}</span>
        </div>
        <ConfidenceMeter score={med.confidenceScore} />
      </div>

      <div className={`text-sm px-3.5 py-2.5 ${s.bg} rounded-xl border-l-[3px] ${s.border} mb-3`}>
        <span className="font-semibold">Recommended pathway:</span>{' '}
        {med.recommendedIndication}
        {med.paRequired && (
          <span className={`ml-2 text-[10px] px-2 py-0.5 rounded font-bold ${s.bg} ${s.color} border ${s.border}`}>
            PA REQUIRED
          </span>
        )}
      </div>

      {med.diagnosisNote && (
        <div className="flex gap-2 text-xs px-3.5 py-2.5 bg-rose-50 rounded-xl mb-3 text-rose-700 font-semibold leading-relaxed">
          <Lightbulb size={14} className="mt-0.5 flex-shrink-0 text-rose-500" />
          <span>{med.diagnosisNote}</span>
        </div>
      )}

      {med.requiredDocumentation.length > 0 && (
        <div className="mb-4">
          <button
            onClick={() => setDocsOpen(o => !o)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors"
          >
            {docsOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            Required documentation ({med.requiredDocumentation.length} items)
          </button>
          {docsOpen && (
            <ul className="mt-2 space-y-1 pl-4">
              {med.requiredDocumentation.map((doc, i) => (
                <li key={i} className="text-xs text-slate-600 list-disc">{doc}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="flex justify-end">
        <button
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-opacity hover:opacity-90 ${
            med.status === 'not_covered'
              ? 'bg-slate-900 text-white'
              : 'bg-rose-600 text-white'
          }`}
        >
          {med.nextStep.label}
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}

export default function CoverageResults({ results, onStartReview }: Props) {
  const bucket = BUCKET_CONFIG[results.bucket] || BUCKET_CONFIG.processing;
  const BucketIcon = bucket.icon;

  return (
    <div>
      <div className={`${bucket.bg} border ${bucket.border} rounded-2xl p-5 mb-6`}>
        <div className="flex items-start gap-3">
          <BucketIcon size={20} className={`${bucket.text} mt-0.5 flex-shrink-0`} />
          <div>
            <h3 className={`font-extrabold ${bucket.text} mb-1`}>{bucket.label}</h3>
            <p className={`text-sm ${bucket.text} opacity-90 leading-relaxed`}>{bucket.description}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t border-current border-opacity-20">
          <div className="text-xs">
            <span className={`font-bold ${bucket.text}`}>{results.insurance.payer}</span>
            {results.insurance.plan && (
              <span className={`${bucket.text} opacity-70`}> · {results.insurance.plan}</span>
            )}
          </div>
          <div className={`text-xs ${bucket.text} opacity-70`}>{results.sourcesUsed} sources checked</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2.5 mb-6">
        {(Object.entries(STATUS_CONFIG) as Array<[keyof typeof STATUS_CONFIG, typeof STATUS_CONFIG[keyof typeof STATUS_CONFIG]]>)
          .filter(([k]) => k !== 'inconclusive')
          .map(([key, cfg]) => {
            const Ic = cfg.icon;
            const descriptions: Record<string, string> = {
              eligible: 'Your plan covers this. Minimal friction.',
              pa_required: 'Coverage possible — we handle the PA.',
              not_covered: 'Not on formulary. Self-pay available.',
            };
            return (
              <div key={key} className={`${cfg.bg} border ${cfg.border} rounded-xl p-3 text-center`}>
                <Ic size={16} className={`${cfg.color} mx-auto mb-1.5`} />
                <div className={`text-xs font-bold ${cfg.color} mb-1`}>{cfg.label}</div>
                <div className="text-[10px] text-slate-500 leading-snug">{descriptions[key]}</div>
              </div>
            );
          })}
      </div>

      {results.medications.map((med, i) => (
        <MedCard key={med.medication} med={med} index={i} />
      ))}

      {results.insurance.pbmPhone && (
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-6 text-sm">
          <Phone size={15} className="text-slate-400 flex-shrink-0" />
          <div>
            <span className="font-semibold text-slate-700">{results.insurance.pbm || 'PBM'} Member Services:</span>{' '}
            <span className="text-slate-600">{results.insurance.pbmPhone}</span>
          </div>
        </div>
      )}

      <div className="bg-slate-900 rounded-2xl p-6 text-center mb-4">
        <p className="text-rose-400 text-xs font-bold uppercase tracking-wider mb-1">Not sure which option is right for you?</p>
        <h3 className="text-white font-extrabold text-lg mb-2">Dr. Linda's team reviews every case personally</h3>
        <p className="text-slate-400 text-sm leading-relaxed mb-4">
          Whether insurance or self-pay, we'll find the best path forward. Expect a follow-up from our team within 3 business days.
        </p>
        {onStartReview && (
          <button
            onClick={onStartReview}
            className="inline-flex items-center gap-2 bg-rose-600 text-white font-bold text-sm px-6 py-2.5 rounded-full hover:bg-rose-700 transition-colors"
          >
            Start My Medical Review <ArrowRight size={14} />
          </button>
        )}
      </div>

      <div className="flex items-start gap-2 text-[10px] text-slate-400 leading-relaxed">
        <Shield size={12} className="text-slate-300 flex-shrink-0 mt-0.5" />
        <p>
          Results based on real-time eligibility data, published formulary policies, Body Good historical case data, and FDA-approved indications.
          Confidence scores reflect agreement across {results.sourcesUsed} independent data sources. Actual coverage may vary.
          PA outcomes depend on clinical documentation. This check is non-refundable.
        </p>
      </div>
    </div>
  );
}
