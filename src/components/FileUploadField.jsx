import { useEffect, useId, useRef } from 'react'
import '../styles/FileUploadField.css'

export default function FileUploadField({
  accept,
  multiple = false,
  disabled = false,
  selectedFiles = [],
  onChange,
  buttonText = 'Scegli file',
  emptyText = 'Nessun file selezionato',
}) {
  const inputId = useId()
  const inputRef = useRef(null)
  const files = Array.from(selectedFiles || [])

  useEffect(() => {
    if (files.length === 0 && inputRef.current) {
      inputRef.current.value = ''
    }
  }, [files.length])

  const selectionText = files.length === 0
    ? emptyText
    : files.length === 1
      ? files[0].name
      : `${files.length} file selezionati`

  return (
    <div className={`file-upload-field ${disabled ? 'is-disabled' : ''}`}>
      <input
        ref={inputRef}
        id={inputId}
        className="file-upload-input"
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={onChange}
      />

      <label className="file-upload-button" htmlFor={inputId}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 16V4m0 0-4.5 4.5M12 4l4.5 4.5M5 14.5v3A2.5 2.5 0 0 0 7.5 20h9a2.5 2.5 0 0 0 2.5-2.5v-3" />
        </svg>
        <span>{buttonText}</span>
      </label>

      <span className={`file-upload-name ${files.length ? 'has-files' : ''}`} title={files.map((file) => file.name).join(', ')}>
        {selectionText}
      </span>
    </div>
  )
}
