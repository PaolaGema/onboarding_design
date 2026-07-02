export default function EmptyState({ icon: Icon, title, description, actionLabel, actionIcon: ActionIcon, onAction }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '40px 20px' }}>
      <div style={{
        width: 72, height: 72, borderRadius: '50%', background: 'var(--green-tint)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14,
      }}>
        <Icon size={30} strokeWidth={1.5} style={{ color: 'var(--green)' }} />
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#0C2D40' }}>{title}</div>
      {description && (
        <p style={{ fontSize: 11.5, color: 'var(--text-muted)', margin: '4px 0 0', maxWidth: 320, lineHeight: 1.55 }}>
          {description}
        </p>
      )}
      {actionLabel && (
        <button className="pl-btn-new" style={{ marginTop: 16 }} onClick={onAction}>
          {ActionIcon && <ActionIcon size={14} />}
          {actionLabel}
        </button>
      )}
    </div>
  )
}
