'use client'
import { Button, ButtonVariant } from '@/components/ui'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}: PaginationProps) {
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
    <div className="flex items-center justify-center pt-2">
      <Button
        variant={ButtonVariant.GHOST}
        disabled={currentPage <= 1}
        aria-label="Previous page"
        onClick={handlePrevious}
      >
        <ChevronLeft size={14} />
      </Button>
      <div className="mx-1 text-sm">
        {currentPage}/{totalPages}
      </div>
      <Button
        variant={ButtonVariant.GHOST}
        disabled={currentPage >= totalPages}
        aria-label="Next page"
        onClick={handleNext}
      >
        <ChevronRight size={14} />
      </Button>
    </div>
  )
}
