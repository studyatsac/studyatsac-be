const router = require('express').Router();
const adminOnlyMiddleware = require('../middlewares/admin_only');
const tokenMiddleware = require('../middlewares/token_middleware');
const tokenParserMiddleware = require('../middlewares/token_parser_middleware');
const apiKeyMiddleware = require('../middlewares/api_key_middleware');
const webhookPaymentTokenMiddleware = require('../middlewares/webhook_payment_callback');
const upload = require('../middlewares/upload_file');

router.get('/ping', (req, res) => res.status(200).json({ message: 'PONG', date: new Date() }));

// Endpoint admin untuk mengambil total peserta beli paket exam tertentu
router.get(
    '/admin/exam-package/participant-count',
    [tokenMiddleware],
    require('../methods/v1/exam-package/participant_count').getParticipantCount
);

// Endpoint admin untuk statistik user per bulan
router.get(
    '/admin/user-stat-per-month',
    [tokenMiddleware],
    require('../methods/v1/user/stat_per_month').getUserStatPerMonth
);

// Endpoint admin untuk mengambil total user
router.get(
    '/admin/user-count',
    [tokenMiddleware],
    require('../methods/v1/user/count').getUserCount
);

// Endpoint admin untuk hapus exam_package by id
router.delete(
    '/admin/exam-package/:id',
    [tokenMiddleware],
    require('../methods/v1/exam-package/admin_delete').deleteExamPackage
);

// Endpoint admin untuk update exam_package by id
router.put(
    '/admin/exam-package/:id',
    [tokenMiddleware],
    require('../methods/v1/exam-package/admin_update').updateExamPackage
);

// Endpoint admin untuk mengambil detail exam_package by id
router.get(
    '/admin/exam-package/:id',
    [tokenMiddleware],
    require('../methods/v1/exam-package/admin_detail').getExamPackageDetail
);

// Endpoint admin untuk membuat exam_package baru
router.post(
    '/admin/exam-package',
    [tokenMiddleware],
    require('../methods/v1/exam-package/admin_create').createExamPackage
);

// Endpoint admin untuk mengambil detail user by id
router.get(
    '/admin/users/:id',
    [tokenMiddleware],
    require('../methods/v1/user/admin_detail').getUserDetail
);

// Endpoint admin untuk mengambil semua user (pagination)
router.get(
    '/admin/users',
    [tokenMiddleware],
    require('../methods/v1/user/admin_list').getListUser
);

// Endpoint admin untuk mengambil semua exam_package
router.get(
    '/admin/exam-packages',
    [tokenMiddleware],
    require('../methods/v1/exam-package/admin_list').getListExamPackage
);

// Endpoint admin untuk mengambil semua exam (pagination)
router.get(
    '/admin/exams',
    [tokenMiddleware],
    require('../methods/v1/exam/admin_list').getListExam
);

// Endpoint admin untuk mengambil semua user_purchases (pagination)
router.get(
    '/admin/user-purchases',
    [tokenMiddleware],
    require('../methods/v1/user-purchase/admin_list').getListUserPurchase
);

// Endpoint admin untuk mengambil semua user_exam (pagination)
router.get(
    '/admin/user-exams',
    [tokenMiddleware],
    require('../methods/v1/user-exam/admin_list').getListUserExam
);

// Endpoint admin untuk mengambil semua ielts_score (pagination)
router.get(
    '/admin/ielts-scores',
    [tokenMiddleware],
    require('../methods/v1/ielts-score/admin_list').getListIeltsScore
);

// Endpoint admin untuk mengambil semua ielts_writing_submission (pagination)
router.get(
    '/admin/ielts-writing-submissions',
    [tokenMiddleware],
    require('../methods/v1/ielts-writing-submission/admin_list').getListIeltsWritingSubmission
);

// Endpoint admin untuk mengambil detail ielts_writing_submission by id
router.get(
    '/admin/ielts-writing-submissions/:id',
    [tokenMiddleware],
    require('../methods/v1/ielts-writing-submission/admin_detail').getIeltsWritingSubmissionDetail
);

