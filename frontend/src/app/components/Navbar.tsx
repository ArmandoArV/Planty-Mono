"use client";

import { Button, Text, Avatar } from "@fluentui/react-components";
import {
  PersonRegular,
  NavigationRegular,
  DismissRegular,
  SignOutRegular,
} from "@fluentui/react-icons";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useBreakpoint } from "../hooks";
import { useAuth } from "../lib/auth";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#cta", label: "Get Started" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isMd } = useBreakpoint();
  const { user, isAuthenticated, logout, loading } = useAuth();
  const router = useRouter();

  const dashboardHref = isAuthenticated ? `/dashboard/${user?.id}` : "/dashboard/demo";

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-50 w-full border-b border-border bg-surface/80 backdrop-blur-lg"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/Images/logoPlanty.png"
            alt="Planty logo"
            width={36}
            height={36}
            className="object-contain"
            priority
          />
          <Text weight="bold" size={500} className="tracking-tight text-foreground">
            Planty
          </Text>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-muted transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Desktop right buttons */}
        <div className="hidden items-center gap-3 md:flex">
          {!loading && isAuthenticated ? (
            <>
              <Link href={dashboardHref} className="flex items-center gap-2">
                <Avatar name={user?.name ?? "User"} size={28} color="brand" />
                <Text size={300} weight="semibold" className="text-foreground">
                  {user?.name}
                </Text>
              </Link>
              <Button appearance="subtle" size="small" icon={<SignOutRegular />} onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button appearance="subtle" size="medium" icon={<PersonRegular />}>
                  Login
                </Button>
              </Link>
              <Link href="/login">
                <Button appearance="primary" size="medium" className="rounded-full!">
                  Pre-Order Now
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        {!isMd && (
          <Button
            appearance="subtle"
            icon={mobileOpen ? <DismissRegular /> : <NavigationRegular />}
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          />
        )}
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && !isMd && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-border bg-surface md:hidden"
          >
            <div className="flex flex-col gap-4 px-6 py-4">
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm text-muted transition-colors hover:text-foreground"
                >
                  {l.label}
                </Link>
              ))}
              <div className="flex flex-col gap-2 pt-2">
                {!loading && isAuthenticated ? (
                  <>
                    <Link href={dashboardHref} onClick={() => setMobileOpen(false)}>
                      <Button appearance="subtle" icon={<PersonRegular />} className="w-full justify-start!">
                        {user?.name ?? "Dashboard"}
                      </Button>
                    </Link>
                    <Button appearance="subtle" icon={<SignOutRegular />} onClick={handleLogout} className="w-full justify-start!">
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setMobileOpen(false)}>
                      <Button appearance="subtle" icon={<PersonRegular />} className="w-full justify-start!">
                        Login
                      </Button>
                    </Link>
                    <Link href="/login" onClick={() => setMobileOpen(false)}>
                      <Button appearance="primary" className="rounded-full!">
                        Pre-Order Now
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
