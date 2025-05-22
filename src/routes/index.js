const express = require('express');
const authRoutesv1 = require('../v1/routes/authRoutes'); // Import version 1 routes
const contactRoute = require('../v1/routes/contactRoutes');
const dealRoute = require('../v1/routes/dealRoutes');
const companyRoute = require('../v1/routes/companyRoutes');
const pipelineRoute = require('../v1/routes/pipelineRoute');
const sourceRoute = require('../v1/routes/sourceRoute');
const callsRoutes = require('../v1/routes/callsRoute');
const callStatusRoutes = require('../v1/routes/callStatusRoute');
const callTypeRoutes = require('../v1/routes/callTypeRoute');
const callResultRoutes = require('../v1/routes/callResultRoute');
// const callPurposeRoutes = require('../v1/routes/callPurposeRoute');
const contactStageRoutes = require('../v1/routes/contactStageRoute');
const industryRoutes = require('../v1/routes/industryRoute');
const lostReasonRoutes = require('../v1/routes/lostReasonRoute');
const projectRoutes = require('../v1/routes/projectRoutes');
const userRoutes = require('../v1/routes/userRoutes');
const roleRoutes = require('../v1/routes/roleRoute');
const leadRoutes = require('../v1/routes/leadRoutes');
const countryRoutes = require('../v1/routes/countryRoutes')
const currencyRoutes = require('../v1/routes/currencyRoutes')
const activitiesRoutes = require('../v1/routes/activitiesRoutes')
// const noteRoutes = require('../v1/routes/noteRoute');
const dashboardRoutes = require('../v1/routes/dashboardRoutes')
const vendorRoutes = require('../v1/routes/vendorRoutes')
const meetingTypeRoutes = require('../v1/routes/meetingTypeRoute')
const stateRoutes = require('../v1/routes/stateRoute')
const modulesRoutes = require('../v1/routes/ModuleRoute')
const permissionsRoutes = require('../v1/routes/roleModulePermissionRoute')
const fileAttachmentRoutes = require('../v1/routes/fileAttachmentRoute')
const productCategoryRoutes = require('../v1/routes/productCategoryRoute')
// const manufacturerRoutes = require('../v1/routes/manufacturerRoute')
const productRoutes = require('../v1/routes/productRoute')
const taxSetupRoutes = require('../v1/routes/taxSetupRoute')
const orderRoutes = require('../v1/routes/orderRoute')
const quotationRoutes = require('../v1/routes/quotationRoute')
const purchaseOrderRoutes = require('../v1/routes/purchaseOrderRoute')
const purchaseInvoiceRoutes = require('../v1/routes/purchaseInvoiceRoute')
const invoiceRoutes = require("../v1/routes/invoiceRoute")
const priceBookRoutes = require("../v1/routes/priceBookRoute")
const casesRoutes = require("../v1/routes/casesRoutes")
const solutionsRoutes = require("../v1/routes/solutionsRoutes")
const campaignRoutes = require("../v1/routes/campaignRoutes")
const bankRoutes = require("../v1/routes/bankRoute")
const companyMasterRoutes = require("../v1/routes/companyMasterRoute")
const branchRoutes = require("../v1/routes/branchRoute")
const departmentRoutes = require("../v1/routes/departmentRoutes")
const designationRoutes = require("../v1/routes/designationRoutes")
const empCategoryRoutes = require("../v1/routes/empCategoryRoutes")
const empTypeRoutes = require("../v1/routes/empTypeRoutes")
const payComponentRoutes = require("../v1/routes/payComponentRoutes")
const salaryStructureRoutes = require("../v1/routes/salaryStructureRoutes")
const statutoryRateRoutes = require("../v1/routes/statutoryRateRoutes")
const taxRegimeRoutes = require("../v1/routes/taxRegimRoutes")
const pfRoutes = require("../v1/routes/PFRoutes")
const taxReliefRoutes = require("../v1/routes/taxReliefRoutes")
const shiftRoutes = require("../v1/routes/shiftRoutes")
const leaveTypeRoutes = require("../v1/routes/leaveTypeRoutes")
const HolidaysRoutes = require("../v1/routes/HolidayCalenderRoutes")
const workScheduleRoutes = require("../v1/routes/workScheduleRoutes")
const KPIRoutes = require("../v1/routes/KPIRoutes")
const GoalCategoryRoutes = require("../v1/routes/GoalCategoryRoutes")
const reviewTempRoutes = require("../v1/routes/reviewTempRoutes")
const ratingScaleRoutes = require("../v1/routes/ratingScaleRoutes")
const jobCategoryRoutes = require("../v1/routes/jobCategoryRoutes")
const grievanceTypeRoutes = require("../v1/routes/grievanceTypeRoutes")
const disciplinaryPenaltyRoutes = require("../v1/routes/disciplinaryPenaltyRoutes")
const eventTypeRoutes = require("../v1/routes/eventTypeRoutes")
const awardTypeRoutes = require("../v1/routes/awardTypeRoutes")
const latterTypeRoutes = require("../v1/routes/latterTypeRoutes")
const DocTypeRoutes = require("../v1/routes/DocTypeRoutes")
const surveyRoutes = require("../v1/routes/surveyRoutes")
const assetsTypeRoutes = require("../v1/routes/assetsTypeRoutes")
const EmployeeRoutes = require("../v1/routes/EmployeeRoutes")
const JobPostingRoutes = require("../v1/routes/JobPostingRoute")
const AppointmetnLatterRoute = require("../v1/routes/AppointmetnLatterRoute")
const offerLatterRoute = require("../v1/routes/offerLatterRoute")
const EmploymentContractRoute = require("../v1/routes/EmploymentContractRoute")
const ResumeUploadRoute = require("../v1/routes/ResumeUploadRoute")

