import { ErrorTemplate } from "../_components/error-template";

export default function UnauthorizedErrorPage() {
  return (
    <ErrorTemplate
      code="401 unauthorized"
      title="Unauthorized"
      description="Please sign in with a valid account to continue."
    />
  );
}
