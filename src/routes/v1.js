const router = require('express').Router();
const tokenMiddleware = require('../middlewares/token_middleware');
const tokenParserMiddleware = require('../middlewares/token_parser_middleware');
const apiKeyMiddleware = require('../middlewares/api_key_middleware');
const webhookPaymentTokenMiddleware = require('../middlewares/webhook_payment_callback');

router.get('/ping', (req, res) => res.status(200).json({ message: 'PONG', date: new Date() }));

router.post('/account/register', [], (require('../methods/v1/account/register')).postRegister);
router.post('/account/login', [], (require('../methods/v1/account/login')).postLogin);
router.post('/account/update-password', [tokenMiddleware], (require('../methods/v1/account/update_password')).updatePassword);
router.get('/account', [tokenMiddleware], (require('../methods/v1/account/profile')).getAccountProfile);

router.post('/ielts-scores', [tokenMiddleware], (require('../methods/v1/exam/post_ielts_score')).postIeltsScore);
router.post('/ielts-scores/:id', [tokenMiddleware], (require('../methods/v1/exam/post_ielts_score')).postIeltsScore);
router.post('/ielts-writing-submissions', [tokenMiddleware], (require('../methods/v1/exam/post_ielts_writing')).postIeltsWriting);
router.post('/ielts-writing-submissions/:id', [tokenMiddleware], (require('../methods/v1/exam/post_ielts_writing')).postIeltsWriting);
router.get('/ielts-scores/:id', [tokenMiddleware], (require('../methods/v1/exam/get_ielts_score')).getIeltsScore);
router.get('/ielts-writing-submissions/:id', [tokenMiddleware], (require('../methods/v1/exam/get_ielts_writing_submissions')).getIeltsWritingSubmission);

router.get('/categories', [tokenMiddleware], (require('../methods/v1/category/list')).getListCategory);

router.get('/exam-packages', [tokenParserMiddleware], (require('../methods/v1/exam-package/list')).getListExamPackage);

router.get('/my-exam-packages', [tokenMiddleware], (require('../methods/v1/user-purchase/my_exam_package_list')).getMyExamPackage);
router.get('/my-exams', [tokenMiddleware], (require('../methods/v1/user-purchase/my_exam_list')).getMyExam);
router.get('/my-exams/active', [tokenMiddleware], (require('../methods/v1/exam/active_exam')).getActiveExam);

router.post('/my-exam/start/exam', [tokenMiddleware], (require('../methods/v1/exam/start_exam')).postStartExam);
router.get('/my-exam/:userExamUuid/continue', [tokenMiddleware], (require('../methods/v1/exam/continue_exam')).getUserExamQuestions);
router.post('/my-exam/:userExamUuid/question/:questionUuid/answer', [tokenMiddleware], (require('../methods/v1/exam/submit_answer')).postAnswer);
router.post('/my-exam/:userExamUuid/finish', [tokenMiddleware], (require('../methods/v1/exam/finish_exam')).postFinishExam);

router.get('/exam/:examUuid/history', [tokenMiddleware], (require('../methods/v1/exam/history')).getExamHistory);
router.get('/exam/:examUuid/history/:userExamUuid', [tokenMiddleware], (require('../methods/v1/exam/detail_history')).getExamHistoryDetail);

router.get('/free-exam-packages', [tokenMiddleware], (require('../methods/v1/exam-package/free_exam_package_list')).getListFreeExamPackage);
router.post('/free-exam-packages/:uuid/claim', [tokenMiddleware], (require('../methods/v1/exam-package/claim_free_exam_package')).postClaimFreeExamPackage);

router.post('/tools/user-purchase', [apiKeyMiddleware], (require('../methods/v1/tools/user_purchase')).postUserPurchase);
router.post('/tools/reset-password', [apiKeyMiddleware], (require('../methods/v1/tools/reset_password')).postResetPassword);

router.post('/purchase/webhook/:pg', [webhookPaymentTokenMiddleware], (require('../methods/v1/tools/webhook_payment')).postWebhookPayment);

router.get('/selection-timelines', [tokenMiddleware], (require('../methods/v1/home/selection_timeline')).getSelectionTimeline);
router.get('/event-updates', [tokenMiddleware], (require('../methods/v1/home/event_update')).getEventUpdate);

/**
 * TODO bikin api untuk cron set end_date exam yang packagenya kadaluarsa, ini bisa jadi bikin ngegantung, gak bisa start exam
 *
 */

module.exports = router;