const router = express.Router();

// Version 1 API
router.use('/v1', authRoutesv1); // Base path: /v1
router.use('/v1', dashboardRoutes); // Base path: /v1
router.use('/v1', contactRoute); // Base path: /v1
router.use('/v1', vendorRoutes); // Base path: /v1
router.use('/v1', dealRoute); // Base path: /v1
router.use('/v1', companyRoute); // Base path: /v1
router.use('/v1', pipelineRoute); // Base path: /v1
router.use('/v1', pipelineRoute); // Base path: /v1
router.use('/v1', sourceRoute); // Base path: /v1
router.use('/v1', callsRoutes);// Base path: /v1
router.use('/v1', callStatusRoutes);// Base path: /v1
router.use('/v1', callTypeRoutes);// Base path: /v1
router.use('/v1', callResultRoutes);// Base path: /v1
// router.use('/v1', callPurposeRoutes);// Base path: /v1
router.use('/v1', contactStageRoutes);// Base path: /v1
router.use('/v1', industryRoutes);// Base path: /v1
router.use('/v1', lostReasonRoutes);// Base path: /v1
router.use('/v1', projectRoutes);
router.use('/v1', userRoutes);
router.use('/v1', roleRoutes);
router.use('/v1', leadRoutes);
router.use('/v1', countryRoutes);
router.use('/v1', currencyRoutes);
router.use('/v1', activitiesRoutes);
// router.use('/v1', noteRoutes);
router.use('/v1', meetingTypeRoutes);
router.use('/v1', stateRoutes);
router.use('/v1', modulesRoutes);
router.use('/v1', permissionsRoutes);
router.use('/v1', fileAttachmentRoutes);
router.use('/v1', productCategoryRoutes);
router.use('/v1', productRoutes);
router.use('/v1', taxSetupRoutes);
router.use('/v1', orderRoutes);
router.use('/v1',quotationRoutes);
router.use('/v1',purchaseOrderRoutes);
router.use('/v1',purchaseInvoiceRoutes);
router.use('/v1',invoiceRoutes);
router.use('/v1',priceBookRoutes);
router.use('/v1',casesRoutes);
router.use('/v1',solutionsRoutes);
router.use('/v1',campaignRoutes);
router.use('/v1', bankRoutes);
router.use('/v1', companyMasterRoutes);
router.use('/v1', branchRoutes);
router.use('/v1', departmentRoutes);
router.use('/v1', designationRoutes);
router.use('/v1', empCategoryRoutes);
router.use('/v1', empTypeRoutes);
router.use('/v1', payComponentRoutes);
router.use('/v1', salaryStructureRoutes);
router.use('/v1', statutoryRateRoutes);
router.use('/v1', taxRegimeRoutes);
router.use('/v1', pfRoutes);
router.use('/v1', taxReliefRoutes);
router.use('/v1', shiftRoutes);
router.use('/v1', leaveTypeRoutes);
router.use('/v1', HolidaysRoutes);
router.use('/v1', workScheduleRoutes);
router.use('/v1', KPIRoutes);
router.use('/v1', GoalCategoryRoutes);
router.use('/v1', reviewTempRoutes);
router.use('/v1', ratingScaleRoutes);
router.use('/v1', jobCategoryRoutes);
router.use('/v1', grievanceTypeRoutes);
router.use('/v1', disciplinaryPenaltyRoutes);
router.use('/v1', eventTypeRoutes);
router.use('/v1', awardTypeRoutes);
router.use('/v1', latterTypeRoutes);
router.use('/v1', DocTypeRoutes);
router.use('/v1', surveyRoutes);
router.use('/v1', assetsTypeRoutes);
router.use('/v1', EmployeeRoutes);
router.use('/v1', JobPostingRoutes);
router.use('/v1', AppointmetnLatterRoute);
router.use('/v1', offerLatterRoute);
router.use('/v1', EmploymentContractRoute);
router.use('/v1', ResumeUploadRoute);

// Add future versions here
// Example: router.use('/v2', v2Routes);

module.exports = router;