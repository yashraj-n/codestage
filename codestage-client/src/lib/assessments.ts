import { generateId } from "./utils";

export type AssessmentEventType =
	| "TAB_SWITCH"
	| "PASTE"
	| "COPY"
	| "FOCUS_LOST"
	| "FOCUS_GAINED"
	| "SESSION_START"
	| "SESSION_END"
	| "CODE_RUN"
	| "CODE_CHANGE"
	| "EXECUTE_CODE"
	| "EYE_CONTACT_LOST"
	| "EYE_CONTACT_GAINED";

export interface AssessmentEvent {
	id: string;
	type: AssessmentEventType;
	timestamp: string;
	details?: string;
}

export interface CodeSnapshot {
	id: string;
	timestamp: string;
	code: string;
	eventId?: string;
}

export interface AssessmentSubmission {
	code: string;
	language: string;
	terminalOutput: string[];
	notes: string;
	submittedAt: string;
	events?: AssessmentEvent[];
	codeSnapshots?: CodeSnapshot[];
}

export interface Assessment {
	id: string;
	candidateEmail: string;
	candidateName: string;
	createdAt: string;
	status: "pending" | "in_progress" | "completed";
	sessionLink: string;
	submission?: AssessmentSubmission;
}

const STORAGE_KEY = "codestage-assessments";

export function getAssessments(): Assessment[] {
	const stored = localStorage.getItem(STORAGE_KEY);
	if (!stored) return [];
	return JSON.parse(stored);
}

export function getAssessmentById(id: string): Assessment | undefined {
	const assessments = getAssessments();
	return assessments.find((a) => a.id === id);
}

export function addAssessment(
	assessment: Omit<Assessment, "id" | "createdAt" | "status" | "sessionLink">,
): Assessment {
	const assessments = getAssessments();

	const newAssessment: Assessment = {
		...assessment,
		id: generateId(),
		createdAt: new Date().toISOString(),
		status: "pending",
		sessionLink: `${window.location.origin}/workspace?session=${generateId().slice(0, 8)}`,
	};

	assessments.unshift(newAssessment);
	localStorage.setItem(STORAGE_KEY, JSON.stringify(assessments));

	return newAssessment;
}

export function updateAssessmentStatus(
	id: string,
	status: Assessment["status"],
): void {
	const assessments = getAssessments();
	const updated = assessments.map((a) => (a.id === id ? { ...a, status } : a));
	localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function completeAssessment(
	id: string,
	submission: Omit<AssessmentSubmission, "submittedAt">,
): void {
	const assessments = getAssessments();
	const updated = assessments.map((a) =>
		a.id === id
			? {
					...a,
					status: "completed" as const,
					submission: { ...submission, submittedAt: new Date().toISOString() },
				}
			: a,
	);
	localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function deleteAssessment(id: string): void {
	const assessments = getAssessments();
	const filtered = assessments.filter((a) => a.id !== id);
	localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}
