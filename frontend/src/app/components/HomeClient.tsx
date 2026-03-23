"use client";

import { Button, Card, CardHeader, Text, Title1 } from "@fluentui/react-components";
import Swal from "sweetalert2";

export default function HomeClient() {
  const handleAlert = () => {
    Swal.fire({
      title: "Welcome to Planty!",
      text: "Your monorepo is set up and ready to go.",
      icon: "success",
      confirmButtonText: "Let's go 🌱",
    });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-green-50 p-8">
      <Title1 className="text-green-800">🌱 Planty Mono</Title1>

      <Card className="w-full max-w-md shadow-lg">
        <CardHeader
          header={<Text weight="semibold">Monorepo Stack</Text>}
          description={
            <Text size={200} className="text-gray-500">
              Next.js · FluentUI · TailwindCSS · SweetAlert2 · Go
            </Text>
          }
        />
        <div className="flex flex-col gap-4 p-4">
          <p className="text-sm text-gray-600">
            This monorepo includes a Next.js frontend with FluentUI components,
            TailwindCSS for styling, SweetAlert2 for alerts, and a Go backend.
          </p>
          <Button appearance="primary" onClick={handleAlert}>
            Show Welcome Alert
          </Button>
        </div>
      </Card>
    </div>
  );
}
