import { ErrorTemplate } from "../_components/error-template";

export default function UnderMaintenanceErrorPage() {
  return (
    <ErrorTemplate
      code="503 under maintenance"
      title="Under Maintenance"
      description="We are currently improving the service. Please check back soon."
    />
  );
}
