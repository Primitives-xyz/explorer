interface Props {
  children: React.ReactNode
}

export function RightSidebarWrapper({ children }: Props) {
  return (
    <div className="relative h-full pt-[50px] px-6">
      <div className="sticky top-[calc(var(--topbar-height)+1.25rem)] w-sidebar-right pb-6">
        {children}
      </div>
    </div>
  )
}
