import { createFileRoute, Outlet } from "@tanstack/react-router";
import { NotFoundPage } from "@/pages/not-found";

export const Route = createFileRoute("/c/$category")({
  component: () => <Outlet />,
  notFoundComponent: NotFoundPage,
});
