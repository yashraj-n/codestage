import { useCallback, useEffect, useRef, useState } from "react";

export type CameraStatus = "pending" | "granted" | "denied";

export function useCamera() {
	const [status, setStatus] = useState<CameraStatus>("pending");
	const streamRef = useRef<MediaStream | null>(null);

	const requestCamera = useCallback(async () => {
		setStatus("pending");
		try {
			const mediaStream = await navigator.mediaDevices.getUserMedia({
				video: true,
			});
			streamRef.current = mediaStream;
			setStatus("granted");
		} catch {
			setStatus("denied");
		}
	}, []);

	useEffect(() => {
		requestCamera();

		return () => {
			if (streamRef.current) {
				for (const track of streamRef.current.getTracks()) {
					track.stop();
				}
				streamRef.current = null;
			}
		};
	}, [requestCamera]);

	return { status, stream: streamRef.current, requestCamera };
}
