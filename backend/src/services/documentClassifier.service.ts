/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Smart Document Classifier Service
 * Analyzes document text to identify the type and recommend generation strategy
 * ═══════════════════════════════════════════════════════════════════════════
 */

export type DocumentType = 
  | "textbook"
  | "question_paper"
  | "lab_manual"
  | "research_paper"
  | "unknown";

export interface ClassificationResult {
  documentType: DocumentType;
  confidence: number; // 0-1
  label: string;      // Human-readable label
  description: string;
  generationStrategy: GenerationStrategy;
}

export interface GenerationStrategy {
  summaryPromptHint: string;
  questionStyle: string;
  quizFocus: string;
  recallNotesFocus: string;
  recommendedQuestionCount: number;
  recommendedQuizCount: number;
}

// ─── Keyword patterns for each document type ─────────────────────────────

const TEXTBOOK_PATTERNS = [
  /chapter\s*\d+/gi,
  /\bintroduction\b/gi,
  /\bdefinition\b/gi,
  /\bexample\b/gi,
  /\bexercise\b/gi,
  /\btheorem\b/gi,
  /\bcorollary\b/gi,
  /\blemma\b/gi,
  /\bproof\b/gi,
  /\bsolution\b/gi,
  /\bin\s+this\s+chapter\b/gi,
  /\blearning\s+objectives?\b/gi,
  /\blet\s+us\b/gi,
  /\bwe\s+know\s+that\b/gi,
  /\bfor\s+example\b/gi,
  /\bsummary\b/gi,
  /\bpoints\s+to\s+remember\b/gi,
  /\bncert\b/gi,
  /\bcbse\b/gi,
  /\btextbook\b/gi,
  /\bclass\s+\d+/gi,
  /\bgrade\s+\d+/gi,
  /\bunit\s+\d+/gi,
  /\btopic\s*:/gi,
  /\bdiagram\b/gi,
  /\bfigure\s*\d+/gi,
  /\btable\s*\d+/gi,
];

const QUESTION_PAPER_PATTERNS = [
  /\bq\s*[\.\)]\s*\d*/gi,
  /\bquestion\s*\d+/gi,
  /\bmarks?\s*[\:\-]?\s*\d+/gi,
  /\(\s*\d+\s*marks?\s*\)/gi,
  /\b\d+\s*marks?\b/gi,
  /\banswer\s+(the\s+)?following/gi,
  /\battempt\s+(any|all)/gi,
  /\bsection\s*[\-:]?\s*[a-d]/gi,
  /\btime\s*[\:\-]?\s*\d+\s*(hours?|hrs?|minutes?|mins?)/gi,
  /\bmaximum\s+marks/gi,
  /\broll\s*no/gi,
  /\bexamination\b/gi,
  /\btest\s+paper\b/gi,
  /\bsolve\b/gi,
  /\bfind\s+the\s+value\b/gi,
  /\bstate\s+(true|false)/gi,
  /\bfill\s+in\s+the\s+blanks?\b/gi,
  /\bmatch\s+the\s+(following|columns?)\b/gi,
  /\bmultiple\s+choice/gi,
  /\bchoose\s+the\s+(correct|right)\b/gi,
  /\bshort\s+answer/gi,
  /\blong\s+answer/gi,
  /\bessay\s+type/gi,
  /\bvery\s+short\s+answer/gi,
  /\b(i+v?|v)\s*[\.\)]/gm, // Roman numerals
  /\b[a-d]\s*[\.\)]\s+\w/gm, // MCQ options
];

const LAB_MANUAL_PATTERNS = [
  /\bexperiment\s*\d*/gi,
  /\bprocedure\b/gi,
  /\bobservation\b/gi,
  /\bapparatus\b/gi,
  /\bmaterials?\s+required\b/gi,
  /\bprecaution/gi,
  /\bresult\b/gi,
  /\bconclusion\b/gi,
  /\blab\s*(manual|report|notebook)\b/gi,
  /\bpractical\b/gi,
  /\baim\s*[\:\-]/gi,
  /\btheory\s*[\:\-]/gi,
  /\bcircuit\s+diagram\b/gi,
  /\bobservation\s+table\b/gi,
  /\bspecimen\b/gi,
  /\breagent/gi,
  /\btitration\b/gi,
  /\bcalibrat/gi,
  /\bmeasur(e|ing|ement)\b/gi,
  /\bsafety\b/gi,
  /\bviva\s*(voce)?\b/gi,
];

