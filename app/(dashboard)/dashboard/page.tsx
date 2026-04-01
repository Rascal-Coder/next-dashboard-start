import { RippleButton, RippleButtonRipples } from "@/components/animate-ui/components/buttons/ripple";

export default function DashboardPage() {
  return <div>
    <RippleButton type="button">
      Ripple Button
      <RippleButtonRipples />
    </RippleButton>
  </div>
}