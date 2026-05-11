import { createFileRoute } from "@tanstack/react-router";
import { DemoApp } from "@/pages/demo/app";

export const Route = createFileRoute("/demo")({
  component: DemoApp,
});
