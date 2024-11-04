export const formatDatetimeFromTimestamp = (timestamp: number) => {
    const dateObj = new Date(timestamp);
    return formatDatetime(dateObj);
}

export const formatDatetime = (dateObj: Date) => {
    return dateObj ? dateObj.toISOString().slice(0, 19).replace('T',' ') : '';
}