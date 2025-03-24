"use client"

import clsx from "clsx"
import type { LucideIcon } from "lucide-react"

interface NavigationItemProps {
  title: string
  icon: LucideIcon
  isActive?: boolean
  onClick?: () => void
}

export default function NavigationItem({ title, icon: Icon, isActive = false, onClick }: NavigationItemProps) {
  return (
    <div
      className={clsx(
        "flex flex-row items-center gap-4 px-1 py-2 text-[#F5F8FD] text-[16px] font-bold leading-[150%] capitalize rounded-[6px] cursor-pointer transition-colors",
        "md:px-4 hover:text-[#97EF83] hover:scale-105",
        isActive && "bg-[#97EF83] text-black/90",
      )}
      onClick={onClick}
    >
      <Icon size={20} />
      <span>{title}</span>
    </div>
  )
}

