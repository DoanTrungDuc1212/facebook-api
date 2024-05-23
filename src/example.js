const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
// Thay các giá trị sau bằng thông tin của bạn


//Bước 1 tạo Campaign
const createCampaign = async (AD_ACCOUNT_ID) => {
    try {
        const response = await axios.post(
            `https://graph.facebook.com/${global.globalversion}/act_${AD_ACCOUNT_ID}/campaigns`,
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
const createAdSet = async ( AD_ACCOUNT_ID, campaignId) => {
    try {
        const response = await axios.post(
            `https://graph.facebook.com/${global.globalversion}/act_${AD_ACCOUNT_ID}/adsets`,
            {
                name: "My Ad Set",
                optimization_goal: "REACH",
                billing_event: "IMPRESSIONS",
                bid_amount: 5000,
                daily_budget: 1000000,
                daily_minimum_amount: 50000, 
                daily_max_amount: 100000,
                campaign_id: campaignId,
                targeting: {
                    // interests: []
                    geo_locations: { countries: ["US", "VN", "SG"] },
                    age_min: 18,
                    age_max: 36,
                    genders: ["1","2"], // 1 là nam, 2 là nữ
                    interests: ["6003673473262","429633153865508","6015683986535","6003292128002","6003429464857","6003205377212","6003433309754","6003463695944","6003263791114"],
                    locales: [6,42]
                },
                start_time: "2024-10-06T04:45:17+0000",
                end_time:  "2024-10-15T05:00:00+0000", 
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
const createAdCreative = async ( AD_ACCOUNT_ID, PAGE_ID) => {
    try {
        const formData = new FormData();
        formData.append('filename', fs.createReadStream("C:/Users/trung/source/repos/login_facebook_nodejs_passport/img/440943871_451016263975499_9164208717559773652_n.jpg"));
        formData.append('access_token', global.globalAccessToken);
        const imageResponse = await axios.post(
            `https://graph.facebook.com/${global.globalversion}/act_${AD_ACCOUNT_ID}/adimages`,
            formData,
            {
                headers: {
                    ...formData.getHeaders()
                }
            }
        );
        const imageHash = imageResponse.data.images[Object.keys(imageResponse.data.images)[0]].hash;
        const creativeResponse = await axios.post(
            `https://graph.facebook.com/${global.globalversion}/act_${AD_ACCOUNT_ID}/adcreatives`,
            {
                name: "Sample Creative",
                object_story_spec: {
                    page_id: PAGE_ID,
                    link_data: {
                        image_hash: imageHash,
                        link: `https://facebook.com/${PAGE_ID}`,
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
const createAd = async ( AD_ACCOUNT_ID,  adSetId, creativeId) => {
    try {
        const response = await axios.post(
            `https://graph.facebook.com/${global.globalversion}/act_${AD_ACCOUNT_ID}/ads`,
            {
                name: "My Ad",
                // creative: JSON.stringify({ creative_id: creativeId }),

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

const createAds = async ( AD_ACCOUNT_ID, PAGE_ID) => {
    try {
        const campaignId = await createCampaign(AD_ACCOUNT_ID);
        // await searchLocation(API_VERSION, ACCESS_TOKEN);
        // await searchInterest(API_VERSION, ACCESS_TOKEN);
        const adSetId = await createAdSet( AD_ACCOUNT_ID, campaignId);
        const creativeId = await createAdCreative( AD_ACCOUNT_ID, PAGE_ID);
        await createAd( AD_ACCOUNT_ID, adSetId, creativeId);
    } catch (error) {
        console.log(error);
    }
};
module.exports = createAds