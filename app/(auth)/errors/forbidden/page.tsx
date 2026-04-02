import { ErrorTemplate } from "../_components/error-template";

export default function ForbiddenErrorPage() {
  return (
    <ErrorTemplate
      code="403 forbidden"
      title="Forbidden"
      description="You do not have permission to access this resource."
    />
  );
}
