    export default function ConfirmModal({ title, message, onConfirm, onCancel }) {
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>{title}</h3>
        <p className="text-muted">{message}</p>

        <div className="modal-actions">
          <button className="button button-outline" onClick={onCancel}>
            Cancel
          </button>
          <button className="button button-danger" onClick={onConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
