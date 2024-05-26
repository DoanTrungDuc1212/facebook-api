const express  = require('express')
const router   = express.Router();
const passport = require('passport')
const axios = require('axios')
const createAd = require('./create-campaign')


module.exports = (function() {   

    router.get('/', function(req, res){
	 	res.render('index', { user: req.user});
	});
	// const profilePicUrl = `https://graph.facebook.com/${req.user.id}/picture?type=large&access_token=${req.user.accessToken}`;
	
	router.get('/login', function(req, res){
	  //render page login html
	});

	router.get('/account', ensureAuthenticated, async function(req, res){
		const profilePicUrl = `https://graph.facebook.com/${req.user.id}/picture?type=large&access_token=${global.globalAccessToken}`;
		res.render('account', { user: req.user , profilePicUrl});
	});
	// 'email', 'public_profile','publish_to_groups','pages_read_engagement', 'pages_manage_posts', 'pages_show_list', 'ads_management','pages_manage_ads'
	router.get('/auth/facebook', passport.authenticate('facebook',{scope:[ 'public_profile', 'pages_show_list', 'ads_management','pages_manage_ads'] }));

	router.get('/auth/facebook/callback',
	  passport.authenticate('facebook', { successRedirect : '/', failureRedirect: '/login' }),
	  function(req, res) {
	    res.redirect('/');
	  });

	router.get('/logout', function(req, res){
	  req.logout();
	  res.redirect('/');
	});
	
	function ensureAuthenticated(req, res, next) {
		if (req.isAuthenticated()) { return next(); }
		res.redirect('/login')
	}

	
	router.get('/list_account', async (req, res)=>{
		try{
			const response = await axios.get(`https://graph.facebook.com/${global.globalversion}/me/adaccounts?fields=id,name&access_token=${global.globalAccessToken}`)
			const list_account = response.data.data;
			res.send(list_account);
		}catch(error){
			console.error("Error list_account:",error.response ? error.response.data : error.message );
		}
	})
	router.get('/behaviors', async (req, res) => {
		try {
			const response = await axios.get(
				`https://graph.facebook.com/${global.globalversion}/search`,
				{
					params: {
						type: "adTargetingCategory",
						class: "behaviors",
						access_token: global.globalAccessToken
					}
				}
			);
			res.send(response.data)
		} catch (error) {
			console.error("Error searching interests:", error.response ? error.response.data : error.message);
		}
	});
	router.get('/behavior', async (req, res) => {
		const behaviors = [
			"Online Shopping",
			"Frequent Buyer"
		]
		const results = []
		try {
			for(const behavior of behaviors){
				const response = await axios.get(
					`https://graph.facebook.com/${global.globalversion}/search`,
					{
						params: {
							type: "adTargetingCategory",
							class: "behaviors",	
							q: behavior,
							access_token: global.globalAccessToken
						}
					}
				);
				const result = response.data.data;
				for(const item in result){
					results.push(result);
				}
			}
			res.send(results);
		} catch (error) {
			console.error("Error searching interests:", error.response ? error.response.data : error.message);
		}
	});
	router.get('/list_page', async(req, res)=>{
		try{
			const response = await axios.get(`https://graph.facebook.com/${global.globalversion}/me/accounts?fields=id,name&access_token=${global.globalAccessToken}`)
			const list_page_id = response.data.data;
			res.send(list_page_id);
		}catch (error) {
			console.error("Error list_page:",error.response ? error.response.data : error.message );
		}
	})
	router.get('/a',async(req, res)=>{
		try{
			const response = await axios.get(`https://2af8-171-241-69-82.ngrok-free.app/list_page`)
			res.send(response.data);
		}catch (error) {
			console.error("Error list_page:",error.response ? error.response.data : error.message );
		}
	})
	router.get('/searchInterest',async (req, res) => {
		const interests = ["Fashion", "Sneakers"];
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
				console.log(interest);
				for(const item in result){
					console.log(result[item])
					results.push(result[item]);
				}
			}
			res.json(results);
		} catch (error) {
			console.error("Error searching interests:", error.response ? error.response.data : error.message);
		}
	});
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
	router.get('/list_interests',  async(req, res)=>{
		const result = [];
		const interests = ["Fashion", "Handbags"]
		for(const interest of interests){
			const interest_id = await searchInterest(interest);
			if (interest_id) {
				result.push(interest_id);
			} 
		}
		console.log(result)
		return result;
	});
	router.get('/languages', async(req, res)=>{
		try {
			const response = await axios.get(`https://graph.facebook.com/${global.globalversion}/search`, {
				params: {
					fields:"key",
					type: 'adlocale',
					q: "English",
					access_token: global.globalAccessToken
				}
			});
			res.json(response.data.data) // Trả về danh sách các key ngôn ngữ
		} catch (error) {
			console.error('Error fetching languages:', error.response.data);
			throw new Error('Failed to fetch languages');
		}
	})
	router.post	('/create-ad', async(req,res)=>{
		try {
			const query = req.body;
			console.log(query);
            res.status(200).send(await createAd( query));
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


