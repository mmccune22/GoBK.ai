import type { EvaluationContext, PublicResult } from '../core/types.js';
import { initialState, unavailableResult } from '../core/stages.js';
import { assertPublicResult } from '../core/output.js';
import { createCheckupGraph } from './graph.js';

const graph = createCheckupGraph();
function unsafeDiagnosticsRequested(): boolean {
  const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {};
  return ['LANGSMITH_TRACING', 'LANGCHAIN_TRACING', 'LANGCHAIN_TRACING_V2', 'LANGCHAIN_VERBOSE'].some(key => {
    const value = env[key]?.toLowerCase();
    return !!value && value !== 'false' && value !== '0';
  });
}
export async function evaluateCheckup(raw: unknown, context: EvaluationContext, signal?: AbortSignal): Promise<PublicResult> {
  try {
    // Ambient verbosity can log inputs even with callbacks: []; refuse it along with tracing.
    if (unsafeDiagnosticsRequested()) return unavailableResult(raw, context, 'langgraph');
    const config = signal ? { recursionLimit: 20, callbacks: [], signal } : { recursionLimit: 20, callbacks: [] };
    const state = await graph.invoke(initialState(raw, context, 'langgraph'), config);
    assertPublicResult(state.result);
    return state.result; // Never return raw graph state or stream graph values.
  } catch {
    return unavailableResult(raw, context, 'langgraph');
  }
}
