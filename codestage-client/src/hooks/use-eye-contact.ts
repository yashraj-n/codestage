import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

// MediaPipe landmark indices for iris centers
const LEFT_IRIS_CENTER = 468;
const RIGHT_IRIS_CENTER = 473;

// Eye corner landmarks
const LEFT_EYE_INNER = 133;
const LEFT_EYE_OUTER = 33;
const RIGHT_EYE_INNER = 362;
const RIGHT_EYE_OUTER = 263;

// FACEMESH connector sets for drawing
const FACEMESH_LEFT_EYE = [
	[33, 7], [7, 163], [163, 144], [144, 145], [145, 153],
	[153, 154], [154, 155], [155, 133], [133, 173], [173, 157],
	[157, 158], [158, 159], [159, 160], [160, 161], [161, 246], [246, 33],
];

const FACEMESH_RIGHT_EYE = [
	[263, 249], [249, 390], [390, 373], [373, 374], [374, 380],
	[380, 381], [381, 382], [382, 362], [362, 398], [398, 384],
	[384, 385], [385, 386], [386, 387], [387, 388], [388, 466], [466, 263],
];

const FACEMESH_LEFT_IRIS = [
	[468, 469], [469, 470], [470, 471], [471, 472], [472, 468],
];

const FACEMESH_RIGHT_IRIS = [
	[473, 474], [474, 475], [475, 476], [476, 477], [477, 473],
];

const DEBOUNCE_MS = 1500;
const GAZE_THRESHOLD = 0.38;

interface UseEyeContactOptions {
	videoRef: RefObject<HTMLVideoElement | null>;
	canvasRef: RefObject<HTMLCanvasElement | null>;
	onEyeContactChange: (looking: boolean) => void;
	enabled?: boolean;
}

function computeGazeRatio(
	landmarks: { x: number; y: number; z: number }[],
	irisIdx: number,
	innerIdx: number,
	outerIdx: number,
): number {
	const iris = landmarks[irisIdx];
	const inner = landmarks[innerIdx];
	const outer = landmarks[outerIdx];

	if (!iris || !inner || !outer) return 0.5;

	const eyeWidth = Math.abs(outer.x - inner.x);
	if (eyeWidth < 0.001) return 0.5;

	// Normalized position of iris between inner and outer corners (0 = inner, 1 = outer)
	const irisPos = (iris.x - Math.min(inner.x, outer.x)) / eyeWidth;
	// Centered around 0.5 means looking at screen
	return Math.abs(irisPos - 0.5);
}

function drawConnectors(
	ctx: CanvasRenderingContext2D,
	landmarks: { x: number; y: number }[],
	connections: number[][],
	style: { color: string; lineWidth: number },
	width: number,
	height: number,
) {
	ctx.strokeStyle = style.color;
	ctx.lineWidth = style.lineWidth;
	for (const [start, end] of connections) {
		const p1 = landmarks[start];
		const p2 = landmarks[end];
		if (!p1 || !p2) continue;
		ctx.beginPath();
		ctx.moveTo(p1.x * width, p1.y * height);
		ctx.lineTo(p2.x * width, p2.y * height);
		ctx.stroke();
	}
}

function drawLandmarkDots(
	ctx: CanvasRenderingContext2D,
	landmarks: { x: number; y: number }[],
	indices: number[],
	style: { color: string; radius: number },
	width: number,
	height: number,
) {
	ctx.fillStyle = style.color;
	for (const idx of indices) {
		const p = landmarks[idx];
		if (!p) continue;
		ctx.beginPath();
		ctx.arc(p.x * width, p.y * height, style.radius, 0, 2 * Math.PI);
		ctx.fill();
	}
}

