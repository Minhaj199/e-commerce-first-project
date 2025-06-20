function isEqual(value1, value2, options) {
    return value1 === value2 ? options.fn(this) : options.inverse(this);
}
function increment(value){
    return value + 1;
  }
  function calculatePersatage (value1, value2) {
    let persantage = parseInt(value1);
    let amount = parseInt(value2);
    if (isNaN(value1) || isNaN(value2)) {
      return "";
    }
    const sample = persantage / 100;
    const discount = sample * amount;
    const preResult = value2 - discount;
    const result = Math.floor(preResult);
    return result;
  }
   function lookupQuantity(size, color, stock) {
    const found = stock.find(item => item.size === size && item.color === color);
    return found ? found.quantity : '-';
  }

  function sumStock(variants){
   
    if (!Array.isArray(variants)) return 0;
    const sum= variants.reduce((sum, item) => {
        const stock = Number(item.stock) || 0;
        return sum + stock;
      }, 0);
    
      return sum
  }
  function stockWarning(stock){
    return stock<10
  }
  function isZero(value){
    return value==0
  }
  const dateFormater=(date)=>{
    console.log(new Date(date).toLocaleDateString())
    const currentDate=new Date(date)
    const day=currentDate.getDate()
    const month=currentDate.getMonth()+1
    const year=currentDate.getFullYear()
    console.log(day)
    console.log(month)
    console.log(year)
    return `${day}-${month}-${year}`
  }
   const isArrayEmpty=(array)=>{
    
    return array.length!==0
  }
   const isStringsEqual=(string1,string2)=>{
    return string1===string2
  }
module.exports={isStringsEqual,isEqual,increment,calculatePersatage,lookupQuantity,sumStock,stockWarning,isZero,dateFormater,isArrayEmpty}