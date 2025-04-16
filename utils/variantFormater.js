
function variatFormater(variant){
    if(!variant.length){
        throw new Error('in sufficient data')
    }
    const newArray=variant.map(element=>{
        return {size:element?.size,color:element.color,stock:element?.stock}
    })
    return newArray
}
module.exports=variatFormater