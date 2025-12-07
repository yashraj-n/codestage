import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { Client, Stomp, type IFrame } from "@stomp/stompjs";
import SockJS from "sockjs-client";

export const Route = createFileRoute("/test")({
  component: RouteComponent,
});

function RouteComponent() {
  useEffect(() => {
    const stompClient = Stomp.over(
      () => new SockJS(`${import.meta.env.VITE_PUBLIC_SERVER_URL}/ws`)
    );
    stompClient.connect(
      {
        Authorization:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJjb2Rlc3RhZ2UiLCJzdWIiOiIxMCIsImNhbmRpZGF0ZSI6IntcImVtYWlsXCI6XCJ5bm5hcmtlNTJAZ21haWwuY29tXCIsXCJuYW1lXCI6XCJjb3NpXCIsXCJpc0FkbWluXCI6ZmFsc2UsXCJzZXNzaW9uSWRcIjpcIjEwXCJ9In0.Oi5GymWuiRN2XPOoMdhuxUQi_KOeueX1JHKWzFPWO7Q",
      },
      (frame: IFrame) => {
        console.log("Connected:", frame);
      }
    );

    stompClient.onConnect = () => {
      console.log("Connected");
    };

    stompClient.onStompError = (frame) => {
      console.error("Broker error:", frame.headers.message);
      console.error("Details:", frame.body);
    };

    stompClient.onWebSocketError = (error) => {
      console.error("WebSocket error:", error);
    };

  }, []);
  return <div>Hello "/test"!</div>;
}
