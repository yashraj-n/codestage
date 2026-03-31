import { Camera, Loader2, ShieldAlert } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import type { CameraStatus } from "@/hooks/use-camera";

interface CameraPermissionGateProps {
	status: CameraStatus;
	onRetry: () => void;
	children: ReactNode;
}

export function CameraPermissionGate({
	status,
	onRetry,
	children,
}: CameraPermissionGateProps) {
	if (status === "granted") return <>{children}</>;

	return (
		<div className="flex h-screen w-full items-center justify-center bg-[#09090d]">
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<div className="absolute -left-48 -top-48 h-[600px] w-[600px] rounded-full bg-violet-600/8 blur-[150px]" />
				<div className="absolute -right-48 top-1/3 h-[500px] w-[500px] rounded-full bg-fuchsia-600/6 blur-[130px]" />
			</div>

			<div className="relative z-10 flex flex-col items-center gap-6 text-center">
				{status === "pending" ? (
					<>
						<div className="flex h-20 w-20 items-center justify-center rounded-full bg-violet-500/10 ring-1 ring-violet-500/30">
							<Loader2 className="h-10 w-10 animate-spin text-violet-400" />
						</div>
						<div>
							<h2 className="text-xl font-semibold text-white">
								Camera Access Required
							</h2>
							<p className="mt-2 max-w-sm text-sm text-white/50">
								Please allow camera access in your browser to continue with
								the assessment.
							</p>
						</div>
					</>
				) : (
					<>
						<div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 ring-1 ring-red-500/30">
							<ShieldAlert className="h-10 w-10 text-red-400" />
						</div>
						<div>
							<h2 className="text-xl font-semibold text-white">
								Camera Access Denied
							</h2>
							<p className="mt-2 max-w-sm text-sm text-white/50">
								Camera access is required for this assessment. Please enable
								camera permissions in your browser settings and try again.
							</p>
						</div>
						<Button
							onClick={onRetry}
							className="gap-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:from-violet-400 hover:to-purple-500"
						>
							<Camera className="h-4 w-4" />
							Retry Camera Access
						</Button>
					</>
				)}
			</div>
		</div>
	);
}
