import Link from "next/link";

import { LiquidButton } from "@/components/animate-ui/components/buttons/liquid";
import { InteractiveGridPattern } from "@/components/interactive-grid";
import { Logo } from "@/components/logo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";


export default function SignInPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden min-h-screen w-full flex-col overflow-hidden border-border border-r bg-primary p-10 text-primary-foreground lg:flex">
        <InteractiveGridPattern
          className={cn(
            "mask-[radial-gradient(400px_circle_at_center,white,transparent)]",
            "inset-x-0 inset-y-[0%] h-full skew-y-12"
          )}
        />
        <div className="relative z-20 flex shrink-0 items-center text-lg font-medium">
          <Logo size={32} decorative className="mr-3 h-8 w-8" />
          Xpress
        </div>
        <div className="relative z-20 mt-auto max-w-md space-y-2">
          <p className="text-sm text-primary-foreground/75">Welcome back</p>
          <h1 className="text-3xl font-semibold tracking-tight">Sign in to continue your workflow</h1>
        </div>
      </div>

      <div className="flex h-full items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="flex w-md flex-col items-center justify-center space-y-6 md:max-w-lg">
          <Card className="w-full shadow-sm">
            <CardHeader className="space-y-2 px-8 pt-8">
              <CardTitle>Sign in</CardTitle>
              <CardDescription>Use your email and password to access your account.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="you@example.com" autoComplete="email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder="Enter your password" autoComplete="current-password" />
                </div>
                
                <LiquidButton asChild className="w-full">
                  <Link href="/dashboard">Continue</Link>
                </LiquidButton>
              </form>
              <p className="mt-6 text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link href="/sign-up" className="font-medium text-primary hover:underline">
                  Sign up
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
