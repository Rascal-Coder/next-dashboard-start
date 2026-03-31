"use client";

import { useRouter } from '@bprogress/next/app';
import { type FC } from 'react';

import { Button } from '@/components/animate-ui/components/buttons/button';

const NotFound: FC = () => {
  const router = useRouter();
  return (
    <div className="min-h-150 flex justify-center items-center h-full">
      <div className="text-center">
        <h1 className="mt-4 text-5xl font-semibold tracking-tight text-balance text-gray-900 sm:text-7xl">404</h1>
        <p className="mt-6 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8">
          It seems that this page has gone on a round-the-world trip and hasn&apos;t sent the postcard back yet.
        </p>
        <div className="flex items-center justify-center mt-10">
          <Button onClick={() => router.push('/dashboard')}>Go back home</Button>
        </div>
      </div>
    </div>
  )
}
export default NotFound;