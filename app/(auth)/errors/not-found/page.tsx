import { ErrorTemplate } from "../_components/error-template";

export default function NotFoundErrorPage() {
  return (
    <ErrorTemplate
      code="404 not found"
      title="Page Not Found"
      description="The page you are trying to reach does not exist or has been moved."
    />
  );
}
