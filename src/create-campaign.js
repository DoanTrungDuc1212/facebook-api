const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
// Thay các giá trị sau bằng thông tin của bạn


//Bước 1 tạo Campaign
const createCampaign = async (query) => {
    try {
        const response = await axios.post(
            `https://graph.facebook.com/${global.globalversion}/${global.globalAdAccountId}/campaigns`,
            {
                name: "Quảng cáo MIMI",
                objective: 'OUTCOME_TRAFFIC',
                status: 'ACTIVE',
                daily_max_amount: query.daily_max_amount,
                daily_minimum_amount: query.daily_minimum_amount,
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
        const response = await axios.post(
            `https://graph.facebook.com/${global.globalversion}/${global.globalAdAccountId}/adsets`,
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
                status: "ACTIVE",
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
        formData.append('filename', fs.createReadStream("./img/59163eeb9141c6011d8338a37fdfdc34.png"));
        formData.append('access_token', global.globalAccessToken);
        const imageResponse = await axios.post(
            `https://graph.facebook.com/${global.globalversion}/${global.globalAdAccountId}/adimages`,
            formData,
            {
                headers: {
                    ...formData.getHeaders()
                }
            }
        );
        const imageHash = imageResponse.data.images[Object.keys(imageResponse.data.images)[0]].hash;
        const creativeResponse = await axios.post(
            `https://graph.facebook.com/${global.globalversion}/${global.globalAdAccountId}/adcreatives`,
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
            `https://graph.facebook.com/${global.globalversion}/${global.globalAdAccountId}/ads`,
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
                status: "ACTIVE",
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
const       searchInterest = async (query) => {
    const interests = query;
    const results = [];
    try {
        for (const interest of interests) {
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
            for(const item in result){
                results.push(result[item]);
            }
        }
       return results;
    } catch (error) {
        console.error("Error searching interests:", error.response ? error.response.data : error.message);
    }
};

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
const searchLanguages =  async(query)=>{
    const languages = query;
    const results = [];
    try {
        for(const language of languages){
            const response = await axios.get(`https://graph.facebook.com/${global.globalversion}/search`, {
                params: {
                    fields: "key",
                    type: 'adlocale',
                    q: language,
                    access_token: global.globalAccessToken
                }
            });
            const result = response.data.data;
            for(const item in result){
                console.log(result[item].key)
                results.push(result[item].key);
            }
        }
        console.log(results);
        return results;
    } catch (error) {
        console.error('Error fetching languages:', error.response.data);
        throw new Error('Failed to fetch languages');
    }
};
//behaviors
const searchBehavior = async (query) => {
    const behaviors = query;
    const results = [];
    try {
        for(const behavior of behaviors){
            const response = await axios.get(
                `https://graph.facebook.com/${global.globalversion}/search`,
                {
                    params: {
                        q: behavior,
                        type: "adTargetingCategory",
						class: "behaviors",
                        access_token: global.globalAccessToken
                    }
                }
            );
            const result = response.data.data;	
			results.push(result[0].id); 
        }
        console.log(results);
		return results;
    } catch (error) {
        console.error("Error searching interests:", error.response ? error.response.data : error.message);
    }
};

const createAds = async ( query ) => {
    try {
        const targeting = {
            geo_locations: { 
                countries: query.countries,
             },
            age_min: query.minimumAge,
            age_max: query.maximumAge,
            genders: gender(query.gender),
            interests: await searchInterest(query.interests),
            locales: await searchLanguages(query.languages),
            publisher_platforms: [
                "facebook"
              ]
            // behaviors: await searchBehavior( query.behaviors)
        }
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