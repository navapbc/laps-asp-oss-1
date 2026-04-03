import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "../landing/theme-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      {/* ─── Header ─── */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link className="flex items-center gap-2.5" href="/landing">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
              <span className="font-serif text-sm font-bold text-primary-foreground">
                N
              </span>
            </div>
            <span className="font-serif text-lg font-semibold text-foreground">
              Form-Filling Assistant
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ─── Back Link ─── */}
      <div className="mx-auto w-full max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
        <Link
          className="flex w-fit items-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
          href="/home"
        >
          <ArrowLeftIcon className="size-3.5" />
          Back
        </Link>
      </div>

      {/* ─── Main Content ─── */}
      <main className="flex flex-1 items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">{children}</div>
      </main>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border/40 bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
          <p className="font-sans text-sm text-muted-foreground">
            Built by{" "}
            <a
              className="text-primary underline underline-offset-2 transition-colors hover:text-primary/80"
              href="https://www.navapbc.com"
              rel="noopener noreferrer"
              target="_blank"
            >
              Nava PBC
            </a>{" "}
            &middot; Open Source &middot; Public Interest Technology
          </p>
        </div>
      </footer>
    </div>
  );
}
