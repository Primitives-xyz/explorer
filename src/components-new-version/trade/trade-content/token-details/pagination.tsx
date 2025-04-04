"use client"
import { Button } from "@/components-new-version/ui"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export default function Pagination({ currentPage = 1, totalPages = 1, onPageChange }: PaginationProps) {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1)
    }
  }

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1)
    }
  }

  return (
    <div className="flex items-center justify-center py-2">
      <Button
        onClick={handlePrevious}
        disabled={currentPage <= 1}
        className="p-2 focus:outline-none disabled:opacity-50"
        aria-label="Previous page"
      >
        <ChevronLeft size={12} />
      </Button>
      <div className="mx-4 text-xs">
        {currentPage}/{totalPages}
      </div>
      <Button
        onClick={handleNext}
        disabled={currentPage >= totalPages}
        className="p-2 focus:outline-none disabled:opacity-50"
        aria-label="Next page"
      >
        <ChevronRight size={12} />
      </Button>
    </div>
  )
}

