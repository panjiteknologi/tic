export function Footer() {
  return (
    <div className="flex items-center justify-center w-full bg-white shadow backdrop-blur supports-[backdrop-filter]:bg-background/60 fixed bottom-0">
      <div className="mx-4 md:mx-8 flex h-14 items-center">
        <p className="text-center text-xs md:text-sm leading-loose text-muted-foreground">
          &copy; {new Date().getFullYear()} Carbon Emissions. All rights
          reserved.
        </p>
      </div>
    </div>
  );
}
