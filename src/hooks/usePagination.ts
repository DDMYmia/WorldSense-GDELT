import { useMemo, useState } from 'react'

export function usePagination(total: number, pageSize: number = 10) {
  const [page, setPage] = useState(1)
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const offset = (page - 1) * pageSize
  const info = useMemo(() => ({ page, pageSize, pageCount, offset }), [page, pageSize, pageCount, offset])
  return { page, setPage, pageSize, pageCount, offset, info }
}








