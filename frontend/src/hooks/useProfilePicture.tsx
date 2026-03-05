
import fetchMyProfilePicture from "@/utils/api/profile/GetMyProfilePicture";
import { useCallback, useEffect, useState } from "react";

export default function useProfilePicture() {
    
    const [profilePicture, setProfilePicture] = useState<any>(null);
    const [percentage, setPercentage] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);

    const getProfilePicture = useCallback(async() => {
        try{
            setLoading(true)
            const res=await fetchMyProfilePicture()
            if(res.status===200){
                setProfilePicture(res.results.profile_picture_url);
                
            }
        }catch{
            return null 
        }
        finally{
            setLoading(false)
        }
    },[])

    useEffect(() => {
        getProfilePicture()
    },[getProfilePicture])
        


    return {
        profilePicture,
        setProfilePicture,
        percentage,
        setPercentage,
        loading,
        
    }
        
   
}