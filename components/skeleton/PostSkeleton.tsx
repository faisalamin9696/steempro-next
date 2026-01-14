import { Card } from "@heroui/card";

type Props = {
  titleLines?: number; // number of lines for title (usually 1)
  bodyLines?: number; // number of paragraph lines
  className?: string;
};

export default function PostSkeleton({
  titleLines = 1,
  bodyLines = 4,
  className = "",
}: Props) {
  const titlePlaceholder = (
    <div className="h-6 rounded-md bg-gray-200 dark:bg-slate-700 w-3/4" />
  );

  const line = (w: string) => (
    <div className={`h-4 rounded bg-gray-200 dark:bg-slate-700 ${w}`} />
  );

  return (
    <div
      className={`max-w-4xl mx-auto p-4 ${className}`}
      aria-busy="true"
      aria-live="polite"
    >
      <Card className="card p-4 flex flex-col gap-4 animate-pulse items-center">
        <div className="flex flex-col gap-4 items-start w-full">
          {/* Header / avatar */}
          <div className="flex items-center gap-3 w-full">
            <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-slate-700" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 rounded bg-gray-200 dark:bg-slate-700" />
              <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-slate-700" />
            </div>
          </div>

          {/* Title placeholder */}
          <div className="w-full">
            {Array.from({ length: titleLines }).map((_, i) => (
              <div key={i} className="mb-2">
                {titlePlaceholder}
              </div>
            ))}
          </div>
        </div>

        {/* Body placeholders */}
        <div className="flex flex-col gap-2 w-full prose">
          {Array.from({ length: bodyLines }).map((_, i) => {
            // vary width for more realism
            const widths = ["w-full", "w-11/12", "w-10/12", "w-9/12"];
            const w = widths[i % widths.length];
            return <div key={i}>{line(w)}</div>;
          })}
        </div>
      </Card>
    </div>
  );
}
