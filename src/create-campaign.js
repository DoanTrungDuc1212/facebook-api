const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
// Thay các giá trị sau bằng thông tin của bạn


//Bước 1 tạo Campaign
const createCampaign = async (query) => {
    try {
        const response = await axios.post(
            `https://graph.facebook.com/${global.globalversion}/act_${query.accountId}/campaigns`,
            {
                name: "Quảng cáo MIMI",
                objective: 'OUTCOME_TRAFFIC',
                status: 'PAUSED',
                special_ad_categories: [],
                access_token: global.globalAccessToken
            }
        );

        if (response.data && response.data.id) {
            const campaignId = response.data.id;
            console.log(`Successfully created campaign with ID: `, campaignId);
            return campaignId;
        } else {
            console.log('Failed to create campaign. No campaign ID returned.');
        }
    } catch (error) {
        console.log("Error creating campaign: " + error.response ? error.response.data : error.message);
    }
};
// Bước 3: Tạo nhóm quảng cáo
const createAdSet = async (targeting, query, campaignId) => {
    try {
        const daily_budget = (query.daily_max_amount + query.daily_minimum_amount)/2;
        const response = await axios.post(
            `https://graph.facebook.com/${global.globalversion}/act_${query.accountId}/adsets`,
            {
                name: query.audienceName,
                optimization_goal: "REACH",
                billing_event: "IMPRESSIONS",
                bid_amount: 5000,
                daily_budget: query.amount,
                campaign_id: campaignId,
                targeting: targeting,
                start_time: query.start_date,
                end_time:  query.end_date, 
                status: "PAUSED",
                access_token: global.globalAccessToken
            }
        );

        console.log("Ad Set created successfully. Ad Set ID:", response.data);
        // console.log("Ad Set created successfully. Ad Set ID:");
        return response.data.id;

    } catch (error) {
        console.error("Error creating Ad Set:", error.response ? error.response.data : error.message);
    }
};

// Bước 4: Cung cấp nội dung quảng cáo
const createAdCreative = async ( query) => {
    try {
        const formData = new FormData();
        formData.append('filename', fs.createReadStream("C:/Users/trung/OneDrive/Máy tính/facebook-api/img/59163eeb9141c6011d8338a37fdfdc34.png"));
        formData.append('access_token', global.globalAccessToken);
        const imageResponse = await axios.post(
            `https://graph.facebook.com/${global.globalversion}/act_${query.accountId}/adimages`,
            formData,
            {
                headers: {
                    ...formData.getHeaders()
                }
            }
        );
        const imageHash = imageResponse.data.images[Object.keys(imageResponse.data.images)[0]].hash;
        const creativeResponse = await axios.post(
            `https://graph.facebook.com/${global.globalversion}/act_${query.accountId}/adcreatives`,
            {
                name: "Sample Creative",
                object_story_spec: {
                    page_id: query.pageId,
                    link_data: {
                        image_hash: imageHash,
                        link: `https://shopee.vn/`,
                        message: "try it out"
                    }
                },
                degrees_of_freedom_spec: {
                    creative_features_spec: {
                        standard_enhancements: {
                            enroll_status: "OPT_IN"
                        }
                    }
                },
                access_token: global.globalAccessToken
            }
        );

        console.log("Ad Creative created successfully. Creative ID:", creativeResponse.data.id);
        // console.log("Ad Creative created successfully. Creative ID:");
        return creativeResponse.data.id;


    } catch (error) {
        //, error.response ? error.response.data : error.message
        console.error("Error creating Ad Creative:", error.response ? error.response.data : error.message);
    }
};

// Bước 5: Lên lịch phân phối
const createAd = async ( query, adSetId, creativeId) => {
    try {
        const response = await axios.post(
            `https://graph.facebook.com/${global.globalversion}/act_${query.accountId}/ads`,
            {
                name: "My Ad",
                creative: {
                    creative_id: creativeId
                },
                degrees_of_freedom_spec: {
                    creative_features_spec: {
                        standard_enhancements: {
                            enroll_status: "OPT_IN"
                        }
                    }
                },
                adset_id: adSetId,
                status: "PAUSED",
                access_token: global.globalAccessToken
            }
        );

        // console.log("Ad created successfully. Ad ID:", response.data.id);
        console.log("Ad created successfully. Ad ID:", response.data.id);

    } catch (error) {
        //, error.response ? error.response.data : error.message
        console.error("Error creating Ad:", error.response ? error.response.data : error.message);
    }
};

