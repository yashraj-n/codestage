export enum StompMessageType {
	NOTES = "NOTES",
}

export interface StompMessage<T> {
	data: T;
	type: StompMessageType;
	sessionId: string;
}

export function createStompMessage<T>(
	data: T,
	type: StompMessageType,
	sessionId: string,
): string {
	return JSON.stringify({
		data: data,
		type: type,
		sessionId: sessionId,
	});
}
