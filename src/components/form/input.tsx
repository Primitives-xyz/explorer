interface Props {
  name: string
  type?: string
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  id?: string
  className?: string
}

export function Input({
  name,
  placeholder,
  type = 'text',
  value,
  onChange,
  id,
  className,
}: Props) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      className={`bg-transparent border border-foreground p-2 w-full ${
        className || ''
      }`}
      placeholder={placeholder}
      name={name}
      onChange={onChange}
    />
  )
}
