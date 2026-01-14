export default function EmptyList({ message }: { message?: string }) {
  return (
    <p className="text-center text-default-600 mt-4 p-4 text-sm">
      {message ?? `Yay! You have seen it all`} 🌟
    </p>
  );
}
