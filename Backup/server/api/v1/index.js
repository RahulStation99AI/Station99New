var express = require('express');
var router = express.Router();
// var { checkToken } = require('../auth/token_validation');

var webRouter =require('./web');
var usersRouter = require('./users');
var songsRouter = require('./songs');
var adProgramRouter = require('./ad_program');
var adFeedRouter = require('./advert');
var signupRouter = require('./signupnew');
var specialAdRouter = require('./special_ad_list');
var loginRouter = require('./loginandroid');
var anonymousRegisterRouter = require('./anonymousregister');
var favRouter = require('./favouritead');
var logoutRouter = require('./logout');
var visibleAddRouter=require('./visible_add_impression');
var updateProfileRouter= require('./updateprofile');
var scheduleAirTrafficRouter= require('./scheduleAirTraffic');
var advertDataRouter= require('./advertData');
var getPlayListRouter= require('./getPlayList');
var getPlayListItemRouter= require('./getPlayListItem');
var getYoutubeChannelRouter= require('./youtubeChannel');
var contestCronResultDailyRouter= require('./contestCronResultDaily');
var connectFmHomeFeedRouter= require('./ConnectFm/connectFmHomeFeed');
var connectFmAdvertisherRouter = require('./ConnectFm/connectFmAdvertisher');
var connectFmCustomerInfoRouter = require('./ConnectFm/connectFmCustomerInfo');
var readCsvRouter= require('./read_csv');

var configRouter= require('./config');

var feedbackRouter= require('./feedback');
var requestSongRouter= require('./request_song');
var ratingRouter= require('./rating');

var privacyPolicyRouter = require('./privacyPolicy');
var contestTermsAndConditionRouter = require('./contestTermsAndCondition');
var contestFormRouter = require('./connectFm/contestForm');
var contestResultRouter = require('./contestResult');

var userPrivacyPolicyCheck = require('./user_privacy_policy');

var termsConditionRouter = require('./termsCondition');
var userTermsAndConditionCheck = require('./user_terms_condition');

var saleAdvertisingRouter = require('./saleAdvertising');
var contactUsRouter = require('./contactUs');

var krkoRouter = require('./krkoFileCopy');
var kxaRouter = require('./kxaFileCopy');
var krkoFressRouter = require('./krkoFressCopy');


var userTelemetryRouter =require('./user_telemetry');
var searchRadioAdsRouter =require('./searchRadioAds');
var cutomerinfoTableRouter =require('./cutomerinfoTable');
var appVersionControlTableRouter =require('./app_version_control');
var changePasswordRouter =require('./change_password');
var forgetPasswordRouter =require('./forget_password');
var resetPasswordRouter =require('./reset_password');
var contestRouter =require('./contest');
var userActivateAccountRouter = require('./userActivateAccount');

router.use('/website',webRouter);
router.use('/cutomerinfoData',cutomerinfoTableRouter);
router.use('/userTelemetry',userTelemetryRouter);
router.use('/searchRadioAdsByName',searchRadioAdsRouter);

router.use('/krko', krkoRouter);
router.use('/kkxa', kxaRouter);
router.use('/krkoFress', krkoFressRouter);


router.use('/userPrivacyPolicy', userPrivacyPolicyCheck);
router.use('/acceptPrivacyPolicy', userPrivacyPolicyCheck);
router.use('/privacyPolicy', privacyPolicyRouter);


router.use('/userTermsAndConditionCheck', userTermsAndConditionCheck);
router.use('/acceptTermsCondition', userTermsAndConditionCheck);
router.use('/termsCondition', termsConditionRouter);

router.use('/saleAdvertising', saleAdvertisingRouter);
router.use('/contactUs', contactUsRouter);
router.use('/updateProfile',updateProfileRouter);

router.use('/rating', ratingRouter);
router.use('/feedback', feedbackRouter);
router.use('/requestSong', requestSongRouter);

// Tomorrow start fromm here
router.use('/adProgram', adProgramRouter); //  Will Work On this api after disscussion with abhay and himanshu
router.use('/users', usersRouter);
router.use('/songs', songsRouter);
router.use('/songLike', songsRouter);
router.use('/adFeed', adFeedRouter);
router.use('/adLike', adFeedRouter);
router.use('/signup', signupRouter);
router.use('/login', loginRouter);
router.use('/specialAdList', specialAdRouter);
router.use('/userActivateAccount', userActivateAccountRouter);

router.use('/userlocation', anonymousRegisterRouter);
router.use('/getFavAds', favRouter);
//router.use('/adProgram', adProgramRouter);
router.use('/logout',logoutRouter);
router.use('/visibleAdImpression',visibleAddRouter);
// router.use('/appVersionControl',checkToken,appVersionControlTableRouter);
router.use('/appVersionControl',appVersionControlTableRouter);
router.use('/changePassword',changePasswordRouter);
router.use('/forgetPassword',forgetPasswordRouter);
router.use('/resetPassword',resetPasswordRouter);
router.use('/contest',contestRouter);
router.use('/addContest',contestRouter);
router.use('/contestTermsAndCondition',contestTermsAndConditionRouter);
router.use('/contestForm',contestFormRouter);

router.use('/contestResult',contestResultRouter);
router.use('/scheduleTraffic',scheduleAirTrafficRouter);
router.use('/advertData',advertDataRouter);
router.use('/getPlayList',getPlayListRouter);
router.use('/getPlayListItem',getPlayListItemRouter);
router.use('/getYoutubeChannel',getYoutubeChannelRouter);
router.use('/contestDailyCronDaily',contestCronResultDailyRouter);
router.use('/cfmHomeFeed',connectFmHomeFeedRouter);
router.use('/cfmAdvertisher',connectFmAdvertisherRouter);
router.use('/cfmCustomerInfo',connectFmCustomerInfoRouter);
router.use('/readCsv',readCsvRouter);



router.use('/getConfig',configRouter);

module.exports = router;