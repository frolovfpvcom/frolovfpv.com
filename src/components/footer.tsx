export function Footer() {
  return (
    <footer className="border-t border-white/[0.04] py-8 px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-neutral-600">
          &copy; {new Date().getFullYear()} Frolov FPV. Alle rettigheder forbeholdes.
        </p>
        <div className="flex gap-6">
          <a
            href="https://youtube.com/@frolovfpv"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-neutral-600 hover:text-white transition-colors"
          >
            YouTube
          </a>
        </div>
      </div>
    </footer>
  );
}
