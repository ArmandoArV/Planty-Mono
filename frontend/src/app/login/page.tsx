"use client";

import { Card, Text, Input, Button, Label, Field, Spinner } from "@fluentui/react-components";
import { PersonRegular, LockClosedRegular, LeafOneRegular } from "@fluentui/react-icons";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, Suspense } from "react";
import { useAuth, isApiError } from "../lib/auth";
import { GuestRoute } from "../lib/guards";

type Mode = "login" | "register";

function LoginForm() {
  const router = useRouter();
  const { login, register } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "login") {
        const res = await login(email, password);
        router.push(`/dashboard/${res.user.id}`);
      } else {
        if (!name.trim()) {
          setError("Name is required");
          setLoading(false);
          return;
        }
        const res = await register(name, email, password);
        router.push(`/dashboard/${res.user.id}`);
      }
    } catch (err) {
      if (isApiError(err)) {
        setError(err.message);
      } else {
        setError("Something went wrong. Is the backend running?");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border border-border bg-surface p-8 shadow-lg">
          {/* Logo */}
          <div className="mb-6 flex flex-col items-center gap-2">
            <Link href="/">
              <Image
                src="/Images/logoPlanty.png"
                alt="Planty logo"
                width={56}
                height={56}
                className="object-contain"
                priority
              />
            </Link>
            <Text size={600} weight="bold" className="text-foreground">
              {mode === "login" ? "Welcome Back" : "Create Account"}
            </Text>
            <Text size={300} className="text-muted">
              {mode === "login"
                ? "Sign in to monitor your plants"
                : "Sign up to start growing with Planty"}
            </Text>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === "register" && (
              <Field label={<Label weight="semibold">Name</Label>} required>
                <Input
                  placeholder="Your name"
                  value={name}
                  onChange={(_, d) => setName(d.value)}
                  contentBefore={<PersonRegular />}
                  appearance="outline"
                />
              </Field>
            )}

            <Field label={<Label weight="semibold">Email</Label>} required>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(_, d) => setEmail(d.value)}
                contentBefore={<PersonRegular />}
                appearance="outline"
              />
            </Field>

            <Field label={<Label weight="semibold">Password</Label>} required>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(_, d) => setPassword(d.value)}
                contentBefore={<LockClosedRegular />}
                appearance="outline"
              />
            </Field>

            {error && (
              <Text size={200} className="text-red-500">
                {error}
              </Text>
            )}

            <Button
              type="submit"
              appearance="primary"
              size="large"
              disabled={loading || !email || !password}
              icon={loading ? <Spinner size="tiny" /> : <LeafOneRegular />}
              className="mt-2 rounded-full!"
            >
              {loading
                ? "Please wait…"
                : mode === "login"
                  ? "Sign In"
                  : "Create Account"}
            </Button>
          </form>

          {/* Toggle mode */}
          <div className="mt-6 text-center">
            <Text size={200} className="text-muted">
              {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setMode(mode === "login" ? "register" : "login");
                  setError("");
                }}
                className="cursor-pointer font-semibold text-accent underline-offset-2 hover:underline"
              >
                {mode === "login" ? "Sign up" : "Sign in"}
              </button>
            </Text>
          </div>

          {/* Demo link */}
          <div className="mt-4 text-center">
            <Link href="/dashboard/demo" className="text-xs text-muted hover:text-foreground transition-colors">
              or try the demo without logging in →
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="large" />
      </div>
    }>
      <GuestRoute>
        <LoginForm />
      </GuestRoute>
    </Suspense>
  );
}
