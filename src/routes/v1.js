const router = require("express").Router();
const usersController = require("../methods/v1/resources/users");
const adminOnly = require("../middlewares/admin_only");
const tokenMiddleware = require("../middlewares/token_middleware");
const tokenParserMiddleware = require("../middlewares/token_parser_middleware");
const apiKeyMiddleware = require("../middlewares/api_key_middleware");
const webhookPaymentTokenMiddleware = require("../middlewares/webhook_payment_callback");
const upload = require("../middlewares/upload_file");

router.get("/ping", (req, res) =>
  res.status(200).json({ message: "PONG", date: new Date() })
);

// Endpoint admin untuk mengambil semua data user
router.get(
  "/admin/users",
  [tokenMiddleware, adminOnly],
  usersController.getAllUsers
);

// Endpoint admin untuk menambah user
router.post(
  "/admin/users",
  [tokenMiddleware, adminOnly],
  usersController.createUser
);

// Endpoint admin untuk menghapus user
router.delete(
  "/admin/users/:id",
  [tokenMiddleware, adminOnly],
  usersController.deleteUser
);

// Endpoint admin untuk bulk delete user
router.post(
  "/admin/users/bulk-delete",
  [tokenMiddleware, adminOnly],
  usersController.bulkDeleteUsers
);

router.post(
  "/account/register",
  [],
  require("../methods/v1/account/register").postRegister
);
router.post(
  "/account/login",
  [],
  require("../methods/v1/account/login").postLogin
);
router.post("/upload", upload.single('file'), require("../methods/v1/storage/storage").uploadFile);
router.post(
  "/forgot-password",
  [],
  require("../methods/v1/account/forgot_password").postForgotPassword
);
router.post(
  "/account/update-password",
  [tokenMiddleware],
  require("../methods/v1/account/update_password").updatePassword
);
router.get(
  "/account",
  [tokenMiddleware],
  require("../methods/v1/account/profile").getAccountProfile
);

router.post(
  "/ielts-scores",
  [tokenMiddleware],
  require("../methods/v1/exam/post_ielts_score").postIeltsScore
);
router.post(
  "/ielts-scores/:id",
  [tokenMiddleware],
  require("../methods/v1/exam/post_ielts_score").postIeltsScore
);
router.post(
  "/ielts-writing-submissions",
  [tokenMiddleware],
  require("../methods/v1/exam/post_ielts_writing").postIeltsWriting
);
router.post(
  "/ielts-writing-submissions/:id",
  [tokenMiddleware],
  require("../methods/v1/exam/post_ielts_writing").postIeltsWriting
);
router.get(
  "/ielts-scores/:id",
  [tokenMiddleware],
  require("../methods/v1/exam/get_ielts_score").getIeltsScore
);
router.get(
  "/ielts-writing-submissions/:id",
  [tokenMiddleware],
  require("../methods/v1/exam/get_ielts_writing_submissions")
    .getIeltsWritingSubmission
);

router.get(
  "/categories",
  [tokenMiddleware],
  require("../methods/v1/category/list").getListCategory
);

router.get(
  "/exam-packages",
  [tokenParserMiddleware],
  require("../methods/v1/exam-package/list").getListExamPackage
);

router.get(
  "/my-exam-packages",
  [tokenMiddleware],
  require("../methods/v1/user-purchase/my_exam_package_list").getMyExamPackage
);
router.get(
  "/my-exams",
  [tokenMiddleware],
  require("../methods/v1/user-purchase/my_exam_list").getMyExam
);
router.get(
  "/my-exams/active",
  [tokenMiddleware],
  require("../methods/v1/exam/active_exam").getActiveExam
);

router.get(
  "/questions/:questionId/resources",
  [tokenMiddleware],
  require("../methods/v1/resources/questions_resources").getResourcesByQuestion
);

router.post(
  "/my-exam/start/exam",
  [tokenMiddleware],
  require("../methods/v1/exam/start_exam").postStartExam
);
router.get(
  "/my-exam/:userExamUuid/continue",
  [tokenMiddleware],
  require("../methods/v1/exam/continue_exam").getUserExamQuestions
);
router.post(
  "/my-exam/:userExamUuid/question/:questionUuid/answer",
  [tokenMiddleware],
  require("../methods/v1/exam/submit_answer").postAnswer
);
router.post(
  "/my-exam/:userExamUuid/finish",
  [tokenMiddleware],
  require("../methods/v1/exam/finish_exam").postFinishExam
);

router.get(
  "/exam/:examUuid/history",
  [tokenMiddleware],
  require("../methods/v1/exam/history").getExamHistory
);
router.get(
  "/exam/:examUuid/history/:userExamUuid",
  [tokenMiddleware],
  require("../methods/v1/exam/detail_history").getExamHistoryDetail
);

router.get(
  "/free-exam-packages",
  [tokenMiddleware],
  require("../methods/v1/exam-package/free_exam_package_list")
    .getListFreeExamPackage
);
router.post(
  "/free-exam-packages/:uuid/claim",
  [tokenMiddleware],
  require("../methods/v1/exam-package/claim_free_exam_package")
    .postClaimFreeExamPackage
);

router.post(
  "/tools/user-purchase",
  [apiKeyMiddleware],
  require("../methods/v1/tools/user_purchase").postUserPurchase
);
router.post(
  "/tools/reset-password",
  [apiKeyMiddleware],
  require("../methods/v1/tools/reset_password").postResetPassword
);

router.post(
  "/purchase/webhook/:pg",
  [webhookPaymentTokenMiddleware],
  require("../methods/v1/tools/webhook_payment").postWebhookPayment
);

router.get(
  "/selection-timelines",
  [tokenMiddleware],
  require("../methods/v1/home/selection_timeline").getSelectionTimeline
);
router.get(
  "/event-updates",
  [tokenMiddleware],
  require("../methods/v1/home/event_update").getEventUpdate
);

/**
 * TODO bikin api untuk cron set end_date exam yang packagenya kadaluarsa, ini bisa jadi bikin ngegantung, gak bisa start exam
 *
 */

// Endpoint baru untuk mengambil resource berdasarkan questionId


module.exports = router;
