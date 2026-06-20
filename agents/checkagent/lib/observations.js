function compactObservation(observation) {
  if (!observation) return undefined;
  return {
    providerId: observation.providerId,
    url: observation.url,
    summary: observation.summary,
    visibleText: (observation.visibleText || []).slice(0, 80),
    data: {
      title: observation.data?.title,
      elements: (observation.data?.elements || []).slice(0, 80),
      markdown: observation.data?.markdown ? String(observation.data.markdown).slice(0, 4000) : undefined
    }
  };
}

function buildAutoTestingNotes({ message, trace, llmTrace, suggestedRefinements }) {
  const notes = {
    message: message || "",
    trace: (trace || []).map((item) => ({
      stepId: item.stepId,
      status: item.status,
      message: item.message,
      candidate: item.candidate,
      resolutionConfidence: item.resolutionConfidence,
      observation: compactObservation(item.observationAfter || item.observationBefore)
    })),
    llmTrace: (llmTrace || []).slice(-5),
    suggestedRefinements: (suggestedRefinements || []).slice(-5)
  };
  const text = JSON.stringify(notes, null, 2);
  return text.length > 12000 ? `${text.slice(0, 12000)}\n...truncated` : text;
}

function collectArtifactPaths(observation) {
  return (observation?.artifacts || []).map((artifact) => artifact.path).filter(Boolean);
}

module.exports = {
  compactObservation,
  buildAutoTestingNotes,
  collectArtifactPaths
};
