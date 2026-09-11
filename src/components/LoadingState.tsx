export function LoadingState({ label = 'Cargando…' }: { label?: string }) {
  return (
    <div className="flex flex-1 items-center justify-center py-24">
      <div className="flex flex-col items-center gap-3 text-gray-400">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600"
          role="status"
          aria-label={label}
        />
        <p className="text-sm">{label}</p>
      </div>
    </div>
  );
}
