import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

// ─── MediaPipe Landmark Indices ──────────────────────────────────────────────

// Iris centers (available when refineLandmarks = true)
const LEFT_IRIS_CENTER = 468;
const RIGHT_IRIS_CENTER = 473;

// Horizontal eye corners
const LEFT_EYE_INNER = 133;
const LEFT_EYE_OUTER = 33;
const RIGHT_EYE_INNER = 362;
const RIGHT_EYE_OUTER = 263;

// Vertical eye boundaries (top/bottom of each eye)
const LEFT_EYE_TOP = 159;
const LEFT_EYE_BOTTOM = 145;
const RIGHT_EYE_TOP = 386;
const RIGHT_EYE_BOTTOM = 374;

// Head pose landmarks
const NOSE_TIP = 1;
const LEFT_FACE_EDGE = 234;
const RIGHT_FACE_EDGE = 454;
const FOREHEAD = 10;
const CHIN = 152;

// ─── Drawing connector sets ──────────────────────────────────────────────────

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

// ─── Thresholds ──────────────────────────────────────────────────────────────

const DEBOUNCE_MS = 1500;

// Horizontal iris offset: 0 = perfectly centered, 0.5 = at corner
const HORIZONTAL_GAZE_THRESHOLD = 0.28;

// Vertical iris offset: same idea but for up/down
const VERTICAL_GAZE_THRESHOLD = 0.32;

// Head yaw: nose position relative to face center (0 = centered, 0.5 = fully turned)
const HEAD_YAW_THRESHOLD = 0.3;

// Head pitch: nose position relative to forehead-chin midpoint
const HEAD_PITCH_THRESHOLD = 0.28;

// ─── Types ───────────────────────────────────────────────────────────────────

interface UseEyeContactOptions {
	videoRef: RefObject<HTMLVideoElement | null>;
	canvasRef: RefObject<HTMLCanvasElement | null>;
	onEyeContactChange: (looking: boolean) => void;
	enabled?: boolean;
}

type Landmark = { x: number; y: number; z: number };

// ─── Gaze computation ────────────────────────────────────────────────────────

function computeHorizontalGaze(
	landmarks: Landmark[],
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

	const irisPos = (iris.x - Math.min(inner.x, outer.x)) / eyeWidth;
	return Math.abs(irisPos - 0.5); // 0 = centered, 0.5 = at corner
}

function computeVerticalGaze(
	landmarks: Landmark[],
	irisIdx: number,
	topIdx: number,
	bottomIdx: number,
): number {
	const iris = landmarks[irisIdx];
	const top = landmarks[topIdx];
	const bottom = landmarks[bottomIdx];
	if (!iris || !top || !bottom) return 0.5;

	const eyeHeight = Math.abs(bottom.y - top.y);
	if (eyeHeight < 0.001) return 0.5;

	const irisPos = (iris.y - Math.min(top.y, bottom.y)) / eyeHeight;
	return Math.abs(irisPos - 0.5); // 0 = centered, 0.5 = at edge
}

function computeHeadYaw(landmarks: Landmark[]): number {
	const nose = landmarks[NOSE_TIP];
	const leftEdge = landmarks[LEFT_FACE_EDGE];
	const rightEdge = landmarks[RIGHT_FACE_EDGE];
	if (!nose || !leftEdge || !rightEdge) return 0;

	const faceWidth = Math.abs(rightEdge.x - leftEdge.x);
	if (faceWidth < 0.001) return 0;

	const faceCenterX = (leftEdge.x + rightEdge.x) / 2;
	// How far nose deviates from face center, normalized by face width
	return Math.abs(nose.x - faceCenterX) / (faceWidth / 2);
}

function computeHeadPitch(landmarks: Landmark[]): number {
	const nose = landmarks[NOSE_TIP];
	const forehead = landmarks[FOREHEAD];
	const chin = landmarks[CHIN];
	if (!nose || !forehead || !chin) return 0;

	const faceHeight = Math.abs(chin.y - forehead.y);
	if (faceHeight < 0.001) return 0;

	const faceCenterY = (forehead.y + chin.y) / 2;
	// Nose is naturally below center, so we compare relative offset
	const normalNoseRatio = 0.15; // nose is ~15% below center normally
	const noseOffset = (nose.y - faceCenterY) / faceHeight;
	return Math.abs(noseOffset - normalNoseRatio);
}

function isLookingAtScreen(landmarks: Landmark[]): boolean {
	// 1. Horizontal gaze (iris left/right)
	const leftH = computeHorizontalGaze(landmarks, LEFT_IRIS_CENTER, LEFT_EYE_INNER, LEFT_EYE_OUTER);
	const rightH = computeHorizontalGaze(landmarks, RIGHT_IRIS_CENTER, RIGHT_EYE_INNER, RIGHT_EYE_OUTER);
	const avgHorizontal = (leftH + rightH) / 2;

	// 2. Vertical gaze (iris up/down)
	const leftV = computeVerticalGaze(landmarks, LEFT_IRIS_CENTER, LEFT_EYE_TOP, LEFT_EYE_BOTTOM);
	const rightV = computeVerticalGaze(landmarks, RIGHT_IRIS_CENTER, RIGHT_EYE_TOP, RIGHT_EYE_BOTTOM);
	const avgVertical = (leftV + rightV) / 2;

	// 3. Head yaw (turning head left/right)
	const headYaw = computeHeadYaw(landmarks);

	// 4. Head pitch (tilting head up/down)
	const headPitch = computeHeadPitch(landmarks);

	// Any single axis failing is enough to consider "not looking"
	if (avgHorizontal > HORIZONTAL_GAZE_THRESHOLD) return false;
	if (avgVertical > VERTICAL_GAZE_THRESHOLD) return false;
	if (headYaw > HEAD_YAW_THRESHOLD) return false;
	if (headPitch > HEAD_PITCH_THRESHOLD) return false;

	return true;
}

// ─── Drawing helpers ─────────────────────────────────────────────────────────

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

// ─── Hook ────────────────────────────────────────────────────────────────────

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

				// Combined gaze + head pose check
				const looking = isLookingAtScreen(landmarks);
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
				if (debounceTimerRef.current) {
					clearTimeout(debounceTimerRef.current);
					debounceTimerRef.current = null;
				}
				return;
			}

			if (debounceTimerRef.current) return;

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
