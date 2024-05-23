const express  = require('express')
const router   = express.Router();
const passport = require('passport')
const axios = require('axios')
const createAd = require('./create-campaign')

module.exports = (function() {   

    router.get('/', function(req, res){
	  res.render('index', { user: req.user });
	});

	router.get('/login', function(req, res){
	  //render page login html
	});

	router.get('/account', ensureAuthenticated, function(req, res){
	  res.render('account', { user: req.user });
	});
	// 'email', 'public_profile','publish_to_groups','pages_read_engagement', 'pages_manage_posts', 'pages_show_list', 'ads_management','pages_manage_ads'
	router.get('/auth/facebook', passport.authenticate('facebook',{scope:[ 'pages_show_list', 'ads_management','pages_manage_ads'] }));

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
	
	router.get('/list_page', async(req, res)=>{
		try{
			const response = await axios.get(`https://graph.facebook.com/${global.globalversion}/me/accounts?fields=id,name&access_token=${global.globalAccessToken}`)
			const list_page_id = response.data.data;
			res.send(list_page_id);
		}catch (error) {
			console.error("Error list_page:",error.response ? error.response.data : error.message );
		}
	})
	router.post	('/create-ad', async(req,res)=>{
		try {
			const query = req.query
            await createAd( query);
            res.status(200).send('Facebook Ad Campaign created successfully');
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


