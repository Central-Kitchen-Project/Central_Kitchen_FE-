import React from "react";

function PageHeader({
  title,
  subtitle,
  as: TitleTag = "h1",
  actions = null,
  className = "",
  contentClassName = "",
  titleClassName = "",
  subtitleClassName = "",
}) {
  return (
    <header className={`border-b border-slate-200 bg-white px-8 py-4 shrink-0 ${className}`.trim()}>
      <div className="flex items-start justify-between gap-4">
        <div className={`max-w-md ${contentClassName}`.trim()}>
          <TitleTag className={`text-xl font-semibold tracking-tight text-slate-900 ${titleClassName}`.trim()}>
            {title}
          </TitleTag>
          {subtitle ? (
            <p className={`mt-1 max-w-md text-sm leading-5 text-slate-500 ${subtitleClassName}`.trim()}>
              {subtitle}
            </p>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-3">{actions}</div> : null}
      </div>
    </header>
  );
}

export default PageHeader;
