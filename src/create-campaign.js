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
                name: 'Quảng cáo mimi',
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
        const response = await axios.post(
            `https://graph.facebook.com/${global.globalversion}/act_${query.accountId}/adsets`,
            {
                name: "My Ad Set",
                optimization_goal: "REACH",
                billing_event: "IMPRESSIONS",
                bid_amount: 5000,
                daily_budget: query.amount,
                daily_minimum_amount: query.daily_max_amount, 
                daily_max_amount: query.daily_minimum_amount,
                daily_budget: query.amount,
                campaign_id: campaignId,
                targeting: targeting,
                start_time: query.start_date,
                // end_time:  query.end_date, 
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
        formData.append('filename', fs.createReadStream("C:/Users/trung/source/repos/login_facebook_nodejs_passport/img/440943871_451016263975499_9164208717559773652_n.jpg"));
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
                        link: `https://facebook.com/${query.pageId}`,
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
const searchInterest =  async (query) => {
    try {
        const response = await axios.get(
            `https://graph.facebook.com/${global.globalversion}/search`,
            {
                params: {
                    fields: "id",
                    type: "adinterest",
                    q: query,
                    access_token: global.globalAccessToken
                }
            }
        );
        const result = [];
			for(const item of response.data.data){
				result.push(item.id);
			}
		return result;
    } catch (error) {
        console.error("Error searching interests:", error.response ? error.response.data : error.message);
    }
};

const list_interests = async(interests)=>{
    const result = [];
    for(const interest in interests){
        const interest_list_id = await searchInterest(interest);
        result.push(interest_list_id);
    }
    return result;
}

const createAds = async ( query ) => {
    try {
        const targeting = {
            geo_locations: { countries: query.countries },
            age_min: query.age_min,
            age_max: query.age_max,
            genders: query.gender,
            interests: list_interests(query.interests),
            locales: query.locales
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


        const campaignId = await createCampaign(query);
        const adSetId = await createAdSet(targeting, query, campaignId);
        const creativeId = await createAdCreative(query);
        await createAd( query, adSetId, creativeId);
    } catch (error) {
        console.log(error);
    }
};
module.exports = createAds