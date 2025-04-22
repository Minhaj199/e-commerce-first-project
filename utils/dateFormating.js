function Invoice(date){
    const parsedDate=new Date(date)
    let day=parsedDate.getDate()
    let month=parsedDate.getMonth()+1
    let year=parsedDate.getFullYear()

    if(day<10){
        day='0'+day
    }
    if(month<10){
        month='0'+month
    }
    return day+'-'+month+'-'+year
}

module.exports={Invoice}