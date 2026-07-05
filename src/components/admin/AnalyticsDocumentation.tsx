'use client';

import React from 'react';
import { Accordion } from '@/components/ui/Accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { EVENTS, PARAMETERS, EventDefinition } from '@/lib/analytics/registry';
import { LucideCopy } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const AnalyticsDocumentation: React.FC = () => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Accordion title="Analytics Documentation" defaultOpen={false}>
      <div className="space-y-6 pt-4">
        
        {/* Section 1: Events */}
        <section>
          <h3 className="font-bold text-slate-900 mb-4">Implemented Events</h3>
          {EVENTS.map((event: EventDefinition) => (
            <Accordion key={event.name} title={`▼ ${event.name}`}>
              <div className="space-y-4">
                <p><strong>Description:</strong> {event.description}</p>
                <div>
                  <strong>Parameters:</strong>
                  <ul className="list-disc pl-5 mt-2">
                    {event.parameters.map(paramName => (
                      <li key={paramName}>{paramName}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </Accordion>
          ))}
        </section>

        {/* Section 2: Parameters */}
        <section>
          <h3 className="font-bold text-slate-900 mb-4">Available Event Parameters</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Parameter</TableHead>
                  <TableHead>Data Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Example</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.values(PARAMETERS).map(param => (
                  <TableRow key={param.name}>
                    <TableCell className="font-mono">{param.name}</TableCell>
                    <TableCell>{param.dataType}</TableCell>
                    <TableCell>{param.description}</TableCell>
                    <TableCell className="font-mono">{String(param.exampleValue)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>

        {/* Section 3: Dimensions Guide */}
        <section className="bg-slate-50 p-6 rounded-lg border border-slate-200">
          <h3 className="font-bold text-slate-900 mb-4">GA4 Custom Dimensions Guide</h3>
          <p className="text-sm text-slate-600 mb-4">To register a custom dimension in Google Analytics 4:</p>
          <ol className="list-decimal pl-5 text-sm text-slate-600 space-y-2">
            <li>GA4 Admin &rarr; Custom Definitions &rarr; Create Custom Dimension</li>
            <li>Dimension Name: <span className="font-semibold">e.g. Page Type</span></li>
            <li>Scope: <span className="font-semibold">Event</span></li>
            <li>Event Parameter: <span className="font-semibold">page_type</span></li>
          </ol>
        </section>

        {/* Section 4: Sample Payload */}
        <section>
          <h3 className="font-bold text-slate-900 mb-4">Sample Event Payload</h3>
          <div className="relative bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(JSON.stringify(EVENTS[0].samplePayload, null, 2))}
              className="absolute top-2 right-2 text-slate-400 hover:text-white"
            >
              <LucideCopy className="w-4 h-4" />
            </Button>
            <pre>{JSON.stringify(EVENTS[0].samplePayload, null, 2)}</pre>
          </div>
        </section>
      </div>
    </Accordion>
  );
};
