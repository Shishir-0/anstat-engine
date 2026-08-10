'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ProposalDocument, ProposalStatus } from '@/lib/types/proposal';
import { Organization } from '@/lib/types/tenant';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import {
  Sparkles,
  ArrowLeft,
  Download,
  Send,
  Copy,
  History,
  CheckCircle2,
  FileText,
  DollarSign,
  Calendar,
  ShieldAlert,
  Layers,
  Bot,
  RefreshCw,
  Check,
  X,
  Building2,
  Printer,
} from 'lucide-react';
import { getProposalService } from '@/lib/services/registry';

interface ProposalEditorClientProps {
  initialProposal: ProposalDocument;
  organization: Organization | null;
}

const SECTION_NAV = [
  { id: 'cover', label: 'Cover & Title' },
  { id: 'summary', label: '1. Executive Summary' },
  { id: 'objectives', label: '2. Project Objectives' },
  { id: 'scope', label: '3. Scope of Work' },
  { id: 'deliverables', label: '4. Deliverables' },
  { id: 'tech', label: '5. Technology Stack' },
  { id: 'timeline', label: '6. Milestones & Timeline' },
  { id: 'pricing', label: '7. Rate-Card Pricing' },
  { id: 'assumptions', label: '8. Assumptions' },
  { id: 'risks', label: '9. Risk Assessment' },
  { id: 'outofscope', label: '10. Out of Scope' },
  { id: 'terms', label: '11. Terms & Next Steps' },
];

