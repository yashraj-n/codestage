import { useEffect, useRef, useState } from "react";

const GAZE_AWAY_THRESHOLD_MS = 1500;
const DEBOUNCE_MS = 5000;

export function useGazeTracker(
	onGazeAway: () => void,
	enabled: boolean,
	localStream: MediaStream | null,
) {
	const lastEventTimeRef = useRef(0);
	const gazeAwayStartRef = useRef<number | null>(null);
	const lastSeenTimeRef = useRef(Date.now());
	const [compositeStream, setCompositeStream] = useState<MediaStream | null>(
		null,
	);

	// Gaze Away Check Loop
	useEffect(() => {
		if (!enabled) return;

		const intervalId = setInterval(() => {
			const now = Date.now();
			const isNotSeen = now - lastSeenTimeRef.current >= GAZE_AWAY_THRESHOLD_MS;
			const isGazeAway =
				gazeAwayStartRef.current &&
				now - gazeAwayStartRef.current >= GAZE_AWAY_THRESHOLD_MS;

			if (isNotSeen || isGazeAway) {
				if (now - lastEventTimeRef.current >= DEBOUNCE_MS) {
					lastEventTimeRef.current = now;
					onGazeAway();
				}
				// Reset so we don't spam
				lastSeenTimeRef.current = now;
				gazeAwayStartRef.current = null;
			}
		}, 500);

		return () => clearInterval(intervalId);
	}, [enabled, onGazeAway]);

	// WebGazer Initialization
	useEffect(() => {
		if (!enabled) return;

		let active = true;
		let webgazerInstance: typeof import("webgazer").default | null = null;

		const init = async () => {
			const webgazer = (await import("webgazer")).default;
			webgazerInstance = webgazer;

			if (!active) return;

			webgazer
				.setRegression("ridge")
				.showVideoPreview(true)
				.showPredictionPoints(false)
				.showFaceOverlay(true)
				.showFaceFeedbackBox(true)
				.setGazeListener(
					(data: { x: number; y: number } | null, _ts: number) => {
						if (!active) return;

						const isAway =
							!data ||
							data.x < 0 ||
							data.y < 0 ||
							data.x > window.innerWidth ||
							data.y > window.innerHeight;

						if (isAway) {
							if (!gazeAwayStartRef.current) {
								gazeAwayStartRef.current = Date.now();
							}
						} else {
							gazeAwayStartRef.current = null;
							lastSeenTimeRef.current = Date.now();
						}
					},
				)
				.begin();

			// Hide WebGazer's absolute DOM elements so they don't clutter the screen
			const hideInterval = setInterval(() => {
				const ids = [
					"webgazerVideoContainer",
					"webgazerVideoFeed",
					"webgazerVideoCanvas",
					"webgazerFaceOverlay",
					"webgazerFaceFeedbackBox",
					"webgazerGazeDot",
				];
				for (const id of ids) {
					const el = document.getElementById(id);
					if (el) {
						el.style.opacity = "0";
						el.style.pointerEvents = "none";
						el.style.position = "fixed";
						el.style.zIndex = "-9999";
					}
				}
			}, 500);

			setTimeout(() => clearInterval(hideInterval), 10000);
		};

		init();

		return () => {
			active = false;
			if (webgazerInstance) {
				webgazerInstance.end();
			}
		};
	}, [enabled]);

	// Compositing Loop
	useEffect(() => {
		if (!enabled || !localStream) {
			setCompositeStream(null);
			return;
		}

		let animationFrameId: number;
		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const video = document.createElement("video");
		video.srcObject = localStream;
		video.autoplay = true;
		video.playsInline = true;
		video.muted = true;

		// Standard webcam resolution fallback
		canvas.width = 640;
		canvas.height = 480;

		const stream = canvas.captureStream(30);
		for (const track of localStream.getAudioTracks()) {
			stream.addTrack(track);
		}

		setCompositeStream(stream);

		const drawLoop = () => {
			const webgazerVideo = document.getElementById(
				"webgazerVideoFeed",
			) as HTMLVideoElement | null;

			// Prefer drawing WebGazer's internally managed video feed so overlays perfectly align
			const sourceVideo =
				webgazerVideo && webgazerVideo.readyState >= 2 ? webgazerVideo : video;

			if (sourceVideo && sourceVideo.readyState >= 2) {
				if (
					sourceVideo.videoWidth > 0 &&
					canvas.width !== sourceVideo.videoWidth
				) {
					canvas.width = sourceVideo.videoWidth;
					canvas.height = sourceVideo.videoHeight;
				}

				ctx.clearRect(0, 0, canvas.width, canvas.height);

				// Draw raw video (WebGazer mirrors video via CSS transform, so pixel data is unmirrored)
				ctx.drawImage(sourceVideo, 0, 0, canvas.width, canvas.height);

				// Draw overlays only if we're successfully hooking into WebGazer's feed
				if (sourceVideo === webgazerVideo) {
					const faceOverlay = document.getElementById(
						"webgazerFaceOverlay",
					) as HTMLCanvasElement | null;
					const faceBox = document.getElementById(
						"webgazerFaceFeedbackBox",
					) as HTMLCanvasElement | null;

					if (faceOverlay && faceOverlay.width > 0) {
						ctx.drawImage(faceOverlay, 0, 0, canvas.width, canvas.height);
					}
					if (faceBox && faceBox.width > 0) {
						ctx.drawImage(faceBox, 0, 0, canvas.width, canvas.height);
					}
				}
			}
			animationFrameId = requestAnimationFrame(drawLoop);
		};

		video.onplaying = () => {
			drawLoop();
		};

		return () => {
			if (animationFrameId) cancelAnimationFrame(animationFrameId);
			video.pause();
			video.srcObject = null;
		};
	}, [enabled, localStream]);

	return compositeStream;
}
