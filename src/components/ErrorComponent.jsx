import '../styles/error.css';

const ErrorComponent = ({ message, onDismiss }) => {
  if (!message) return null;

  return (
    <div className="error-container" role="alert" aria-live="assertive">
      <div className="error-content">
        <span className="error-icon">⚠</span>
        <p className="error-message">{message}</p>
        <button
          className="error-close-btn"
          onClick={onDismiss}
          aria-label="Close error message"
          title="Dismiss error"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default ErrorComponent;
