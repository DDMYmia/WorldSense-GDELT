export const formatYMD = (d: Date) => d.toISOString().slice(0,10)
export const parseYMD = (s: string) => new Date(s + 'T00:00:00Z')








