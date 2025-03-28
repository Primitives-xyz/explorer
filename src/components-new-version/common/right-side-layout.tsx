interface Props {
  children: React.ReactNode
}

export function RightSideLayout({ children }: Props) {
  return <div className="pt-[100px] min-w-[300px]">{children}</div>
}
