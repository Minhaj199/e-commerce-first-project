    function Normalisation(string){
        return string.split(' ').map(word=>{
            const firstLetter=word.charAt(0).toUpperCase()
            const restWord=word.slice(1).toLowerCase()
            
            return firstLetter + restWord
        }).join('')


    }

module.exports=Normalisation