"use client";

import { useRouter } from '@bprogress/next/app';
import { type FC } from 'react';

import { RippleButton } from '@/components/animate-ui/components/buttons/ripple';

const NotFound: FC = () => {
  const router = useRouter();
  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-2xl rounded-3xl border border-border bg-card p-8 text-center shadow-xl backdrop-blur sm:p-12">
        <p className="inline-flex rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          404 not found
        </p>
        <h1 className="mt-6 text-6xl font-bold tracking-tight text-balance text-foreground sm:text-8xl">Oops!</h1>
        <p className="mt-4 text-xl font-semibold text-foreground/90 sm:text-2xl">This page is taking the scenic route.</p>
        <p className="mt-4 text-base font-medium text-pretty text-muted-foreground sm:text-lg">
          It seems that this page has gone on a round-the-world trip and hasn&apos;t sent the postcard back yet.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <RippleButton type="button" variant="default" className="cursor-pointer px-5 py-2.5" onClick={() => router.push('/')}>
            Go back home
          </RippleButton>
          <RippleButton type="button" variant="outline" className="cursor-pointer px-5 py-2.5" onClick={() => router.back()}>
            Go back
          </RippleButton>
        </div>
      </div>
    </div>
  );
};
export default NotFound;