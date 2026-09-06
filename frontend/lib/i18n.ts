export type Locale = "en" | "ar";

export const LOCALES: { code: Locale; label: string; dir: "ltr" | "rtl" }[] = [
  { code: "en", label: "English", dir: "ltr" },
  { code: "ar", label: "العربية", dir: "rtl" },
];

/**
 * Flat translation dictionary. Keys are dot-namespaced by page/section.
 * Values may contain {placeholders} filled in via the second argument to t().
 */
const dict = {
  en: {
    // Navbar
    "nav.backToDashboard": "Back to dashboard",
    "nav.signOut": "Sign out",

    // Theme toggle
    "theme.toLight": "Switch to light mode",
    "theme.toDark": "Switch to dark mode",

    // Auth brand panel
    "brand.headline1": "Land your next role,",
    "brand.headline2": "backed by data.",
    "brand.copy": "Upload your resume, paste a job description, and get a data-backed fit score with specific, prioritized ways to improve it.",
    "brand.feature1": "AI-powered resume-to-job matching",
    "brand.feature2": "Instant ATS compatibility scoring",
    "brand.feature3": "Actionable, prioritized feedback",
    "brand.copyright": "© {year} AI Resume Analyzer",

    // Login page
    "login.title": "Sign in",
    "login.subtitle": "Welcome back — enter your details to continue.",
    "login.email": "Email address",
    "login.password": "Password",
    "login.submit": "Sign in",
    "login.submitting": "Signing in...",
    "login.noAccount": "Don't have an account?",
    "login.createOne": "Create one",
    "login.error": "Login failed. Please try again.",

    // Register page
    "register.title": "Create your account",
    "register.subtitle": "Start getting AI-powered feedback on your resume.",
    "register.fullName": "Full name",
    "register.fullNamePlaceholder": "Joseph",
    "register.email": "Email address",
    "register.password": "Password",
    "register.passwordPlaceholder": "Min. 8 characters",
    "register.submit": "Create account",
    "register.submitting": "Creating account...",
    "register.haveAccount": "Already have an account?",
    "register.signIn": "Sign in",
    "register.errorShort": "Password must be at least 8 characters.",
    "register.error": "Registration failed. Please try again.",
    "register.role": "I am a...",
    "register.roleJobSeeker": "Job seeker",
    "register.roleHiringManager": "Hiring manager",
    "register.roleHiringManagerHelp": "Adds the ability to rank multiple candidate resumes against one job description.",

    // Dashboard
    "dashboard.loading": "Loading dashboard...",
    "dashboard.loadFailed": "Failed to load dashboard. Please refresh.",
    "dashboard.resumes": "Resumes",
    "dashboard.upload": "Upload Resume",
    "dashboard.uploading": "Uploading...",
    "dashboard.noResumes": "No resumes yet. Upload one to get started.",
    "dashboard.deleteResume": "Delete resume",
    "dashboard.deleteResumeTitle": "Delete resume?",
    "dashboard.deleteResumeMsg": "This cannot be undone.",
    "dashboard.uploadSuccess": "Resume uploaded — processing now.",
    "dashboard.uploadFailed": "Upload failed.",
    "dashboard.resumeDeleted": "Resume deleted.",
    "dashboard.resumeDeleteFailed": "Failed to delete resume.",

    "dashboard.jobDescriptions": "Job Descriptions",
    "dashboard.jobTitlePlaceholder": "Job title",
    "dashboard.jobContentPlaceholder": "Paste the full job description here...",
    "dashboard.saveJob": "Save Job Description",
    "dashboard.saving": "Saving...",
    "dashboard.noJobs": "No job descriptions yet.",
    "dashboard.deleteJob": "Delete job description",
    "dashboard.deleteJobTitle": "Delete job description?",
    "dashboard.jobSaved": "Job description saved.",
    "dashboard.jobSaveFailed": "Failed to save job description.",
    "dashboard.jobDeleted": "Job description deleted.",
    "dashboard.jobDeleteFailed": "Failed to delete job description.",
    "dashboard.contentLoading": "Loading...",
    "dashboard.contentLoadFailed": "Failed to load content.",
    "dashboard.viewRanking": "View candidate ranking",
    "dashboard.viewRankingLink": "Ranking →",

    "dashboard.runAnalysis": "Run Analysis",
    "dashboard.emptyBoth": "Upload a resume and add a job description to run your first analysis.",
    "dashboard.emptyResume": "Upload a resume and wait for processing to finish before running an analysis.",
    "dashboard.emptyJob": "Add a job description to run an analysis.",
    "dashboard.selectResume": "Select a resume...",
    "dashboard.selectJob": "Select a job description...",
    "dashboard.runAnalysisBtn": "Run Analysis →",
    "dashboard.starting": "Starting...",
    "dashboard.analysisFailed": "Failed to start analysis.",

    "dashboard.pastAnalyses": "Past Analyses",
    "dashboard.fitLabel": "Fit:",
    "dashboard.atsLabel": "ATS:",

    // Rank candidates (hiring manager only)
    "dashboard.rankCandidates": "Rank Candidates",
    "dashboard.rankCandidatesSubtitle": "Upload multiple resumes and rank them against one job description.",
    "dashboard.uploadResumes": "Upload Resumes",
    "dashboard.rankingNeedsUpload": "Upload resumes above to start ranking candidates.",
    "dashboard.candidatesSelected": "Candidates ({count} selected)",
    "dashboard.rankButton": "Rank {count} Candidates →",
    "dashboard.rankButtonEmpty": "Rank Candidates →",
    "dashboard.bulkUploadSuccess": "{count} resume(s) uploaded — processing now.",
    "dashboard.bulkUploadFailed": "Bulk upload failed.",
    "dashboard.rankingFailed": "Failed to start ranking.",

    "confirm.delete": "Delete",
    "confirm.confirm": "Confirm",
    "confirm.cancel": "Cancel",

    // Status badges
    "status.done": "done",
    "status.completed": "completed",
    "status.processing": "processing",
    "status.uploaded": "uploaded",
    "status.pending": "pending",
    "status.failed": "failed",

    // Analysis results
    "analysis.starting": "Starting analysis...",
    "analysis.analyzing": "Analyzing your resume...",
    "analysis.eta": "This usually takes a few seconds.",
    "analysis.failedTitle": "Analysis failed.",
    "analysis.failedMsg": "Something went wrong while processing this analysis.",
    "analysis.backToDashboard": "← Back to dashboard",
    "analysis.results": "Analysis Results",
    "analysis.fitScore": "Fit Score",
    "analysis.atsScore": "ATS Score",
    "analysis.skillsBreakdown": "Skills Breakdown",
    "analysis.matched": "Matched ({count})",
    "analysis.missing": "Missing ({count})",
    "analysis.none": "None",
    "analysis.greatCoverage": "None — great coverage!",
    "analysis.feedback": "Feedback ({count})",
    "analysis.noFeedback": "No feedback items were generated.",
    "analysis.noFeedbackYet": "Detailed feedback hasn't been generated for this analysis yet.",
    "analysis.generateFeedback": "Generate Feedback",
    "analysis.generating": "Generating...",
    "analysis.generateFeedbackFailed": "Failed to generate feedback.",
    "analysis.loadFailed": "Failed to load analysis.",

    // score_breakdown labels (fixed backend enum)
    "score.excellent": "Excellent",
    "score.good": "Good",
    "score.fair": "Fair",
    "score.poor": "Poor",

    // feedback item section/type labels (fixed backend enum)
    "section.summary": "summary",
    "section.experience": "experience",
    "section.skills": "skills",
    "section.education": "education",
    "section.formatting": "formatting",
    "type.improvement": "improvement",
    "type.missing_keyword": "missing keyword",
    "type.strength": "strength",

    // Rankings page (hiring manager only, no Joseph equivalent)
    "rankings.title": "Candidate Ranking",
    "rankings.loading": "Loading ranking...",
    "rankings.empty": "No candidates have been ranked against this job description yet.",
    "rankings.scoring": "Scoring candidates — this list will keep updating.",
    "rankings.footerHint": "Click a candidate to see their full skills breakdown, or to generate detailed written feedback for them.",
    "rankings.loadFailed": "Failed to load ranking.",
    "rankings.rank": "Rank",
    "rankings.candidate": "Candidate",
    "rankings.score": "Score",

    // Skills coverage chart
    "chart.noSkills": "No required skills were detected in the job description.",
    "chart.skillsMatched": "skills matched",
    "chart.matched": "Matched",
    "chart.missing": "Missing",

    // Language switcher
    "lang.switch": "Language",

    // Toast
    "toast.dismiss": "Dismiss notification",
  },
  ar: {
    "nav.backToDashboard": "العودة إلى لوحة التحكم",
    "nav.signOut": "تسجيل الخروج",

    "theme.toLight": "التبديل إلى الوضع الفاتح",
    "theme.toDark": "التبديل إلى الوضع الداكن",

    "brand.headline1": "احصل على وظيفتك القادمة،",
    "brand.headline2": "بالاعتماد على البيانات.",
    "brand.copy": "ارفع سيرتك الذاتية، الصق الوصف الوظيفي، واحصل على درجة توافق مبنية على البيانات مع طرق محددة ومرتبة حسب الأولوية لتحسينها.",
    "brand.feature1": "مطابقة السيرة الذاتية بالوظيفة بالذكاء الاصطناعي",
    "brand.feature2": "تقييم فوري لتوافق أنظمة تتبع المتقدمين (ATS)",
    "brand.feature3": "ملاحظات قابلة للتنفيذ ومرتبة حسب الأولوية",
    "brand.copyright": "© {year} محلل السيرة الذاتية بالذكاء الاصطناعي",

    "login.title": "تسجيل الدخول",
    "login.subtitle": "مرحبًا بعودتك — أدخل بياناتك للمتابعة.",
    "login.email": "البريد الإلكتروني",
    "login.password": "كلمة المرور",
    "login.submit": "تسجيل الدخول",
    "login.submitting": "جارٍ تسجيل الدخول...",
    "login.noAccount": "ليس لديك حساب؟",
    "login.createOne": "أنشئ حسابًا",
    "login.error": "فشل تسجيل الدخول. حاول مرة أخرى.",

    "register.title": "أنشئ حسابك",
    "register.subtitle": "ابدأ بالحصول على ملاحظات مدعومة بالذكاء الاصطناعي على سيرتك الذاتية.",
    "register.fullName": "الاسم الكامل",
    "register.fullNamePlaceholder": "يوسف",
    "register.email": "البريد الإلكتروني",
    "register.password": "كلمة المرور",
    "register.passwordPlaceholder": "٨ أحرف على الأقل",
    "register.submit": "إنشاء حساب",
    "register.submitting": "جارٍ إنشاء الحساب...",
    "register.haveAccount": "لديك حساب بالفعل؟",
    "register.signIn": "تسجيل الدخول",
    "register.errorShort": "يجب أن تتكون كلمة المرور من ٨ أحرف على الأقل.",
    "register.error": "فشل إنشاء الحساب. حاول مرة أخرى.",
    "register.role": "أنا...",
    "register.roleJobSeeker": "باحث عن عمل",
    "register.roleHiringManager": "مدير توظيف",
    "register.roleHiringManagerHelp": "يضيف إمكانية ترتيب عدة سير ذاتية للمرشحين مقابل وصف وظيفي واحد.",

    "dashboard.loading": "جارٍ تحميل لوحة التحكم...",
    "dashboard.loadFailed": "فشل تحميل لوحة التحكم. يرجى إعادة التحميل.",
    "dashboard.resumes": "السير الذاتية",
    "dashboard.upload": "رفع سيرة ذاتية",
    "dashboard.uploading": "جارٍ الرفع...",
    "dashboard.noResumes": "لا توجد سير ذاتية بعد. ارفع واحدة للبدء.",
    "dashboard.deleteResume": "حذف السيرة الذاتية",
    "dashboard.deleteResumeTitle": "حذف السيرة الذاتية؟",
    "dashboard.deleteResumeMsg": "لا يمكن التراجع عن هذا الإجراء.",
    "dashboard.uploadSuccess": "تم رفع السيرة الذاتية — جارٍ المعالجة الآن.",
    "dashboard.uploadFailed": "فشل الرفع.",
    "dashboard.resumeDeleted": "تم حذف السيرة الذاتية.",
    "dashboard.resumeDeleteFailed": "فشل حذف السيرة الذاتية.",

    "dashboard.jobDescriptions": "الأوصاف الوظيفية",
    "dashboard.jobTitlePlaceholder": "المسمى الوظيفي",
    "dashboard.jobContentPlaceholder": "الصق الوصف الوظيفي الكامل هنا...",
    "dashboard.saveJob": "حفظ الوصف الوظيفي",
    "dashboard.saving": "جارٍ الحفظ...",
    "dashboard.noJobs": "لا توجد أوصاف وظيفية بعد.",
    "dashboard.deleteJob": "حذف الوصف الوظيفي",
    "dashboard.deleteJobTitle": "حذف الوصف الوظيفي؟",
    "dashboard.jobSaved": "تم حفظ الوصف الوظيفي.",
    "dashboard.jobSaveFailed": "فشل حفظ الوصف الوظيفي.",
    "dashboard.jobDeleted": "تم حذف الوصف الوظيفي.",
    "dashboard.jobDeleteFailed": "فشل حذف الوصف الوظيفي.",
    "dashboard.contentLoading": "جارٍ التحميل...",
    "dashboard.contentLoadFailed": "فشل تحميل المحتوى.",
    "dashboard.viewRanking": "عرض ترتيب المرشحين",
    "dashboard.viewRankingLink": "الترتيب ←",

    "dashboard.runAnalysis": "تشغيل التحليل",
    "dashboard.emptyBoth": "ارفع سيرة ذاتية وأضف وصفًا وظيفيًا لتشغيل أول تحليل.",
    "dashboard.emptyResume": "ارفع سيرة ذاتية وانتظر انتهاء المعالجة قبل تشغيل التحليل.",
    "dashboard.emptyJob": "أضف وصفًا وظيفيًا لتشغيل التحليل.",
    "dashboard.selectResume": "اختر سيرة ذاتية...",
    "dashboard.selectJob": "اختر وصفًا وظيفيًا...",
    "dashboard.runAnalysisBtn": "← تشغيل التحليل",
    "dashboard.starting": "جارٍ البدء...",
    "dashboard.analysisFailed": "فشل بدء التحليل.",

    "dashboard.pastAnalyses": "التحليلات السابقة",
    "dashboard.fitLabel": "التوافق:",
    "dashboard.atsLabel": "ATS:",

    "dashboard.rankCandidates": "ترتيب المرشحين",
    "dashboard.rankCandidatesSubtitle": "ارفع عدة سير ذاتية ورتبها مقابل وصف وظيفي واحد.",
    "dashboard.uploadResumes": "رفع سير ذاتية",
    "dashboard.rankingNeedsUpload": "ارفع سيرًا ذاتية أعلاه لبدء ترتيب المرشحين.",
    "dashboard.candidatesSelected": "المرشحون ({count} محدد)",
    "dashboard.rankButton": "← ترتيب {count} مرشح",
    "dashboard.rankButtonEmpty": "← ترتيب المرشحين",
    "dashboard.bulkUploadSuccess": "تم رفع {count} سيرة ذاتية — جارٍ المعالجة الآن.",
    "dashboard.bulkUploadFailed": "فشل الرفع الجماعي.",
    "dashboard.rankingFailed": "فشل بدء الترتيب.",

    "confirm.delete": "حذف",
    "confirm.confirm": "تأكيد",
    "confirm.cancel": "إلغاء",

    "status.done": "منتهية",
    "status.completed": "مكتمل",
    "status.processing": "قيد المعالجة",
    "status.uploaded": "مرفوعة",
    "status.pending": "قيد الانتظار",
    "status.failed": "فشل",

    "analysis.starting": "جارٍ بدء التحليل...",
    "analysis.analyzing": "جارٍ تحليل سيرتك الذاتية...",
    "analysis.eta": "يستغرق هذا عادة بضع ثوانٍ.",
    "analysis.failedTitle": "فشل التحليل.",
    "analysis.failedMsg": "حدث خطأ أثناء معالجة هذا التحليل.",
    "analysis.backToDashboard": "→ العودة إلى لوحة التحكم",
    "analysis.results": "نتائج التحليل",
    "analysis.fitScore": "درجة التوافق",
    "analysis.atsScore": "درجة ATS",
    "analysis.skillsBreakdown": "تفصيل المهارات",
    "analysis.matched": "متطابقة ({count})",
    "analysis.missing": "ناقصة ({count})",
    "analysis.none": "لا يوجد",
    "analysis.greatCoverage": "لا يوجد — تغطية ممتازة!",
    "analysis.feedback": "الملاحظات ({count})",
    "analysis.noFeedback": "لم يتم إنشاء أي ملاحظات.",
    "analysis.noFeedbackYet": "لم يتم إنشاء ملاحظات مفصلة لهذا التحليل بعد.",
    "analysis.generateFeedback": "إنشاء الملاحظات",
    "analysis.generating": "جارٍ الإنشاء...",
    "analysis.generateFeedbackFailed": "فشل إنشاء الملاحظات.",
    "analysis.loadFailed": "فشل تحميل التحليل.",

    "score.excellent": "ممتاز",
    "score.good": "جيد",
    "score.fair": "مقبول",
    "score.poor": "ضعيف",

    "section.summary": "الملخص",
    "section.experience": "الخبرة",
    "section.skills": "المهارات",
    "section.education": "التعليم",
    "section.formatting": "التنسيق",
    "type.improvement": "تحسين",
    "type.missing_keyword": "كلمة مفتاحية ناقصة",
    "type.strength": "نقطة قوة",

    "rankings.title": "ترتيب المرشحين",
    "rankings.loading": "جارٍ تحميل الترتيب...",
    "rankings.empty": "لم يتم ترتيب أي مرشحين مقابل هذا الوصف الوظيفي بعد.",
    "rankings.scoring": "جارٍ تقييم المرشحين — ستستمر هذه القائمة في التحديث.",
    "rankings.footerHint": "انقر على مرشح لعرض تفصيل مهاراته الكامل، أو لإنشاء ملاحظات مكتوبة مفصلة له.",
    "rankings.loadFailed": "فشل تحميل الترتيب.",
    "rankings.rank": "الترتيب",
    "rankings.candidate": "المرشح",
    "rankings.score": "الدرجة",

    "chart.noSkills": "لم يتم اكتشاف أي مهارات مطلوبة في الوصف الوظيفي.",
    "chart.skillsMatched": "مهارات متطابقة",
    "chart.matched": "متطابقة",
    "chart.missing": "ناقصة",

    "lang.switch": "اللغة",

    "toast.dismiss": "إغلاق الإشعار",
  },
} as const;

export type TranslationKey = keyof typeof dict["en"];

export function translate(
  locale: Locale,
  key: TranslationKey,
  params?: Record<string, string | number>
): string {
  let text: string = dict[locale][key] ?? dict.en[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(`{${k}}`, String(v));
    }
  }
  return text;
}
