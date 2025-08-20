import React, { useState } from "react"
import classNames from "classnames"
import _ from "lodash"

export function Spinner() {
  return <i className="fa fa-spinner fa-spin" />
}

export function Button({
  type = "secondary",
  onClick,
  disabled,
  active,
  size,
  children
}) {
  const btnType = type === "default" ? "secondary" : type
  const btnSize = size === "xs" ? "sm" : size

  return (
    <button
      type="button"
      className={classNames("btn", `btn-${btnType}`, { active }, { [`btn-${btnSize}`]: size })}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

export function Icon({ id }) {
  if (id.match(/^fa-/)) {
    return <i className={`fa ${id}`} />
  }
  return null
}
export function FormGroup({ label, labelMuted, hint, help, children }) {
  return (
    <div className="mb-3">
      <label>
        {labelMuted ? <span className="text-muted">{label}</span> : label}
        {hint && (
          <span className="text-muted" style={{ fontWeight: label ? "normal" : undefined }}>
            {label ? " - " : null}
            {hint}
          </span>
        )}
      </label>
      <div style={{ marginLeft: 5 }}>{children}</div>
      {help && (
        <p className="form-text text-muted" style={{ marginLeft: 5 }}>{help}</p>
      )}
    </div>
  )
}


export function Checkbox({ value, onChange, inline, nullForFalse, disabled, children }) {
  const id = React.useId()

  const handleChange = (ev) => {
    if (!onChange) return
    if (nullForFalse) {
      onChange(ev.target.checked || null)
    } else {
      onChange(ev.target.checked)
    }
  }

  const checkbox = (
    <>
      <input
        type="checkbox"
        id={id}
        disabled={disabled}
        className="form-check-input"
        checked={value || false}
        onChange={onChange ? handleChange : undefined}
      />
      <label className="form-check-label" htmlFor={id}>{children}</label>
    </>
  )

  return (
    <div className={classNames("form-check", { "form-check-inline": inline })}>
      {checkbox}
    </div>
  )
}


export function Radio({ value, radioValue, onChange, inline, disabled, children }) {
  const id = React.useId()

  const handleClick = () => {
    onChange?.(radioValue)
  }

  return (
    <div className={classNames("form-check", { "form-check-inline": inline })}>
      <input
        type="radio"
        id={id}
        disabled={disabled}
        className="form-check-input"
        checked={value === radioValue}
        onChange={() => {}}
        onClick={handleClick}
      />
      <label className="form-check-label" htmlFor={id}>{children}</label>
    </div>
  )
}


export function Select({ value, onChange, options, size, nullLabel, style, inline }) {
  const opts = [...options]
  if (nullLabel != null) {
    opts.unshift({ value: null, label: nullLabel })
  }

  let mergedStyle = inline ? { width: "auto", display: "inline-block" } : {}
  _.extend(mergedStyle, style || {})

  const handleChange = (ev) => {
    const val = JSON.parse(ev.target.value)
    onChange?.(val)
  }

  return (
    <select
      style={mergedStyle}
      disabled={onChange == null}
      className={classNames("form-select", {
        "form-select-sm": size === "sm",
        "form-select-lg": size === "lg"
      })}
      value={JSON.stringify(value != null ? value : null)}
      onChange={onChange ? handleChange : undefined}
    >
      {opts.map((option) => (
        <option key={JSON.stringify(option.value)} value={JSON.stringify(option.value)}>
          {option.label}
        </option>
      ))}
    </select>
  )
}


export function TextInput({ value, onChange, placeholder, size, emptyNull, style }) {
  const inputRef = useRef(null)

  const handleChange = (e) => {
    let val = e.target.value
    if (emptyNull) val = val || null
    onChange?.(val)
  }

  return (
    <input
      ref={inputRef}
      type="text"
      className={classNames("form-control", {
        "form-control-sm": size === "sm",
        "form-control-lg": size === "lg"
      })}
      value={value || ""}
      style={style}
      onChange={onChange ? handleChange : undefined}
      placeholder={placeholder}
      disabled={onChange == null}
    />
  )
}

export function NumberInput({
  decimal,
  value,
  onChange,
  style = {},
  size,
  onTab,
  onEnter,
  decimalPlaces,
  placeholder,
  min,
  max
}) {
  const [inputText, setInputText] = useState(formatInput({ decimal, value, decimalPlaces }))
  const inputRef = useRef(null)

  useEffect(() => {
    setInputText(formatInput({ decimal, value, decimalPlaces }))
  }, [value])

  const formatInput = ({ decimal, value, decimalPlaces }) => {
    if (value == null) return ""
    if (!decimal) return "" + Math.floor(value)
    if (decimalPlaces != null) return value.toFixed(decimalPlaces)
    return "" + value
  }

  const getNumericValue = () => {
    let val = decimal ? parseFloat(inputText) : parseInt(inputText)
    if (isNaN(val)) return null
    if (decimalPlaces != null) val = parseFloat(val.toFixed(decimalPlaces))
    return val
  }

  const isValid = () => {
    if (inputText.length === 0) return true
    const isNum = decimal
      ? inputText.match(/^-?[0-9]*\.?[0-9]+$/) && !isNaN(parseFloat(inputText))
      : inputText.match(/^-?\d+$/)
    if (!isNum) return false
    const val = getNumericValue()
    if (val && max != null && val > max) return false
    if (val && min != null && val < min) return false
    return true
  }

  const handleBlur = () => {
    if (isValid()) {
      const val = getNumericValue()
      if (val !== value) onChange?.(val)
    }
  }

  const handleKeyDown = (e) => {
    if (e.keyCode === 13) {
      handleBlur()
      onEnter?.(e)
      e.preventDefault()
    }
    if (e.keyCode === 9) {
      handleBlur()
      onTab?.(e)
      e.preventDefault()
    }
  }

  const redStyle = {
    borderColor: "#a94442",
    boxShadow: "inset 0 1px 1px rgba(0,0,0,.075)",
    backgroundColor: "rgba(132, 53, 52, 0.12)"
  }

  const inputStyle = {
    ...style,
    width: style.width || "8em",
    ...(isValid() ? {} : redStyle)
  }

  let inputType = decimal ? "number" : "tel"
  if (decimal && navigator.userAgent.match(/SM-/)) inputType = "text"

  return (
    <input
      ref={inputRef}
      type={inputType}
      className={`form-control ${size ? `form-control-${size}` : ""}`}
      lang="en"
      style={inputStyle}
      value={inputText}
      onChange={onChange ? (e) => setInputText(e.target.value) : () => {}}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      disabled={onChange == null}
    />
  )
}

export function CollapsibleSection({ initiallyOpen = false, label, labelMuted, hint, children }) {
  const [open, setOpen] = useState(initiallyOpen)
  const toggle = () => setOpen(!open)

  return (
    <div className="mb-3">
      <label onClick={toggle} style={{ cursor: "pointer" }}>
        <i className={`fa fa-fw ${open ? "fa-caret-down" : "fa-caret-right"} ${labelMuted ? "text-muted" : ""}`} />
        {labelMuted ? <span className="text-muted">{label}</span> : label}
        {hint && (
          <span className="text-muted" style={{ fontWeight: label ? "normal" : undefined }}>
            {label ? " - " : null}
            {hint}
          </span>
        )}
      </label>
      {open && <div style={{ marginLeft: 5 }}>{children}</div>}
    </div>
  )
}

export function NavPills({ pills, activePill, onPillClick }) {
  return (
    <ul className="nav nav-pills">
      {pills.map((pill) => (
        <li key={pill.id} className="nav-item">
          <a
            href={pill.href}
            onClick={() => onPillClick?.(pill.id)}
            className={pill.id === activePill ? "nav-link active" : "nav-link"}
          >
            {pill.label}
          </a>
        </li>
      ))}
    </ul>
  )
}

export function Toggle({ value, onChange, options, size, allowReset }) {
  const renderOption = (option, index) => {
    const isActive = value === option.value
    const nextValue = isActive && allowReset ? null : option.value

    return (
      <button
        key={index}
        type="button"
        className={classNames("btn", {
          "btn-outline-primary": !isActive,
          "btn-primary": isActive,
          active: isActive
        })}
        onClick={() => {
          if (!isActive || allowReset) onChange?.(nextValue)
        }}
        style={{ whiteSpace: "nowrap" }}
      >
        {option.label}
      </button>
    )
  }

  const groupSize = size === "xs" ? "sm" : size

  return (
    <div className={`btn-group ${groupSize ? `btn-group-${groupSize}` : ""}`}>{options.map(renderOption)}</div>
  )
}

export function CollapsiblePanel({ title, hint, children, initiallyClosed }) {
  const [open, setOpen] = useState(initiallyClosed ? false : true)

  return (
    <div className="card mb-3">
      <div className="card-header">
        <div
          style={{ display: "inline-block", paddingRight: 5, color: "var(--bs-primary)", cursor: "pointer" }}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <i className="fas fa-caret-down fa-fw" /> : <i className="fas fa-caret-right fa-fw" />}
        </div>
        {title}
        {hint ? <span className="text-muted"> - {hint}</span> : null}
      </div>
      {open ? <div className="card-body">{children}</div> : null}
    </div>
  )
}



