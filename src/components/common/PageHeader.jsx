import React from "react";

function PageHeader({
  title,
  subtitle,
  as: TitleTag = "h1",
  actions = null,
  className = "",
  /** Replaces default `max-w-md` when set (e.g. `flex-1 max-w-none` with actions). */
  contentClassName = "",
  titleClassName = "",
  subtitleClassName = "",
}) {
  const titleCls = `text-xl font-semibold tracking-tight text-slate-900 ${titleClassName}`.trim();
  const subtitleCls = `text-sm leading-5 text-slate-500 ${subtitleClassName}`.trim();
  const leftColClass = `min-w-0 ${contentClassName || "max-w-md"}`.trim();

  return (
    <header className={`border-b border-slate-200 bg-white px-8 py-4 shrink-0 ${className}`.trim()}>
      <div className="flex items-start justify-between gap-4">
        <div className={leftColClass}>
          <TitleTag className={titleCls}>{title}</TitleTag>
          {subtitle ? (
            <p className={`mt-1 min-w-0 max-w-full ${subtitleCls}`.trim()}>{subtitle}</p>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-3">{actions}</div> : null}
      </div>
    </header>
  );
}

export default PageHeader;
