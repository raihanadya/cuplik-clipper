export const PIPELINE_STAGES = [
  {
    key: 'ingestion',
    label: 'Ingestion',
    description: 'Validating video encoding, extracting audio stream, and preparing pipeline assets.',
  },
  {
    key: 'transcription',
    label: 'Transcription',
    description: 'Running Indonesian speech recognition (ASR) with custom vocabulary grounding.',
  },
  {
    key: 'curation_llm',
    label: 'Curation & Selection',
    description: 'Analyzing semantic concept completeness and scoring pedagogical self-contained highlights.',
  },
  {
    key: 'rendering',
    label: 'Rendering',
    description: 'Cropping layout, compositing templates, and rendering final 9:16 vertical clips.',
  },
];

export const STAGE_STATUSES = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  DONE: 'done',
  FAILED: 'failed',
};
