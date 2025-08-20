import React from "react"
import { NumberInput } from "./bootstrap"

export function NumberInputComponent({
  decimal = true,
  value,
  onChange,
  style,
  small,
  placeholder
}) {
  return (
    <NumberInput
      decimal={decimal}
      value={value}
      onChange={onChange}
      style={style}
      size={small ? "sm" : undefined}
      placeholder={placeholder}
    />
  )
}
