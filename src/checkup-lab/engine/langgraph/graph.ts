import { Annotation, StateGraph, START, END } from '@langchain/langgraph';
import type { EngineState, RuleProvider } from '../core/types.js';
import { disabledRuleProvider } from '../core/rules.js';
import { createStages, routeAfterSnapshot } from '../core/stages.js';

// Replacement channels, not append reducers. Every invocation receives fresh state.
const State = Annotation.Root({
  rawInput: Annotation<EngineState['rawInput']>(),
  context: Annotation<EngineState['context']>(),
  engine: Annotation<EngineState['engine']>(),
  validation: Annotation<EngineState['validation']>(),
  activeRuleIds: Annotation<EngineState['activeRuleIds']>(),
  plan: Annotation<EngineState['plan']>(),
  snapshot: Annotation<EngineState['snapshot']>(),
  findings: Annotation<EngineState['findings']>(),
  limitations: Annotation<EngineState['limitations']>(),
  readingTopics: Annotation<EngineState['readingTopics']>(),
  nodeIds: Annotation<EngineState['nodeIds']>(),
  result: Annotation<EngineState['result']>(),
});

export function createCheckupGraph(provider: RuleProvider = disabledRuleProvider) {
  const nodes = createStages(provider);
  return new StateGraph(State)
    .addNode('validate_and_preserve_urgency', nodes.validate_and_preserve_urgency)
    .addNode('load_capabilities', nodes.load_capabilities)
    .addNode('plan_supported_work', nodes.plan_supported_work)
    .addNode('calculate_snapshot', nodes.calculate_snapshot)
    .addNode('evaluate_reviewed_rules', nodes.evaluate_reviewed_rules)
    .addNode('record_legal_limits', nodes.record_legal_limits)
    .addNode('assemble_findings', nodes.assemble_findings)
    .addNode('render_result', nodes.render_result)
    .addNode('validate_public_result', nodes.validate_public_result)
    .addEdge(START, 'validate_and_preserve_urgency')
    .addEdge('validate_and_preserve_urgency', 'load_capabilities')
    .addEdge('load_capabilities', 'plan_supported_work')
    .addEdge('plan_supported_work', 'calculate_snapshot')
    .addConditionalEdges('calculate_snapshot', routeAfterSnapshot, {
      evaluate_reviewed_rules: 'evaluate_reviewed_rules',
      record_legal_limits: 'record_legal_limits',
    })
    .addEdge('evaluate_reviewed_rules', 'assemble_findings')
    .addEdge('record_legal_limits', 'assemble_findings')
    .addEdge('assemble_findings', 'render_result')
    .addEdge('render_result', 'validate_public_result')
    .addEdge('validate_public_result', END)
    .compile(); // No checkpointer, database, model, agent, or cross-request memory.
}
