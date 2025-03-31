interface Props {
  children: React.ReactNode
}

export function RightSideLayout({ children }: Props) {
  return (
    <>
      <div className="w-sidebar-right px-6" />
      <div className="w-sidebar-right px-6 fixed top-topbar right-0 bottom-0 inset-y-0">
        <div className="pt-[50px]">{children}</div>
      </div>
    </>
  )
}
