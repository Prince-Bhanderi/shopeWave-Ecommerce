import Modal from './Modal';

/**
 * Reusable confirmation dialog for destructive/important admin actions
 * (delete product, cancel order, block user, etc.)
 */
const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  isDestructive = true,
  isLoading = false,
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={title}
    size="sm"
    footer={
      <>
        <button type="button" className="btn-secondary" onClick={onClose} disabled={isLoading}>
          Cancel
        </button>
        <button
          type="button"
          className={isDestructive ? 'btn-danger' : 'btn-primary'}
          onClick={onConfirm}
          disabled={isLoading}
        >
          {isLoading ? 'Please wait...' : confirmLabel}
        </button>
      </>
    }
  >
    <p className="text-sm text-slate-600">{message}</p>
  </Modal>
);

export default ConfirmDialog;
