import type { Client } from "@stomp/stompjs";
import type { JwtCandidate } from "@/lib/generated-api";

export interface Judge0Response {
	stdout: string | null;
	stderr: string | null;
	compile_output: string | null;
	time: string;
	memory: number;
	token: string;
}

export interface Judge0Request {
	language_id: number;
	source_code: string;
	stdin: string;
}

export interface RemoteCursorProps {
	name: string;
	color: string;
	x: number;
	y: number;
}

export interface WorkspaceLayoutProps {
	user: JwtCandidate;
	stompClient: Client;
}

export interface EndSessionEvent {
	code: string;
	notes: string;
}
