"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { LiquidButton } from "@/components/animate-ui/components/buttons/liquid";
import { Form, FormField } from "@/components/ui/form";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { getCaptcha, httpRequest, isSuccess } from "@/lib/http";
import { useAuthStore } from "@/stores/auth-store";

const signInSchema = z.object({
  username: z.string().min(1, { error: "请输入用户名" }),
  password: z.string().min(1, { error: "请输入密码" }),
  code: z.string().min(1, { error: "请输入验证码" }),
});

type SignInValues = z.infer<typeof signInSchema>;

type LoginData = {
  token: string;
  refreshToken: string;
};

type LoginPayload = SignInValues & { codeId: string };

async function postLogin(values: LoginPayload) {
  const res = await httpRequest.post<LoginData>(
    "/login",
    {
      username: values.username,
      password: values.password,
      code: values.code,
      codeId: values.codeId,
    },
    {
      skipAuth: true,
      skipErrorHandler: true,
    },
  );
  if (!isSuccess(res.code) || !res.data) {
    throw new Error(res.msg || "登录失败，请重试");
  }
  return res.data;
}

export function SignInForm() {
  const router = useRouter();
  const setTokens = useAuthStore((s) => s.setTokens);
  const setUser = useAuthStore((s) => s.setUser);
  const clearSession = useAuthStore((s) => s.clearSession);

  const refImg = useRef<HTMLDivElement>(null);
  const [codeId, setCodeId] = useState("");

  const refreshCaptcha = useCallback(() => {
    getCaptcha()
      .then((res) => {
        if (refImg.current) refImg.current.innerHTML = res.img;
        setCodeId(res.id);
      })
      .catch((err) => {
        toast({
          variant: "destructive",
          description: err instanceof Error ? err.message : "获取验证码失败",
        });
      });
  }, []);

  useEffect(() => {
    refreshCaptcha();
  }, [refreshCaptcha]);

  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      username: "",
      password: "",
      code: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: postLogin,
    onSuccess: (tokens) => {
      setUser(null);
      setTokens(tokens);
      router.push("/dashboard");
    },
    onError: (error) => {
      clearSession();
      toast({
        variant: "destructive",
        description:
          error instanceof Error ? error.message : "登录失败，请重试",
      });
      form.setValue("code", "");
      refreshCaptcha();
    },
  });

  function onSubmit(values: SignInValues) {
    if (!codeId) {
      toast({ variant: "destructive", description: "请等待验证码加载完成" });
      return;
    }
    loginMutation.mutate({ ...values, codeId});
  }

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <FieldSet>
          <FieldGroup className="gap-6">
            <FormField
              control={form.control}
              name="username"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <FieldLabel htmlFor="sign-in-username">用户名</FieldLabel>
                  <FieldContent>
                    <Input
                      id="sign-in-username"
                      type="text"
                      placeholder="请输入用户名"
                      autoComplete="username"
                      {...field}
                    />
                    <FieldError errors={fieldState.error ? [fieldState.error] : undefined} />
                  </FieldContent>
                </Field>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <FieldLabel htmlFor="sign-in-password">密码</FieldLabel>
                  <FieldContent>
                    <Input
                      id="sign-in-password"
                      type="password"
                      placeholder="请输入密码"
                      autoComplete="current-password"
                      {...field}
                    />
                    <FieldError errors={fieldState.error ? [fieldState.error] : undefined} />
                  </FieldContent>
                </Field>
              )}
            />
            <FormField
              control={form.control}
              name="code"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <FieldLabel htmlFor="sign-in-code">验证码</FieldLabel>
                  <FieldContent className="gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <div
                        ref={refImg}
                        className="flex min-h-10 min-w-[120px] items-center rounded-md border border-border bg-muted/30 px-2 py-1 [&_img]:max-h-10 [&_img]:w-auto"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        className="shrink-0"
                        onClick={refreshCaptcha}
                        aria-label="换一张验证码"
                      >
                        <RefreshCw />
                      </Button>
                    </div>
                    <Input
                      id="sign-in-code"
                      type="text"
                      placeholder="请输入验证码"
                      autoComplete="one-time-code"
                      {...field}
                    />
                    <FieldError errors={fieldState.error ? [fieldState.error] : undefined} />
                  </FieldContent>
                </Field>
              )}
            />
          </FieldGroup>
        </FieldSet>

        <LiquidButton type="submit" className="w-full" disabled={loginMutation.isPending}>
          {loginMutation.isPending ? "Signing in…" : "Continue"}
        </LiquidButton>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="font-medium text-primary hover:underline">
          Sign up
        </Link>
      </p>
    </Form>
  );
}