export function useEyeContact({
	videoRef,
	canvasRef,
	onEyeContactChange,
	enabled = true,
}: UseEyeContactOptions) {
	const [isLooking, setIsLooking] = useState(true);
	const lastStateRef = useRef(true);
	const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const faceMeshRef = useRef<any>(null);
	const cameraRef = useRef<any>(null);
	const onEyeContactChangeRef = useRef(onEyeContactChange);

	// Keep callback ref fresh
	useEffect(() => {
		onEyeContactChangeRef.current = onEyeContactChange;
	}, [onEyeContactChange]);

	useEffect(() => {
		if (!enabled) return;

		const video = videoRef.current;
		const canvas = canvasRef.current;
		if (!video || !canvas) return;

		let cancelled = false;

		async function initFaceMesh() {
			const { FaceMesh } = await import("@mediapipe/face_mesh");
			const { Camera } = await import("@mediapipe/camera_utils");

			if (cancelled) return;

			const faceMesh = new FaceMesh({
				locateFile: (file: string) =>
					`https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
			});

			faceMesh.setOptions({
				maxNumFaces: 1,
				refineLandmarks: true,
				minDetectionConfidence: 0.5,
				minTrackingConfidence: 0.5,
			});

			faceMesh.onResults((results: any) => {
				if (cancelled) return;

				const canvasEl = canvasRef.current;
				if (!canvasEl) return;
				const ctx = canvasEl.getContext("2d");
				if (!ctx) return;

				const w = canvasEl.width;
				const h = canvasEl.height;

				ctx.clearRect(0, 0, w, h);

				if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
					// No face detected — treat as not looking
					handleGazeChange(false);
					return;
				}

				const landmarks = results.multiFaceLandmarks[0];

				// Draw eye connectors
				drawConnectors(ctx, landmarks, FACEMESH_LEFT_EYE, { color: "#30d5c8aa", lineWidth: 1 }, w, h);
				drawConnectors(ctx, landmarks, FACEMESH_RIGHT_EYE, { color: "#30d5c8aa", lineWidth: 1 }, w, h);

				// Draw iris connectors
				drawConnectors(ctx, landmarks, FACEMESH_LEFT_IRIS, { color: "#ff6b6bcc", lineWidth: 1.5 }, w, h);
				drawConnectors(ctx, landmarks, FACEMESH_RIGHT_IRIS, { color: "#ff6b6bcc", lineWidth: 1.5 }, w, h);

				// Draw iris center dots
				drawLandmarkDots(ctx, landmarks, [LEFT_IRIS_CENTER, RIGHT_IRIS_CENTER], { color: "#ff6b6b", radius: 2.5 }, w, h);

				// Compute gaze
				const leftGaze = computeGazeRatio(landmarks, LEFT_IRIS_CENTER, LEFT_EYE_INNER, LEFT_EYE_OUTER);
				const rightGaze = computeGazeRatio(landmarks, RIGHT_IRIS_CENTER, RIGHT_EYE_INNER, RIGHT_EYE_OUTER);
				const avgGaze = (leftGaze + rightGaze) / 2;

				const looking = avgGaze < GAZE_THRESHOLD;
				handleGazeChange(looking);
			});

			faceMeshRef.current = faceMesh;

			const camera = new Camera(video!, {
				onFrame: async () => {
					if (cancelled || !faceMeshRef.current) return;
					await faceMeshRef.current.send({ image: video! });
				},
				width: 320,
				height: 240,
			});

			cameraRef.current = camera;
			camera.start();
		}

		function handleGazeChange(looking: boolean) {
			if (looking === lastStateRef.current) {
				// Same state — clear any pending debounce
				if (debounceTimerRef.current) {
					clearTimeout(debounceTimerRef.current);
					debounceTimerRef.current = null;
				}
				return;
			}

			// State changed — debounce before firing
			if (debounceTimerRef.current) return; // Already debouncing

			debounceTimerRef.current = setTimeout(() => {
				lastStateRef.current = looking;
				setIsLooking(looking);
				onEyeContactChangeRef.current(looking);
				debounceTimerRef.current = null;
			}, DEBOUNCE_MS);
		}

		initFaceMesh();

		return () => {
			cancelled = true;
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current);
			}
			if (cameraRef.current) {
				cameraRef.current.stop();
			}
			if (faceMeshRef.current) {
				faceMeshRef.current.close();
			}
		};
	}, [enabled, videoRef, canvasRef]);

	return { isLooking };
}
