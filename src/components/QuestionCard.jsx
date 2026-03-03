import './QuestionCard.css';

const QuestionCard = ({ question, value, onChange, options, type = 'text', required = false, placeholder, hasOtherField, otherValue, onOtherChange }) => {
  const renderInput = () => {
    switch (type) {
      case 'select':
        return (
          <>
            <select
              className="question-input select-input"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              required={required}
            >
              <option value="">Select an option</option>
              {options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {hasOtherField && value === 'Other' && (
              <input
                type="text"
                className="question-input other-input"
                value={otherValue || ''}
                onChange={(e) => onOtherChange(e.target.value)}
                placeholder="Type your department here..."
                required
              />
            )}
          </>
        );

      case 'radio':
        return (
          <div className="radio-group">
            {options?.map((option) => (
              <label key={option.value} className="radio-option">
                <input
                  type="radio"
                  name={question}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => onChange(e.target.value)}
                  required={required}
                />
                <span className="radio-label">{option.label}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="checkbox-group">
            {options?.map((option) => (
              <label key={option.value} className="checkbox-option">
                <input
                  type="checkbox"
                  value={option.value}
                  checked={Array.isArray(value) && value.includes(option.value)}
                  onChange={(e) => {
                    const currentValues = Array.isArray(value) ? value : [];
                    if (e.target.checked) {
                      onChange([...currentValues, option.value]);
                    } else {
                      onChange(currentValues.filter(v => v !== option.value));
                    }
                  }}
                />
                <span className="checkbox-label">{option.label}</span>
              </label>
            ))}
          </div>
        );

      case 'textarea':
        return (
          <textarea
            className="question-input textarea-input"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            rows={4}
            placeholder="Type your answer here..."
            required={required}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            className="question-input"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            min="0"
            placeholder="Enter a number"
            required={required}
          />
        );

      default:
        return (
          <input
            type="text"
            className="question-input"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || "Type your answer here..."}
            required={required}
          />
        );
    }
  };

  return (
    <div className="question-card">
      <label className="question-label">
        {question}
        {required && <span className="required-star"> *</span>}
      </label>
      {renderInput()}
    </div>
  );
};

export default QuestionCard;
