import { Spinner } from "@heroui/spinner";

function LoadingStatus({ message }: { message?: string }) {
  return (
    <div className="text-center py-12">
      <Spinner />
      <p className="text-muted">{message ?? "Loading data..."}</p>
    </div>
  );
}

export default LoadingStatus;
