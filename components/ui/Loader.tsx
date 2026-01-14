import { Spinner } from "@heroui/spinner";

function Loader() {
  return (
    <div className="flex justify-center items-center min-h-64">
      <Spinner size="lg" />
    </div>
  );
}

export default Loader;
