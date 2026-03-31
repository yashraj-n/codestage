declare module "webgazer" {
	interface WebGazer {
		setRegression(type: string): WebGazer;
		showVideoPreview(show: boolean): WebGazer;
		showPredictionPoints(show: boolean): WebGazer;
		showFaceOverlay(show: boolean): WebGazer;
		showFaceFeedbackBox(show: boolean): WebGazer;
		setGazeListener(
			listener: (
				data: { x: number; y: number } | null,
				elapsedTime: number,
			) => void,
		): WebGazer;
		begin(): WebGazer;
		end(): void;
	}

	const webgazer: WebGazer;
	export default webgazer;
}
