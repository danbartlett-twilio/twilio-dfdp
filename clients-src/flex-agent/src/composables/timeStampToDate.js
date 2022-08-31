export function timeStampToDate(ts) {
    console.log("ts => ", ts);
    let date = new Date(parseInt(ts));

    return `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()} @ ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`

}  