// Endpoint admin untuk membuat ielts_writing_submission baru
router.post(
    '/admin/ielts-writing-submissions',
    [tokenMiddleware],
    require('../methods/v1/ielts-writing-submission/admin_create').createIeltsWritingSubmission
);

// Endpoint admin untuk update ielts_writing_submission by id
router.put(
    '/admin/ielts-writing-submissions/:id',
    [tokenMiddleware],
    require('../methods/v1/ielts-writing-submission/admin_update').updateIeltsWritingSubmission
);

// Endpoint admin untuk hapus ielts_writing_submission by id
router.delete(
    '/admin/ielts-writing-submissions/:id',
    [tokenMiddleware],
    require('../methods/v1/ielts-writing-submission/admin_delete').deleteIeltsWritingSubmission
);

// Endpoint admin untuk mengambil detail ielts_score by id
router.get(
    '/admin/ielts-scores/:id',
    [tokenMiddleware],
    require('../methods/v1/ielts-score/admin_detail').getIeltsScoreDetail
);

// Endpoint admin untuk membuat ielts_score baru
router.post(
    '/admin/ielts-scores',
    [tokenMiddleware],
    require('../methods/v1/ielts-score/admin_create').createIeltsScore
);

// Endpoint admin untuk update ielts_score by id
router.put(
    '/admin/ielts-scores/:id',
    [tokenMiddleware],
    require('../methods/v1/ielts-score/admin_update').updateIeltsScore
);

// Endpoint admin untuk hapus ielts_score by id
router.delete(
    '/admin/ielts-scores/:id',
    [tokenMiddleware],
    require('../methods/v1/ielts-score/admin_delete').deleteIeltsScore
);

// Endpoint admin untuk mengambil detail user_exam by id
router.get(
    '/admin/user-exams/:id',
    [tokenMiddleware],
    require('../methods/v1/user-exam/admin_detail').getUserExamDetail
);

// Endpoint admin untuk membuat user_exam baru
router.post(
    '/admin/user-exams',
    [tokenMiddleware],
    require('../methods/v1/user-exam/admin_create').createUserExam
);

// Endpoint admin untuk update user_exam by id
router.put(
    '/admin/user-exams/:id',
    [tokenMiddleware],
    require('../methods/v1/user-exam/admin_update').updateUserExam
);

// Endpoint admin untuk hapus user_exam by id
router.delete(
    '/admin/user-exams/:id',
    [tokenMiddleware],
    require('../methods/v1/user-exam/admin_delete').deleteUserExam
);

// Endpoint admin untuk mengambil detail user_purchase by id
router.get(
    '/admin/user-purchases/:id',
    [tokenMiddleware],
    require('../methods/v1/user-purchase/admin_detail').getUserPurchaseDetail
);

// Endpoint admin untuk membuat user_purchase baru
router.post(
    '/admin/user-purchases',
    [tokenMiddleware],
    require('../methods/v1/user-purchase/admin_create').createUserPurchase
);

// Endpoint admin untuk update user_purchase by id
router.put(
    '/admin/user-purchases/:id',
    [tokenMiddleware],
    require('../methods/v1/user-purchase/admin_update').updateUserPurchase
);

// Endpoint admin untuk hapus user_purchase by id
router.delete(
    '/admin/user-purchases/:id',
    [tokenMiddleware],
    require('../methods/v1/user-purchase/admin_delete').deleteUserPurchase
);

// Endpoint admin untuk mengambil detail exam by id
router.get(
    '/admin/exams/:id',
    [tokenMiddleware],
    require('../methods/v1/exam/admin_detail').getExamDetail
);

// Endpoint admin untuk membuat exam baru
router.post(
    '/admin/exams',
    [tokenMiddleware],
    require('../methods/v1/exam/admin_create').createExam
);

