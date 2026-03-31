import { useEffect, useRef } from "react";

interface CameraFeedProps {
	stream: MediaStream;
	muted?: boolean;
	label?: string;
}

export function CameraFeed({ stream, muted = false, label }: CameraFeedProps) {
	const videoRef = useRef<HTMLVideoElement>(null);

	useEffect(() => {
		if (videoRef.current) {
			videoRef.current.srcObject = stream;
		}
	}, [stream]);

	return (
		<div className="relative overflow-hidden rounded-xl border border-white/10 bg-black">
			<video
				ref={videoRef}
				autoPlay
				playsInline
				muted={muted}
				className="h-full w-full object-cover"
			/>
			{label && (
				<div className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-0.5 text-xs font-medium text-white/80 backdrop-blur-sm">
					{label}
				</div>
			)}
		</div>
	);
}