//interest
const searchInterest = async (interest) => {
    try {
        const response = await axios.get(
            `https://graph.facebook.com/${global.globalversion}/search`,
            {
                params: {
                    fields: "id,name",
                    type: "adinterest",
                    q: interest,
                    access_token: global.globalAccessToken
                }
            }
        );
        const result = response.data.data;
		return result[0];
    } catch (error) {
        console.error("Error searching interests:", error.response ? error.response.data : error.message);
    }
};

const list_interests = async(interests)=>{
    const result = [];

    for(const interest of interests){
        const interest_id = await searchInterest(interest);
        if (interest_id) {
            result.push(interest_id);
        } 
    }
    console.log(result)
    return result;
}
//gender
const gender = (items) => {
    const result = [];
    const list_item = [...items]
    for (const item of list_item) {
        if (item === "male") result.push(1);
        else result.push(2);
    }
    return result;
}
//language
const searchLanguages =  async(language)=>{
    try {
        const response = await axios.get(`https://graph.facebook.com/${global.globalversion}/search`, {
            params: {
                fields: "key",
                type: 'adlocale',
                q: language,
                access_token: global.globalAccessToken
            }
        });
        
        const result = response.data.data // Trả về danh sách các key ngôn ngữ
        console.log(result[0])
        return result[0];
    } catch (error) {
        console.error('Error fetching languages:', error.response.data);
        throw new Error('Failed to fetch languages');
    }
};
const list_language = async(languages)=>{
    const result = [];  
    for(const language of languages){
        const language_key = await searchLanguages(language);
        if (language_key) {
            result.push(language_key);
        } 
    }
    console.log(result)
    return result;
}
//behaviors
const searchBehavior = async (behavior) => {
    try {
        const response = await axios.get(
            'https://graph.facebook.com/v13.0/search',
            {
                params: {
                    q: behavior,
                    type: 'adTargetingCategory',
                    access_token: 'YOUR_ACCESS_TOKEN' // Thay YOUR_ACCESS_TOKEN bằng access token của bạn
                }
            }
        );
        const result = response.data.data;
        console.log(result);
		return result[0];
    } catch (error) {
        console.error("Error searching interests:", error.response ? error.response.data : error.message);
    }
};

const list_Behavior = async(behaviors)=>{
    const result = [];
    for(const behavior of behaviors){
        const behavior_id = await searchBehavior(behavior);
        if (behavior_id) {
            result.push(behavior_id);
        } 
    }
    console.log(result)
    return result;
}
const createAds = async ( query ) => {
    try {
        
        const targeting = {
            geo_locations: { 
                countries: query.countries,
             },
            age_min: query.minimumAge,
            age_max: query.maximumAge,
            genders: gender(query.gender),
            interests: await list_interests(query.interests),
            locales: [6],
            publisher_platforms: [
                "facebook"
              ]
            // behavior: await list_Behavior( query.behaviors)
        }
        // const accountId = query.accountId;
        // const pageId = query.pageId;
        // const countries = query.countries;
        // const gender = query.gender;
        // const age_max = query.age_max;
        // const age_min = query.age_min;
        // const interests = query.interests;
        // const amount = query.amount
        // const start_date = query.start_date;
        // const end_date = query.end_date;
        // const daily_minimum_amount = query.daily_minimum_amount;
        // const daily_max_amount = query.daily_max_amount;
        console.log(targeting);

        const campaignId = await createCampaign(query);
        const adSetId = await createAdSet(targeting, query, campaignId);
        const creativeId = await createAdCreative(query);
        await createAd( query, adSetId, creativeId);
    } catch (error) {
        console.log(error);
    }
};
module.exports = createAds