// Endpoint admin untuk update exam by id
router.put(
    '/admin/exams/:id',
    [tokenMiddleware],
    require('../methods/v1/exam/admin_update').updateExam
);

// Endpoint admin untuk hapus exam by id
router.delete(
    '/admin/exams/:id',
    [tokenMiddleware],
    require('../methods/v1/exam/admin_delete').deleteExam
);

// Endpoint admin untuk menambah user
router.post(
    '/admin/users',
    [tokenMiddleware],
    require('../methods/v1/user/admin_create').createUser
);

// Endpoint admin untuk update user
router.put(
    '/admin/users/:id',
    [tokenMiddleware],
    require('../methods/v1/user/admin_update').updateUser
);

// Endpoint admin untuk menghapus user
router.delete(
    '/admin/users/:id',
    [tokenMiddleware],
    require('../methods/v1/user/admin_delete').deleteUser
);

// Endpoint admin untuk bulk delete user
router.post(
    '/admin/users/bulk-delete',
    [tokenMiddleware],
    require('../methods/v1/user/admin_bulk_delete').bulkDeleteUsers
);

router.get(
    '/account/roles',
    [tokenMiddleware],
    require('../methods/v1/roles/user_roles').getUserRoles
);

router.get(
    '/roles',
    [],
    require('../methods/v1/roles/get_all').getAll
);

router.post(
    '/account/register',
    [],
    require('../methods/v1/account/register').postRegister
);
router.post(
    '/account/login',
    [],
    require('../methods/v1/account/login').postLogin
);
router.post('/upload', upload.single('file'), require('../methods/v1/storage/storage').uploadFile);
router.post(
    '/forgot-password',
    [],
    require('../methods/v1/account/forgot_password').postForgotPassword
);
router.post(
    '/reset-password',
    [],
    require('../methods/v1/account/reset_password').resetPassword
);
router.post(
    '/account/update-password',
    [tokenMiddleware],
    require('../methods/v1/account/update_password').updatePassword
);
router.get(
    '/account',
    [tokenMiddleware],
    require('../methods/v1/account/profile').getAccountProfile
);

router.post(
    '/ielts-scores',
    [tokenMiddleware],
    require('../methods/v1/exam/post_ielts_score').postIeltsScore
);
router.post(
    '/ielts-scores/:id',
    [tokenMiddleware],
    require('../methods/v1/exam/post_ielts_score').postIeltsScore
);
router.post(
    '/ielts-writing-submissions',
    [tokenMiddleware],
    require('../methods/v1/exam/post_ielts_writing').postIeltsWriting
);
router.post(
    '/ielts-writing-submissions/:id',
    [tokenMiddleware],
    require('../methods/v1/exam/post_ielts_writing').postIeltsWriting
);
router.get(
    '/ielts-scores/:id',
    [tokenMiddleware],
    require('../methods/v1/exam/get_ielts_score').getIeltsScore
);
router.get(
    '/ielts-writing-submissions/:id',
    [tokenMiddleware],
    require('../methods/v1/exam/get_ielts_writing_submissions')
        .getIeltsWritingSubmission
);

router.get(
    '/categories',
    [tokenMiddleware],
    require('../methods/v1/category/list').getListCategory
);

router.get(
    '/exam-packages',
    [tokenParserMiddleware],
    require('../methods/v1/exam-package/list').getListExamPackage
);

router.get(
    '/my-exam-packages',
    [tokenMiddleware],
    require('../methods/v1/user-purchase/my_exam_package_list').getMyExamPackage
);
router.get(
    '/my-exams',
    [tokenMiddleware],
    require('../methods/v1/user-purchase/my_exam_list').getMyExam
);
router.get(
    '/my-exams/active',
    [tokenMiddleware],
    require('../methods/v1/exam/active_exam').getActiveExam
);

router.get(
    '/questions/:questionId/resources',
    [tokenMiddleware],
    require('../methods/v1/resources/questions_resources').getResourcesByQuestion
);

