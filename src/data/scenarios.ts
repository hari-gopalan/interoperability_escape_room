import type { Option, Question, Room, Scenario, ScenarioId } from "../types";

export const competencies = [
  "DICOM recognition",
  "DICOM compliance vs interoperability",
  "Workflow validation",
  "HL7 vs DICOM",
  "Worklist and manual-entry risk",
  "Semantic interoperability",
  "Patient and order validation",
  "Information-integrity discrepancy",
  "ICD purpose",
  "Patient-identification investigation",
  "Safe corrective action",
  "Root cause and system response",
  "Coding harmonization and TB reporting",
  "FHIR",
  "Integration synthesis",
];
const keys = [
  "dicom",
  "compliance",
  "validation",
  "hl7",
  "worklist",
  "semantic",
  "identity-order",
  "integrity",
  "icd",
  "patient-id",
  "safe-correction",
  "root-cause",
  "harmonization",
  "fhir",
  "synthesis",
];
const roomTitles = [
  "PROCUREMENT",
  "BUILDING THE WORKFLOW",
  "CLINICAL VALIDATION",
  "INVESTIGATION",
  "ORGANIZATIONAL INTEROPERABILITY",
];
type P = {
  id: ScenarioId;
  title: string;
  role: string;
  modality: string;
  pair: string[];
  staff: string;
  young: string;
  old: string;
  wrong: string[];
  report: string;
  app: string;
};
const ps: P[] = [
  {
    id: "A",
    title: "CT EXPANSION PROJECT",
    role: "imaging information coordinator",
    modality: "CT scanner",
    pair: ["CT ABDOMEN W CONTRAST", "CT-ABD+C"],
    staff: "technologist Marco during a crowded CT list",
    young:
      "Sofia Reyes, ID 204851, accession A67382, DOB 2019-04-16, CT abdomen for pain",
    old: "Sofia Reyes, ID 204851, accession A67382, DOB 1956-04-16, CT chest for lung malignancy follow-up",
    wrong: [
      "Maria Santos, DOB 1987-06-12, ID 100284",
      "Marina Santos, DOB 1956-08-21, ID 700824",
    ],
    report: "network-wide TB case count",
    app: "patient portal",
  },
  {
    id: "B",
    title: "MRI REPLACEMENT PROJECT",
    role: "MRI replacement lead",
    modality: "MRI scanner",
    pair: ["MRI BRAIN W/WO CONTRAST", "MR-BRAIN+C/-C"],
    staff: "technologist Liza while MRI is running behind",
    young:
      "Noah Villanueva, ID 318640, accession M44219, DOB 2018-09-03, brain MRI for seizures",
    old: "Noah Villanueva, ID 318640, accession M44219, DOB 1951-02-11, brain MRI for tumour surveillance",
    wrong: [
      "Carlo Lim, DOB 1992-03-08, ID 221054",
      "Carlos Lao, DOB 1948-12-19, ID 884201",
    ],
    report: "MRI utilization among TB cases",
    app: "referral application",
  },
  {
    id: "C",
    title: "NEW DIGITAL RADIOGRAPHY ROOM",
    role: "ED imaging implementation coordinator",
    modality: "DR console",
    pair: ["CHEST 2 VIEW", "CXR-PA-LAT"],
    staff: "technologist Bea during a busy ED shift",
    young:
      "Mia Cruz, ID 407122, accession R90831, DOB 2020-01-27, chest study for suspected foreign body",
    old: "Mia Cruz, ID 407122, accession R90831, DOB 1954-05-06, chest study for oncology surveillance",
    wrong: [
      "Paolo Garcia, DOB 2001-07-14, ID 330178",
      "Pedro Gonzales, DOB 1944-11-30, ID 990421",
    ],
    report: "chest radiograph utilization among TB cases",
    app: "ED dashboard",
  },
  {
    id: "D",
    title: "ULTRASOUND SERVICE UPGRADE",
    role: "ultrasound upgrade coordinator",
    modality: "ultrasound system",
    pair: ["US ABDOMEN COMPLETE", "ABD-US-COMP"],
    staff: "sonographer Ana on an overbooked list",
    young:
      "Elijah Ramos, ID 512903, accession U77126, DOB 2017-06-18, abdominal ultrasound for acute pain",
    old: "Elijah Ramos, ID 512903, accession U77126, DOB 1949-10-22, liver malignancy surveillance",
    wrong: [
      "Nina Flores, DOB 1995-04-09, ID 661204",
      "Nora Fernandez, DOB 1952-01-25, ID 118940",
    ],
    report: "infectious-disease service audit including TB",
    app: "care-coordination application",
  },
  {
    id: "E",
    title: "SATELLITE IMAGING CENTRE",
    role: "cross-site interoperability lead",
    modality: "satellite imaging equipment",
    pair: ["CT CHEST W CONTRAST", "CT-THORAX+C"],
    staff: "technologist Daniel while satellite patients wait",
    young:
      "Ava Mendoza, ID 620415, accession S55680, DOB 2019-11-12, chest CT for congenital airway assessment",
    old: "Ava Mendoza, ID 620415, accession S55680, DOB 1950-07-24, chest CT for malignancy surveillance",
    wrong: [
      "Renato Diaz, DOB 1988-02-17, ID 770315",
      "Rolando Dizon, DOB 1946-09-28, ID 204977",
    ],
    report: "combined main hospital and satellite TB report",
    app: "cross-site appointment application",
  },
];
type B = {
  prompt: string;
  answers: string[];
  correct: number;
  explanation: string;
};
function content(p: P, n: number): B {
  return [
    {
      prompt: `The hospital needs the ${p.modality} to send images and imaging-related patient and examination information to PACS without creating an isolated workflow. Which interoperability standard should the procurement team investigate first?`,
      answers: ["DICOM", "ICD", "FHIR", "A local spreadsheet format"],
      correct: 0,
      explanation:
        "DICOM is the primary standard for medical images and imaging-related information exchanged between modalities and systems such as PACS. Identifying DICOM is the correct starting point, but the team must still confirm that both products support compatible DICOM capabilities for the intended workflow. If those capabilities, configurations or information exchanges do not align, images or associated patient and examination information may not communicate correctly even when both products claim DICOM support.",
    },
    {
      prompt: `The vendor says the ${p.modality} is DICOM compliant, and PACS supports DICOM. Does this guarantee the required workflow?`,
      answers: [
        "Yes, every DICOM workflow is identical",
        "No, both sides must support the specific capabilities and workflow required",
        "Yes, once connected to the same network",
        "No, DICOM cannot support imaging",
      ],
      correct: 1,
      explanation:
        "A compliance label does not guarantee the needed capabilities, configuration and workflow on both systems.",
    },
    {
      prompt:
        "What gives the strongest evidence that the vendor integration claim is correct?",
      answers: [
        "The vendor repeats the claim",
        "Another hospital owns the same model",
        "Both product pages mention DICOM",
        "Test the intended end-to-end workflow in the organization’s environment",
      ],
      correct: 3,
      explanation:
        "A realistic end-to-end local test directly validates the intended workflow.",
    },
    {
      prompt: "Which description best separates HL7 and DICOM in this project?",
      answers: [
        "HL7 commonly exchanges patient, order and result information; DICOM supports images and imaging workflows",
        "DICOM replaces every HL7 exchange",
        "HL7 only transfers pixels",
        "ICD performs both exchanges",
      ],
      correct: 0,
      explanation:
        "HL7 commonly supports patient, order and result messages. DICOM supports imaging information and imaging-related workflow.",
    },
    {
      prompt: `Most users have few mismatches. ${p.staff} cannot find the scheduled exam and manually recreates the patient and exam. Which behavior creates the greatest risk?`,
      answers: [
        "Reviewing the requisition",
        "Searching with a second identifier",
        "Manually recreating the patient and examination",
        "Changing a display description",
      ],
      correct: 2,
      explanation:
        "Manual transcription risks wrong patient, accession and procedure data. DICOM Modality Worklist supplies scheduled information and reduces unnecessary re-entry.",
    },
    {
      prompt: `The order says “${p.pair[0]}” and imaging displays “${p.pair[1]}.” Data arrives, but the receiver does not recognize the same procedure. What problem is this?`,
      answers: [
        "Connectivity failure",
        "Image compression failure",
        "Semantic interoperability or terminology mapping",
        "Patient identity collision",
      ],
      correct: 2,
      explanation:
        "Transmission succeeded, but meaning was not preserved. The local terms require semantic mapping.",
    },
    {
      prompt:
        "Which pair is most useful to validate both the correct patient and correct imaging order?",
      answers: [
        "Patient name and DOB",
        "Patient ID and accession number",
        "Patient name and study description",
        "DOB and accession number",
      ],
      correct: 1,
      explanation:
        "Patient ID establishes identity and accession number links the study to the ordered examination.",
    },
    {
      prompt: `Order: ${p.young}. PACS/DICOM: ${p.old}. Name, ID and accession match. What should the team conclude?`,
      answers: [
        "The matching ID proves it is safe",
        "The technologist should simply change the minor mismatch",
        "This is a serious integrity or patient-association discrepancy requiring investigation before correction or use",
        "The older DOB should replace the order",
      ],
      correct: 2,
      explanation:
        "The dramatic age and clinical-context conflict is serious even when major identifiers match. Investigate before correction or reliance.",
    },
    {
      prompt: "What does ICD contribute when a diagnosis appears in this case?",
      answers: [
        "Standardized disease and health-condition classification for reporting, statistics and analysis",
        "Image transfer to PACS",
        "A DICOM study identifier",
        "Replacement for HL7 and DICOM",
      ],
      correct: 0,
      explanation:
        "ICD classifies diseases and health conditions. It does not transfer images or replace exchange standards.",
    },
    {
      prompt: `Hospital record: ${p.wrong[0]}. Acquired study: ${p.wrong[1]}. What conclusion is best supported?`,
      answers: [
        "Similar context proves they match",
        "Only the description needs editing",
        "Multiple identifiers conflict, so investigate a potential patient-identification and data-integrity mismatch",
        "PACS should merge them automatically",
      ],
      correct: 2,
      explanation:
        "Conflicts in name, DOB and Patient ID require potential wrong-patient and data-integrity investigation.",
    },
    {
      prompt:
        "A colleague says, “It is obviously a typo. Let us fix it in PACS.” What is the best action?",
      answers: [
        "Edit immediately",
        "Delete and repeat without review",
        "Validate identity and trace the entry point before correction under organizational procedure",
        "Choose whichever record looks closest",
      ],
      correct: 2,
      explanation:
        "Validate, preserve traceability, find the source and follow approved correction procedure before editing.",
    },
    {
      prompt: `Registration, order and worklist are correct, but the modality study is wrong. ${p.staff} manually created it after failing to find the scheduled exam. What system response is best?`,
      answers: [
        "Tell the user to be more careful",
        "Ban manual entry without exceptions",
        "Investigate worklist failure, minimize re-entry and establish a safe exception process",
        "Correct this record and close the incident",
      ],
      correct: 2,
      explanation:
        "System thinking addresses the failed workflow and risky workaround while preserving a controlled exception path.",
    },
    {
      prompt: `Leadership wants a ${p.report}. Site A counts only A15.- confirmed respiratory TB. Site B includes A15.- and A16.-. Another site uses local terms that may cover A17.-, A18.- or A19.-. What happens first?`,
      answers: [
        "Add all transmitted totals",
        "Treat A15.- as all TB",
        "Define the report’s TB case criteria and map each coding version or representation before aggregation",
        "Count cough as a TB diagnosis",
      ],
      correct: 2,
      explanation:
        "Agree on the report definition, then reconcile and map site representations. Successful transmission does not guarantee comparable meaning.",
    },
    {
      prompt: `A ${p.app} will request selected health information. Why may FHIR be relevant?`,
      answers: [
        "It automatically fixes meaning",
        "It is a diagnosis code",
        "It replaces all DICOM image exchange",
        "It uses resource-based healthcare exchange with modern web and API technologies",
      ],
      correct: 3,
      explanation:
        "FHIR supports resource-based exchange through modern web APIs. It does not automatically solve semantics or replace every DICOM workflow.",
    },
    {
      prompt: "What should the organization do differently next time?",
      answers: [
        "Buy products with a standards logo",
        "Define workflow and exchanges, select appropriate capabilities, test, validate patient and order data, preserve meaning, identify failures and manage exceptions",
        "Focus only on connectivity",
        "Use manual entry whenever an interface is inconvenient",
      ],
      correct: 1,
      explanation:
        "Reliable interoperability joins workflow definition, standards, real testing, validation, semantic alignment, failure analysis and safe exception management.",
    },
  ][n - 1];
}
const hints1 = [
  "Focus on medical images and imaging workflow.",
  "A label is not proof of a particular workflow.",
  "Look for direct evidence in your environment.",
  "Separate messages from images.",
  "Find the step that introduces new transcription.",
  "The data arrived, so consider meaning.",
  "Use one identity field and one order-linking field.",
  "Matching fields do not erase a major clinical conflict.",
  "Think classification and reporting.",
  "Several identity fields disagree.",
  "Validate before editing.",
  "Address why the workaround became necessary.",
  "Define the report population first.",
  "Think resources and web APIs.",
  "Choose the full lifecycle response.",
];
const hints2 = [
  "DICOM is the starting point.",
  "Capabilities must align on both systems.",
  "Run an end-to-end workflow test.",
  "HL7 commonly carries patient/order/result data; DICOM handles imaging.",
  "Modality Worklist reduces manual re-entry.",
  "This is semantic mapping.",
  "Patient ID plus accession number.",
  "Pause and investigate integrity before use.",
  "ICD classifies disease.",
  "Treat this as a potential wrong-patient event.",
  "Trace the source, then follow correction procedure.",
  "Fix the worklist process and provide safe exceptions.",
  "Map sites to an agreed TB definition before adding totals.",
  "FHIR is resource-based exchange using web technologies.",
  "Define, select, test, validate, monitor and manage exceptions.",
];
function storyBeat(p: P, n: number) {
  return [
    `The procurement committee has narrowed its shortlist for the ${p.title}. The new ${p.modality} cannot operate as an isolated device: acquired images and their associated patient and examination information must reach PACS reliably so clinicians can locate and use the correct study. A vendor presentation is about to begin, and the committee asks you which interoperability standard should be investigated first.`,
    `The vendor points to a DICOM logo and assures the committee that integration is settled. Before the purchase recommendation is signed, the clinical team turns to you and asks whether that statement is enough.`,
    `Two proposals remain. Marketing claims and reference sites sound reassuring, but the committee needs defensible evidence that the selected ${p.modality} will work inside this hospital's real environment.`,
    `Months later, the equipment has arrived. Registration, scheduling, orders, reports and images now have to travel through different parts of the workflow, and the implementation team is mixing up the roles of the standards involved.`,
    `During a pressured shift, ${p.staff} repeatedly fails to locate a scheduled examination. You observe the user abandon the scheduled path and recreate the patient and examination at the modality while the waiting list grows.`,
    `The connection is now transmitting data, but the order term “${p.pair[0]}” reaches imaging as “${p.pair[1]}.” Staff treat them differently even though the project team intended the same procedure.`,
    `Supervised patient use begins the next morning. Before allowing acquisition to continue, the validation team asks you to choose the strongest pair of fields for confirming both the person and the ordered examination.`,
    `An alert sounds during clinical validation. The order describes ${p.young}; the PACS study describes ${p.old}. Several major identifiers still match, so the room waits for your safety decision.`,
    `The affected patient's diagnosis is also needed for quality reporting. A colleague notices an ICD value in the record and asks what role that classification actually plays in this investigation.`,
    `Several weeks later, a second incident reaches the control room. Registration shows ${p.wrong[0]}, while the acquired study shows ${p.wrong[1]}. The visible disagreement is not subtle, but the team must classify the risk correctly.`,
    `A colleague reaches for the edit control and calls the discrepancy an obvious typo. The study has not yet been released, and you must decide what evidence must be protected and checked before anything is changed.`,
    `The trace is complete: registration, the order and the scheduled worklist were correct. The wrong information appeared only after the scheduled item could not be found and a new examination was entered manually. Leadership asks for a response that prevents recurrence.`,
    `Six months later, leadership requests a ${p.report}. Three facilities transmit totals successfully, but each uses a different definition or representation of tuberculosis. The deadline is close, yet adding the numbers now could mislead the organization.`,
    `A separate modernization project proposes a ${p.app} that will request selected information from existing systems. The team places FHIR on the table and asks what it can appropriately contribute.`,
    `The final door remains locked. Leadership asks you to convert everything learned from procurement, early use and incident investigation into one repeatable plan for the organization's next interoperability project.`,
  ][n - 1];
}
function question(p: P, n: number): Question {
  const b = content(p, n);
  const shift = (p.id.charCodeAt(0) - 65 + n) % 4;
  const raw = b.answers.map((text, i) => ({ text, i }));
  const arranged = [...raw.slice(shift), ...raw.slice(0, shift)];
  const options: Option[] = arranged.map((x, i) => ({
    id: String.fromCharCode(65 + i),
    text: x.text,
  }));
  return {
    id: `${p.id}-Q${n}`,
    number: n,
    competencyId: keys[n - 1],
    competency: competencies[n - 1],
    context: `${p.title}: ${roomTitles[Math.floor((n - 1) / 3)]}`,
    storyBeat: storyBeat(p, n),
    prompt: b.prompt,
    options,
    correctOptionId: options[arranged.findIndex((x) => x.i === b.correct)].id,
    hintAfterFirstWrong: hints1[n - 1],
    hintAfterSecondWrong: hints2[n - 1],
    explanation: b.explanation,
  };
}
function scenario(p: P): Scenario {
  const intros = [
    "The team evaluates the system before purchase.",
    "Several months later, the system arrives and the daily workflow is built.",
    "Supervised clinical use begins. Decide whether the information is safe to rely upon.",
    "Several weeks later, an incident is reported. Reconstruct the information trail.",
    "Six months later, leadership applies the lessons to organization-wide data.",
  ];
  const transitions = [
    "The purchase is approved. Now the design must work in practice.",
    "The configured workflow moves into supervised use.",
    "The immediate risk is contained. Trace where the mismatch entered.",
    "The investigation leads to broader questions about shared meaning.",
    "The incident report is ready.",
  ];
  const rooms: Room[] = roomTitles.map((title, i) => ({
    id: `${p.id}-R${i + 1}`,
    number: i + 1,
    title,
    narrativeIntro: intros[i],
    transitionText: transitions[i],
    questions: [1, 2, 3].map((j) => question(p, i * 3 + j)),
  }));
  return {
    id: p.id,
    title: p.title,
    role: p.role,
    introduction: `You are the ${p.role}. Follow this project from selection through organizational learning and protect information integrity.`,
    rooms,
  };
}
export const scenarios = ps.map(scenario);
export const allQuestions = (s: Scenario) =>
  s.rooms.flatMap((r) => r.questions);
