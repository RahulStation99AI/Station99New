var express = require('express');
var router = express.Router();

var usersRouter = require('./users');
var songsRouter = require('./songs');
var adProgramRouter = require('./ad_program');
var adFeedRouter = require('./advert');
var signupRouter = require('./signupnew');
var loginRouterAndroid = require('./loginandroid');
var specialAdRouter = require('./special_ad_list');
var loginRouter = require('./loginandroid');
var anonymousRegisterRouter = require('./anonymousregister');
var onTabRouter = require('./tabs');

var sessionTrackRouter = require('./session_track');
var favRouter = require('./favouritead');
var syncDelayRouter = require('./sync_delay');
var logoutRouter = require('./logout');
var searchRouter=require('./search');
var visibleAddRouter=require('./visible_add_impression');
var updateProfileRouter= require('./updateprofile');

var configRouter= require('./config');
var saleAdvertisingRouter = require('./saleAdvertising');
var contactUsRouter = require('./contactUs');

var webRouter =require('./web');
var feedbackRouter= require('./feedback');
var requestSongRouter= require('./request_song');
var ratingRouter= require('./rating');

var privacyPolicyRouter = require('./privacyPolicy');
var userPrivacyPolicyCheck = require('./user_privacy_policy');

var termsConditionRouter = require('./termsCondition');
var userTermsAndConditionCheck = require('./user_terms_condition');
var sendEmailRouter =require('./sendEmail');
var searchRadioAdsRouter =require('./searchRadioAds');
var cutomerinfoTableRouter =require('./cutomerinfoTable');
var appVersionControlTableRouter =require('./app_version_control');
var userTelemetryRouter =require('./user_telemetry');

router.use('/userTelemetry',userTelemetryRouter);
router.use('/cutomerinfoData',cutomerinfoTableRouter);
router.use('/sendEmail',sendEmailRouter);
router.use('/searchRadioAdsByName',searchRadioAdsRouter);

router.use('/userPrivacyPolicy', userPrivacyPolicyCheck);
router.use('/acceptPrivacyPolicy', userPrivacyPolicyCheck);
router.use('/privacyPolicy', privacyPolicyRouter);

router.use('/userTermsAndConditionCheck', userTermsAndConditionCheck);
router.use('/acceptTermsCondition', userTermsAndConditionCheck);
router.use('/termsCondition', termsConditionRouter);

router.use('/updateProfile',updateProfileRouter);
router.use('/website',webRouter);
router.use('/adProgram', adProgramRouter);
router.use('/users', usersRouter);
router.use('/songs', songsRouter);
router.use('/songLike', songsRouter);
router.use('/adFeed', adFeedRouter);
router.use('/adLike', adFeedRouter);
router.use('/batchAdEvent',adFeedRouter);
router.use('/signup', signupRouter);
router.use('/login', loginRouter);
router.use('/specialAdList', specialAdRouter);
router.use('/specialAd/:id', specialAdRouter);
router.use('/userlocation', anonymousRegisterRouter);
router.use('/onTab', onTabRouter);
router.use('/adInfoClick', adFeedRouter);
router.use('/sessionTrack', sessionTrackRouter)
router.use('/getFavAds', favRouter);
router.use('/serverDelay', syncDelayRouter);
router.use('/loginandroid',loginRouterAndroid);
router.use('/logout',logoutRouter);
router.use('/searchTelemetry',searchRouter);
router.use('/visibleAdImpression',visibleAddRouter);

router.use('/getConfig',configRouter);
router.use('/saleAdvertising', saleAdvertisingRouter);
router.use('/contactUs', contactUsRouter);
router.use('/rating', ratingRouter);
router.use('/feedback', feedbackRouter);
router.use('/requestSong', requestSongRouter);
router.use('/appVersionControl',appVersionControlTableRouter);

module.exports = router;