export function ProposalEditorClient({ initialProposal, organization }: ProposalEditorClientProps) {
  const router = useRouter();
  const [proposal, setProposal] = React.useState<ProposalDocument>(initialProposal);
  const [activeSection, setActiveSection] = React.useState('summary');
  const [saveState, setSaveState] = React.useState<'saved' | 'saving' | 'unsaved'>('saved');

  // Modals State
  const [isExportOpen, setIsExportOpen] = React.useState(false);
  const [isEmailOpen, setIsEmailOpen] = React.useState(false);
  const [isVersionOpen, setIsVersionOpen] = React.useState(false);
  const [isAiPreviewOpen, setIsAiPreviewOpen] = React.useState(false);

  // AI Assistant Action State
  const [aiAction, setAiAction] = React.useState<{ action: string; currentText: string; proposedText: string } | null>(null);

  // Export State
  const [isExporting, setIsExporting] = React.useState(false);
  const [exportedUrl, setExportedUrl] = React.useState<string | null>(null);

  // Email State
  const [emailTo, setEmailTo] = React.useState('sarah@vertexcommerce.com');
  const [emailSubject, setEmailSubject] = React.useState(`Proposal: ${proposal.title} — ${organization?.name || 'Northstar Studio'}`);
  const [emailBody, setEmailBody] = React.useState(`Hi Sarah,\n\nPlease find attached our rate-card backed Statement of Work proposal for the ${proposal.title}.\n\nBest regards,\nShishir Kumar`);
  const [isSendingEmail, setIsSendingEmail] = React.useState(false);

  // Update proposal helper
  const handleUpdateContent = (field: keyof ProposalDocument, value: any) => {
    setSaveState('saving');
    setProposal(prev => ({ ...prev, [field]: value }));
    setTimeout(() => {
      setSaveState('saved');
    }, 600);
  };

  // Trigger Contextual AI Action with Diff Preview (Rule #33)
  const triggerAiAction = (actionName: string, currentText: string, suggestedReplacement: string) => {
    setAiAction({
      action: actionName,
      currentText,
      proposedText: suggestedReplacement,
    });
    setIsAiPreviewOpen(true);
  };

  const applyAiAction = () => {
    if (aiAction) {
      handleUpdateContent('executiveSummary', aiAction.proposedText);
      setIsAiPreviewOpen(false);
      setAiAction(null);
    }
  };

  // Duplicate Action
  const handleDuplicate = async () => {
    const proposalService = getProposalService();
    const copy = await proposalService.duplicate(proposal.id);
    router.push(`/proposals/${copy.id}`);
  };

  // Status Change Handler
  const handleStatusChange = async (newStatus: ProposalStatus) => {
    const proposalService = getProposalService();
    const updated = await proposalService.changeStatus(proposal.id, newStatus);
    setProposal(updated);
  };

  // Export Trigger
  const handleRunExport = async (format: 'pdf' | 'docx') => {
    setIsExporting(true);
    const proposalService = getProposalService();
    setTimeout(async () => {
      const res = await proposalService.exportDocument(proposal.id, format);
      setExportedUrl(res.downloadUrl);
      setIsExporting(false);
    }, 1200);
  };

  // Email Trigger
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingEmail(true);
    const proposalService = getProposalService();
    setTimeout(async () => {
      await proposalService.sendProposal(proposal.id, {
        to: emailTo,
        subject: emailSubject,
        message: emailBody,
      });
      setIsSendingEmail(false);
      setIsEmailOpen(false);
      setProposal(prev => ({ ...prev, status: 'sent' }));
    }, 1000);
  };

  return (
    <div className="space-y-4">
      {/* TOPBAR DOCUMENT CONTROLS */}
      <div className="sticky top-14 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white/95 p-3 backdrop-blur-md rounded-lg shadow-xs">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push('/proposals')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-slate-900 truncate max-w-sm">{proposal.title}</h1>
              <Badge variant={proposal.status === 'won' ? 'success' : 'info'}>{proposal.status}</Badge>
            </div>
            <p className="text-[11px] text-slate-500">
              Client: <strong className="text-slate-700">{proposal.clientName}</strong> • Value: ${proposal.totalValueUsd.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Autosave State Indicator */}
          <span className="text-[11px] font-mono text-slate-400 mr-2 flex items-center gap-1">
            {saveState === 'saving' ? (
              <RefreshCw className="h-3 w-3 animate-spin text-amber-500" />
            ) : (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            )}
            <span className="capitalize">{saveState}</span>
          </span>

          {/* Status Change Selector */}
          <select
            value={proposal.status}
            onChange={(e) => handleStatusChange(e.target.value as ProposalStatus)}
            className="h-8 text-xs font-semibold rounded border border-slate-300 bg-white px-2 text-slate-700 focus:outline-none"
          >
            <option value="draft">Draft</option>
            <option value="generated">AI Generated</option>
            <option value="review">In Review</option>
            <option value="sent">Sent to Client</option>
            <option value="won">Mark Won</option>
            <option value="lost">Mark Lost</option>
          </select>

          <Button variant="outline" size="sm" onClick={() => setIsVersionOpen(true)} title="Version History">
            <History className="h-3.5 w-3.5" /> <span className="hidden sm:inline">v{proposal.version}</span>
          </Button>

          <Button variant="outline" size="sm" onClick={handleDuplicate} title="Duplicate">
            <Copy className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Duplicate</span>
          </Button>

          <Button variant="outline" size="sm" onClick={() => setIsExportOpen(true)}>
            <Download className="h-3.5 w-3.5 mr-1" /> Export
          </Button>

          <Button variant="primary" size="sm" onClick={() => setIsEmailOpen(true)}>
            <Send className="h-3.5 w-3.5 mr-1" /> Send SOW
          </Button>
        </div>
      </div>

      {/* 3-COLUMN EDITOR GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* COLUMN 1: LEFT SECTION NAVIGATOR (3 cols) */}
        <div className="lg:col-span-3 sticky top-32 space-y-1 bg-white p-3 rounded-lg border border-slate-200 text-xs">
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Document Sections
          </div>
          {SECTION_NAV.map((sec) => (
            <button
              key={sec.id}
              onClick={() => {
                setActiveSection(sec.id);
                const el = document.getElementById(`doc-sec-${sec.id}`);
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 font-medium transition-colors text-left cursor-pointer ${
                activeSection === sec.id
                  ? 'bg-emerald-50 text-emerald-900 font-semibold border-l-2 border-emerald-600'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span className="truncate">{sec.label}</span>
            </button>
          ))}
        </div>

        {/* COLUMN 2: CENTER DOCUMENT CANVAS (6 cols) */}
        <div className="lg:col-span-6 space-y-8 bg-white p-8 md:p-12 rounded-xl border border-slate-200 shadow-sm text-slate-900 min-h-[900px]">
          {/* Document Branded Header */}
          <div className="border-b border-slate-200 pb-6 flex items-center justify-between" id="doc-sec-cover">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-emerald-600 uppercase">
                {organization?.name || 'Northstar Software Studio'}
              </span>
              <h2 className="text-2xl font-bold tracking-tight mt-1 text-slate-900">{proposal.title}</h2>
              <p className="text-xs text-slate-500 mt-1">Prepared for: <strong className="text-slate-900">{proposal.clientName}</strong></p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold text-slate-400">STATEMENT OF WORK</span>
              <p className="text-xs font-bold text-emerald-700 font-mono mt-1">${proposal.totalValueUsd.toLocaleString()} USD</p>
            </div>
          </div>

          {/* Section 1: Executive Summary */}
          <div className="space-y-2" id="doc-sec-summary">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-1">
              1. Executive Summary
            </h3>
            <Textarea
              rows={4}
              value={proposal.executiveSummary}
              onChange={(e) => handleUpdateContent('executiveSummary', e.target.value)}
              className="text-xs text-slate-700 leading-relaxed border-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Section 2: Project Objectives */}
          <div className="space-y-2" id="doc-sec-objectives">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-1">
              2. Project Objectives
            </h3>
            <ul className="list-disc pl-5 text-xs text-slate-700 space-y-1">
              {proposal.objectives.map((obj, idx) => (
                <li key={idx}>{obj}</li>
              ))}
            </ul>
          </div>

          {/* Section 3: Scope of Work */}
          <div className="space-y-2" id="doc-sec-scope">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-1">
              3. Scope of Work
            </h3>
            <div className="space-y-1.5 text-xs text-slate-700">
              {proposal.scope.map((item, idx) => (
                <div key={idx} className="p-2 rounded bg-slate-50 border border-slate-100 flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Deliverables */}
          <div className="space-y-2" id="doc-sec-deliverables">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-1">
              4. Deliverables
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {proposal.deliverables.map((del) => (
                <div key={del.id} className="p-3 rounded-lg border border-slate-200 bg-white space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{del.title}</span>
                    <span className="font-mono text-slate-500 text-[11px]">{del.estimatedHours} Hours</span>
                  </div>
                  <p className="text-slate-600 text-[11px]">{del.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Tech Stack */}
          <div className="space-y-2" id="doc-sec-tech">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-1">
              5. Technology Stack
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {proposal.technologyStack.map((tech, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded bg-slate-100 font-mono text-[11px] text-slate-800 font-semibold border border-slate-200">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Section 6: Milestones & Visual Timeline */}
          <div className="space-y-3" id="doc-sec-timeline">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-1">
              6. Milestones & Timeline
            </h3>
            <div className="space-y-2">
              {proposal.milestones.map((m, idx) => (
                <div key={m.id} className="flex items-center justify-between p-3 rounded-md border border-slate-200 bg-slate-50/50 text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{m.name}</span>
                    <p className="text-[11px] text-slate-500">Duration: {m.estimatedWeeks} Weeks</p>
                  </div>
                  <span className="font-mono font-bold text-emerald-700">${m.amountUsd.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 7: Rate-Card Pricing Breakdown */}
          <div className="space-y-3" id="doc-sec-pricing">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-1">
              7. Commercial Pricing Breakdown
            </h3>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
                  <tr>
                    <th className="py-2 px-3">Role</th>
                    <th className="py-2 px-3">Hours</th>
                    <th className="py-2 px-3">Rate</th>
                    <th className="py-2 px-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {proposal.pricingBreakdown.map((item) => (
                    <tr key={item.id}>
                      <td className="py-2 px-3 font-semibold text-slate-900">{item.role}</td>
                      <td className="py-2 px-3 font-mono">{item.estimatedHours}h</td>
                      <td className="py-2 px-3 font-mono">${item.hourlyRateUsd}/hr</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                        ${(item.estimatedHours * item.hourlyRateUsd).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-emerald-50 border-t border-emerald-200 font-bold text-xs">
                  <tr>
                    <td colSpan={3} className="py-2.5 px-3 text-emerald-900">Total Fixed Contract Price</td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-900 text-sm">
                      ${proposal.totalValueUsd.toLocaleString()} USD
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Section 8: Assumptions & Risks */}
          <div className="space-y-3" id="doc-sec-assumptions">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-1">
              8. Assumptions & Risk Assessment
            </h3>
            <div className="space-y-2 text-xs text-slate-700">
              {proposal.assumptions.map((ass, idx) => (
                <p key={idx}>• {ass}</p>
              ))}
            </div>
          </div>

          {/* Section 9: Out of Scope */}
          <div className="space-y-2" id="doc-sec-outofscope">
            <h3 className="text-sm font-bold uppercase tracking-wider text-rose-900 border-b border-rose-100 pb-1">
              9. Out of Scope
            </h3>
            <div className="p-3 rounded bg-rose-50/50 border border-rose-200 space-y-1 text-xs text-rose-900">
              {proposal.outOfScope.map((oos, idx) => (
                <p key={idx}>• {oos}</p>
              ))}
            </div>
          </div>

          {/* Document Footer */}
          <div className="border-t border-slate-200 pt-6 text-[10px] text-slate-400 flex justify-between font-mono">
            <span>{organization?.name || 'Northstar Software Studio'}</span>
            <span>Confidential Proposal • Version {proposal.version}</span>
          </div>
        </div>

        {/* COLUMN 3: RIGHT CONTEXTUAL AI ASSISTANT (3 cols) */}
        <div className="lg:col-span-3 sticky top-32 space-y-4">
          <Card className="border-emerald-200 bg-emerald-50/20">
            <CardHeader className="py-3 flex flex-row items-center gap-2 border-b border-emerald-100">
              <Bot className="h-4 w-4 text-emerald-600" />
              <CardTitle className="text-xs">Contextual AI Assistant</CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-2">
              <p className="text-[11px] text-slate-600">Apply targeted AI refinements with side-by-side diff preview.</p>

              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs justify-start bg-white hover:bg-emerald-50"
                onClick={() =>
                  triggerAiAction(
                    'Make Executive Summary Concise',
                    proposal.executiveSummary,
                    'Northstar Studio will deliver a high-performance Next.js B2B platform with real-time SAP ERP integration, role-based wholesale checkout, and automated Stripe invoicing in 12 weeks.'
                  )
                }
              >
                <Sparkles className="h-3 w-3 text-emerald-600 mr-2" /> Make Concise
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs justify-start bg-white hover:bg-emerald-50"
                onClick={() =>
                  triggerAiAction(
                    'Add Technical Depth to SOW',
                    proposal.executiveSummary,
                    'Northstar Studio will engineer an enterprise-grade Omnichannel B2B platform utilizing Next.js 15 App Router, TypeScript strict typing, sub-150ms P95 API caching via Redis, and bi-directional REST webhooks with SAP ERP.'
                  )
                }
              >
                <Sparkles className="h-3 w-3 text-emerald-600 mr-2" /> Add Technical Depth
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI ACTION DIFF PREVIEW DIALOG (Rule #33) */}
      <Dialog
        isOpen={isAiPreviewOpen}
        onClose={() => setIsAiPreviewOpen(false)}
        title={`AI Action Preview: ${aiAction?.action}`}
        description="Review proposed AI text changes side-by-side before applying to the proposal."
        maxWidth="xl"
      >
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded border border-rose-200 bg-rose-50/30 space-y-1">
              <span className="font-bold text-rose-800 uppercase text-[10px]">Current Text</span>
              <p className="text-slate-700 leading-relaxed">{aiAction?.currentText}</p>
            </div>

            <div className="p-3 rounded border border-emerald-200 bg-emerald-50/50 space-y-1">
              <span className="font-bold text-emerald-800 uppercase text-[10px]">Proposed AI Text</span>
              <p className="text-emerald-950 font-medium leading-relaxed">{aiAction?.proposedText}</p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setIsAiPreviewOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={applyAiAction}>
              Apply Changes
            </Button>
          </div>
        </div>
      </Dialog>

      {/* EXPORT MODAL */}
      <Dialog
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        title="Export Proposal Document"
        description="Generate branded PDF or DOCX client document."
      >
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleRunExport('pdf')}
              className="p-4 rounded-lg border border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/50 text-center space-y-2 cursor-pointer"
            >
              <Printer className="h-6 w-6 text-emerald-600 mx-auto" />
              <span className="font-bold text-slate-900 block">Download PDF</span>
              <span className="text-[10px] text-slate-500">Client-ready branded document</span>
            </button>

            <button
              onClick={() => handleRunExport('docx')}
              className="p-4 rounded-lg border border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/50 text-center space-y-2 cursor-pointer"
            >
              <FileText className="h-6 w-6 text-emerald-600 mx-auto" />
              <span className="font-bold text-slate-900 block">Download DOCX</span>
              <span className="text-[10px] text-slate-500">Editable Word document</span>
            </button>
          </div>

          {isExporting && (
            <div className="p-3 bg-slate-50 rounded border text-center font-mono text-emerald-700">
              Applying workspace branding & generating document...
            </div>
          )}

          {exportedUrl && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-center">
              <span className="font-semibold text-emerald-900 block">✓ Export Ready!</span>
              <a href={exportedUrl} className="text-xs text-emerald-600 underline font-bold mt-1 inline-block">
                Click here to download file
              </a>
            </div>
          )}
        </div>
      </Dialog>

      {/* EMAIL DELIVERY MODAL */}
      <Dialog
        isOpen={isEmailOpen}
        onClose={() => setIsEmailOpen(false)}
        title="Send SOW Proposal to Client"
        description="Deliver document attachment to primary contact."
      >
        <form onSubmit={handleSendEmail} className="space-y-3">
          <Input label="Recipient Email" value={emailTo} onChange={(e) => setEmailTo(e.target.value)} required />
          <Input label="Subject" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} required />
          <Textarea label="Message" rows={4} value={emailBody} onChange={(e) => setEmailBody(e.target.value)} required />
          <div className="p-2.5 bg-slate-50 rounded border text-xs text-slate-600">
            Attachment: <strong>{proposal.title}.pdf</strong> (${proposal.totalValueUsd.toLocaleString()} USD)
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsEmailOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isSendingEmail}>
              Send Proposal SOW
            </Button>
          </div>
        </form>
      </Dialog>

      {/* VERSION HISTORY DIALOG */}
      <Dialog
        isOpen={isVersionOpen}
        onClose={() => setIsVersionOpen(false)}
        title="Proposal Version History"
        description="Audit timeline of document updates."
      >
        <div className="space-y-3 text-xs">
          {proposal.versions.map((v) => (
            <div key={v.id} className="p-3 rounded border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900">v{v.versionNumber} — {v.summary}</span>
                <p className="text-[10px] text-slate-500">Author: {v.author}</p>
              </div>
              <span className="font-mono text-[10px] text-slate-400">{new Date(v.createdAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      </Dialog>
    </div>
  );
}
