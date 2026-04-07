import { InteractiveGridPattern } from "@/components/interactive-grid";
import { Logo } from "@/components/logo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { SignInForm } from "./sign-in-form";


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
              <CardDescription>使用用户名、密码与验证码登录。</CardDescription>
            </CardHeader>
            <CardContent>
              <SignInForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
