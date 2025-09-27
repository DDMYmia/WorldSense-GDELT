export const boundsToBboxString = (west:number, south:number, east:number, north:number) => [west, south, east, north].map(v=>v.toFixed(5)).join(',')