router.post(
    '/my-exam/start/exam',
    [tokenMiddleware],
    require('../methods/v1/exam/start_exam').postStartExam
);
router.get(
    '/my-exam/:userExamUuid/continue',
    [tokenMiddleware],
    require('../methods/v1/exam/continue_exam').getUserExamQuestions
);
router.post(
    '/my-exam/:userExamUuid/question/:questionUuid/answer',
    [tokenMiddleware],
    require('../methods/v1/exam/submit_answer').postAnswer
);
router.post(
    '/my-exam/:userExamUuid/finish',
    [tokenMiddleware],
    require('../methods/v1/exam/finish_exam').postFinishExam
);

router.get(
    '/exam/:examUuid/history',
    [tokenMiddleware],
    require('../methods/v1/exam/history').getExamHistory
);
router.get(
    '/exam/:examUuid/history/:userExamUuid',
    [tokenMiddleware],
    require('../methods/v1/exam/detail_history').getExamHistoryDetail
);

router.get(
    '/free-exam-packages',
    [tokenMiddleware],
    require('../methods/v1/exam-package/free_exam_package_list')
        .getListFreeExamPackage
);
router.post(
    '/free-exam-packages/:uuid/claim',
    [tokenMiddleware],
    require('../methods/v1/exam-package/claim_free_exam_package')
        .postClaimFreeExamPackage
);

router.post(
    '/tools/user-purchase',
    [apiKeyMiddleware],
    require('../methods/v1/tools/user_purchase').postUserPurchase
);
router.post(
    '/tools/reset-password',
    [apiKeyMiddleware],
    require('../methods/v1/tools/reset_password').postResetPassword
);

router.post(
    '/purchase/webhook/:pg',
    [webhookPaymentTokenMiddleware],
    require('../methods/v1/tools/webhook_payment').postWebhookPayment
);

router.get(
    '/selection-timelines',
    [tokenMiddleware],
    require('../methods/v1/home/selection_timeline').getSelectionTimeline
);
router.get(
    '/event-updates',
    [tokenMiddleware],
    require('../methods/v1/home/event_update').getEventUpdate
);

router.get(
    '/admin/essays',
    [tokenMiddleware, adminOnlyMiddleware],
    require('../methods/v1/essay/essay_list').getEssayList
);
router.post(
    '/admin/essays',
    [tokenMiddleware, adminOnlyMiddleware],
    require('../methods/v1/essay/create_essay').createEssay
);
router.get(
    '/admin/essays/:uuid',
    [tokenMiddleware, adminOnlyMiddleware],
    require('../methods/v1/essay/essay').getEssay
);
router.put(
    '/admin/essays/:uuid',
    [tokenMiddleware, adminOnlyMiddleware],
    require('../methods/v1/essay/update_essay').updateEssay
);
router.delete(
    '/admin/essays/:uuid',
    [tokenMiddleware, adminOnlyMiddleware],
    require('../methods/v1/essay/delete_essay').deleteEssay
);
router.get(
    '/essays',
    [tokenMiddleware],
    require('../methods/v1/essay/active_essay_list').getActiveEssayList
);
router.get(
    '/essays/:uuid',
    [tokenMiddleware],
    require('../methods/v1/essay/restricted_essay').getRestrictedEssay
);

router.get(
    '/admin/user-essays',
    [tokenMiddleware, adminOnlyMiddleware],
    require('../methods/v1/user-essay/user_essay_list').getUserEssayList
);
router.get(
    '/user-essays',
    [tokenMiddleware],
    require('../methods/v1/user-essay/specific_user_essay_list').getSpecificUserEssayList
);
router.get(
    '/user-essays/:uuid',
    [tokenMiddleware],
    require('../methods/v1/user-essay/user_essay').getUserEssay
);

/**
 * TODO bikin api untuk cron set end_date exam yang packagenya kadaluarsa, ini bisa jadi bikin ngegantung, gak bisa start exam
 *
 */

// Endpoint baru untuk mengambil resource berdasarkan questionId

module.exports = router;
