
const dotenv=require('dotenv')
const cloudinary=require('cloudinary')


dotenv.config({path:'configaration.env'})



cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.CLOUD_SECRET_KEY,
    api_secret:process.env.CLOUD_API_KEY    
})



exports.uploads=(file,folder)=>{
        return new Promise(resolve=>{
            cloudinary.uploader.upload(file,(result)=>{
                resolve({
                    url:result.url,
                    id:result.public_id
                })

            },{
                resource_type:'auto',
                folder:folder
            })
        })
}