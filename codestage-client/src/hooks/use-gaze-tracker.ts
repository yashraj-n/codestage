import { useEffect, useRef } from "react";

const GAZE_AWAY_THRESHOLD_MS = 1500;
const DEBOUNCE_MS = 5000;

export function useGazeTracker(onGazeAway: () => void, enabled: boolean) {
	const lastEventTimeRef = useRef(0);
	const gazeAwayStartRef = useRef<number | null>(null);

	useEffect(() => {
		if (!enabled) return;

		let active = true;

		const init = async () => {
			const webgazer = (await import("webgazer")).default;

			if (!active) return;

			webgazer
				.setRegression("ridge")
				.showVideoPreview(false)
				.showPredictionPoints(false)
				.showFaceOverlay(false)
				.showFaceFeedbackBox(false)
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
							} else if (
								Date.now() - gazeAwayStartRef.current >=
								GAZE_AWAY_THRESHOLD_MS
							) {
								const now = Date.now();
								if (now - lastEventTimeRef.current >= DEBOUNCE_MS) {
									lastEventTimeRef.current = now;
									onGazeAway();
								}
								gazeAwayStartRef.current = null;
							}
						} else {
							gazeAwayStartRef.current = null;
						}
					},
				)
				.begin();
		};

		init();

		return () => {
			active = false;
			import("webgazer").then((mod) => {
				mod.default.end();
			});
		};
	}, [onGazeAway, enabled]);
}
