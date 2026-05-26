export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="text-center py-16 px-6">
      <div className="text-5xl mb-4 opacity-30">{icon}</div>
      <h3 className="text-base font-bold text-gray-400 mb-2">{title}</h3>
      {description && <p className="text-sm text-gray-300 mb-6">{description}</p>}
      {action}
    </div>
  );
}
