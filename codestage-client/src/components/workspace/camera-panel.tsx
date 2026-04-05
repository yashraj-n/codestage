"use client";

import type { Client } from "@stomp/stompjs";
import { Camera, CameraOff, Eye, EyeOff, VideoOff } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useEyeContact } from "@/hooks/use-eye-contact";

interface CameraPanelProps {
	isAdmin: boolean;
	stompClient: Client;
	sessionId: string;
	onEyeContactChange?: (looking: boolean) => void;
}

const ICE_SERVERS: RTCConfiguration = {
	iceServers: [
		{ urls: "stun:stun.l.google.com:19302" },
		{ urls: "stun:stun1.l.google.com:19302" },
	],
};

export function CameraPanel({
	isAdmin,
	stompClient,
	sessionId,
	onEyeContactChange,
}: CameraPanelProps) {
	const localVideoRef = useRef<HTMLVideoElement>(null);
	const remoteVideoRef = useRef<HTMLVideoElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
	const localStreamRef = useRef<MediaStream | null>(null);
	const [cameraReady, setCameraReady] = useState(false);
	const [remoteStreamReady, setRemoteStreamReady] = useState(false);
	const [cameraError, setCameraError] = useState<string | null>(null);
	const pendingIceCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
	const [isLookingState, setIsLookingState] = useState(true);

	const handleEyeContactChange = useCallback(
		(looking: boolean) => {
			setIsLookingState(looking);
			onEyeContactChange?.(looking);
		},
		[onEyeContactChange],
	);

	// Eye contact detection — runs on the relevant video element
	const activeVideoRef = isAdmin ? remoteVideoRef : localVideoRef;
	const eyeContactEnabled = isAdmin ? remoteStreamReady : cameraReady;

	useEyeContact({
		videoRef: activeVideoRef,
		canvasRef,
		onEyeContactChange: handleEyeContactChange,
		enabled: eyeContactEnabled,
	});

	// Candidate: get camera + create WebRTC offer
	useEffect(() => {
		if (isAdmin) return;

		let cancelled = false;

		async function setupCandidate() {
			try {
				const stream = await navigator.mediaDevices.getUserMedia({
					video: { width: 320, height: 240, facingMode: "user" },
					audio: false,
				});

				if (cancelled) {
					stream.getTracks().forEach((t) => t.stop());
					return;
				}

				localStreamRef.current = stream;

				if (localVideoRef.current) {
					localVideoRef.current.srcObject = stream;
				}
				setCameraReady(true);

				// Setup PeerConnection
				const pc = new RTCPeerConnection(ICE_SERVERS);
				peerConnectionRef.current = pc;

				// Add tracks
				for (const track of stream.getTracks()) {
					pc.addTrack(track, stream);
				}

				// ICE candidate handling
				pc.onicecandidate = (event) => {
					if (event.candidate && stompClient.connected) {
						stompClient.publish({
							destination: `/app/${sessionId}/webrtc-ice`,
							body: JSON.stringify({
								candidate: event.candidate.toJSON(),
								from: "candidate",
							}),
						});
					}
				};

				// Subscribe to answer
				const answerSub = stompClient.subscribe(
					`/topic/${sessionId}/webrtc-answer`,
					async (message) => {
						try {
							const { sdp } = JSON.parse(message.body);
							if (pc.signalingState !== "closed") {
								await pc.setRemoteDescription(
									new RTCSessionDescription({ type: "answer", sdp }),
								);
								// Flush pending ICE candidates
								for (const candidate of pendingIceCandidatesRef.current) {
									await pc.addIceCandidate(new RTCIceCandidate(candidate));
								}
								pendingIceCandidatesRef.current = [];
							}
						} catch (err) {
							console.error("Error handling WebRTC answer:", err);
						}
					},
				);

				// Subscribe to ICE from admin
				const iceSub = stompClient.subscribe(
					`/topic/${sessionId}/webrtc-ice`,
					async (message) => {
						try {
							const { candidate, from } = JSON.parse(message.body);
							if (from === "admin" && candidate) {
								if (pc.remoteDescription) {
									await pc.addIceCandidate(new RTCIceCandidate(candidate));
								} else {
									pendingIceCandidatesRef.current.push(candidate);
								}
							}
						} catch (err) {
							console.error("Error handling ICE candidate:", err);
						}
					},
				);

				// Create and send offer
				const offer = await pc.createOffer();
				await pc.setLocalDescription(offer);

				if (stompClient.connected) {
					stompClient.publish({
						destination: `/app/${sessionId}/webrtc-offer`,
						body: JSON.stringify({ sdp: offer.sdp }),
					});
				}

				return () => {
					answerSub.unsubscribe();
					iceSub.unsubscribe();
				};
			} catch (err) {
				console.error("Camera access error:", err);
				setCameraError("Camera access denied");
			}
		}

		const cleanupPromise = setupCandidate();

		return () => {
			cancelled = true;
			cleanupPromise?.then((cleanup) => cleanup?.());
			if (peerConnectionRef.current) {
				peerConnectionRef.current.close();
				peerConnectionRef.current = null;
			}
			if (localStreamRef.current) {
				localStreamRef.current.getTracks().forEach((t) => t.stop());
				localStreamRef.current = null;
			}
		};
	}, [isAdmin, stompClient, sessionId]);

	// Admin: subscribe to WebRTC offer and respond
	useEffect(() => {
		if (!isAdmin) return;

		const subscriptions: { unsubscribe: () => void }[] = [];

		const offerSub = stompClient.subscribe(
			`/topic/${sessionId}/webrtc-offer`,
			async (message) => {
				try {
					const { sdp } = JSON.parse(message.body);

					const pc = new RTCPeerConnection(ICE_SERVERS);
					peerConnectionRef.current = pc;

					// Handle incoming tracks
					pc.ontrack = (event) => {
						if (remoteVideoRef.current && event.streams[0]) {
							remoteVideoRef.current.srcObject = event.streams[0];
							setRemoteStreamReady(true);
						}
					};

					// ICE candidate handling
					pc.onicecandidate = (event) => {
						if (event.candidate && stompClient.connected) {
							stompClient.publish({
								destination: `/app/${sessionId}/webrtc-ice`,
								body: JSON.stringify({
									candidate: event.candidate.toJSON(),
									from: "admin",
								}),
							});
						}
					};

					// Set remote offer
					await pc.setRemoteDescription(
						new RTCSessionDescription({ type: "offer", sdp }),
					);

					// Flush pending ICE
					for (const candidate of pendingIceCandidatesRef.current) {
						await pc.addIceCandidate(new RTCIceCandidate(candidate));
					}
					pendingIceCandidatesRef.current = [];

					// Create and send answer
					const answer = await pc.createAnswer();
					await pc.setLocalDescription(answer);

					if (stompClient.connected) {
						stompClient.publish({
							destination: `/app/${sessionId}/webrtc-answer`,
							body: JSON.stringify({ sdp: answer.sdp }),
						});
					}
				} catch (err) {
					console.error("Error handling WebRTC offer:", err);
				}
			},
		);
		subscriptions.push(offerSub);

		// Subscribe to ICE from candidate
		const iceSub = stompClient.subscribe(
			`/topic/${sessionId}/webrtc-ice`,
			async (message) => {
				try {
					const { candidate, from } = JSON.parse(message.body);
					if (from === "candidate" && candidate) {
						const pc = peerConnectionRef.current;
						if (pc) {
							if (pc.remoteDescription) {
								await pc.addIceCandidate(new RTCIceCandidate(candidate));
							} else {
								pendingIceCandidatesRef.current.push(candidate);
							}
						}
					}
				} catch (err) {
					console.error("Error handling ICE candidate:", err);
				}
			},
		);
		subscriptions.push(iceSub);

		return () => {
			for (const sub of subscriptions) {
				sub.unsubscribe();
			}
			if (peerConnectionRef.current) {
				peerConnectionRef.current.close();
				peerConnectionRef.current = null;
			}
		};
	}, [isAdmin, stompClient, sessionId]);

	// Sync canvas dimensions with the active video
	useEffect(() => {
		const video = activeVideoRef.current;
		const canvas = canvasRef.current;
		if (!video || !canvas) return;

		const syncSize = () => {
			canvas.width = video.videoWidth || 320;
			canvas.height = video.videoHeight || 240;
		};

		video.addEventListener("loadedmetadata", syncSize);
		syncSize();

		return () => {
			video.removeEventListener("loadedmetadata", syncSize);
		};
	}, [activeVideoRef]);

	return (
		<div className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d0d14]/90 shadow-2xl shadow-black/40 backdrop-blur-xl transition-all">
			{/* Header */}
			<div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.02] px-3 py-2">
				<div className="flex items-center gap-2">
					<div className="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-cyan-500/20 to-blue-500/20 ring-1 ring-white/10">
						<Camera className="h-2.5 w-2.5 text-cyan-400" />
					</div>
					<span className="text-[11px] font-medium text-white/80">
						{isAdmin ? "Candidate Camera" : "Camera"}
					</span>
				</div>
				{/* Eye contact indicator */}
				<div className="flex items-center gap-1.5">
					<div
						className={`h-1.5 w-1.5 rounded-full transition-colors ${
							isLookingState
								? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]"
								: "bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.5)]"
						}`}
					/>
					<span
						className={`text-[10px] font-medium transition-colors ${
							isLookingState ? "text-emerald-400" : "text-red-400"
						}`}
					>
						{isLookingState ? "Looking" : "Not Looking"}
					</span>
				</div>
			</div>

			{/* Video container */}
			<div className="relative aspect-[4/3] w-full bg-black/40">
				{cameraError ? (
					<div className="flex h-full w-full flex-col items-center justify-center gap-2">
						<CameraOff className="h-6 w-6 text-white/20" />
						<span className="text-[10px] text-white/30">{cameraError}</span>
					</div>
				) : (
					<>
						{/* Local video (candidate) */}
						{!isAdmin && (
							<video
								ref={localVideoRef}
								autoPlay
								playsInline
								muted
								className="h-full w-full object-cover"
								style={{ transform: "scaleX(-1)" }}
							/>
						)}

						{/* Remote video (admin viewing candidate) */}
						{isAdmin && (
							<>
								{!remoteStreamReady && (
									<div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
										<VideoOff className="h-6 w-6 text-white/20" />
										<span className="text-[10px] text-white/30">
											Waiting for candidate camera...
										</span>
									</div>
								)}
								<video
									ref={remoteVideoRef}
									autoPlay
									playsInline
									muted
									className={`h-full w-full object-cover transition-opacity ${remoteStreamReady ? "opacity-100" : "opacity-0"}`}
									style={{ transform: "scaleX(-1)" }}
								/>
							</>
						)}

						{/* Canvas overlay for landmarks */}
						<canvas
							ref={canvasRef}
							className="pointer-events-none absolute inset-0 h-full w-full"
							style={{ transform: "scaleX(-1)" }}
						/>
					</>
				)}

				{/* Gaze status overlay */}
				<div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 rounded-md bg-black/60 px-1.5 py-0.5 backdrop-blur-sm">
					{isLookingState ? (
						<Eye className="h-2.5 w-2.5 text-emerald-400" />
					) : (
						<EyeOff className="h-2.5 w-2.5 text-red-400" />
					)}
					<span
						className={`text-[9px] font-medium ${isLookingState ? "text-emerald-400" : "text-red-400"}`}
					>
						{isLookingState ? "Eye Contact" : "Looking Away"}
					</span>
				</div>
			</div>
		</div>
	);
}