const RESEARCH_PAPER_PATTERNS = [
  /\babstract\b/gi,
  /\bmethodology\b/gi,
  /\breferences?\b/gi,
  /\bbibliography\b/gi,
  /\bliterature\s+review\b/gi,
  /\bconclusion\b/gi,
  /\bresearch\s+(paper|article|study)\b/gi,
  /\bhypothesis\b/gi,
  /\bdata\s+analysis\b/gi,
  /\bstatistical\b/gi,
  /\bfindings\b/gi,
  /\backnowledg(e)?ments?\b/gi,
  /\bpeer[\s\-]review/gi,
  /\bjournal\b/gi,
  /\bdoi\s*[\:\-]/gi,
  /\b(et\s+al\.?)\b/gi,
  /\bcitation/gi,
  /\bfigure\s+\d+\s*[\:\-]/gi,
  /\bintroduction\b[\s\S]{0,200}\bpurpose\b/gi,
  /\bresults?\s+and\s+discussion/gi,
  /\bsample\s+size\b/gi,
  /\bcontrol\s+group\b/gi,
  /\bvariable/gi,
  /\bp[\s\-]?value/gi,
  /\bcorrelation\b/gi,
  /\bsignifican(t|ce)\b/gi,
];

// ─── Generation strategies per document type ─────────────────────────────

const STRATEGIES: Record<DocumentType, GenerationStrategy> = {
  textbook: {
    summaryPromptHint:
      "Create a comprehensive study summary organized by chapter topics. Include key definitions, important formulas, and core concepts that students need to memorize for exams.",
    questionStyle:
      "Generate conceptual understanding questions, definition-based Q&A, and application problems similar to NCERT exercises.",
    quizFocus:
      "Focus on testing understanding of definitions, concepts, formulas, and their applications. Include diagram-based questions where relevant.",
    recallNotesFocus:
      "Create revision cards organized by topic with key definitions, formulas, important dates/facts, and memory aids/mnemonics.",
    recommendedQuestionCount: 12,
    recommendedQuizCount: 12,
  },
  question_paper: {
    summaryPromptHint:
      "Analyze the question paper and provide: 1) An answer key with solved solutions for every question, 2) Key topics tested, 3) Difficulty distribution, 4) Important formulas/concepts needed.",
    questionStyle:
      "Generate practice variations of each question from the paper — similar questions with different values/scenarios so students can practice more.",
    quizFocus:
      "Create MCQs based on the topics covered in the question paper. Focus on commonly tested concepts and tricky areas.",
    recallNotesFocus:
      "Extract all topics tested and create quick-reference notes for each topic area. Include solved approaches for common question types.",
    recommendedQuestionCount: 15,
    recommendedQuizCount: 15,
  },
  lab_manual: {
    summaryPromptHint:
      "Summarize each experiment with: Aim, Key Procedure Steps, Expected Observations, and Conclusions. Focus on the scientific principles behind each experiment.",
    questionStyle:
      "Generate viva-voce questions that a teacher might ask during practical exams. Include theory-based questions related to each experiment.",
    quizFocus:
      "Focus on procedural knowledge, safety precautions, expected results, and the scientific principles behind experiments.",
    recallNotesFocus:
      "Create quick-reference cards for each experiment with: Aim, Apparatus, Key Steps, Precautions, and Expected Results.",
    recommendedQuestionCount: 10,
    recommendedQuizCount: 10,
  },
  research_paper: {
    summaryPromptHint:
      "Provide a structured summary with: Research Objective, Methodology Used, Key Findings, Statistical Results, and Implications. Use clear language accessible to students.",
    questionStyle:
      "Generate critical analysis questions: What was the methodology? What are the limitations? How could the study be improved? What are the practical implications?",
    quizFocus:
      "Test understanding of research methodology, findings interpretation, statistical concepts used, and critical evaluation skills.",
    recallNotesFocus:
      "Create summary cards with: Research Question, Method, Key Findings, Limitations, and Significance. Include relevant statistics and data points.",
    recommendedQuestionCount: 10,
    recommendedQuizCount: 8,
  },
  unknown: {
    summaryPromptHint:
      "Create a comprehensive summary of the main topics, key facts, and important concepts from the document.",
    questionStyle:
      "Generate a mix of conceptual, factual, and application-based questions from the document content.",
    quizFocus:
      "Create MCQs testing understanding of the main concepts and facts presented in the document.",
    recallNotesFocus:
      "Create revision notes organized by topic with key points, facts, and quick-reference information.",
    recommendedQuestionCount: 10,
    recommendedQuizCount: 10,
  },
};

// ─── Main classifier ─────────────────────────────────────────────────────

