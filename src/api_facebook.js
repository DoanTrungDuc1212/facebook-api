const express = require('express')
const router = express.Router();
const passport = require('passport')
const axios = require('axios')
const createAd = require('./facebook-campain')


module.exports = (function () {

	router.get('/', function (req, res) {
		res.render('index', { user: req.user });
	});
	// const profilePicUrl = `https://graph.facebook.com/${req.user.id}/picture?type=large&access_token=${req.user.accessToken}`;

	router.get('/login', function (req, res) {
		//render page login html
	});

	router.get('/account', ensureAuthenticated, async function (req, res) {
		const profilePicUrl = `https://graph.facebook.com/${req.user.id}/picture?type=large&access_token=${global.globalAccessToken}`;
		res.render('account', { user: req.user, profilePicUrl });
	});
	// 'email', 'public_profile','publish_to_groups','pages_read_engagement', 'pages_manage_posts', 'pages_show_list', 'ads_management','pages_manage_ads'
	'ads_management', 'business_management', 'manage_pages', 'pages_read_engagement'	
	router.get('/auth/facebook', passport.authenticate('facebook', { scope: ['pages_manage_ads','business_management', 'pages_read_engagement', 'pages_show_list', 'ads_management'] }));

	router.get('/auth/facebook/callback',
		passport.authenticate('facebook', { successRedirect: '/', failureRedirect: '/login' }),
		function (req, res) {
			res.redirect('/');
		});

	router.get('/logout', function (req, res) {
		req.logout();
		res.redirect('/');
	});

	function ensureAuthenticated(req, res, next) {
		if (req.isAuthenticated()) { return next(); }
		res.redirect('/login')
	}

	router.get('/list_page', async (req, res) => {
		try {
			const response = await axios.get(`https://graph.facebook.com/${global.globalversion}/me/accounts?access_token=${global.globalAccessToken}`);
			const pages = response.data.data;
			global.globalPageAccessToken = response.data.data[0].access_token;
			global.globalPageId = response.data.data[2].id;
			console.log(global.globalPageAccessToken);
			console.log(global.globalPageId)
			res.send(pages);
		} catch (error) {
			console.error("Error list_page:", error.response ? error.response.data : error.message);
			res.status(500).send('Failed to fetch list of pages');
		}
	})
	//Trả về số lượng tiếp cận
	router.get('/estimated_reach', async (req, res) => {
		try {
			const response = await axios.get(`https://graph.facebook.com/${global.globalversion}/${global.globalAdAccountId}/reachestimate`, {
				params: {
					access_token: global.globalAccessToken,
					targeting_spec: {
						geo_locations: { countries: ['VN', 'US'] },
						age_min: 18,
						age_max: 65,
						genders: [1],
						interests: [
							{ id: '6003037232645', name: 'Sneakers Addict' },
							{ id: '6003102870390', name: 'sneakersnstuff' },
							{ id: '6003101385834', name: 'Sneakers (1992 film)' },
							{ id: '6004048589096', name: 'Veja Sneakers' },
							{ id: '6002915639155', name: 'SilverSneakers' },
							{ id: '6003017860156', name: 'SNEAKERS MAG' },
							{ id: '6002915661155', name: 'Sneakershop' },
							{ id: '6003150306030', name: 'trainers. sneakers & apparel' },
							{ id: '6003150119230', name: 'Streetwear Shop' },
							{ id: '6012706663837', name: 'FIRE & FIGHT Streetwear' },
							{ id: '6003299417538', name: 'Trang phục dạo phố (trang phục)' },
							{ id: '6003396051089', name: 'Fashion (film)' },
							{ id: '6003149148149', name: 'Fashion and Style' },
							{ id: '6002992469194', name: 'Fashion and makeup' },
							{ id: '6003467756257', name: 'Style & Fashion' },
							{ id: '6003281862210', name: "Men's Fashion" },
							{ id: '6003061799728', name: 'Fashion show' },
							{ id: '6003095705016', name: 'Beauty & Fashion' },
							{ id: '6004112805589', name: 'Fashion (magazine)' },
							{ id: '6003392754754', name: 'Nike, Inc. (giày dép)' },
							{
								id: '6003116583792',
								name: 'New York Yankees minor league players'
							},
							{ id: '6003392754754', name: 'Nike, Inc. (giày dép)' },
							{ id: '6003242854988', name: 'Nike Air Max' },
							{ id: '6003286870497', name: 'Nike Skateboarding' },
							{ id: '429292493891358', name: 'Nike+' },
							{ id: '6003566603318', name: 'Nike Football' },
							{ id: '6003491811857', name: 'Nike & Adidas' },
							{ id: '6003715590946', name: 'Nike Ardilla' },
							{ id: '6003344289405', name: 'Nike Women' }
						],
						locales: [],
						publisher_platforms: ['facebook']
					},
					optimization_goal: 'REACH',
				}
			});
			res.send(response.data);
		} catch (error) {
			console.error('Error fetching estimated reach:', error.response ? error.response.data : error.message);
			throw new Error('Failed to fetch estimated reach');
		}
	});
	//trả về số lượng người tiếp cận trong 1 ngày
	router.get('/daily_estimated_reach', async (req, res) => {
		try {
			const response = await axios.get(`https://graph.facebook.com/${global.globalversion}/${global.globalCampainId}/delivery_estimate`, {
				params: {
					access_token: global.globalAccessToken,
					targeting_spec: JSON.stringify({
						geo_locations: { countries: ['VN', 'US'] },
						age_min: 18,
						age_max: 65,
						genders: [1],
						interests: [
							{ id: '6003037232645', name: 'Sneakers Addict' },
							{ id: '6003102870390', name: 'sneakersnstuff' },
							{ id: '6003101385834', name: 'Sneakers (1992 film)' },
							{ id: '6004048589096', name: 'Veja Sneakers' },
							{ id: '6002915639155', name: 'SilverSneakers' },
							{ id: '6003017860156', name: 'SNEAKERS MAG' },
							{ id: '6002915661155', name: 'Sneakershop' },
							{ id: '6003150306030', name: 'trainers. sneakers & apparel' },
							{ id: '6003150119230', name: 'Streetwear Shop' },
							{ id: '6012706663837', name: 'FIRE & FIGHT Streetwear' },
							{ id: '6003299417538', name: 'Trang phục dạo phố (trang phục)' },
							{ id: '6003396051089', name: 'Fashion (film)' },
							{ id: '6003149148149', name: 'Fashion and Style' },
							{ id: '6002992469194', name: 'Fashion and makeup' },
							{ id: '6003467756257', name: 'Style & Fashion' },
							{ id: '6003281862210', name: "Men's Fashion" },
							{ id: '6003061799728', name: 'Fashion show' },
							{ id: '6003095705016', name: 'Beauty & Fashion' },
							{ id: '6004112805589', name: 'Fashion (magazine)' },
							{ id: '6003392754754', name: 'Nike, Inc. (giày dép)' },
							{ id: '6003116583792', name: 'New York Yankees minor league players' },
							{ id: '6003392754754', name: 'Nike, Inc. (giày dép)' },
							{ id: '6003242854988', name: 'Nike Air Max' },
							{ id: '6003286870497', name: 'Nike Skateboarding' },
							{ id: '429292493891358', name: 'Nike+' },
							{ id: '6003566603318', name: 'Nike Football' },
							{ id: '6003491811857', name: 'Nike & Adidas' },
							{ id: '6003715590946', name: 'Nike Ardilla' },
							{ id: '6003344289405', name: 'Nike Women' }
						],
						locales: [],
						publisher_platforms: ['facebook']
					}),
					start_time: "2024-05-29T17:10:00+0000", // Chuyển đổi sang đơn vị giây
					end_time: "2024-05-31T20:00:00+0000", // Chuyển đổi sang đơn vị giây
					optimization_goal: 'REACH'
				}
			});
			res.send(response.data);
		} catch (error) {
			console.error('Error fetching daily estimated reach:', error.response ? error.response.data : error.message);
			throw new Error('Failed to fetch daily estimated reach');
		}
	});
	
	
	router.get('/list_business', async (req, res) => {
		try {
			const response = await axios.get(`https://graph.facebook.com/${global.globalversion}/${global.globalPageId}?fields=about,business&access_token=${global.globalPageAccessToken}`);
			global.globalBusinessId = response.data.business.id;
			console.log(global.globalBusinessId);
			res.send(response.data);
		} catch (error) {
			console.error('Error fetching business ID:', error.response ? error.response.data : error.message);
			throw new Error('Failed to fetch business ID');
		}
	})
	router.get('/list_account', async (req, res) => {
		try {
			const response = await axios.get(`https://graph.facebook.com/${global.globalversion}/${global.globalBusinessId}/owned_ad_accounts?access_token=${global.globalAccessToken}`);
			global.globalAdAccountId = response.data.data[0].id;
			console.log(global.globalAdAccountId);
			res.send(response.data);
		} catch (error) {
			console.error('Error fetching ad accounts:', error.response ? error.response.data : error.message);
			throw new Error('Failed to fetch ad accounts');
		}
	});
	router.get('/seen', async (req, res) => {
		try {
			const response = await axios.get(`https://graph.facebook.com/${global.globalversion}/120211319812070555/previews`,
				{
					params: {
						access_token: globalAccessToken
					}
				}
			);
			console.log(response.data);
			res.send(response.data);
		} catch (error) {
			console.error("Error searching interests:", error.response ? error.response.data : error);
		}
	})
	router.get('/scope', async (req, res) => {
		const url = `https://adsmanager.facebook.com/adsmanager/manage/campaigns/edit?act=${global.globalAdAccountId}&business_id=${global.globalBusinessId}&selected_campaign_ids=${global.globalCampainId}&global_scope_id=${global.globalBusinessId}`
		res.redirect(url);
	});
	// router.get('/behavior', async (req, res) => {
	// 	const behaviors = [
	// 		"Online Shopping",
	// 		"Frequent Buyer"
	// 	]
	// 	const results = []
	// 	try {
	// 		for (const behavior of behaviors) {
	// 			const response = await axios.get(
	// 				`https://graph.facebook.com/${global.globalversion}/search`,
	// 				{
	// 					params: {
	// 						type: "adTargetingCategory",
	// 						class: "behaviors",
	// 						q: behavior,
	// 						access_token: global.globalAccessToken
	// 					}
	// 				}
	// 			);
	// 			const result = response.data.data;
	// 			for (const item in result) {
	// 				results.push(result);
	// 			}
	// 		}
	// 		res.send(results);
	// 	} catch (error) {
	// 		console.error("Error searching interests:", error.response ? error.response.data : error.message);
	// 	}
	// });
	router.get('/AdInsights', async (req, res) => {
		try {
			const response = await axios.get(`https://graph.facebook.com/${globalversion}/120211436036470555/insights`, {
				params: {
					access_token: globalAccessToken,
					fields: 'impressions,reach,spend' // Thêm reach vào danh sách các trường
				}
			});
			res.send(response.data); // Trả về dữ liệu chi tiết của quảng cáo
		} catch (error) {
			console.error('Error fetching ad insights:', error.response ? error.response.data : error.message);
			throw error;
		}
	});
	router.get('/EstimatedDailyResults',async (req, res) => {
		try {
			const response = await axios.get(`https://graph.facebook.com/${global.globalversion}/${global.globalAdAccountId}/reachestimate`, {
				params: {
					access_token: globalAccessToken,
					optimization_goal: "REACH",
					billing_event: "IMPRESSIONS",
					targeting_spec: JSON.stringify({
						geo_locations: {
							countries: ['US']
						},
						age_min: 18,
						age_max: 65
					}),
					bid_amount: 50000
				}
			});
	
			res.send(response.data);
		} catch (error) {
			console.error('Error fetching estimated daily results:', error.response ? error.response.data : error.message);
		}
	});
	router.post('/create-ad', async (req, res) => {
		try {
			const query = req.body;
			console.log(query);
			console.log(global);
			res.status(200).send(await createAd(query));
		} catch (error) {
			console.error('Error creating ad:', error);
			res.status(500).send('Error creating Facebook Ad Campaign');
		}
	})
	// router.post	('/create-ad-test', async(req,res)=>{
	// 	try {
	// 		const request = {
	// 			accountId: '318852407775485',
	// 			pageId: '289814727556531',
	// 			gender: 'Men',
	// 			age_min: 18,
	// 			age_max: 36
	// 		}
	// 		const accountId= '318852407775485'
	// 	    const pageId= '289814727556531'
	//         await createAd( accountId, pageId);
	//         res.status(200).send('Facebook Ad Campaign created successfully');
	//     } catch (error) {
	//         console.error('Error creating ad:', error);
	//         res.status(500).send('Error creating Facebook Ad Campaign');
	//     }
	// })
	return router;
})();


