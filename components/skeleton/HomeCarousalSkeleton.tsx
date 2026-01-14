
function HomeCarousalSkeleton() {
  return (
    <div className="flex flex-col animate-pulse bg-foreground/10 rounded-2xl">
      <div className="h-40 w-full" />

      <div
        className="flex flex-col p-2 w-full absolute bottom-0 gap-2 bg-black/50 rounded-b-2xl
                backdrop-blur-sm z-10"
      >
        <div className="text-sm h-2 w-full bg-foreground/10" />

        <div className="flex flex-row items-center gap-2 text-tiny">
          <div className=" h-[25px] w-[25px] rounded-xl bg-foreground/10" />
          <div className="text-sm h-2 w-10 bg-foreground/10" />
          <div className="text-sm h-2 w-14 bg-foreground/10" />
        </div>
      </div>
    </div>
  );
}

export default HomeCarousalSkeleton;