export class DocumentClassifierService {
  /**
   * Classify a document based on its text content
   * Uses fast rule-based pattern matching (no AI call needed)
   */
  classify(text: string): ClassificationResult {
    const startTime = Date.now();

    // Analyze first ~10000 characters for speed (enough to detect patterns)
    const sample = text.substring(0, 10000).toLowerCase();
    const fullLowerText = text.toLowerCase();

    // Count matches for each type
    const scores: Record<DocumentType, number> = {
      textbook: this.countMatches(fullLowerText, TEXTBOOK_PATTERNS),
      question_paper: this.countMatches(fullLowerText, QUESTION_PAPER_PATTERNS),
      lab_manual: this.countMatches(fullLowerText, LAB_MANUAL_PATTERNS),
      research_paper: this.countMatches(fullLowerText, RESEARCH_PAPER_PATTERNS),
      unknown: 0,
    };

    // Apply weighting — some patterns are stronger signals
    // Question papers with marks notation are very distinctive
    const marksMatches = (fullLowerText.match(/\(\s*\d+\s*marks?\s*\)/gi) || []).length;
    if (marksMatches >= 2) scores.question_paper += marksMatches * 3;

    // "Experiment" + "Procedure" + "Observation" together is very strong for lab
    const hasExperiment = /experiment/i.test(fullLowerText);
    const hasProcedure = /procedure/i.test(fullLowerText);
    const hasObservation = /observation/i.test(fullLowerText);
    if (hasExperiment && hasProcedure && hasObservation) scores.lab_manual += 15;

    // "Abstract" + "References" + "Methodology" together is strong for research
    const hasAbstract = /abstract/i.test(sample);
    const hasReferences = /references/i.test(fullLowerText);
    const hasMethodology = /methodology/i.test(fullLowerText);
    if (hasAbstract && hasReferences) scores.research_paper += 10;
    if (hasAbstract && hasMethodology) scores.research_paper += 10;

    // "Chapter" + educational language is strong for textbook
    const hasChapter = /chapter\s*\d+/i.test(fullLowerText);
    const hasExercise = /exercise/i.test(fullLowerText);
    if (hasChapter && hasExercise) scores.textbook += 10;

    // Find winner
    const entries = Object.entries(scores).filter(([k]) => k !== "unknown") as [DocumentType, number][];
    entries.sort((a, b) => b[1] - a[1]);

    const [winnerType, winnerScore] = entries[0];
    const [, runnerUpScore] = entries[1];

    // Calculate confidence — higher when winner is clearly ahead
    const totalScore = entries.reduce((sum, [, s]) => sum + s, 0);
    let confidence = totalScore > 0 ? winnerScore / totalScore : 0;

    // Minimum threshold — if score is too low, classify as unknown
    if (winnerScore < 5) {
      const result: ClassificationResult = {
        documentType: "unknown",
        confidence: 0.3,
        label: "General Document",
        description: "Could not determine a specific document type. Using general content generation.",
        generationStrategy: STRATEGIES.unknown,
      };
      console.log(`📋 Classification: unknown (score too low: ${winnerScore}) in ${Date.now() - startTime}ms`);
      return result;
    }

    // Boost confidence if winner is clearly dominant
    if (winnerScore > runnerUpScore * 2) {
      confidence = Math.min(1, confidence + 0.15);
    }

    const labels: Record<DocumentType, string> = {
      textbook: "Textbook / Study Material",
      question_paper: "Question Paper / Exam",
      lab_manual: "Lab Manual / Practical",
      research_paper: "Research Paper / Article",
      unknown: "General Document",
    };

    const descriptions: Record<DocumentType, string> = {
      textbook: "Detected as study material with chapters, definitions, and exercises. Generating comprehensive revision content.",
      question_paper: "Detected as a question paper/exam. Generating answer keys, solved solutions, and practice variations.",
      lab_manual: "Detected as a lab manual with experiments and procedures. Generating viva questions and procedure summaries.",
      research_paper: "Detected as a research paper with abstract and methodology. Generating critical analysis content.",
      unknown: "Could not determine document type. Using general content generation.",
    };

    const result: ClassificationResult = {
      documentType: winnerType,
      confidence: Math.round(confidence * 100) / 100,
      label: labels[winnerType],
      description: descriptions[winnerType],
      generationStrategy: STRATEGIES[winnerType],
    };

    console.log(
      `📋 Classification: ${winnerType} (confidence: ${result.confidence}, score: ${winnerScore}) in ${Date.now() - startTime}ms`
    );
    console.log(`   Scores: ${entries.map(([t, s]) => `${t}=${s}`).join(", ")}`);

    return result;
  }

  /**
   * Count total matches for an array of patterns
   */
  private countMatches(text: string, patterns: RegExp[]): number {
    let total = 0;
    for (const pattern of patterns) {
      // Reset lastIndex for global patterns
      pattern.lastIndex = 0;
      const matches = text.match(pattern);
      if (matches) {
        total += matches.length;
      }
    }
    return total;
  }

  /**
   * Get the generation strategy for a document type
   */
  getStrategy(type: DocumentType): GenerationStrategy {
    return STRATEGIES[type] || STRATEGIES.unknown;
  }
}

export const documentClassifierService = new DocumentClassifierService();
