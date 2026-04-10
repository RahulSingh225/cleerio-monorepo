'use client';

import { redirect } from 'next/navigation';

// V2: Workflow rules have been replaced by Journeys
export default function WorkflowsRedirect() {
  redirect('/journeys');
}
