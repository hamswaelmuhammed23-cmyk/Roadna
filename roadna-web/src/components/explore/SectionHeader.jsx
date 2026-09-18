export default function SectionHeader({
  title,
  subtitle,
  iconUrl,
  actionLabel,
  onAction,
}) {
  return (
    <div className="mb-5 flex items-end justify-between">
      <div>
        <div className="mb-1 flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#EEF5FF] shadow-sm">
            <img src={iconUrl} alt="" className="h-4 w-4" />
          </span>
          <h2 className="text-lg font-bold text-[#2F80ED]">{title}</h2>
        </div>
        {subtitle ? <p className="ml-10 text-sm text-gray-400">{subtitle}</p> : null}
      </div>

      {actionLabel ? (
        <button
          onClick={onAction}
          className="text-sm font-semibold text-[#2F80ED] transition-colors hover:text-[#1f64c7]"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  )
}
