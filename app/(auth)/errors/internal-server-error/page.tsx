import { ErrorTemplate } from "../_components/error-template";

export default function InternalServerErrorPage() {
  return (
    <ErrorTemplate
      code="500 internal server error"
      title="Server Error"
      description="Something went wrong on our side. Please try again in a moment."
    />
  );
}
