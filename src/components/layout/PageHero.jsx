export default function PageHero({ icon: Icon, image, title, description, actionLabel, actionIcon: ActionIcon, onAction }) {
  return (
    <div className="welcome-banner">
      <div className="welcome-left">
        {image ? (
          <img src={image} alt="" className="welcome-mascot" />
        ) : Icon && (
          <div className="welcome-icon-badge">
            <Icon size={28} style={{ color: '#00E091' }} strokeWidth={1.75} />
          </div>
        )}
        <div className="welcome-content">
          <div className="welcome-title">{title}</div>
          {description && <div className="welcome-sub">{description}</div>}
        </div>
      </div>
      {actionLabel && (
        <div className="welcome-actions">
          <button className="btn-outline-light" onClick={onAction}>
            {ActionIcon && <ActionIcon size={13} />}
            {actionLabel}
          </button>
        </div>
      )}
    </div>
  )
}
