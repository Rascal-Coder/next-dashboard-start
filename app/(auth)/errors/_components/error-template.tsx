"use client";

import { useRouter } from "@bprogress/next/app";
import { type FC } from "react";

import { RippleButton } from "@/components/animate-ui/components/buttons/ripple";

type ErrorTemplateProps = {
  code: string;
  title: string;
  description: string;
};

export const ErrorTemplate: FC<ErrorTemplateProps> = ({ code, title, description }) => {
  const router = useRouter();

  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-2xl rounded-3xl border border-border bg-card p-8 text-center shadow-xl backdrop-blur sm:p-12">
        <p className="inline-flex rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {code}
        </p>
        <h1 className="mt-6 text-5xl font-bold tracking-tight text-balance text-foreground sm:text-6xl">{title}</h1>
        <p className="mt-4 text-base font-medium text-pretty text-muted-foreground sm:text-lg">{description}</p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <RippleButton type="button" variant="default" className="cursor-pointer px-5 py-2.5" onClick={() => router.push("/")}>
            Go back home
          </RippleButton>
        </div>
      </div>
    </div>
  );
};
