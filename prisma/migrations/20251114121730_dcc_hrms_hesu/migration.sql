BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[hrms_d_role_permissions] (
    [id] INT NOT NULL IDENTITY(1,1),
    [role_id] INT NOT NULL,
    [permissions] NVARCHAR(max) NOT NULL,
    [is_active] CHAR(1) NOT NULL CONSTRAINT [hrms_d_role_permissions_is_active_df] DEFAULT 'Y',
    [log_inst] INT NOT NULL CONSTRAINT [hrms_d_role_permissions_log_inst_df] DEFAULT 1,
    [createdate] DATETIME NOT NULL CONSTRAINT [hrms_d_role_permissions_createdate_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedate] DATETIME,
    [createdby] INT NOT NULL CONSTRAINT [hrms_d_role_permissions_createdby_df] DEFAULT 1,
    [updatedby] INT,
    CONSTRAINT [hrms_d_role_permissions_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_user_role] (
    [id] INT NOT NULL IDENTITY(1,1),
    [user_id] INT NOT NULL,
    [role_id] INT NOT NULL,
    [is_active] CHAR(1) NOT NULL CONSTRAINT [DF__hrms_d_us__is_ac__2A4B4B5E] DEFAULT 'Y',
    [log_inst] INT NOT NULL CONSTRAINT [DF__hrms_d_us__log_i__2B3F6F97] DEFAULT 1,
    [createdate] DATETIME NOT NULL CONSTRAINT [DF__hrms_d_us__creat__2C3393D0] DEFAULT CURRENT_TIMESTAMP,
    [updatedate] DATETIME,
    [createdby] INT NOT NULL CONSTRAINT [DF__hrms_d_us__creat__2D27B809] DEFAULT 1,
    [updatedby] INT,
    CONSTRAINT [PK__hrms_d_u__3213E83F64B7E424] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_m_role] (
    [id] INT NOT NULL IDENTITY(1,1),
    [role_name] NVARCHAR(100) NOT NULL,
    [is_active] CHAR(1) NOT NULL CONSTRAINT [DF__hrms_m_ro__is_ac__44FF419A] DEFAULT 'Y',
    [log_inst] INT NOT NULL CONSTRAINT [DF__hrms_m_ro__log_i__45F365D3] DEFAULT 1,
    [createdate] DATETIME NOT NULL CONSTRAINT [DF__hrms_m_ro__creat__46E78A0C] DEFAULT CURRENT_TIMESTAMP,
    [updatedate] DATETIME,
    [createdby] INT NOT NULL CONSTRAINT [DF__hrms_m_ro__creat__47DBAE45] DEFAULT 1,
    [updatedby] INT,
    CONSTRAINT [PK__hrms_m_r__3213E83F568348B8] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_m_user] (
    [id] INT NOT NULL IDENTITY(1,1),
    [username] NVARCHAR(100) NOT NULL,
    [password] NVARCHAR(255),
    [email] NVARCHAR(255) NOT NULL,
    [full_name] NVARCHAR(255),
    [is_active] CHAR(1) NOT NULL CONSTRAINT [DF__hrms_m_us__is_ac__4AB81AF0] DEFAULT 'Y',
    [log_inst] INT NOT NULL CONSTRAINT [DF__hrms_m_us__log_i__4BAC3F29] DEFAULT 1,
    [createdate] DATETIME NOT NULL CONSTRAINT [DF__hrms_m_us__creat__4CA06362] DEFAULT CURRENT_TIMESTAMP,
    [updatedate] DATETIME,
    [createdby] INT NOT NULL CONSTRAINT [DF__hrms_m_us__creat__4D94879B] DEFAULT 1,
    [updatedby] INT,
    [address] NVARCHAR(255),
    [phone] NVARCHAR(15),
    [profile_img] NVARCHAR(255),
    [employee_id] INT,
    CONSTRAINT [PK__hrms_m_u__3213E83FD9B9A3C4] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_m_module] (
    [id] INT NOT NULL IDENTITY(1,1),
    [module_name] NVARCHAR(100) NOT NULL,
    [description] NVARCHAR(255),
    [is_active] CHAR(1) NOT NULL CONSTRAINT [DF__hrms_m_mo__is_ac__398D8EEE] DEFAULT 'Y',
    [log_inst] INT NOT NULL CONSTRAINT [DF__hrms_m_mo__log_i__3A81B327] DEFAULT 1,
    [createdate] DATETIME NOT NULL CONSTRAINT [DF__hrms_m_mo__creat__3B75D760] DEFAULT CURRENT_TIMESTAMP,
    [updatedate] DATETIME,
    [createdby] INT NOT NULL CONSTRAINT [DF__hrms_m_mo__creat__3C69FB99] DEFAULT 1,
    [updatedby] INT,
    CONSTRAINT [PK__hrms_m_m__3213E83FEFB217E0] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_appointment_letter] (
    [id] INT NOT NULL IDENTITY(1,1),
    [issue_date] DATE,
    [terms_summary] NVARCHAR(500),
    [createdate] DATETIME CONSTRAINT [DF__hrms_d_ap__creat__681373AD] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    [designation_id] INT,
    [joining_date] DATE,
    [department_id] INT,
    [location_id] INT,
    [employment_type] NVARCHAR(50),
    [reporting_manager_id] INT,
    [contract_duration_months] INT,
    [probation_period_months] INT,
    [salary_structure_id] INT,
    [offer_terms_summary] NVARCHAR(1000),
    [additional_clauses] NVARCHAR(1000),
    [attachment_path] NVARCHAR(250),
    [signed_by] NVARCHAR(100),
    [signed_date] DATE,
    [status] NVARCHAR(50) CONSTRAINT [DF__hrms_d_ap__statu__4EA8A765] DEFAULT 'Draft',
    [remarks] NVARCHAR(500),
    [candidate_id] INT,
    CONSTRAINT [PK__hrms_d_a__3213E83F95843842] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_appraisal] (
    [id] INT NOT NULL IDENTITY(1,1),
    [employee_id] INT,
    [review_period] VARCHAR(50),
    [rating] INT,
    [reviewer_comments] NVARCHAR(500),
    [createdate] DATETIME CONSTRAINT [DF__hrms_d_ap__creat__76619304] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    [appraisal_cycle_id] INT,
    [appraisal_template_id] INT,
    [reviewer_id] INT,
    [hr_reviewer_id] INT,
    [review_start_date] DATE,
    [review_end_date] DATE,
    [status] NVARCHAR(50) CONSTRAINT [DF__hrms_d_ap__statu__4DB4832C] DEFAULT 'P',
    [final_score] DECIMAL(5,2),
    [final_rating] NVARCHAR(100),
    [overall_remarks] NVARCHAR(500),
    [effective_date] DATE,
    [review_date] DATE,
    [next_review_date] DATE,
    CONSTRAINT [PK__hrms_d_a__3213E83F2F13CC8B] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_asset_assignment] (
    [id] INT NOT NULL IDENTITY(1,1),
    [employee_id] INT,
    [asset_type_id] INT,
    [asset_name] NVARCHAR(100),
    [serial_number] NVARCHAR(100),
    [issued_on] DATE,
    [returned_on] DATE,
    [status] VARCHAR(50),
    [createdate] DATETIME CONSTRAINT [DF__hrms_d_as__creat__15DA3E5D] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    CONSTRAINT [PK__hrms_d_a__3213E83F53CB6E63] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_competency] (
    [id] INT NOT NULL IDENTITY(1,1),
    [employee_id] INT,
    [skill_name] NVARCHAR(100),
    [proficiency_level] VARCHAR(50),
    [last_assessed_date] DATE,
    [createdate] DATETIME CONSTRAINT [DF__hrms_d_co__creat__4589517F] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    CONSTRAINT [PK__hrms_d_c__3213E83F2EF10B9D] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_disciplinary_action] (
    [id] INT NOT NULL IDENTITY(1,1),
    [employee_id] INT NOT NULL,
    [incident_date] DATE,
    [incident_description] NVARCHAR(1000),
    [action_taken] NVARCHAR(255),
    [committee_notes] NVARCHAR(1000),
    [penalty_type] INT,
    [effective_from] DATE,
    [status] VARCHAR(50),
    [createdate] DATETIME CONSTRAINT [DF__hrms_d_di__creat__0D44F85C] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    [reviewed_by] INT,
    [review_date] DATE,
    [remarks] NVARCHAR(1000),
    [is_active] CHAR(1) CONSTRAINT [hrms_d_disciplinary_action_is_active_df] DEFAULT 'Y',
    CONSTRAINT [PK__hrms_d_d__3213E83F3B5CF98E] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_document_upload] (
    [id] INT NOT NULL IDENTITY(1,1),
    [employee_id] INT,
    [document_type] NVARCHAR(100),
    [document_path] NVARCHAR(255),
    [uploaded_on] DATETIME,
    [createdate] DATETIME CONSTRAINT [DF__hrms_d_do__creat__6DCC4D03] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    [document_number] NVARCHAR(100),
    [issued_date] DATE,
    [expiry_date] DATE,
    [is_mandatory] CHAR(1) NOT NULL CONSTRAINT [DF__hrms_d_do__is_ma__056ECC6A] DEFAULT 'Y',
    [document_owner_type] VARCHAR(20) CONSTRAINT [DF__hrms_d_do__docum__0662F0A3] DEFAULT 'employee',
    [document_owner_id] INT,
    CONSTRAINT [PK__hrms_d_d__3213E83F12C70662] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_employee] (
    [id] INT NOT NULL IDENTITY(1,1),
    [employee_code] VARCHAR(20) NOT NULL,
    [first_name] NVARCHAR(100),
    [last_name] NVARCHAR(100),
    [gender] VARCHAR(10),
    [date_of_birth] DATE,
    [national_id_number] VARCHAR(50),
    [passport_number] VARCHAR(50),
    [employment_type] VARCHAR(50),
    [employee_category] VARCHAR(50),
    [designation_id] INT,
    [department_id] INT,
    [join_date] DATE,
    [confirm_date] DATE,
    [resign_date] DATE,
    [bank_id] INT,
    [account_number] VARCHAR(30),
    [work_location] NVARCHAR(100),
    [email] NVARCHAR(100),
    [phone_number] VARCHAR(20),
    [status] VARCHAR(20),
    [createdate] DATETIME CONSTRAINT [DF__hrms_d_em__creat__625A9A57] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    [full_name] NVARCHAR(100),
    [profile_pic] NVARCHAR(1000),
    [father_name] NVARCHAR(1000),
    [manager_id] INT,
    [marital_status] NVARCHAR(1000),
    [mother_name] NVARCHAR(1000),
    [no_of_child] INT,
    [spouse_name] NVARCHAR(1000),
    [currency_id] INT,
    [account_holder_name] VARCHAR(100),
    [address] NVARCHAR(1000),
    [ifsc] NVARCHAR(1000),
    [nationality] NVARCHAR(1000),
    [passport_expiry_date] DATETIME2,
    [passport_issue_date] DATETIME2,
    [primary_contact_name] NVARCHAR(1000),
    [primary_contact_number] NVARCHAR(1000),
    [primary_contact_relation] NVARCHAR(1000),
    [secondary_contact_mumber] NVARCHAR(1000),
    [secondary_contact_name] NVARCHAR(1000),
    [secondary_contact_relation] NVARCHAR(1000),
    [social_medias] NVARCHAR(1000),
    [middle_name] NVARCHAR(100),
    [identification_number] NVARCHAR(100),
    [work_permit_number] NVARCHAR(100),
    [work_permit_expiry] DATE,
    [blood_group] NVARCHAR(10),
    [official_email] NVARCHAR(150),
    [office_phone] NVARCHAR(20),
    [extension] NVARCHAR(10),
    [cost_center_id] INT,
    [employment_type_id] INT,
    [employee_category_id] INT,
    [shift_id] INT,
    [date_of_confirmation] DATE,
    [probation_end_date] DATE,
    [date_of_relieving] DATE,
    [home_address_id] INT,
    [work_address_id] INT,
    [payment_mode] NVARCHAR(50),
    [notes] NVARCHAR(500),
    [header_attendance_rule] VARCHAR(255),
    [nida_file] VARCHAR(255),
    [nssf_file] VARCHAR(255),
    [wcf] VARCHAR(255),
    [nhif] VARCHAR(255),
    CONSTRAINT [PK__hrms_d_e__3213E83F2F671AFD] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [UQ__hrms_d_e__B0AA73455BFB8896] UNIQUE NONCLUSTERED ([employee_code])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_employee_address] (
    [id] INT NOT NULL IDENTITY(1,1),
    [employee_id] INT NOT NULL,
    [address_type] VARCHAR(50),
    [street] NVARCHAR(255),
    [street_no] NVARCHAR(50),
    [building] NVARCHAR(100),
    [floor] NVARCHAR(50),
    [city] NVARCHAR(100),
    [district] NVARCHAR(100),
    [state] INT,
    [country] INT,
    [zip_code] NVARCHAR(20),
    CONSTRAINT [PK__hrms_d_e__3213E83F2523D35F] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_employee_suggestion] (
    [id] INT NOT NULL IDENTITY(1,1),
    [employee_id] INT,
    [suggestion_text] NVARCHAR(1000),
    [votes] INT,
    [submitted_on] DATETIME,
    [createdate] DATETIME CONSTRAINT [DF__hrms_d_em__creat__6225902D] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    CONSTRAINT [PK__hrms_d_e__3213E83F31DC0BE7] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_employment_contract] (
    [id] INT NOT NULL IDENTITY(1,1),
    [employee_id] INT,
    [contract_start_date] DATE,
    [contract_end_date] DATE,
    [contract_type] VARCHAR(50),
    [document_path] NVARCHAR(255),
    [signature] NVARCHAR(255),
    [createdate] DATETIME CONSTRAINT [DF__hrms_d_em__creat__6AEFE058] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [token] NVARCHAR(1000),
    [token_expiry] DATETIME2,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    [description] NVARCHAR(1000),
    [candidate_id] INT,
    [hrms_d_employeeId] INT,
    CONSTRAINT [PK__hrms_d_e__3213E83F506FAF63] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_exit_clearance] (
    [id] INT NOT NULL IDENTITY(1,1),
    [employee_id] INT,
    [start_date] DATETIME,
    [reason] NVARCHAR(255),
    [employee_name] NVARCHAR(100),
    [clearance_date] DATE,
    [cleared_by] INT,
    [remarks] NVARCHAR(255),
    [createdate] DATETIME CONSTRAINT [DF__hrms_d_ex__creat__310335E5] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    CONSTRAINT [PK__hrms_d_e__3213E83F6E5C594D] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_exit_interview] (
    [id] INT NOT NULL IDENTITY(1,1),
    [employee_id] INT,
    [interview_date] DATE,
    [reason_for_leaving] NVARCHAR(255),
    [feedback] NVARCHAR(1000),
    [suggestions] NVARCHAR(1000),
    [createdate] DATETIME CONSTRAINT [DF__hrms_d_ex__creat__2704CA5F] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    CONSTRAINT [PK__hrms_d_e__3213E83F32172285] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_grievance] (
    [id] INT NOT NULL IDENTITY(1,1),
    [employee_id] INT NOT NULL,
    [grievance_type] INT,
    [description] NVARCHAR(1000),
    [anonymous] BIT,
    [submitted_on] DATETIME,
    [status] VARCHAR(50),
    [assigned_to] INT,
    [resolution_notes] NVARCHAR(1000),
    [resolved_on] DATETIME,
    [createdate] DATETIME CONSTRAINT [DF__hrms_d_gr__creat__0A688BB1] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    [is_active] CHAR(1) CONSTRAINT [hrms_d_grievance_is_active_df] DEFAULT 'Y',
    CONSTRAINT [PK__hrms_d_g__3213E83FF9AE53A7] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_helpdesk_ticket] (
    [id] INT NOT NULL IDENTITY(1,1),
    [employee_id] INT,
    [ticket_subject] NVARCHAR(255),
    [ticket_type] NVARCHAR(100),
    [status] VARCHAR(50),
    [priority] VARCHAR(50),
    [assigned_to] INT,
    [description] NVARCHAR(1000),
    [submitted_on] DATETIME,
    [createdate] DATETIME CONSTRAINT [DF__hrms_d_he__creat__53D770D6] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    CONSTRAINT [PK__hrms_d_h__3213E83F10017242] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_hr_letter] (
    [id] INT NOT NULL IDENTITY(1,1),
    [employee_id] INT,
    [letter_type] INT,
    [request_date] DATE,
    [issue_date] DATE,
    [document_path] NVARCHAR(255),
    [createdate] DATETIME CONSTRAINT [DF__hrms_d_hr__creat__1E6F845E] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    [letter_subject] NVARCHAR(255),
    [letter_content] NVARCHAR(max),
    [status] NVARCHAR(50) CONSTRAINT [DF__hrms_d_hr__statu__51851410] DEFAULT 'Draft',
    [is_active] CHAR(1) CONSTRAINT [hrms_d_hr_letter_is_active_df] DEFAULT 'Y',
    CONSTRAINT [PK__hrms_d_h__3213E83FF90997EE] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_job_posting] (
    [id] INT NOT NULL IDENTITY(1,1),
    [department_id] INT,
    [hiring_stage_id] NVARCHAR(1000),
    [designation_id] INT,
    [reporting_manager_id] INT,
    [job_title] NVARCHAR(255),
    [description] NVARCHAR(1000),
    [document_type_id] NVARCHAR(1000),
    [required_experience] NVARCHAR(100),
    [due_date] DATE,
    [annual_salary_from] INT,
    [annual_salary_to] INT,
    [currency_id] INT,
    [posting_date] DATE,
    [closing_date] DATE,
    [is_internal] BIT,
    [createdate] DATETIME CONSTRAINT [DF__hrms_d_jo__creat__12FDD1B2] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    [job_code] VARCHAR(20) NOT NULL,
    [status] NVARCHAR(50),
    CONSTRAINT [PK__hrms_d_j__3213E83FF15AFFB9] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_leave_application] (
    [id] INT NOT NULL IDENTITY(1,1),
    [employee_id] INT,
    [leave_type_id] INT,
    [start_date] DATE,
    [end_date] DATE,
    [reason] NVARCHAR(255),
    [status] VARCHAR(20),
    [createdate] DATETIME CONSTRAINT [DF__hrms_d_le__creat__01D345B0] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    [partial_day] VARCHAR(10),
    [start_session] VARCHAR(20),
    [end_session] VARCHAR(20),
    [backup_person_id] INT,
    [contact_details_during_leave] NVARCHAR(255),
    [approver_id] INT,
    [approval_date] DATE,
    [document_attachment] NVARCHAR(255),
    [rejection_reason] NVARCHAR(255),
    CONSTRAINT [PK__hrms_d_l__3213E83FAE88D5EB] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_leave_balance] (
    [id] INT NOT NULL IDENTITY(1,1),
    [employee_id] INT NOT NULL,
    [employee_code] VARCHAR(20) NOT NULL,
    [first_name] NVARCHAR(100),
    [last_name] NVARCHAR(100),
    [start_date] DATE,
    [end_date] DATE,
    [status] VARCHAR(20),
    [createdate] DATETIME CONSTRAINT [DF__hrms_d_le__creat__5F9E293D] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    [is_active] CHAR(1) CONSTRAINT [hrms_d_leave_balance_is_active_df] DEFAULT 'Y',
    CONSTRAINT [hrms_d_leave_balance_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_leave_encashment] (
    [id] INT NOT NULL IDENTITY(1,1),
    [employee_id] INT,
    [leave_type_id] INT,
    [leave_days] DECIMAL(5,2),
    [encashment_amount] DECIMAL(10,2),
    [approval_status] VARCHAR(50),
    [encashment_date] DATE,
    [createdate] DATETIME CONSTRAINT [DF__hrms_d_le__creat__56B3DD81] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    [basic_salary] DECIMAL(19,3),
    [payroll_period] NVARCHAR(20),
    [total_amount] DECIMAL(19,4),
    [entitled] DECIMAL(19,4),
    [total_available] DECIMAL(19,4),
    [used] DECIMAL(19,4),
    [balance] DECIMAL(19,4),
    [requested] DECIMAL(19,4),
    [requested_date] DATE,
    CONSTRAINT [PK__hrms_d_l__3213E83FFF868C01] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_loan_request] (
    [id] INT NOT NULL IDENTITY(1,1),
    [employee_id] INT,
    [loan_type_id] INT,
    [amount] DECIMAL(10,2),
    [emi_months] INT,
    [status] VARCHAR(20),
    [createdate] DATETIME CONSTRAINT [DF__hrms_d_lo__creat__04AFB25B] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    [currency] INT,
    [start_date] NVARCHAR(1000),
    CONSTRAINT [PK__hrms_d_l__3213E83FF14CF674] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_medical_record] (
    [id] INT NOT NULL IDENTITY(1,1),
    [employee_id] INT,
    [record_type] NVARCHAR(100),
    [description] NVARCHAR(1000),
    [record_date] DATE,
    [document_path] NVARCHAR(255),
    [createdate] DATETIME CONSTRAINT [DF__hrms_d_me__creat__18B6AB08] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    [doctor_name] NVARCHAR(255),
    [hospital_name] NVARCHAR(255),
    [diagnosis] NVARCHAR(1000),
    [treatment] NVARCHAR(1000),
    [next_review_date] DATE,
    [prescription_path] NVARCHAR(255),
    CONSTRAINT [PK__hrms_d_m__3213E83FCD103BA4] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_notification_log] (
    [id] INT NOT NULL IDENTITY(1,1),
    [employee_id] INT,
    [message_title] NVARCHAR(255),
    [message_body] TEXT,
    [channel] VARCHAR(50),
    [sent_on] DATETIME,
    [status] VARCHAR(50),
    [createdate] DATETIME CONSTRAINT [DF__hrms_d_no__creat__5F492382] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    CONSTRAINT [PK__hrms_d_n__3213E83FE7247C57] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_offer_letter] (
    [id] INT NOT NULL IDENTITY(1,1),
    [offer_date] DATE,
    [currency_id] INT NOT NULL,
    [position] NVARCHAR(100),
    [offered_salary] DECIMAL(10,2),
    [valid_until] DATE,
    [status] VARCHAR(20),
    [createdate] DATETIME CONSTRAINT [DF__hrms_d_of__creat__65370702] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    [candidate_id] INT,
    [hrms_m_currency_masterId] INT,
    CONSTRAINT [PK__hrms_d_o__3213E83F3C2A08B8] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_org_chart] (
    [id] INT NOT NULL IDENTITY(1,1),
    [employee_id] INT,
    [manager_id] INT,
    [position_title] NVARCHAR(100),
    [level] INT,
    [createdate] DATETIME CONSTRAINT [DF__hrms_d_or__creat__50FB042B] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    CONSTRAINT [PK__hrms_d_o__3213E83F384BF6AB] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_payslip] (
    [id] INT NOT NULL IDENTITY(1,1),
    [employee_id] INT,
    [month] VARCHAR(7),
    [net_salary] DECIMAL(10,2),
    [pdf_path] NVARCHAR(255),
    [createdate] DATETIME CONSTRAINT [DF__hrms_d_pa__creat__793DFFAF] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    [year] NVARCHAR(1000),
    [gross_salary] DECIMAL(18,2),
    [total_earnings] DECIMAL(18,2),
    [total_deductions] DECIMAL(18,2),
    [pay_component_summary] NVARCHAR(max),
    [tax_deductions] DECIMAL(18,2),
    [loan_deductions] DECIMAL(18,2),
    [other_adjustments] DECIMAL(18,2),
    [status] NVARCHAR(50) CONSTRAINT [DF__hrms_d_pa__statu__4F9CCB9E] DEFAULT 'Generated',
    [remarks] NVARCHAR(500),
    CONSTRAINT [PK__hrms_d_p__3213E83F1EC9183D] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_probation_review] (
    [id] INT NOT NULL IDENTITY(1,1),
    [employee_id] INT,
    [probation_end_date] DATE,
    [review_notes] NVARCHAR(1000),
    [confirmation_status] VARCHAR(50),
    [confirmation_date] DATE,
    [createdate] DATETIME CONSTRAINT [DF__hrms_d_pr__creat__59904A2C] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    [extended_till_date] DATE,
    [extension_reason] NVARCHAR(1000),
    [extension_required] VARCHAR(5),
    [final_remarks] NVARCHAR(1000),
    [next_review_date] DATE,
    [performance_rating] INT,
    [review_meeting_date] DATE,
    [reviewer_id] INT,
    [hrms_d_employeeId] INT,
    CONSTRAINT [PK__hrms_d_p__3213E83FAF32F81C] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_recognition_award] (
    [id] INT NOT NULL IDENTITY(1,1),
    [employee_id] INT,
    [award_title] NVARCHAR(100),
    [description] NVARCHAR(500),
    [award_date] DATE,
    [nominated_by] INT,
    [createdate] DATETIME CONSTRAINT [DF__hrms_d_re__creat__24285DB4] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    CONSTRAINT [PK__hrms_d_r__3213E83FAC65FB35] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_relieving_letter] (
    [id] INT NOT NULL IDENTITY(1,1),
    [employee_id] INT,
    [relieving_date] DATE,
    [remarks] NVARCHAR(255),
    [createdate] DATETIME CONSTRAINT [DF__hrms_d_re__creat__7EF6D905] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    CONSTRAINT [PK__hrms_d_r__3213E83F4F0CC987] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_remote_work_log] (
    [id] INT NOT NULL IDENTITY(1,1),
    [employee_id] INT,
    [work_date] DATE,
    [hours_worked] DECIMAL(5,2),
    [task_summary] NVARCHAR(1000),
    [createdate] DATETIME CONSTRAINT [DF__hrms_d_re__creat__29E1370A] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    CONSTRAINT [PK__hrms_d_r__3213E83F8ACE00B5] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_resume] (
    [id] INT NOT NULL IDENTITY(1,1),
    [resume_path] NVARCHAR(255),
    [uploaded_on] DATETIME,
    [createdate] DATETIME CONSTRAINT [DF__hrms_d_re__creat__73852659] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    [candidate_id] INT,
    CONSTRAINT [PK__hrms_d_r__3213E83FBE64C057] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_succession_plan] (
    [id] INT NOT NULL IDENTITY(1,1),
    [critical_position] NVARCHAR(100),
    [current_holder_id] INT,
    [potential_successor_id] INT,
    [readiness_level] VARCHAR(50),
    [plan_date] DATE,
    [createdate] DATETIME CONSTRAINT [DF__hrms_d_su__creat__4E1E9780] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    [role_id] INT,
    [notes] NVARCHAR(500),
    [evaluation_date] DATE,
    [evaluated_by] INT,
    [status] NVARCHAR(50) NOT NULL CONSTRAINT [DF__hrms_d_su__statu__740F363E] DEFAULT 'Draft',
    [development_plan] NVARCHAR(1000),
    [successor_rank] INT,
    [expected_transition_date] DATE,
    [risk_of_loss] VARCHAR(50),
    [retention_plan] NVARCHAR(1000),
    [last_updated_by_hr] INT,
    [last_review_date] DATE,
    CONSTRAINT [PK__hrms_d_s__3213E83F2189BE23] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_survey_response] (
    [id] INT NOT NULL IDENTITY(1,1),
    [employee_id] INT,
    [survey_id] INT,
    [response_text] NVARCHAR(1000),
    [submitted_on] DATETIME,
    [createdate] DATETIME CONSTRAINT [DF__hrms_d_su__creat__214BF109] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    CONSTRAINT [PK__hrms_d_s__3213E83F38538453] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_time_sheet] (
    [id] INT NOT NULL IDENTITY(1,1),
    [employee_id] INT,
    [work_date] DATE,
    [project_name] NVARCHAR(100),
    [task_description] NVARCHAR(500),
    [hours_worked] DECIMAL(5,2),
    [createdate] DATETIME CONSTRAINT [DF__hrms_d_ti__creat__42ACE4D4] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    [approved_by] INT,
    [approved_on] DATETIME,
    [project_id] INT NOT NULL,
    [remarks] NVARCHAR(250),
    [status] NVARCHAR(20) NOT NULL CONSTRAINT [hrms_d_time_sheet_status_df] DEFAULT 'Draft',
    [task_id] INT,
    [billable_flag] CHAR(1),
    [work_location] NVARCHAR(100),
    [submission_date] DATETIME,
    [approval_status] NVARCHAR(50),
    [timesheet_type] NVARCHAR(50),
    CONSTRAINT [hrms_d_time_sheet_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_training_feedback] (
    [id] INT NOT NULL IDENTITY(1,1),
    [training_id] INT,
    [employee_id] INT,
    [feedback_text] NVARCHAR(1000),
    [rating] INT,
    [createdate] DATETIME CONSTRAINT [DF__hrms_d_tr__creat__4B422AD5] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    CONSTRAINT [PK__hrms_d_t__3213E83F64122CB7] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_training_session] (
    [id] INT NOT NULL IDENTITY(1,1),
    [training_title] NVARCHAR(255),
    [trainer_id] INT,
    [training_date] DATE,
    [location] NVARCHAR(100),
    [training_type] VARCHAR(50),
    [createdate] DATETIME CONSTRAINT [DF__hrms_d_tr__creat__4865BE2A] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    [training_objective] NVARCHAR(1000),
    [department_id] INT,
    [audience_level] VARCHAR(50),
    [participant_limit] INT,
    [duration_hours] DECIMAL(5,2),
    [training_material_path] NVARCHAR(255),
    [evaluation_required] BIT,
    [feedback_required] BIT,
    [training_status] VARCHAR(50),
    CONSTRAINT [PK__hrms_d_t__3213E83F1B83D284] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_travel_expense] (
    [id] INT NOT NULL IDENTITY(1,1),
    [employee_id] INT,
    [travel_purpose] NVARCHAR(255),
    [start_date] DATE,
    [end_date] DATE,
    [destination] NVARCHAR(255),
    [total_amount] DECIMAL(10,2),
    [approved_by] INT,
    [approval_status] VARCHAR(50),
    [createdate] DATETIME CONSTRAINT [DF__hrms_d_tr__creat__1B9317B3] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    [travel_mode] NVARCHAR(100),
    [advance_amount] DECIMAL(10,2),
    [expense_breakdown] NVARCHAR(2000),
    [attachment_path] NVARCHAR(1000),
    [currency] INT,
    [exchange_rate] DECIMAL(10,4),
    [final_approved_amount] DECIMAL(10,2),
    [remarks] NVARCHAR(1000),
    CONSTRAINT [PK__hrms_d_t__3213E83F0E6C7ED4] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_work_life_event] (
    [id] INT NOT NULL IDENTITY(1,1),
    [employee_id] INT NOT NULL,
    [event_type] INT,
    [event_date] DATE,
    [notes] NVARCHAR(1000),
    [requires_followup] BIT,
    [createdate] DATETIME CONSTRAINT [DF__hrms_d_wo__creat__10216507] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    [is_active] CHAR(1) CONSTRAINT [hrms_d_work_life_event_is_active_df] DEFAULT 'Y',
    CONSTRAINT [PK__hrms_d_w__3213E83F17E65FDB] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_life_event] (
    [id] INT NOT NULL IDENTITY(1,1),
    [employee_id] INT NOT NULL,
    [event_type_id] INT,
    [from_date] DATE,
    [to_date] DATE,
    [createdate] DATETIME CONSTRAINT [hrms_d_life_event_createdate_df] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    [is_active] CHAR(1) CONSTRAINT [hrms_d_life_event_is_active_df] DEFAULT 'Y',
    CONSTRAINT [hrms_d_life_event_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_work_permit] (
    [id] INT NOT NULL IDENTITY(1,1),
    [employee_id] INT,
    [permit_number] VARCHAR(100),
    [valid_from] DATE,
    [valid_to] DATE,
    [country] NVARCHAR(100),
    [createdate] DATETIME CONSTRAINT [hrms_d_work_permit_createdate_df] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    CONSTRAINT [PK__hrms_d_w__3213E83FCB012DCD] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_wps_file_log] (
    [id] INT NOT NULL IDENTITY(1,1),
    [payroll_month] VARCHAR(7),
    [file_path] NVARCHAR(255),
    [generated_on] DATETIME,
    [submitted_to_bank] BIT,
    [createdate] DATETIME CONSTRAINT [DF__hrms_d_wp__creat__5C6CB6D7] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    CONSTRAINT [PK__hrms_d_w__3213E83F3EEA5D25] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_m_advance_type] (
    [id] INT NOT NULL IDENTITY(1,1),
    [advance_name] NVARCHAR(100),
    [createdate] DATETIME CONSTRAINT [DF__hrms_m_ad__creat__4A8310C6] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    CONSTRAINT [PK__hrms_m_a__3213E83F585A278C] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_m_asset_type] (
    [id] INT NOT NULL IDENTITY(1,1),
    [asset_type_name] NVARCHAR(100),
    [depreciation_rate] DECIMAL(5,2),
    [createdate] DATETIME CONSTRAINT [DF__hrms_m_as__creat__41EDCAC5] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    [is_active] CHAR(1) CONSTRAINT [hrms_m_asset_type_is_active_df] DEFAULT 'Y',
    CONSTRAINT [PK__hrms_m_a__3213E83FAD5C7A8E] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_m_award_type] (
    [id] INT NOT NULL IDENTITY(1,1),
    [award_name] NVARCHAR(100),
    [description] NVARCHAR(255),
    [createdate] DATETIME CONSTRAINT [DF__hrms_m_aw__creat__382F5661] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    [is_active] CHAR(1) CONSTRAINT [hrms_m_award_type_is_active_df] DEFAULT 'Y',
    CONSTRAINT [PK__hrms_m_a__3213E83FE5DF34C8] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_m_bank_master] (
    [id] INT NOT NULL IDENTITY(1,1),
    [bank_name] NVARCHAR(255),
    [createdate] DATETIME CONSTRAINT [DF__hrms_m_ba__creat__395884C4] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    [is_active] CHAR(1) CONSTRAINT [hrms_m_bank_master_is_active_df] DEFAULT 'Y',
    CONSTRAINT [PK__hrms_m_b__3213E83F1B2BC21F] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_m_branch_master] (
    [id] INT NOT NULL IDENTITY(1,1),
    [company_id] INT NOT NULL,
    [branch_name] NVARCHAR(255),
    [location] NVARCHAR(255),
    [createdate] DATETIME CONSTRAINT [DF__hrms_m_br__creat__17036CC0] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME2,
    [updatedby] INT,
    [log_inst] INT,
    [is_active] CHAR(1) CONSTRAINT [hrms_m_branch_master_is_active_df] DEFAULT 'Y',
    CONSTRAINT [PK__hrms_m_b__3213E83FF8103A9B] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_m_company_master] (
    [id] INT NOT NULL IDENTITY(1,1),
    [company_name] NVARCHAR(200),
    [company_code] NVARCHAR(50),
    [address] NVARCHAR(255),
    [contact_person] NVARCHAR(100),
    [contact_email] NVARCHAR(100),
    [contact_phone] NVARCHAR(50),
    [country_id] INT NOT NULL,
    [currency_code] VARCHAR(5),
    [financial_year_start] DATE,
    [timezone] VARCHAR(100),
    [createdate] DATETIME CONSTRAINT [DF__hrms_m_co__creat__6501FCD8] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    [is_active] CHAR(1) CONSTRAINT [hrms_m_company_master_is_active_df] DEFAULT 'Y',
    CONSTRAINT [PK__hrms_m_c__3213E83F22908E36] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_m_currency_master] (
    [id] INT NOT NULL IDENTITY(1,1),
    [currency_code] VARCHAR(5),
    [currency_name] NVARCHAR(100),
    [createdate] DATETIME CONSTRAINT [DF__hrms_m_cu__creat__339FAB6E] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    [is_active] CHAR(1) CONSTRAINT [hrms_m_currency_master_is_active_df] DEFAULT 'Y',
    CONSTRAINT [PK__hrms_m_c__3213E83F74D02FD5] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_m_department_master] (
    [id] INT NOT NULL IDENTITY(1,1),
    [department_name] NVARCHAR(255),
    [createdate] DATETIME CONSTRAINT [DF__hrms_m_de__creat__19DFD96B] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    [is_active] CHAR(1) CONSTRAINT [hrms_m_department_master_is_active_df] DEFAULT 'Y',
    CONSTRAINT [PK__hrms_m_d__3213E83F972A91BD] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_m_designation_master] (
    [id] INT NOT NULL IDENTITY(1,1),
    [designation_name] NVARCHAR(255),
    [createdate] DATETIME CONSTRAINT [DF__hrms_m_de__creat__1CBC4616] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    [is_active] CHAR(1) CONSTRAINT [hrms_m_designation_master_is_active_df] DEFAULT 'Y',
    CONSTRAINT [PK__hrms_m_d__3213E83FB3D16212] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_m_disciplinary_penalty] (
    [id] INT NOT NULL IDENTITY(1,1),
    [penalty_type] NVARCHAR(100),
    [description] NVARCHAR(255),
    [createdate] DATETIME CONSTRAINT [DF__hrms_m_di__creat__2F9A1060] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    [action_taken] NVARCHAR(255),
    [is_active] CHAR(1) CONSTRAINT [hrms_m_disciplinary_penalty_is_active_df] DEFAULT 'Y',
    CONSTRAINT [PK__hrms_m_d__3213E83F893BEA80] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_m_document_type] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(100),
    [code] VARCHAR(20),
    [doc_type] NVARCHAR(100),
    [alert_before_expiry] INT,
    [createdate] DATETIME CONSTRAINT [DF__hrms_m_do__creat__3C34F16F] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    [is_active] CHAR(1) CONSTRAINT [hrms_m_document_type_is_active_df] DEFAULT 'Y',
    CONSTRAINT [PK__hrms_m_d__3213E83F6F7CBFB3] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_m_employee_category] (
    [id] INT NOT NULL IDENTITY(1,1),
    [category_name] NVARCHAR(100),
    [createdate] DATETIME CONSTRAINT [DF__hrms_m_em__creat__1F98B2C1] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    [is_active] CHAR(1) CONSTRAINT [hrms_m_employee_category_is_active_df] DEFAULT 'Y',
    CONSTRAINT [PK__hrms_m_e__3213E83F2A0FBA56] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_m_employment_type] (
    [id] INT NOT NULL IDENTITY(1,1),
    [type_name] NVARCHAR(100),
    [createdate] DATETIME CONSTRAINT [DF__hrms_m_em__creat__22751F6C] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    [is_active] CHAR(1) CONSTRAINT [hrms_m_employment_type_is_active_df] DEFAULT 'Y',
    CONSTRAINT [PK__hrms_m_e__3213E83F11B66B00] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_m_goal_category] (
    [id] INT NOT NULL IDENTITY(1,1),
    [category_name] NVARCHAR(100),
    [createdate] DATETIME CONSTRAINT [DF__hrms_m_go__creat__55F4C372] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    [is_active] CHAR(1) CONSTRAINT [hrms_m_goal_category_is_active_df] DEFAULT 'Y',
    CONSTRAINT [PK__hrms_m_g__3213E83FFCE2E4CE] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_m_grievance_type] (
    [id] INT NOT NULL IDENTITY(1,1),
    [grievance_type_name] NVARCHAR(100),
    [createdate] DATETIME CONSTRAINT [DF__hrms_m_gr__creat__2CBDA3B5] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    [is_active] CHAR(1) CONSTRAINT [hrms_m_grievance_type_is_active_df] DEFAULT 'Y',
    CONSTRAINT [PK__hrms_m_g__3213E83FADA6089E] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_m_holiday_calendar] (
    [id] INT NOT NULL IDENTITY(1,1),
    [holiday_name] NVARCHAR(100),
    [holiday_date] DATE,
    [location] NVARCHAR(100),
    [createdate] DATETIME CONSTRAINT [DF__hrms_m_ho__creat__2B0A656D] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    [is_active] CHAR(1) CONSTRAINT [hrms_m_holiday_calendar_is_active_df] DEFAULT 'Y',
    CONSTRAINT [PK__hrms_m_h__3213E83F4175E2D3] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_m_job_category] (
    [id] INT NOT NULL IDENTITY(1,1),
    [job_category_name] NVARCHAR(100),
    [createdate] DATETIME CONSTRAINT [DF__hrms_m_jo__creat__3552E9B6] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    [is_active] CHAR(1) CONSTRAINT [hrms_m_job_category_is_active_df] DEFAULT 'Y',
    CONSTRAINT [PK__hrms_m_j__3213E83F1434C918] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_m_kpi_master] (
    [id] INT NOT NULL IDENTITY(1,1),
    [kpi_name] NVARCHAR(255),
    [description] NVARCHAR(255),
    [createdate] DATETIME CONSTRAINT [DF__hrms_m_kp__creat__58D1301D] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    [is_active] CHAR(1) CONSTRAINT [hrms_m_kpi_master_is_active_df] DEFAULT 'Y',
    CONSTRAINT [PK__hrms_m_k__3213E83F8790DFA5] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_m_leave_type_master] (
    [id] INT NOT NULL IDENTITY(1,1),
    [leave_type] NVARCHAR(100),
    [carry_forward] BIT,
    [sub_period] VARCHAR(100),
    [leaves_sub_period] DECIMAL(18,2),
    [createdate] DATETIME CONSTRAINT [DF__hrms_m_le__creat__282DF8C2] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    [leave_qty] INT,
    [leave_unit] CHAR(1) NOT NULL CONSTRAINT [DF__hrms_m_le__leave__0ABD916C] DEFAULT 'D',
    [prorate_allowed] CHAR(1) NOT NULL CONSTRAINT [DF__hrms_m_le__prora__0BB1B5A5] DEFAULT 'Y',
    [for_gender] CHAR(1) NOT NULL CONSTRAINT [DF__hrms_m_le__for_g__0CA5D9DE] DEFAULT 'B',
    [is_active] CHAR(1) CONSTRAINT [hrms_m_leave_type_master_is_active_df] DEFAULT 'Y',
    CONSTRAINT [PK__hrms_m_l__3213E83F7F49932B] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_m_letter_type] (
    [id] INT NOT NULL IDENTITY(1,1),
    [letter_name] NVARCHAR(100),
    [template_path] NVARCHAR(255),
    [createdate] DATETIME CONSTRAINT [DF__hrms_m_le__creat__3DE82FB7] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    [is_active] CHAR(1) CONSTRAINT [hrms_m_letter_type_is_active_df] DEFAULT 'Y',
    CONSTRAINT [PK__hrms_m_l__3213E83F746BC6B8] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_m_loan_type] (
    [id] INT NOT NULL IDENTITY(1,1),
    [loan_name] NVARCHAR(100),
    [interest_rate] DECIMAL(5,2),
    [createdate] DATETIME CONSTRAINT [DF__hrms_m_lo__creat__4D5F7D71] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    [is_active] CHAR(1) CONSTRAINT [hrms_m_loan_type_is_active_df] DEFAULT 'Y',
    CONSTRAINT [PK__hrms_m_l__3213E83F83117D15] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_m_pay_component] (
    [id] INT NOT NULL IDENTITY(1,1),
    [component_name] NVARCHAR(100),
    [component_code] VARCHAR(50),
    [component_type] VARCHAR(20),
    [is_taxable] CHAR(1) NOT NULL CONSTRAINT [DF_hrms_m_pay_component_is_taxable] DEFAULT 'Y',
    [is_statutory] CHAR(1) NOT NULL CONSTRAINT [DF_hrms_m_pay_component_is_statutory] DEFAULT 'N',
    [is_active] CHAR(1) NOT NULL CONSTRAINT [DF_hrms_m_pay_component_is_active] DEFAULT 'Y',
    [createdate] DATETIME CONSTRAINT [DF__hrms_m_pa__creat__44CA3770] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    [pay_or_deduct] CHAR(1) NOT NULL CONSTRAINT [DF__hrms_m_pa__pay_o__0F824689] DEFAULT 'P',
    [is_worklife_related] CHAR(1) NOT NULL CONSTRAINT [DF__hrms_m_pa__is_wo__10766AC2] DEFAULT 'N',
    [is_grossable] CHAR(1) NOT NULL CONSTRAINT [DF__hrms_m_pa__is_gr__116A8EFB] DEFAULT 'N',
    [is_advance] CHAR(1) NOT NULL CONSTRAINT [DF__hrms_m_pa__is_ad__125EB334] DEFAULT 'N',
    [tax_code_id] INT,
    [gl_account_id] INT,
    [factor] SMALLINT,
    [status] VARCHAR(50),
    [payable_glaccount_id] INT,
    [project_id] INT,
    [cost_center1_id] INT,
    [cost_center2_id] INT,
    [cost_center3_id] INT,
    [cost_center4_id] INT,
    [cost_center5_id] INT,
    [column_order] SMALLINT,
    [auto_fill] CHAR(1) NOT NULL CONSTRAINT [DF__hrms_m_pa__auto___1352D76D] DEFAULT 'N',
    [unpaid_leave] CHAR(1) NOT NULL CONSTRAINT [DF__hrms_m_pa__unpai__1446FBA6] DEFAULT 'N',
    [component_subtype] NVARCHAR(50),
    [contributes_to_nssf] CHAR(1) NOT NULL CONSTRAINT [DF__hrms_m_pa__contr__2AF556D4] DEFAULT 'N',
    [contributes_to_paye] CHAR(1) NOT NULL CONSTRAINT [DF__hrms_m_pa__contr__2BE97B0D] DEFAULT 'N',
    [is_overtime_related] CHAR(1) NOT NULL CONSTRAINT [DF__hrms_m_pa__is_ov__2CDD9F46] DEFAULT 'N',
    [is_recurring] CHAR(1) NOT NULL CONSTRAINT [DF__hrms_m_pa__is_re__2DD1C37F] DEFAULT 'Y',
    [default_formula] NVARCHAR(max),
    [formula_editable] CHAR(1) NOT NULL CONSTRAINT [DF__hrms_m_pa__formu__2EC5E7B8] DEFAULT 'Y',
    [visible_in_payslip] CHAR(1) NOT NULL CONSTRAINT [DF__hrms_m_pa__visib__2FBA0BF1] DEFAULT 'Y',
    [execution_order] INT,
    [is_loan] NVARCHAR(1) CONSTRAINT [DF__hrms_m_pa__is_lo__6C5905DD] DEFAULT 'N',
    [contribution_of_employee] CHAR(1) NOT NULL CONSTRAINT [hrms_m_pay_component_contribution_of_employee_df] DEFAULT 'N',
    [employer_default_formula] VARCHAR(50),
    [is_basic] VARCHAR(50),
    [relief_amount] VARCHAR(50),
    [relief_type] VARCHAR(50),
    CONSTRAINT [PK__hrms_m_p__3213E83F1403D2CD] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_m_provident_fund] (
    [id] INT NOT NULL IDENTITY(1,1),
    [pf_name] NVARCHAR(100),
    [employer_contribution] DECIMAL(5,2),
    [employee_contribution] DECIMAL(5,2),
    [createdate] DATETIME CONSTRAINT [DF__hrms_m_pr__creat__503BEA1C] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    [is_active] CHAR(1) CONSTRAINT [hrms_m_provident_fund_is_active_df] DEFAULT 'Y',
    CONSTRAINT [PK__hrms_m_p__3213E83F36ADE0EE] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_m_rating_scale] (
    [id] INT NOT NULL IDENTITY(1,1),
    [rating_value] INT,
    [rating_description] NVARCHAR(255),
    [createdate] DATETIME CONSTRAINT [DF__hrms_m_ra__creat__5E8A0973] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    [is_active] CHAR(1) CONSTRAINT [hrms_m_rating_scale_is_active_df] DEFAULT 'Y',
    CONSTRAINT [PK__hrms_m_r__3213E83F3F1F2020] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_m_review_template] (
    [id] INT NOT NULL IDENTITY(1,1),
    [template_name] NVARCHAR(100),
    [valid_from] DATE,
    [createdate] DATETIME CONSTRAINT [DF__hrms_m_re__creat__5BAD9CC8] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    [is_active] CHAR(1) CONSTRAINT [hrms_m_review_template_is_active_df] DEFAULT 'Y',
    CONSTRAINT [PK__hrms_m_r__3213E83F12B783C2] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_m_salary_structure] (
    [id] INT NOT NULL IDENTITY(1,1),
    [structure_name] NVARCHAR(100),
    [createdate] DATETIME CONSTRAINT [DF__hrms_m_sa__creat__30C33EC3] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    [is_active] CHAR(1) CONSTRAINT [hrms_m_salary_structure_is_active_df] DEFAULT 'Y',
    CONSTRAINT [PK__hrms_m_s__3213E83F5C9225CE] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_m_shift_master] (
    [id] INT NOT NULL IDENTITY(1,1),
    [shift_name] NVARCHAR(100),
    [start_time] VARCHAR(50),
    [end_time] VARCHAR(50),
    [createdate] DATETIME CONSTRAINT [DF__hrms_m_sh__creat__25518C17] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    [lunch_time] SMALLINT,
    [daily_working_hours] DECIMAL(19,2),
    [department_id] INT,
    [number_of_working_days] DECIMAL(19,2),
    [half_day_working] CHAR(1) CONSTRAINT [DF__hrms_m_sh__half___0E8E2250] DEFAULT 'N',
    [half_day_on] SMALLINT,
    [remarks] NVARCHAR(300),
    [is_active] CHAR(1) CONSTRAINT [hrms_m_shift_master_is_active_df] DEFAULT 'Y',
    [weekoff_days] VARCHAR(50),
    CONSTRAINT [PK__hrms_m_s__3213E83F3E04C8DC] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_m_statutory_rate] (
    [id] INT NOT NULL IDENTITY(1,1),
    [country_code] VARCHAR(5),
    [statutory_type] VARCHAR(50),
    [lower_limit] DECIMAL(10,2),
    [upper_limit] DECIMAL(10,2),
    [rate_percent] DECIMAL(5,2),
    [effective_from] DATE,
    [is_active] CHAR(1) CONSTRAINT [hrms_m_statutory_rate_is_active_df] DEFAULT 'Y',
    [createdate] DATETIME CONSTRAINT [DF__hrms_m_st__creat__367C1819] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    CONSTRAINT [PK__hrms_m_s__3213E83F156CA6EE] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_m_survey_master] (
    [id] INT NOT NULL IDENTITY(1,1),
    [survey_title] NVARCHAR(255),
    [description] NVARCHAR(500),
    [launch_date] DATE,
    [close_date] DATE,
    [createdate] DATETIME CONSTRAINT [DF__hrms_m_su__creat__3B0BC30C] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    [is_active] CHAR(1) CONSTRAINT [hrms_m_survey_master_is_active_df] DEFAULT 'Y',
    CONSTRAINT [PK__hrms_m_s__3213E83FA2306E59] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_m_tax_regime] (
    [id] INT NOT NULL IDENTITY(1,1),
    [regime_name] NVARCHAR(100),
    [country_code] INT,
    [createdate] DATETIME CONSTRAINT [DF__hrms_m_ta__creat__47A6A41B] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    [is_active] CHAR(1) CONSTRAINT [hrms_m_tax_regime_is_active_df] DEFAULT 'Y',
    CONSTRAINT [PK__hrms_m_t__3213E83F93DEC7A5] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_m_tax_relief] (
    [id] INT NOT NULL IDENTITY(1,1),
    [relief_name] NVARCHAR(100),
    [amount] DECIMAL(10,2),
    [createdate] DATETIME CONSTRAINT [DF__hrms_m_ta__creat__531856C7] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    [is_active] CHAR(1) CONSTRAINT [hrms_m_tax_relief_is_active_df] DEFAULT 'Y',
    CONSTRAINT [PK__hrms_m_t__3213E83F90669121] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_m_work_life_event_type] (
    [id] INT NOT NULL IDENTITY(1,1),
    [event_type_name] NVARCHAR(100),
    [createdate] DATETIME CONSTRAINT [DF__hrms_m_wo__creat__32767D0B] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    [is_active] CHAR(1) CONSTRAINT [hrms_m_work_life_event_type_is_active_df] DEFAULT 'Y',
    CONSTRAINT [PK__hrms_m_w__3213E83FCFB88DCB] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_m_work_schedule_template] (
    [id] INT NOT NULL IDENTITY(1,1),
    [template_name] NVARCHAR(100),
    [description] NVARCHAR(255),
    [createdate] DATETIME CONSTRAINT [DF__hrms_m_wo__creat__3F115E1A] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    [is_active] CHAR(1) CONSTRAINT [hrms_m_work_schedule_template_is_active_df] DEFAULT 'Y',
    CONSTRAINT [PK__hrms_m_w__3213E83F9426192B] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_m_country_master] (
    [id] INT NOT NULL IDENTITY(1,1),
    [is_active] CHAR(1) CONSTRAINT [DF__hrms_m_co__is_ac__67DE6983] DEFAULT 'Y',
    [createdate] DATETIME CONSTRAINT [DF__hrms_m_co__creat__68D28DBC] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    [code] VARCHAR(5),
    [name] NVARCHAR(100),
    CONSTRAINT [PK__hrms_m_c__3213E83F1EDF4224] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_m_country_tax_rule_template] (
    [id] INT NOT NULL IDENTITY(1,1),
    [country_id] INT NOT NULL,
    [pay_component_id] INT NOT NULL,
    [rule_type] VARCHAR(20) NOT NULL,
    [slab_min] DECIMAL(12,2),
    [slab_max] DECIMAL(12,2),
    [rate] DECIMAL(5,2),
    [flat_amount] DECIMAL(12,2),
    [formula_text] NVARCHAR(500),
    [is_default] CHAR(1) NOT NULL CONSTRAINT [DF__hrms_m_co__is_de__79FD19BE] DEFAULT 'Y',
    [is_active] CHAR(1) NOT NULL CONSTRAINT [DF__hrms_m_co__is_ac__7AF13DF7] DEFAULT 'Y',
    [effective_from] DATE,
    [effective_to] DATE,
    [createdate] DATETIME CONSTRAINT [DF__hrms_m_co__creat__7BE56230] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    CONSTRAINT [PK__hrms_m_c__3213E83FE24FF953] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_m_tax_slab_rule] (
    [id] INT NOT NULL IDENTITY(1,1),
    [code] NVARCHAR(50) NOT NULL,
    [name] NVARCHAR(50) NOT NULL,
    [pay_component_id] INT NOT NULL,
    [formula_text] NVARCHAR(500),
    [is_active] CHAR(1) NOT NULL CONSTRAINT [DF__hrms_m_ta__is_ac__78BEDCC2] DEFAULT 'Y',
    [createdate] DATETIME CONSTRAINT [DF__hrms_m_ta__creat__79B300FB] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    CONSTRAINT [PK__hrms_m_t__3213E83FFB20C3D1] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[m_mobile_notification_template] (
    [id] INT NOT NULL IDENTITY(1,1),
    [event_code] NVARCHAR(50) NOT NULL,
    [title_template] NVARCHAR(200) NOT NULL,
    [message_template] NVARCHAR(1000) NOT NULL,
    [is_active] CHAR(1) NOT NULL CONSTRAINT [DF__m_mobile___is_ac__038683F8] DEFAULT 'Y',
    [createdate] DATETIME CONSTRAINT [DF__m_mobile___creat__047AA831] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    CONSTRAINT [PK__m_mobile__3213E83F1A0CA05A] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[crms_m_states] (
    [id] INT NOT NULL IDENTITY(1,1),
    [country_code] INT NOT NULL,
    [name] NVARCHAR(100) NOT NULL,
    [is_active] CHAR(1) NOT NULL CONSTRAINT [DF__crms_m_st__is_ac__361203C5] DEFAULT 'Y',
    [createdate] DATETIME NOT NULL CONSTRAINT [crms_m_states_createdate_df] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [log_inst] INT,
    [updatedate] DATETIME,
    [updatedby] INT,
    CONSTRAINT [PK_crms__states] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[crms_m_countries] (
    [id] INT NOT NULL IDENTITY(1,1),
    [code] CHAR(4) NOT NULL,
    [name] NVARCHAR(50) NOT NULL,
    [is_active] CHAR(1) NOT NULL CONSTRAINT [crms_m_countries_is_active_df] DEFAULT 'Y',
    [createdate] DATETIME NOT NULL CONSTRAINT [crms_m_countries_createdate_df] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [log_inst] INT,
    [updatedate] DATETIME,
    [updatedby] INT,
    CONSTRAINT [crms_m_countries_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_employee_d_experiences] (
    [id] INT NOT NULL IDENTITY(1,1),
    [employee_id] INT NOT NULL,
    [company_name] NVARCHAR(1000),
    [position] NVARCHAR(1000),
    [start_from] DATETIME2,
    [end_to] DATETIME2,
    [createdate] DATETIME NOT NULL CONSTRAINT [hrms_employee_d_experiences_createdate_df] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [log_inst] INT,
    [updatedate] DATETIME,
    [updatedby] INT,
    CONSTRAINT [hrms_employee_d_experiences_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_employee_d_educations] (
    [id] INT NOT NULL IDENTITY(1,1),
    [employee_id] INT NOT NULL,
    [institute_name] NVARCHAR(1000),
    [degree] NVARCHAR(1000),
    [specialization] NVARCHAR(1000),
    [createdate] DATETIME NOT NULL CONSTRAINT [hrms_employee_d_educations_createdate_df] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [log_inst] INT,
    [updatedate] DATETIME,
    [updatedby] INT,
    [end_to] DATETIME2,
    [start_from] DATETIME2,
    CONSTRAINT [hrms_employee_d_educations_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_api_integration_settings] (
    [id] INT NOT NULL IDENTITY(1,1),
    [integration_name] NVARCHAR(100) NOT NULL,
    [api_endpoint] NVARCHAR(250) NOT NULL,
    [api_key] NVARCHAR(250),
    [secret_token] NVARCHAR(250),
    [is_active] CHAR(1) NOT NULL CONSTRAINT [DF__hrms_d_ap__is_ac__76EBA2E9] DEFAULT 'Y',
    [remarks] NVARCHAR(250),
    [createdate] DATETIME NOT NULL CONSTRAINT [DF__hrms_d_ap__creat__77DFC722] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    CONSTRAINT [PK__hrms_d_a__3213E83FBB86CFD0] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_company_policy_upload] (
    [id] INT NOT NULL IDENTITY(1,1),
    [policy_title] NVARCHAR(200) NOT NULL,
    [policy_category] NVARCHAR(100),
    [effective_date] DATE,
    [expiry_date] DATE,
    [file_path] NVARCHAR(250) NOT NULL,
    [description] NVARCHAR(500),
    [uploaded_by] INT NOT NULL,
    [createdate] DATETIME NOT NULL CONSTRAINT [DF__hrms_d_co__creat__7ABC33CD] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    CONSTRAINT [PK__hrms_d_c__3213E83F6572A914] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_kpi_progress_entry] (
    [id] INT NOT NULL IDENTITY(1,1),
    [employee_id] INT NOT NULL,
    [goal_id] INT NOT NULL,
    [entry_date] DATE NOT NULL,
    [progress_value] NVARCHAR(100) NOT NULL,
    [remarks] NVARCHAR(250),
    [reviewed_by] INT,
    [reviewed_on] DATETIME,
    [createdate] DATETIME NOT NULL CONSTRAINT [DF__hrms_d_kp__creat__7D98A078] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    CONSTRAINT [PK__hrms_d_k__3213E83F196354CE] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_daily_attendance_entry] (
    [id] INT NOT NULL IDENTITY(1,1),
    [employee_id] INT NOT NULL,
    [attendance_date] DATE NOT NULL,
    [check_in_time] DATETIME,
    [check_out_time] DATETIME,
    [status] NVARCHAR(20) NOT NULL,
    [remarks] NVARCHAR(250),
    [createdate] DATETIME NOT NULL CONSTRAINT [hrms_d_daily_attendance_entry_createdate_df] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    [working_hours] DECIMAL(18,0),
    [manager_verified] VARCHAR(100),
    [manager_verification_date] DATETIME2,
    [manager_remarks] TEXT,
    [verified_by_manager_id] INT,
    CONSTRAINT [hrms_d_daily_attendance_entry_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_monthly_payroll_processing] (
    [id] INT NOT NULL IDENTITY(1,1),
    [employee_id] INT NOT NULL,
    [payroll_month] SMALLINT NOT NULL,
    [payroll_year] SMALLINT NOT NULL,
    [payroll_week] SMALLINT NOT NULL,
    [payroll_start_date] DATE,
    [payroll_end_date] DATE,
    [payroll_paid_days] INT,
    [pay_currency] INT,
    [total_earnings] DECIMAL(18,4) NOT NULL,
    [taxable_earnings] DECIMAL(18,4) NOT NULL,
    [tax_amount] DECIMAL(18,4) NOT NULL,
    [total_deductions] DECIMAL(18,4) NOT NULL,
    [net_pay] DECIMAL(18,2) NOT NULL,
    [status] NVARCHAR(20) NOT NULL,
    [execution_date] DATE,
    [pay_date] DATETIME,
    [doc_date] DATE,
    [processed] CHAR(1) NOT NULL CONSTRAINT [DF__hrms_d_mo__proce__09946309] DEFAULT 'N',
    [je_transid] INT,
    [project_id] INT,
    [cost_center1_id] INT,
    [cost_center2_id] INT,
    [cost_center3_id] INT,
    [cost_center4_id] INT,
    [cost_center5_id] INT,
    [approved1] CHAR(1) NOT NULL CONSTRAINT [DF__hrms_d_mo__appro__0A888742] DEFAULT 'N',
    [approver1_id] INT,
    [employee_email] NVARCHAR(100),
    [remarks] NVARCHAR(250),
    [createdate] DATETIME NOT NULL,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    CONSTRAINT [hrms_d_monthly_payroll_processing_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_arrear_adjustments] (
    [id] INT NOT NULL IDENTITY(1,1),
    [employee_id] INT NOT NULL,
    [payroll_month] VARCHAR(7) NOT NULL,
    [arrear_reason] NVARCHAR(250) NOT NULL,
    [arrear_amount] DECIMAL(18,2) NOT NULL,
    [adjustment_type] NVARCHAR(20) NOT NULL,
    [remarks] NVARCHAR(250),
    [createdate] DATETIME NOT NULL CONSTRAINT [hrms_d_arrear_adjustments_createdate_df] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    CONSTRAINT [hrms_d_arrear_adjustments_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_advance_payment_entry] (
    [id] INT NOT NULL IDENTITY(1,1),
    [employee_id] INT NOT NULL,
    [request_date] DATE NOT NULL,
    [amount_requested] DECIMAL(18,2) NOT NULL,
    [amount_approved] DECIMAL(18,2),
    [approval_status] NVARCHAR(20) NOT NULL,
    [approval_date] DATE,
    [approved_by] INT,
    [reason] NVARCHAR(250),
    [repayment_schedule] NVARCHAR(100),
    [createdate] DATETIME NOT NULL CONSTRAINT [hrms_d_advance_payment_entry_createdate_df] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    CONSTRAINT [hrms_d_advance_payment_entry_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_m_timesheet_project] (
    [id] INT NOT NULL IDENTITY(1,1),
    [project_code] NVARCHAR(50) NOT NULL,
    [project_name] NVARCHAR(200) NOT NULL,
    [client_name] NVARCHAR(150),
    [project_manager_id] INT,
    [start_date] DATE,
    [end_date] DATE,
    [status] NVARCHAR(20) NOT NULL,
    [createdate] DATETIME NOT NULL CONSTRAINT [hrms_m_timesheet_project_createdate_df] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    CONSTRAINT [hrms_m_timesheet_project_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_m_timesheet_task] (
    [id] INT NOT NULL IDENTITY(1,1),
    [task_code] NVARCHAR(50) NOT NULL,
    [task_name] NVARCHAR(200) NOT NULL,
    [task_description] NVARCHAR(500),
    [project_id] INT,
    [estimated_hours] DECIMAL(10,2),
    [task_type] NVARCHAR(50),
    [status] NVARCHAR(20) NOT NULL,
    [createdate] DATETIME NOT NULL CONSTRAINT [hrms_m_timesheet_task_createdate_df] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    CONSTRAINT [hrms_m_timesheet_task_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_goal_sheet_assignment] (
    [id] INT NOT NULL IDENTITY(1,1),
    [employee_id] INT NOT NULL,
    [appraisal_cycle_id] INT NOT NULL,
    [goal_category_id] INT,
    [goal_description] NVARCHAR(500) NOT NULL,
    [weightage] INT NOT NULL,
    [target_value] NVARCHAR(100),
    [measurement_criteria] NVARCHAR(250),
    [due_date] DATE,
    [status] NVARCHAR(20) NOT NULL CONSTRAINT [hrms_d_goal_sheet_assignment_status_df] DEFAULT 'Draft',
    [createdate] DATETIME CONSTRAINT [hrms_d_goal_sheet_assignment_createdate_df] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    CONSTRAINT [hrms_d_goal_sheet_assignment_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_warning_letters] (
    [id] INT NOT NULL IDENTITY(1,1),
    [employee_id] INT NOT NULL,
    [letter_type] INT NOT NULL,
    [reason] NVARCHAR(500) NOT NULL,
    [issued_date] DATE NOT NULL,
    [issued_by] INT NOT NULL,
    [severity_level] NVARCHAR(50),
    [remarks] NVARCHAR(250),
    [attachment_path] NVARCHAR(250),
    [createdate] DATETIME CONSTRAINT [hrms_d_warning_letters_createdate_df] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    CONSTRAINT [hrms_d_warning_letters_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_employee_pay_component_assignment_header] (
    [id] INT NOT NULL IDENTITY(1,1),
    [employee_id] INT NOT NULL,
    [effective_from] DATE,
    [effective_to] DATE,
    [department_id] INT,
    [branch_id] INT,
    [position_id] INT,
    [pay_grade_id] INT,
    [pay_grade_level] INT,
    [allowance_group] NVARCHAR(30),
    [work_life_entry] INT,
    [status] VARCHAR(20) NOT NULL CONSTRAINT [DF__hrms_d_em__statu__2B2A60FE] DEFAULT 'Active',
    [remarks] NVARCHAR(500),
    [createdate] DATETIME CONSTRAINT [DF__hrms_d_em__creat__2C1E8537] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    CONSTRAINT [PK__hrms_d_e__3213E83F9954ECB3] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_employee_pay_component_assignment_line] (
    [id] INT NOT NULL IDENTITY(1,1),
    [parent_id] INT NOT NULL,
    [line_num] INT NOT NULL,
    [pay_component_id] INT NOT NULL,
    [amount] DECIMAL(18,4) NOT NULL,
    [type_value] DECIMAL(18,4) NOT NULL,
    [currency_id] INT,
    [is_taxable] CHAR(1) NOT NULL CONSTRAINT [DF__hrms_d_em__is_ta__2FEF161B] DEFAULT 'Y',
    [is_recurring] CHAR(1) NOT NULL CONSTRAINT [DF__hrms_d_em__is_re__30E33A54] DEFAULT 'Y',
    [is_worklife_related] CHAR(1) NOT NULL CONSTRAINT [DF__hrms_d_em__is_wo__31D75E8D] DEFAULT 'N',
    [is_grossable] CHAR(1) NOT NULL CONSTRAINT [DF__hrms_d_em__is_gr__32CB82C6] DEFAULT 'N',
    [remarks] NVARCHAR(500),
    [tax_code_id] INT,
    [gl_account_id] INT,
    [factor] SMALLINT,
    [payable_glaccount_id] INT,
    [component_type] NVARCHAR(3) NOT NULL CONSTRAINT [DF__hrms_d_em__compo__33BFA6FF] DEFAULT 'O',
    [project_id] INT,
    [cost_center1_id] INT,
    [cost_center2_id] INT,
    [cost_center3_id] INT,
    [cost_center4_id] INT,
    [cost_center5_id] INT,
    [column_order] SMALLINT,
    [createdate] DATETIME CONSTRAINT [DF__hrms_d_em__creat__34B3CB38] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [log_inst] INT,
    [updatedate] DATETIME,
    [updatedby] INT,
    CONSTRAINT [PK__hrms_d_e__3213E83F1BAFA9E6] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_employee_payroll_adjustment] (
    [id] INT NOT NULL IDENTITY(1,1),
    [employee_id] INT NOT NULL,
    [payroll_month] SMALLINT NOT NULL,
    [payroll_year] SMALLINT NOT NULL,
    [payroll_week] SMALLINT NOT NULL,
    [pay_currency] INT,
    [overtime_type] INT,
    [overtime_rate] DECIMAL(18,2) NOT NULL,
    [component_id] INT NOT NULL,
    [amount] DECIMAL(18,2) NOT NULL,
    [status] VARCHAR(20),
    [execution_date] DATE,
    [doc_date] DATE,
    [je_transid] INT,
    [project_id] INT,
    [cost_center1_id] INT,
    [cost_center2_id] INT,
    [cost_center3_id] INT,
    [cost_center4_id] INT,
    [cost_center5_id] INT,
    [approved1] CHAR(1) NOT NULL CONSTRAINT [DF__hrms_d_em__appro__3D9E16F4] DEFAULT 'N',
    [approver1_id] INT,
    [remarks] NVARCHAR(250),
    [createdate] DATETIME,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    [hrms_m_currency_masterId] INT,
    CONSTRAINT [PK__hrms_d_e__3213E83FD3B08BF0] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_employee_payroll_deduction_schedule] (
    [id] INT NOT NULL IDENTITY(1,1),
    [employee_id] INT NOT NULL,
    [payroll_month] SMALLINT NOT NULL,
    [payroll_year] SMALLINT NOT NULL,
    [payroll_week] SMALLINT NOT NULL,
    [pay_currency] INT,
    [component_id] INT NOT NULL,
    [amount] DECIMAL(18,2) NOT NULL,
    [status] NVARCHAR(20) NOT NULL,
    [execution_date] DATE,
    [doc_date] DATE,
    [je_transid] INT,
    [project_id] INT,
    [cost_center1_id] INT,
    [cost_center2_id] INT,
    [cost_center3_id] INT,
    [cost_center4_id] INT,
    [cost_center5_id] INT,
    [approved1] CHAR(1) NOT NULL CONSTRAINT [DF__hrms_d_em__appro__4DD47EBD] DEFAULT 'N',
    [approver1_id] INT,
    [remarks] NVARCHAR(250),
    [createdate] DATETIME NOT NULL,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    [hrms_m_currency_masterId] INT,
    CONSTRAINT [hrms_d_employee_payroll_deduction_schedule_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_leave_balance_details] (
    [id] INT NOT NULL IDENTITY(1,1),
    [parent_id] INT NOT NULL,
    [leave_type_id] INT NOT NULL,
    [leave_type_name] VARCHAR(50),
    [no_of_leaves] INT NOT NULL,
    [used_leaves] NVARCHAR(255),
    [carried_forward] INT NOT NULL,
    [encashed] INT NOT NULL,
    [expired] INT NOT NULL,
    [balance] INT NOT NULL,
    [closed] NVARCHAR(1),
    [unit] NVARCHAR(50),
    CONSTRAINT [PK__hrms_d_l__3213E83FC77DDF0C] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_loan_emi_schedule] (
    [id] INT NOT NULL IDENTITY(1,1),
    [loan_request_id] INT NOT NULL,
    [employee_id] INT NOT NULL,
    [due_month] VARCHAR(50) NOT NULL,
    [emi_amount] DECIMAL(18,2) NOT NULL,
    [status] VARCHAR(1) CONSTRAINT [DF__hrms_d_lo__statu__53385258] DEFAULT 'U',
    [payslip_id] INT,
    [createdate] DATETIME CONSTRAINT [DF__hrms_d_lo__creat__542C7691] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    [due_year] NVARCHAR(1000),
    CONSTRAINT [PK__hrms_d_l__3213E83F89B3FAA3] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_finalsettlement_processing] (
    [id] INT NOT NULL IDENTITY(1,1),
    [employee_id] INT NOT NULL,
    [payroll_month] SMALLINT NOT NULL,
    [payroll_year] SMALLINT NOT NULL,
    [overtime_date] DATE NOT NULL,
    [pay_currency] NVARCHAR(3) NOT NULL,
    [component_id] INT NOT NULL,
    [start_date] DATE NOT NULL,
    [end_date] DATE NOT NULL,
    [no_of_days] INT,
    [no_of_days_entitled] INT,
    [basic_pay] DECIMAL(18,2) NOT NULL,
    [annual_basic_pay] DECIMAL(18,2) NOT NULL,
    [leave_pay] DECIMAL(18,2) NOT NULL,
    [no_of_working_days] INT,
    [no_of_working_years] INT,
    [total_payment] DECIMAL(19,4),
    [entitled_after5yrs] DECIMAL(19,4),
    [esob_after5yrs] DECIMAL(19,4),
    [esob] DECIMAL(19,4),
    [je_transid] INT,
    [status] NVARCHAR(20) NOT NULL,
    [execution_date] DATE,
    [pay_date] DATETIME,
    [pay_id] INT,
    [processed] CHAR(1) NOT NULL CONSTRAINT [DF__hrms_d_fi__proce__18D6A699] DEFAULT 'N',
    [approved1] CHAR(1) NOT NULL CONSTRAINT [DF__hrms_d_fi__appro__19CACAD2] DEFAULT 'N',
    [approver1_id] INT,
    [employee_email] NVARCHAR(100),
    [remarks] NVARCHAR(250),
    [createdate] DATETIME NOT NULL,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    CONSTRAINT [hrms_d_finalsettlement_processing_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_midmonth_payroll_processing] (
    [id] INT NOT NULL IDENTITY(1,1),
    [employee_id] INT NOT NULL,
    [payroll_month] SMALLINT NOT NULL,
    [payroll_year] SMALLINT NOT NULL,
    [payroll_week] SMALLINT NOT NULL,
    [pay_currency] INT,
    [component_id] INT NOT NULL,
    [net_pay] DECIMAL(18,2) NOT NULL,
    [status] NVARCHAR(20) NOT NULL,
    [execution_date] DATE,
    [pay_date] DATETIME,
    [doc_date] DATE,
    [processed] CHAR(1) NOT NULL CONSTRAINT [DF__hrms_d_mi__proce__0E591826] DEFAULT 'N',
    [je_transid] INT,
    [project_id] INT,
    [cost_center1_id] INT,
    [cost_center2_id] INT,
    [cost_center3_id] INT,
    [cost_center4_id] INT,
    [cost_center5_id] INT,
    [approved1] CHAR(1) NOT NULL CONSTRAINT [DF__hrms_d_mi__appro__0F4D3C5F] DEFAULT 'N',
    [approver1_id] INT,
    [employee_email] NVARCHAR(100),
    [remarks] NVARCHAR(250),
    [createdate] DATETIME NOT NULL,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    [hrms_m_currency_masterId] INT,
    CONSTRAINT [hrms_d_midmonth_payroll_processing_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_overtime_payroll_processing] (
    [id] INT NOT NULL IDENTITY(1,1),
    [employee_id] INT NOT NULL,
    [payroll_month] SMALLINT NOT NULL,
    [payroll_year] SMALLINT NOT NULL,
    [overtime_date] DATE NOT NULL,
    [pay_currency] INT,
    [component_id] INT NOT NULL,
    [start_time] NVARCHAR(1000),
    [end_time] NVARCHAR(1000),
    [overtime_hours] DECIMAL(18,2) NOT NULL,
    [overtime_formula] NVARCHAR(max),
    [overtime_type] NVARCHAR(50),
    [overtime_category] NVARCHAR(50),
    [overtime_rate_multiplier] DECIMAL(5,2),
    [calculation_basis] NVARCHAR(50),
    [payroll_cycle_id] INT,
    [linked_payslip_id] INT,
    [source_doc] NVARCHAR(100),
    [overtime_pay] DECIMAL(18,2) NOT NULL,
    [status] NVARCHAR(20) NOT NULL,
    [execution_date] DATE,
    [pay_date] DATETIME,
    [pay_id] INT,
    [processed] CHAR(1) NOT NULL CONSTRAINT [DF__hrms_d_ov__proce__290D0E62] DEFAULT 'N',
    [approved1] CHAR(1) NOT NULL CONSTRAINT [DF__hrms_d_ov__appro__2A01329B] DEFAULT 'N',
    [approver1_id] INT,
    [employee_email] NVARCHAR(100),
    [remarks] NVARCHAR(250),
    [createdate] DATETIME NOT NULL,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    CONSTRAINT [PK__hrms_d_o__3213E83FD60C6CB6] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_m_pay_component_formula] (
    [id] INT NOT NULL IDENTITY(1,1),
    [component_id] INT,
    [formula] NVARCHAR(max) NOT NULL,
    [conditions] NVARCHAR(1000),
    [effective_from] DATE NOT NULL,
    [effective_to] DATE,
    [is_active] CHAR(1) NOT NULL CONSTRAINT [DF__hrms_m_pa__is_ac__338A9CD5] DEFAULT 'Y',
    CONSTRAINT [PK__hrms_m_p__3213E83FA07441EE] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_candidate_master] (
    [id] INT NOT NULL IDENTITY(1,1),
    [candidate_code] VARCHAR(20) NOT NULL,
    [full_name] NVARCHAR(200) NOT NULL,
    [email] NVARCHAR(150),
    [phone] NVARCHAR(20),
    [date_of_birth] DATE,
    [gender] CHAR(1),
    [department_id] INT,
    [nationality] NVARCHAR(100),
    [resume_path] NVARCHAR(255),
    [applied_position_id] INT,
    [application_source] INT,
    [status] NVARCHAR(50),
    [status_remarks] NTEXT,
    [interview1_remarks] NTEXT,
    [interview2_remarks] NTEXT,
    [interview3_remarks] NTEXT,
    [interview_stage] INT,
    [expected_joining_date] DATE,
    [actual_joining_date] DATE,
    [createdate] DATETIME CONSTRAINT [DF__hrms_d_ca__creat__375B2DB9] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    [offer_accepted_date] DATE,
    [no_show_flag] CHAR(1) CONSTRAINT [DF__hrms_d_ca__no_sh__384F51F2] DEFAULT 'N',
    [no_show_remarks] NVARCHAR(255),
    [no_show_marked_date] DATE,
    [job_posting] INT,
    [profile_pic] NVARCHAR(1000),
    [date_of_application] DATE,
    CONSTRAINT [PK__hrms_d_c__3213E83F52C48510] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [UQ__hrms_d_c__FA965E6259D1F830] UNIQUE NONCLUSTERED ([candidate_code])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_candidate_documents] (
    [id] INT NOT NULL IDENTITY(1,1),
    [candidate_id] INT NOT NULL,
    [path] VARCHAR(255),
    [name] NVARCHAR(255),
    [type_id] INT,
    [expiry_date] DATE,
    [status] VARCHAR(255),
    [remarks] NTEXT,
    [createdate] DATETIME,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    CONSTRAINT [hrms_d_candidate_documents_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_m_application_source] (
    [id] INT NOT NULL IDENTITY(1,1),
    [source_name] NVARCHAR(100) NOT NULL,
    [createdate] DATETIME CONSTRAINT [DF__hrms_m_application_source__createdate] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    CONSTRAINT [hrms_m_application_source_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [hrms_m_application_source_source_name_key] UNIQUE NONCLUSTERED ([source_name])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_m_interview_stage] (
    [id] INT NOT NULL IDENTITY(1,1),
    [stage_name] NVARCHAR(100) NOT NULL,
    [createdate] DATETIME CONSTRAINT [DF__interview_stage__createdate] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    [sort_order] INT NOT NULL,
    [description] NVARCHAR(max),
    CONSTRAINT [hrms_m_interview_stage_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [hrms_m_interview_stage_stage_name_key] UNIQUE NONCLUSTERED ([stage_name])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_m_interview_stage_remark] (
    [id] INT NOT NULL IDENTITY(1,1),
    [candidate_id] INT NOT NULL,
    [stage_id] INT NOT NULL,
    [stage_name] VARCHAR(50),
    [remark] NTEXT,
    [rating] INT,
    [createdate] DATETIME CONSTRAINT [DF__stage_remark__createdate] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME2,
    [updatedby] INT,
    [log_inst] INT,
    [is_completed] BIT,
    [status] NVARCHAR(50),
    [employee_id] INT,
    [interview_date] DATETIME2,
    CONSTRAINT [hrms_m_interview_stage_remark_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_m_costcenters] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] VARCHAR(200),
    [dimension_id] INT,
    [is_active] CHAR(1) NOT NULL CONSTRAINT [DF__m_costcen__is_ac__6576FE24] DEFAULT 'Y',
    [valid_from] DATE,
    [valid_to] DATE,
    [createdate] DATETIME CONSTRAINT [DF__m_costcen__creat__666B225D] DEFAULT CURRENT_TIMESTAMP,
    [updatedate] DATETIME,
    [createdby] INT NOT NULL,
    [updatedby] INT,
    [log_inst] INT,
    [external_code] NVARCHAR(200),
    CONSTRAINT [PK__m_costce__3213E83FEA0D7E3A] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_m_projects] (
    [id] INT NOT NULL IDENTITY(1,1),
    [code] VARCHAR(50) NOT NULL,
    [name] VARCHAR(200),
    [locked] CHAR(1) NOT NULL CONSTRAINT [DF__hrms_m_projects__locke__3A8CA01F] DEFAULT 'N',
    [valid_from] DATE,
    [valid_to] DATE,
    [employee_id] INT,
    [createdate] DATETIME CONSTRAINT [DF__hrms_m_projects__creat__3B80C458] DEFAULT CURRENT_TIMESTAMP,
    [updatedate] DATETIME,
    [createdby] INT NOT NULL,
    [updatedby] INT,
    [log_inst] INT,
    [ValidFrom] DATETIME2 NOT NULL CONSTRAINT [DF__hrms_m_pr__Valid__670A40DB] DEFAULT sysutcdatetime(),
    [ValidTo] DATETIME2 NOT NULL CONSTRAINT [DF__hrms_m_pr__Valid__67FE6514] DEFAULT 9999-12-31 23:59:59.9999999,
    [is_active] CHAR(1) CONSTRAINT [DF__hrms_m_pr__is_ac__69E6AD86] DEFAULT 'Y',
    CONSTRAINT [PK__m_projec__3213E83F47788695] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [UQ__m_projec__357D4CF92EB107C2] UNIQUE NONCLUSTERED ([code])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_activity_log] (
    [id] INT NOT NULL IDENTITY(1,1),
    [employee_id] INT NOT NULL,
    [module] VARCHAR(100) NOT NULL,
    [action_type] VARCHAR(50) NOT NULL,
    [activity] VARCHAR(255) NOT NULL,
    [reference_id] INT,
    [description] TEXT,
    [is_deleted] BIT NOT NULL CONSTRAINT [hrms_d_activity_log_is_deleted_df] DEFAULT 0,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [hrms_d_activity_log_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [hrms_d_activity_log_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_m_loan_master] (
    [id] INT NOT NULL IDENTITY(1,1),
    [loan_code] VARCHAR(20) NOT NULL,
    [loan_name] VARCHAR(100) NOT NULL,
    [loan_type_id] INT,
    [wage_type] VARCHAR(50) NOT NULL,
    [minimum_tenure] VARCHAR(50) NOT NULL,
    [maximum_tenure] VARCHAR(50) NOT NULL,
    [tenure_divider] INT NOT NULL,
    [maximum_amount] INT NOT NULL,
    [in_active] BIT NOT NULL CONSTRAINT [hrms_m_loan_master_in_active_df] DEFAULT 0,
    [createdate] DATETIME2 NOT NULL CONSTRAINT [hrms_m_loan_master_createdate_df] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME2,
    [updatedby] INT,
    [log_inst] INT,
    [amount_currency] INT NOT NULL,
    [minimum_amount] INT NOT NULL,
    CONSTRAINT [hrms_m_loan_master_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_m_overtime_setup] (
    [id] INT NOT NULL IDENTITY(1,1),
    [days_code] VARCHAR(20) NOT NULL,
    [wage_type] VARCHAR(50) NOT NULL,
    [hourly_rate_hike] DECIMAL(10,5) NOT NULL,
    [maximum_overtime_allowed] VARCHAR(50) NOT NULL,
    [createdate] DATETIME2 NOT NULL CONSTRAINT [hrms_m_overtime_setup_createdate_df] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [log_inst] INT,
    [updatedate] DATETIME2,
    [updatedby] INT,
    CONSTRAINT [hrms_m_overtime_setup_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_m_tax_slab_rule1] (
    [id] INT NOT NULL IDENTITY(1,1),
    [parent_id] INT NOT NULL,
    [rule_type] VARCHAR(20),
    [slab_min] DECIMAL(12,2),
    [slab_max] DECIMAL(12,2),
    [rate] DECIMAL(5,2),
    [flat_amount] DECIMAL(12,2),
    [effective_from] DATE NOT NULL,
    [effective_to] DATE,
    [createdate] DATETIME CONSTRAINT [DF__hrms_m_ta__creat__015422C3] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    CONSTRAINT [PK__hrms_m_t__3213E83F32540D17] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_loan_cash_payment] (
    [id] INT NOT NULL IDENTITY(1,1),
    [loan_request_id] INT NOT NULL,
    [balance_amount] DECIMAL(18,2) NOT NULL,
    [amount] DECIMAL(18,2) NOT NULL,
    [pending_amount] DECIMAL(18,2) NOT NULL,
    [createdate] DATETIME CONSTRAINT [DF__hrms_d_loan_cash_payment__creat__542C7691] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    [due_year] NVARCHAR(1000),
    CONSTRAINT [PK__hrms_d_loan_cash_payment] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_exit_clearance1] (
    [id] INT NOT NULL IDENTITY(1,1),
    [parent_id] INT,
    [pay_component_id] INT,
    [payment_or_dedcution] NVARCHAR(10),
    [no_of_days] INT,
    [amount] DECIMAL(19,6),
    [remarks] NVARCHAR(255),
    [createdate] DATETIME CONSTRAINT [DF__hrms_d_ex__creat__35C7EB02] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    CONSTRAINT [PK__hrms_d_e__3213E83F605785EC] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_default_configurations] (
    [id] INT NOT NULL IDENTITY(1,1),
    [company_logo] VARCHAR(255),
    [company_name] NVARCHAR(150) NOT NULL,
    [email] VARCHAR(100) NOT NULL,
    [website] VARCHAR(150),
    [phone_number] VARCHAR(20),
    [description] NVARCHAR(1000),
    [street_address] NVARCHAR(200),
    [city] NVARCHAR(100),
    [state] INT,
    [province] NVARCHAR(100),
    [zip_code] VARCHAR(20),
    [country] INT,
    [gst_number] VARCHAR(30),
    [pan_number] VARCHAR(30),
    [tax_id] VARCHAR(30),
    [smtp_host] VARCHAR(50),
    [smtp_port] INT,
    [smtp_username] VARCHAR(200),
    [smtp_password] VARCHAR(100),
    [createdate] DATETIME NOT NULL CONSTRAINT [hrms_d_default_configurations_createdate_df] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    [company_signature] VARCHAR(255),
    [column_one] VARCHAR(255),
    [column_two] VARCHAR(255),
    [column_three] VARCHAR(255),
    [column_four] VARCHAR(255),
    [full_day_working_hours] INT,
    [half_day_working_hours] INT,
    [working_days] INT,
    [local_employee_probation_period] VARCHAR(255),
    [terms_and_conditions] TEXT,
    [notes] TEXT,
    [local_employee_notice_period] INT,
    CONSTRAINT [hrms_d_default_configurations_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_requests] (
    [id] INT NOT NULL IDENTITY(1,1),
    [requester_id] INT NOT NULL,
    [request_type] VARCHAR(100),
    [request_data] TEXT,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [hrms_d_requests_status_df] DEFAULT 'Pending',
    [reference_id] INT,
    [remarks] VARCHAR(100),
    [createdate] DATETIME NOT NULL CONSTRAINT [hrms_d_requests_createdate_df] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    CONSTRAINT [hrms_d_requests_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_approval_work_flow] (
    [id] INT NOT NULL IDENTITY(1,1),
    [request_type] NVARCHAR(1000),
    [sequence] INT NOT NULL,
    [approver_id] INT NOT NULL,
    [department_id] INT,
    [designation_id] INT,
    [header_approval_type] NVARCHAR(1000),
    [header_designation_id] INT,
    [is_active] NVARCHAR(1000),
    [remarks] VARCHAR(100),
    [createdate] DATETIME NOT NULL CONSTRAINT [hrms_d_approval_work_flow_createdate_df] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    CONSTRAINT [hrms_d_approval_work_flow_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_requests_approval] (
    [id] INT NOT NULL IDENTITY(1,1),
    [request_id] INT NOT NULL,
    [approver_id] INT NOT NULL,
    [sequence] INT NOT NULL,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [hrms_d_requests_approval_status_df] DEFAULT 'Pending',
    [action_at] DATETIME2,
    [remarks] VARCHAR(100),
    [createdate] DATETIME NOT NULL CONSTRAINT [hrms_d_requests_approval_createdate_df] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT,
    CONSTRAINT [hrms_d_requests_approval_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_employee_kpi] (
    [id] INT NOT NULL IDENTITY(1,1),
    [employee_id] INT NOT NULL,
    [reviewer_id] INT NOT NULL,
    [review_date] DATE NOT NULL,
    [review_remarks] NVARCHAR(500),
    [next_review_date] DATE,
    [employment_type] VARCHAR(50),
    [contract_expiry_date] DATE,
    [employment_remarks] NVARCHAR(500),
    [rating] DECIMAL(19,6),
    [revise_component_assignment] CHAR(1) CONSTRAINT [hrms_d_employee_kpi_revise_component_assignment_df] DEFAULT 'N',
    [status] VARCHAR(20) NOT NULL CONSTRAINT [hrms_d_employee_kpi_status_df] DEFAULT 'Pending',
    [last_kpi_id] INT,
    [createdate] DATETIME NOT NULL CONSTRAINT [hrms_d_employee_kpi_createdate_df] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT CONSTRAINT [hrms_d_employee_kpi_log_inst_df] DEFAULT 1,
    CONSTRAINT [hrms_d_employee_kpi_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_employee_kpi_contents] (
    [id] INT NOT NULL IDENTITY(1,1),
    [employee_kpi_id] INT NOT NULL,
    [kpi_name] NVARCHAR(255),
    [kpi_remarks] NVARCHAR(500),
    [weightage_percentage] DECIMAL(19,6),
    [target_point] DECIMAL(19,6),
    [achieved_point] DECIMAL(19,6),
    [achieved_percentage] DECIMAL(19,6),
    [kpi_drawing_type] NVARCHAR(100),
    [target_point_for_next_kpi] DECIMAL(19,6),
    [weightage_percentage_for_next_kpi] DECIMAL(19,6),
    [createdate] DATETIME NOT NULL CONSTRAINT [hrms_d_employee_kpi_contents_createdate_df] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT CONSTRAINT [hrms_d_employee_kpi_contents_log_inst_df] DEFAULT 1,
    CONSTRAINT [hrms_d_employee_kpi_contents_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_employee_kpi_component_assignment] (
    [id] INT NOT NULL IDENTITY(1,1),
    [employee_kpi_id] INT NOT NULL,
    [header_payroll_rule] VARCHAR(100),
    [effective_from] DATE,
    [effective_to] DATE,
    [status] VARCHAR(20) NOT NULL CONSTRAINT [hrms_d_employee_kpi_component_assignment_status_df] DEFAULT 'Pending',
    [last_component_assignment_id] INT,
    [change_percentage] DECIMAL(19,6),
    [department_id] INT,
    [designation_id] INT,
    [position] NVARCHAR(100),
    [successor_id] INT,
    [createdate] DATETIME NOT NULL CONSTRAINT [hrms_d_employee_kpi_component_assignment_createdate_df] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT CONSTRAINT [hrms_d_employee_kpi_component_assignment_log_inst_df] DEFAULT 1,
    CONSTRAINT [hrms_d_employee_kpi_component_assignment_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [hrms_d_employee_kpi_component_assignment_employee_kpi_id_key] UNIQUE NONCLUSTERED ([employee_kpi_id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_employee_kpi_component_lines] (
    [id] INT NOT NULL IDENTITY(1,1),
    [component_assignment_id] INT NOT NULL,
    [pay_component_id] INT NOT NULL,
    [amount] DECIMAL(19,6) NOT NULL,
    [createdate] DATETIME NOT NULL CONSTRAINT [hrms_d_employee_kpi_component_lines_createdate_df] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [log_inst] INT CONSTRAINT [hrms_d_employee_kpi_component_lines_log_inst_df] DEFAULT 1,
    CONSTRAINT [hrms_d_employee_kpi_component_lines_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_employee_kpi_attachments] (
    [id] INT NOT NULL IDENTITY(1,1),
    [employee_kpi_id] INT NOT NULL,
    [document_type_id] INT,
    [document_name] NVARCHAR(255),
    [issue_date] DATE,
    [expiry_date] DATE,
    [status] VARCHAR(20) NOT NULL CONSTRAINT [hrms_d_employee_kpi_attachments_status_df] DEFAULT 'Pending',
    [remarks] NVARCHAR(500),
    [attachment_url] NVARCHAR(500),
    [createdate] DATETIME NOT NULL CONSTRAINT [hrms_d_employee_kpi_attachments_createdate_df] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT CONSTRAINT [hrms_d_employee_kpi_attachments_log_inst_df] DEFAULT 1,
    CONSTRAINT [hrms_d_employee_kpi_attachments_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_templates] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] VARCHAR(50) NOT NULL,
    [key] VARCHAR(100) NOT NULL,
    [channel] VARCHAR(100),
    [type] VARCHAR(100),
    [subject] VARCHAR(100) NOT NULL,
    [body] TEXT NOT NULL,
    [createdate] DATETIME NOT NULL CONSTRAINT [hrms_d_templates_createdate_df] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    CONSTRAINT [hrms_d_templates_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [hrms_d_templates_name_key] UNIQUE NONCLUSTERED ([name]),
    CONSTRAINT [hrms_d_templates_key_key] UNIQUE NONCLUSTERED ([key])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_notification_setup] (
    [id] INT NOT NULL IDENTITY(1,1),
    [title] VARCHAR(255) NOT NULL,
    [action_type] VARCHAR(50) NOT NULL,
    [action_create] BIT NOT NULL CONSTRAINT [hrms_d_notification_setup_action_create_df] DEFAULT 0,
    [action_update] BIT NOT NULL CONSTRAINT [hrms_d_notification_setup_action_update_df] DEFAULT 0,
    [action_delete] BIT NOT NULL CONSTRAINT [hrms_d_notification_setup_action_delete_df] DEFAULT 0,
    [template_id] INT,
    [channel_email] BIT NOT NULL CONSTRAINT [hrms_d_notification_setup_channel_email_df] DEFAULT 0,
    [channel_system] BIT NOT NULL CONSTRAINT [hrms_d_notification_setup_channel_system_df] DEFAULT 0,
    [channel_whatsapp] BIT NOT NULL CONSTRAINT [hrms_d_notification_setup_channel_whatsapp_df] DEFAULT 0,
    [channel_sms] BIT NOT NULL CONSTRAINT [hrms_d_notification_setup_channel_sms_df] DEFAULT 0,
    [is_active] CHAR(1) NOT NULL CONSTRAINT [DF__hrms_d_noti__is_ac__3D5E1FD6] DEFAULT 'Y',
    [created_at] DATETIME NOT NULL CONSTRAINT [DF__hrms_d_noti__creat__3E52440F] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME NOT NULL CONSTRAINT [DF__hrms_d_noti__updat__3F466848] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [hrms_d_notification_setup_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_notification_assigned_user] (
    [id] INT NOT NULL IDENTITY(1,1),
    [notification_setup_id] INT NOT NULL,
    [employee_id] INT NOT NULL,
    [sort_order] INT NOT NULL CONSTRAINT [hrms_d_notification_assigned_user_sort_order_df] DEFAULT 0,
    [created_at] DATETIME NOT NULL CONSTRAINT [DF__hrms_d_noti__creat__403A8C42] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [hrms_d_notification_assigned_user_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_alert_workflow] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(100) NOT NULL,
    [description] NVARCHAR(500),
    [target_type] NVARCHAR(50) NOT NULL,
    [target] NVARCHAR(500) NOT NULL,
    [schedule_cron] NVARCHAR(100),
    [is_active] CHAR(1) NOT NULL CONSTRAINT [hrms_d_alert_workflow_is_active_df] DEFAULT 'Y',
    [conditions] NVARCHAR(1000) NOT NULL CONSTRAINT [hrms_d_alert_workflow_conditions_df] DEFAULT '[]',
    [actions] NVARCHAR(1000) NOT NULL CONSTRAINT [hrms_d_alert_workflow_actions_df] DEFAULT '[]',
    [createdate] DATETIME NOT NULL CONSTRAINT [hrms_d_alert_workflow_createdate_df] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [created_at] DATETIME CONSTRAINT [hrms_d_alert_workflow_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [log_inst] INT NOT NULL CONSTRAINT [hrms_d_alert_workflow_log_inst_df] DEFAULT 1,
    CONSTRAINT [hrms_d_alert_workflow_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_alert_workflow_action] (
    [id] INT NOT NULL IDENTITY(1,1),
    [workflow_id] INT NOT NULL,
    [action_type] NVARCHAR(20) NOT NULL,
    [template_id] INT NOT NULL,
    [created_at] DATETIME NOT NULL CONSTRAINT [hrms_d_alert_workflow_action_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [created_by] INT NOT NULL,
    [log_inst] INT NOT NULL CONSTRAINT [hrms_d_alert_workflow_action_log_inst_df] DEFAULT 1,
    CONSTRAINT [hrms_d_alert_workflow_action_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_alert_log] (
    [id] INT NOT NULL IDENTITY(1,1),
    [workflow_id] INT NOT NULL,
    [recipient_id] INT,
    [channel_code] NVARCHAR(20),
    [status] NVARCHAR(20) NOT NULL,
    [attempted_at] DATETIME NOT NULL CONSTRAINT [hrms_d_alert_log_attempted_at_df] DEFAULT CURRENT_TIMESTAMP,
    [delivered_at] DATETIME2,
    [details] NTEXT,
    [error_message] NVARCHAR(max),
    [retry_count] INT NOT NULL CONSTRAINT [hrms_d_alert_log_retry_count_df] DEFAULT 0,
    [created_at] DATETIME NOT NULL CONSTRAINT [hrms_d_alert_log_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [hrms_d_alert_log_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_pay_component_contract] (
    [id] INT NOT NULL IDENTITY(1,1),
    [contract_id] INT NOT NULL,
    [pay_component_id] INT NOT NULL,
    [amount] DECIMAL(18,4) NOT NULL,
    [currency_id] INT,
    [createdate] DATETIME CONSTRAINT [hrms_d_pay_component_contract_createdate_df] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [log_inst] INT,
    [updatedate] DATETIME,
    [updatedby] INT,
    CONSTRAINT [hrms_d_pay_component_contract_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_announcement] (
    [id] INT NOT NULL IDENTITY(1,1),
    [title] NVARCHAR(200) NOT NULL,
    [description] NTEXT,
    [image_url] NVARCHAR(500),
    [priority] NVARCHAR(20) NOT NULL CONSTRAINT [hrms_d_announcement_priority_df] DEFAULT 'Normal',
    [scheduled_at] DATETIME,
    [target_type] NVARCHAR(50) NOT NULL,
    [target_values] NTEXT,
    [is_active] CHAR(1) NOT NULL CONSTRAINT [hrms_d_announcement_is_active_df] DEFAULT 'Y',
    [createdate] DATETIME NOT NULL CONSTRAINT [hrms_d_announcement_createdate_df] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT NOT NULL,
    [updatedate] DATETIME,
    [updatedby] INT,
    [log_inst] INT NOT NULL CONSTRAINT [hrms_d_announcement_log_inst_df] DEFAULT 1,
    CONSTRAINT [hrms_d_announcement_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_announcement_log] (
    [id] INT NOT NULL IDENTITY(1,1),
    [announcement_id] INT NOT NULL,
    [action] NVARCHAR(50) NOT NULL,
    [details] NTEXT,
    [status] NVARCHAR(20) NOT NULL,
    [error_message] NVARCHAR(500),
    [processed_count] INT NOT NULL CONSTRAINT [hrms_d_announcement_log_processed_count_df] DEFAULT 0,
    [failed_count] INT NOT NULL CONSTRAINT [hrms_d_announcement_log_failed_count_df] DEFAULT 0,
    [recipient_emails] NTEXT,
    [createdate] DATETIME NOT NULL CONSTRAINT [hrms_d_announcement_log_createdate_df] DEFAULT CURRENT_TIMESTAMP,
    [createdby] INT,
    CONSTRAINT [hrms_d_announcement_log_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_early_leave] (
    [id] INT NOT NULL IDENTITY(1,1),
    [employee_id] INT NOT NULL,
    [leave_date] DATE NOT NULL,
    [early_leave_time] NVARCHAR(10) NOT NULL,
    [reason] NVARCHAR(500) NOT NULL,
    [status] NVARCHAR(20) NOT NULL CONSTRAINT [hrms_d_early_leave_status_df] DEFAULT 'Pending',
    [approved_by] INT,
    [approved_date] DATETIME,
    [remarks] NVARCHAR(500),
    [log_inst] INT NOT NULL CONSTRAINT [hrms_d_early_leave_log_inst_df] DEFAULT 1,
    [createdate] DATETIME NOT NULL CONSTRAINT [hrms_d_early_leave_createdate_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedate] DATETIME,
    [createdby] INT NOT NULL CONSTRAINT [hrms_d_early_leave_createdby_df] DEFAULT 1,
    [updatedby] INT,
    CONSTRAINT [hrms_d_early_leave_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_payment_recovery] (
    [id] INT NOT NULL IDENTITY(1,1),
    [employee_id] INT NOT NULL,
    [amount] DECIMAL(18,2) NOT NULL,
    [status] VARCHAR(5) NOT NULL CONSTRAINT [hrms_d_payment_recovery_status_df] DEFAULT 'P',
    [payment_mode] VARCHAR(500),
    [payment_date] DATETIME,
    [remarks] NVARCHAR(500),
    [createdate] DATETIME NOT NULL CONSTRAINT [hrms_d_payment_recovery_createdate_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedate] DATETIME,
    [createdby] INT NOT NULL CONSTRAINT [hrms_d_payment_recovery_createdby_df] DEFAULT 1,
    [updatedby] INT,
    [log_inst] INT NOT NULL CONSTRAINT [hrms_d_payment_recovery_log_inst_df] DEFAULT 1,
    CONSTRAINT [hrms_d_payment_recovery_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_hiring_stage] (
    [id] INT NOT NULL IDENTITY(1,1),
    [code] NVARCHAR(100) NOT NULL,
    [stage_id] INT NOT NULL,
    [description] NTEXT,
    [planned_date] DATETIME,
    [completion_date] DATETIME,
    [feedback] NTEXT,
    [competency_level] NVARCHAR(50),
    [remarks] NTEXT,
    [createdate] DATETIME NOT NULL CONSTRAINT [hrms_d_hiring_stage_createdate_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedate] DATETIME,
    [createdby] INT NOT NULL CONSTRAINT [hrms_d_hiring_stage_createdby_df] DEFAULT 1,
    [updatedby] INT,
    [log_inst] INT NOT NULL CONSTRAINT [hrms_d_hiring_stage_log_inst_df] DEFAULT 1,
    CONSTRAINT [hrms_d_hiring_stage_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_hiring_stage_value] (
    [id] INT NOT NULL IDENTITY(1,1),
    [value] NVARCHAR(100) NOT NULL,
    [createdate] DATETIME NOT NULL CONSTRAINT [hrms_d_hiring_stage_value_createdate_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedate] DATETIME,
    [createdby] INT NOT NULL CONSTRAINT [hrms_d_hiring_stage_value_createdby_df] DEFAULT 1,
    [updatedby] INT,
    [log_inst] INT NOT NULL CONSTRAINT [hrms_d_hiring_stage_value_log_inst_df] DEFAULT 1,
    CONSTRAINT [hrms_d_hiring_stage_value_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hrms_d_candidate_hiring_stage] (
    [id] INT NOT NULL IDENTITY(1,1),
    [candidate_id] INT NOT NULL,
    [job_posting_id] INT NOT NULL,
    [stage_id] INT NOT NULL,
    [stage_name] NVARCHAR(100) NOT NULL,
    [sequence_order] INT NOT NULL,
    [stage_status] VARCHAR(20) NOT NULL CONSTRAINT [hrms_d_candidate_hiring_stage_stage_status_df] DEFAULT 'pending',
    [description] NTEXT,
    [feedback] NTEXT,
    [started_date] DATETIME,
    [completed_date] DATETIME,
    [createdate] DATETIME NOT NULL CONSTRAINT [hrms_d_candidate_hiring_stage_createdate_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedate] DATETIME,
    [createdby] INT NOT NULL CONSTRAINT [hrms_d_candidate_hiring_stage_createdby_df] DEFAULT 1,
    [updatedby] INT,
    [log_inst] INT NOT NULL CONSTRAINT [hrms_d_candidate_hiring_stage_log_inst_df] DEFAULT 1,
    CONSTRAINT [hrms_d_candidate_hiring_stage_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[_AlertActionRecipients] (
    [A] INT NOT NULL,
    [B] INT NOT NULL,
    CONSTRAINT [_AlertActionRecipients_AB_unique] UNIQUE NONCLUSTERED ([A],[B])
);

-- CreateTable
CREATE TABLE [dbo].[_AlertActionAlertRecipients] (
    [A] INT NOT NULL,
    [B] INT NOT NULL,
    CONSTRAINT [_AlertActionAlertRecipients_AB_unique] UNIQUE NONCLUSTERED ([A],[B])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [_AlertActionRecipients_B_index] ON [dbo].[_AlertActionRecipients]([B]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [_AlertActionAlertRecipients_B_index] ON [dbo].[_AlertActionAlertRecipients]([B]);

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_role_permissions] ADD CONSTRAINT [hrms_d_role_permissions_role_id_fkey] FOREIGN KEY ([role_id]) REFERENCES [dbo].[hrms_m_role]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_user_role] ADD CONSTRAINT [FK_hrms_d_user_role_role] FOREIGN KEY ([role_id]) REFERENCES [dbo].[hrms_m_role]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_user_role] ADD CONSTRAINT [FK_hrms_d_user_role_user] FOREIGN KEY ([user_id]) REFERENCES [dbo].[hrms_m_user]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_m_user] ADD CONSTRAINT [hrms_m_user_employee_id_fkey] FOREIGN KEY ([employee_id]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_appointment_letter] ADD CONSTRAINT [hrms_d_appointment_letter_candidate_id_fkey] FOREIGN KEY ([candidate_id]) REFERENCES [dbo].[hrms_d_candidate_master]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_appointment_letter] ADD CONSTRAINT [hrms_d_appointment_letter_designation_id_fkey] FOREIGN KEY ([designation_id]) REFERENCES [dbo].[hrms_m_designation_master]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_appraisal] ADD CONSTRAINT [hrms_d_appraisal_employee_id_fkey] FOREIGN KEY ([employee_id]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_asset_assignment] ADD CONSTRAINT [hrms_d_asset_assignment_asset_type_id_fkey] FOREIGN KEY ([asset_type_id]) REFERENCES [dbo].[hrms_m_asset_type]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_asset_assignment] ADD CONSTRAINT [hrms_d_asset_assignment_employee_id_fkey] FOREIGN KEY ([employee_id]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_competency] ADD CONSTRAINT [hrms_d_competency_employee_id_fkey] FOREIGN KEY ([employee_id]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_disciplinary_action] ADD CONSTRAINT [hrms_d_disciplinary_action_employee_id_fkey] FOREIGN KEY ([employee_id]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_disciplinary_action] ADD CONSTRAINT [hrms_d_disciplinary_action_penalty_type_fkey] FOREIGN KEY ([penalty_type]) REFERENCES [dbo].[hrms_m_disciplinary_penalty]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_disciplinary_action] ADD CONSTRAINT [hrms_d_disciplinary_action_reviewed_by_fkey] FOREIGN KEY ([reviewed_by]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_document_upload] ADD CONSTRAINT [hrms_d_document_upload_employee_id_fkey] FOREIGN KEY ([employee_id]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_employee] ADD CONSTRAINT [hrms_d_employee_bank_id_fkey] FOREIGN KEY ([bank_id]) REFERENCES [dbo].[hrms_m_bank_master]([id]) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_employee] ADD CONSTRAINT [hrms_d_employee_department_id_fkey] FOREIGN KEY ([department_id]) REFERENCES [dbo].[hrms_m_department_master]([id]) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_employee] ADD CONSTRAINT [hrms_d_employee_designation_id_fkey] FOREIGN KEY ([designation_id]) REFERENCES [dbo].[hrms_m_designation_master]([id]) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_employee] ADD CONSTRAINT [hrms_d_employee_manager_id_fkey] FOREIGN KEY ([manager_id]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_employee] ADD CONSTRAINT [hrms_d_employee_shift_id_fkey] FOREIGN KEY ([shift_id]) REFERENCES [dbo].[hrms_m_shift_master]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_employee] ADD CONSTRAINT [hrms_d_employee_currency_id_fkey] FOREIGN KEY ([currency_id]) REFERENCES [dbo].[hrms_m_currency_master]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_employee_address] ADD CONSTRAINT [FK__hrms_d_em__emplo__078C1F06] FOREIGN KEY ([employee_id]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_employee_address] ADD CONSTRAINT [hrms_d_employee_address_country_fkey] FOREIGN KEY ([country]) REFERENCES [dbo].[hrms_m_country_master]([id]) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_employee_address] ADD CONSTRAINT [hrms_d_employee_address_state_fkey] FOREIGN KEY ([state]) REFERENCES [dbo].[crms_m_states]([id]) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_employee_suggestion] ADD CONSTRAINT [hrms_d_employee_suggestion_employee_id_fkey] FOREIGN KEY ([employee_id]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_employment_contract] ADD CONSTRAINT [hrms_d_employment_contract_candidate_id_fkey] FOREIGN KEY ([candidate_id]) REFERENCES [dbo].[hrms_d_candidate_master]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_employment_contract] ADD CONSTRAINT [hrms_d_employment_contract_employee_id_fkey] FOREIGN KEY ([employee_id]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_exit_clearance] ADD CONSTRAINT [hrms_d_exit_clearance_cleared_by_fkey] FOREIGN KEY ([cleared_by]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_exit_clearance] ADD CONSTRAINT [hrms_d_exit_clearance_employee_id_fkey] FOREIGN KEY ([employee_id]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_exit_interview] ADD CONSTRAINT [hrms_d_exit_interview_employee_id_fkey] FOREIGN KEY ([employee_id]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_grievance] ADD CONSTRAINT [hrms_d_grievance_assigned_to_fkey] FOREIGN KEY ([assigned_to]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_grievance] ADD CONSTRAINT [hrms_d_grievance_employee_id_fkey] FOREIGN KEY ([employee_id]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_grievance] ADD CONSTRAINT [hrms_d_grievance_grievance_type_fkey] FOREIGN KEY ([grievance_type]) REFERENCES [dbo].[hrms_m_grievance_type]([id]) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_helpdesk_ticket] ADD CONSTRAINT [hrms_d_helpdesk_ticket_assigned_to_fkey] FOREIGN KEY ([assigned_to]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_helpdesk_ticket] ADD CONSTRAINT [hrms_d_helpdesk_ticket_employee_id_fkey] FOREIGN KEY ([employee_id]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_hr_letter] ADD CONSTRAINT [hrms_d_hr_letter_employee_id_fkey] FOREIGN KEY ([employee_id]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_hr_letter] ADD CONSTRAINT [hrms_d_hr_letter_letter_type_fkey] FOREIGN KEY ([letter_type]) REFERENCES [dbo].[hrms_m_letter_type]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_job_posting] ADD CONSTRAINT [hrms_d_job_posting_department_id_fkey] FOREIGN KEY ([department_id]) REFERENCES [dbo].[hrms_m_department_master]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_job_posting] ADD CONSTRAINT [hrms_d_job_posting_designation_id_fkey] FOREIGN KEY ([designation_id]) REFERENCES [dbo].[hrms_m_designation_master]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_job_posting] ADD CONSTRAINT [hrms_d_job_posting_reporting_manager_id_fkey] FOREIGN KEY ([reporting_manager_id]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_job_posting] ADD CONSTRAINT [hrms_d_job_posting_currency_id_fkey] FOREIGN KEY ([currency_id]) REFERENCES [dbo].[hrms_m_currency_master]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_leave_application] ADD CONSTRAINT [hrms_d_leave_application_approver_id_fkey] FOREIGN KEY ([approver_id]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_leave_application] ADD CONSTRAINT [hrms_d_leave_application_backup_person_id_fkey] FOREIGN KEY ([backup_person_id]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_leave_application] ADD CONSTRAINT [hrms_d_leave_application_employee_id_fkey] FOREIGN KEY ([employee_id]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_leave_application] ADD CONSTRAINT [hrms_d_leave_application_leave_type_id_fkey] FOREIGN KEY ([leave_type_id]) REFERENCES [dbo].[hrms_m_leave_type_master]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_leave_balance] ADD CONSTRAINT [hrms_d_leave_balance_employee_id_fkey] FOREIGN KEY ([employee_id]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_leave_encashment] ADD CONSTRAINT [hrms_d_leave_encashment_employee_id_fkey] FOREIGN KEY ([employee_id]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_leave_encashment] ADD CONSTRAINT [hrms_d_leave_encashment_leave_type_id_fkey] FOREIGN KEY ([leave_type_id]) REFERENCES [dbo].[hrms_m_leave_type_master]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_loan_request] ADD CONSTRAINT [hrms_d_loan_request_currency_fkey] FOREIGN KEY ([currency]) REFERENCES [dbo].[hrms_m_currency_master]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_loan_request] ADD CONSTRAINT [hrms_d_loan_request_employee_id_fkey] FOREIGN KEY ([employee_id]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_loan_request] ADD CONSTRAINT [hrms_d_loan_request_loan_type_id_fkey] FOREIGN KEY ([loan_type_id]) REFERENCES [dbo].[hrms_m_loan_type]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_medical_record] ADD CONSTRAINT [hrms_d_medical_record_employee_id_fkey] FOREIGN KEY ([employee_id]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_notification_log] ADD CONSTRAINT [hrms_d_notification_log_employee_id_fkey] FOREIGN KEY ([employee_id]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_offer_letter] ADD CONSTRAINT [hrms_d_offer_letter_candidate_id_fkey] FOREIGN KEY ([candidate_id]) REFERENCES [dbo].[hrms_d_candidate_master]([id]) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_offer_letter] ADD CONSTRAINT [hrms_d_offer_letter_currency_id_fkey] FOREIGN KEY ([currency_id]) REFERENCES [dbo].[hrms_m_currency_master]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_offer_letter] ADD CONSTRAINT [hrms_d_offer_letter_hrms_m_currency_masterId_fkey] FOREIGN KEY ([hrms_m_currency_masterId]) REFERENCES [dbo].[hrms_m_currency_master]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_payslip] ADD CONSTRAINT [hrms_d_payslip_employee_id_fkey] FOREIGN KEY ([employee_id]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_probation_review] ADD CONSTRAINT [hrms_d_probation_review_employee_id_fkey] FOREIGN KEY ([employee_id]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_probation_review] ADD CONSTRAINT [hrms_d_probation_review_hrms_d_employeeId_fkey] FOREIGN KEY ([hrms_d_employeeId]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_probation_review] ADD CONSTRAINT [hrms_d_probation_review_reviewer_id_fkey] FOREIGN KEY ([reviewer_id]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_recognition_award] ADD CONSTRAINT [hrms_d_recognition_award_employee_id_fkey] FOREIGN KEY ([employee_id]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_recognition_award] ADD CONSTRAINT [hrms_d_recognition_award_nominated_by_fkey] FOREIGN KEY ([nominated_by]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_relieving_letter] ADD CONSTRAINT [hrms_d_relieving_letter_employee_id_fkey] FOREIGN KEY ([employee_id]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_resume] ADD CONSTRAINT [hrms_d_resume_candidate_id_fkey] FOREIGN KEY ([candidate_id]) REFERENCES [dbo].[hrms_d_candidate_master]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_succession_plan] ADD CONSTRAINT [hrms_d_succession_plan_current_holder_id_fkey] FOREIGN KEY ([current_holder_id]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_succession_plan] ADD CONSTRAINT [hrms_d_succession_plan_evaluated_by_fkey] FOREIGN KEY ([evaluated_by]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_succession_plan] ADD CONSTRAINT [hrms_d_succession_plan_last_updated_by_hr_fkey] FOREIGN KEY ([last_updated_by_hr]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_succession_plan] ADD CONSTRAINT [hrms_d_succession_plan_potential_successor_id_fkey] FOREIGN KEY ([potential_successor_id]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_succession_plan] ADD CONSTRAINT [hrms_d_succession_plan_role_id_fkey] FOREIGN KEY ([role_id]) REFERENCES [dbo].[hrms_m_role]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_survey_response] ADD CONSTRAINT [hrms_d_survey_response_employee_id_fkey] FOREIGN KEY ([employee_id]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_survey_response] ADD CONSTRAINT [hrms_d_survey_response_survey_id_fkey] FOREIGN KEY ([survey_id]) REFERENCES [dbo].[hrms_m_survey_master]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_time_sheet] ADD CONSTRAINT [fk_timesheet_approved_by] FOREIGN KEY ([approved_by]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_time_sheet] ADD CONSTRAINT [fk_timesheet_submitted_by] FOREIGN KEY ([employee_id]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_time_sheet] ADD CONSTRAINT [hrms_d_time_sheet_project_id_fkey] FOREIGN KEY ([project_id]) REFERENCES [dbo].[hrms_m_projects]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_time_sheet] ADD CONSTRAINT [hrms_d_time_sheet_task_id_fkey] FOREIGN KEY ([task_id]) REFERENCES [dbo].[hrms_m_timesheet_task]([id]) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_training_feedback] ADD CONSTRAINT [hrms_d_training_feedback_employee_id_fkey] FOREIGN KEY ([employee_id]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_training_feedback] ADD CONSTRAINT [hrms_d_training_feedback_training_id_fkey] FOREIGN KEY ([training_id]) REFERENCES [dbo].[hrms_d_training_session]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_training_session] ADD CONSTRAINT [hrms_d_training_session_department_id_fkey] FOREIGN KEY ([department_id]) REFERENCES [dbo].[hrms_m_department_master]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_training_session] ADD CONSTRAINT [hrms_d_training_session_trainer_id_fkey] FOREIGN KEY ([trainer_id]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_travel_expense] ADD CONSTRAINT [hrms_d_travel_expense_approved_by_fkey] FOREIGN KEY ([approved_by]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_travel_expense] ADD CONSTRAINT [hrms_d_travel_expense_createdby_fkey] FOREIGN KEY ([createdby]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_travel_expense] ADD CONSTRAINT [hrms_d_travel_expense_currency_fkey] FOREIGN KEY ([currency]) REFERENCES [dbo].[hrms_m_currency_master]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_travel_expense] ADD CONSTRAINT [hrms_d_travel_expense_employee_id_fkey] FOREIGN KEY ([employee_id]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_work_life_event] ADD CONSTRAINT [hrms_d_work_life_event_employee_id_fkey] FOREIGN KEY ([employee_id]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_work_life_event] ADD CONSTRAINT [hrms_d_work_life_event_event_type_fkey] FOREIGN KEY ([event_type]) REFERENCES [dbo].[hrms_m_work_life_event_type]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_life_event] ADD CONSTRAINT [hrms_d_life_event_employee_id_fkey] FOREIGN KEY ([employee_id]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_life_event] ADD CONSTRAINT [hrms_d_life_event_event_type_id_fkey] FOREIGN KEY ([event_type_id]) REFERENCES [dbo].[hrms_m_work_life_event_type]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_m_branch_master] ADD CONSTRAINT [hrms_m_branch_master_company_id_fkey] FOREIGN KEY ([company_id]) REFERENCES [dbo].[hrms_m_company_master]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_m_company_master] ADD CONSTRAINT [hrms_m_company_master_country_id_fkey] FOREIGN KEY ([country_id]) REFERENCES [dbo].[hrms_m_country_master]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_m_pay_component] ADD CONSTRAINT [hrms_m_pay_component_cost_center1_id_fkey] FOREIGN KEY ([cost_center1_id]) REFERENCES [dbo].[hrms_m_costcenters]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_m_pay_component] ADD CONSTRAINT [hrms_m_pay_component_cost_center2_id_fkey] FOREIGN KEY ([cost_center2_id]) REFERENCES [dbo].[hrms_m_costcenters]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_m_pay_component] ADD CONSTRAINT [hrms_m_pay_component_cost_center3_id_fkey] FOREIGN KEY ([cost_center3_id]) REFERENCES [dbo].[hrms_m_costcenters]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_m_pay_component] ADD CONSTRAINT [hrms_m_pay_component_cost_center4_id_fkey] FOREIGN KEY ([cost_center4_id]) REFERENCES [dbo].[hrms_m_costcenters]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_m_pay_component] ADD CONSTRAINT [hrms_m_pay_component_cost_center5_id_fkey] FOREIGN KEY ([cost_center5_id]) REFERENCES [dbo].[hrms_m_costcenters]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_m_pay_component] ADD CONSTRAINT [hrms_m_pay_component_project_id_fkey] FOREIGN KEY ([project_id]) REFERENCES [dbo].[hrms_m_projects]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_m_pay_component] ADD CONSTRAINT [hrms_m_pay_component_tax_code_id_fkey] FOREIGN KEY ([tax_code_id]) REFERENCES [dbo].[hrms_m_tax_slab_rule]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_m_shift_master] ADD CONSTRAINT [hrms_m_shift_master_department_id_fkey] FOREIGN KEY ([department_id]) REFERENCES [dbo].[hrms_m_department_master]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_m_tax_regime] ADD CONSTRAINT [hrms_m_tax_regime_country_code_fkey] FOREIGN KEY ([country_code]) REFERENCES [dbo].[hrms_m_country_master]([id]) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_m_tax_slab_rule] ADD CONSTRAINT [hrms_m_tax_slab_rule_pay_component_id_fkey] FOREIGN KEY ([pay_component_id]) REFERENCES [dbo].[hrms_m_pay_component]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[crms_m_states] ADD CONSTRAINT [crms_m_states_country_code_fkey] FOREIGN KEY ([country_code]) REFERENCES [dbo].[hrms_m_country_master]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_employee_d_experiences] ADD CONSTRAINT [hrms_employee_d_experiences_employee_id_fkey] FOREIGN KEY ([employee_id]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_employee_d_educations] ADD CONSTRAINT [hrms_employee_d_educations_employee_id_fkey] FOREIGN KEY ([employee_id]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_kpi_progress_entry] ADD CONSTRAINT [hrms_d_kpi_progress_entry_employee_id_fkey] FOREIGN KEY ([employee_id]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_kpi_progress_entry] ADD CONSTRAINT [hrms_d_kpi_progress_entry_goal_id_fkey] FOREIGN KEY ([goal_id]) REFERENCES [dbo].[hrms_d_goal_sheet_assignment]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_kpi_progress_entry] ADD CONSTRAINT [hrms_d_kpi_progress_entry_reviewed_by_fkey] FOREIGN KEY ([reviewed_by]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_daily_attendance_entry] ADD CONSTRAINT [hrms_d_daily_attendance_entry_employee_id_fkey] FOREIGN KEY ([employee_id]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_monthly_payroll_processing] ADD CONSTRAINT [FK__hrms_d_mo__emplo__08A03ED0] FOREIGN KEY ([employee_id]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_arrear_adjustments] ADD CONSTRAINT [hrms_d_arrear_adjustments_employee_id_fkey] FOREIGN KEY ([employee_id]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_advance_payment_entry] ADD CONSTRAINT [hrms_d_advance_payment_entry_approved_by_fkey] FOREIGN KEY ([approved_by]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_advance_payment_entry] ADD CONSTRAINT [hrms_d_advance_payment_entry_employee_id_fkey] FOREIGN KEY ([employee_id]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_m_timesheet_task] ADD CONSTRAINT [hrms_m_timesheet_task_project_id_fkey] FOREIGN KEY ([project_id]) REFERENCES [dbo].[hrms_m_timesheet_project]([id]) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_goal_sheet_assignment] ADD CONSTRAINT [hrms_d_goal_sheet_assignment_appraisal_cycle_id_fkey] FOREIGN KEY ([appraisal_cycle_id]) REFERENCES [dbo].[hrms_d_appraisal]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_goal_sheet_assignment] ADD CONSTRAINT [hrms_d_goal_sheet_assignment_employee_id_fkey] FOREIGN KEY ([employee_id]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_goal_sheet_assignment] ADD CONSTRAINT [hrms_d_goal_sheet_assignment_goal_category_id_fkey] FOREIGN KEY ([goal_category_id]) REFERENCES [dbo].[hrms_m_goal_category]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_warning_letters] ADD CONSTRAINT [hrms_d_warning_letters_employee_id_fkey] FOREIGN KEY ([employee_id]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_warning_letters] ADD CONSTRAINT [hrms_d_warning_letters_issued_by_fkey] FOREIGN KEY ([issued_by]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_warning_letters] ADD CONSTRAINT [hrms_d_warning_letters_letter_type_fkey] FOREIGN KEY ([letter_type]) REFERENCES [dbo].[hrms_m_letter_type]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_employee_pay_component_assignment_header] ADD CONSTRAINT [FK__hrms_d_em__emplo__2A363CC5] FOREIGN KEY ([employee_id]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_employee_pay_component_assignment_header] ADD CONSTRAINT [hrms_d_employee_pay_component_assignment_header_branch_id_fkey] FOREIGN KEY ([branch_id]) REFERENCES [dbo].[hrms_m_branch_master]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_employee_pay_component_assignment_header] ADD CONSTRAINT [hrms_d_employee_pay_component_assignment_header_work_life_entry_fkey] FOREIGN KEY ([work_life_entry]) REFERENCES [dbo].[hrms_d_work_life_event]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_employee_pay_component_assignment_line] ADD CONSTRAINT [FK__hrms_d_em__paren__2EFAF1E2] FOREIGN KEY ([parent_id]) REFERENCES [dbo].[hrms_d_employee_pay_component_assignment_header]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_employee_pay_component_assignment_line] ADD CONSTRAINT [hrms_d_employee_pay_component_assignment_line_cost_center1_id_fkey] FOREIGN KEY ([cost_center1_id]) REFERENCES [dbo].[hrms_m_costcenters]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_employee_pay_component_assignment_line] ADD CONSTRAINT [hrms_d_employee_pay_component_assignment_line_cost_center2_id_fkey] FOREIGN KEY ([cost_center2_id]) REFERENCES [dbo].[hrms_m_costcenters]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_employee_pay_component_assignment_line] ADD CONSTRAINT [hrms_d_employee_pay_component_assignment_line_cost_center3_id_fkey] FOREIGN KEY ([cost_center3_id]) REFERENCES [dbo].[hrms_m_costcenters]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_employee_pay_component_assignment_line] ADD CONSTRAINT [hrms_d_employee_pay_component_assignment_line_cost_center4_id_fkey] FOREIGN KEY ([cost_center4_id]) REFERENCES [dbo].[hrms_m_costcenters]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_employee_pay_component_assignment_line] ADD CONSTRAINT [hrms_d_employee_pay_component_assignment_line_cost_center5_id_fkey] FOREIGN KEY ([cost_center5_id]) REFERENCES [dbo].[hrms_m_costcenters]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_employee_pay_component_assignment_line] ADD CONSTRAINT [hrms_d_employee_pay_component_assignment_line_currency_id_fkey] FOREIGN KEY ([currency_id]) REFERENCES [dbo].[hrms_m_currency_master]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_employee_pay_component_assignment_line] ADD CONSTRAINT [hrms_d_employee_pay_component_assignment_line_pay_component_id_fkey] FOREIGN KEY ([pay_component_id]) REFERENCES [dbo].[hrms_m_pay_component]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_employee_pay_component_assignment_line] ADD CONSTRAINT [hrms_d_employee_pay_component_assignment_line_project_id_fkey] FOREIGN KEY ([project_id]) REFERENCES [dbo].[hrms_m_projects]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_employee_payroll_adjustment] ADD CONSTRAINT [hrms_d_employee_payroll_adjustment_component_id_fkey] FOREIGN KEY ([component_id]) REFERENCES [dbo].[hrms_m_pay_component]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_employee_payroll_adjustment] ADD CONSTRAINT [hrms_d_employee_payroll_adjustment_cost_center1_id_fkey] FOREIGN KEY ([cost_center1_id]) REFERENCES [dbo].[hrms_m_costcenters]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_employee_payroll_adjustment] ADD CONSTRAINT [hrms_d_employee_payroll_adjustment_cost_center2_id_fkey] FOREIGN KEY ([cost_center2_id]) REFERENCES [dbo].[hrms_m_costcenters]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_employee_payroll_adjustment] ADD CONSTRAINT [hrms_d_employee_payroll_adjustment_cost_center3_id_fkey] FOREIGN KEY ([cost_center3_id]) REFERENCES [dbo].[hrms_m_costcenters]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_employee_payroll_adjustment] ADD CONSTRAINT [hrms_d_employee_payroll_adjustment_cost_center4_id_fkey] FOREIGN KEY ([cost_center4_id]) REFERENCES [dbo].[hrms_m_costcenters]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_employee_payroll_adjustment] ADD CONSTRAINT [hrms_d_employee_payroll_adjustment_cost_center5_id_fkey] FOREIGN KEY ([cost_center5_id]) REFERENCES [dbo].[hrms_m_costcenters]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_employee_payroll_adjustment] ADD CONSTRAINT [hrms_d_employee_payroll_adjustment_employee_id_fkey] FOREIGN KEY ([employee_id]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_employee_payroll_adjustment] ADD CONSTRAINT [hrms_d_employee_payroll_adjustment_hrms_m_currency_masterId_fkey] FOREIGN KEY ([hrms_m_currency_masterId]) REFERENCES [dbo].[hrms_m_currency_master]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_employee_payroll_adjustment] ADD CONSTRAINT [hrms_d_employee_payroll_adjustment_project_id_fkey] FOREIGN KEY ([project_id]) REFERENCES [dbo].[hrms_m_projects]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_employee_payroll_deduction_schedule] ADD CONSTRAINT [hrms_d_employee_payroll_deduction_schedule_component_id_fkey] FOREIGN KEY ([component_id]) REFERENCES [dbo].[hrms_m_pay_component]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_employee_payroll_deduction_schedule] ADD CONSTRAINT [hrms_d_employee_payroll_deduction_schedule_cost_center1_id_fkey] FOREIGN KEY ([cost_center1_id]) REFERENCES [dbo].[hrms_m_costcenters]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_employee_payroll_deduction_schedule] ADD CONSTRAINT [hrms_d_employee_payroll_deduction_schedule_cost_center2_id_fkey] FOREIGN KEY ([cost_center2_id]) REFERENCES [dbo].[hrms_m_costcenters]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_employee_payroll_deduction_schedule] ADD CONSTRAINT [hrms_d_employee_payroll_deduction_schedule_cost_center3_id_fkey] FOREIGN KEY ([cost_center3_id]) REFERENCES [dbo].[hrms_m_costcenters]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_employee_payroll_deduction_schedule] ADD CONSTRAINT [hrms_d_employee_payroll_deduction_schedule_cost_center4_id_fkey] FOREIGN KEY ([cost_center4_id]) REFERENCES [dbo].[hrms_m_costcenters]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_employee_payroll_deduction_schedule] ADD CONSTRAINT [hrms_d_employee_payroll_deduction_schedule_cost_center5_id_fkey] FOREIGN KEY ([cost_center5_id]) REFERENCES [dbo].[hrms_m_costcenters]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_employee_payroll_deduction_schedule] ADD CONSTRAINT [hrms_d_employee_payroll_deduction_schedule_employee_id_fkey] FOREIGN KEY ([employee_id]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_employee_payroll_deduction_schedule] ADD CONSTRAINT [hrms_d_employee_payroll_deduction_schedule_pay_currency_fkey] FOREIGN KEY ([pay_currency]) REFERENCES [dbo].[hrms_m_currency_master]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_employee_payroll_deduction_schedule] ADD CONSTRAINT [hrms_d_employee_payroll_deduction_schedule_project_id_fkey] FOREIGN KEY ([project_id]) REFERENCES [dbo].[hrms_m_projects]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_leave_balance_details] ADD CONSTRAINT [hrms_d_leave_balance_details_leave_type_id_fkey] FOREIGN KEY ([leave_type_id]) REFERENCES [dbo].[hrms_m_leave_type_master]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_leave_balance_details] ADD CONSTRAINT [hrms_d_leave_balance_details_parent_id_fkey] FOREIGN KEY ([parent_id]) REFERENCES [dbo].[hrms_d_leave_balance]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_loan_emi_schedule] ADD CONSTRAINT [hrms_d_loan_emi_schedule_employee_id_fkey] FOREIGN KEY ([employee_id]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_loan_emi_schedule] ADD CONSTRAINT [hrms_d_loan_emi_schedule_loan_request_id_fkey] FOREIGN KEY ([loan_request_id]) REFERENCES [dbo].[hrms_d_loan_request]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_loan_emi_schedule] ADD CONSTRAINT [hrms_d_loan_emi_schedule_payslip_id_fkey] FOREIGN KEY ([payslip_id]) REFERENCES [dbo].[hrms_d_payslip]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_finalsettlement_processing] ADD CONSTRAINT [FK__hrms_d_fi__compo__17E28260] FOREIGN KEY ([component_id]) REFERENCES [dbo].[hrms_m_pay_component]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_finalsettlement_processing] ADD CONSTRAINT [FK__hrms_d_fi__emplo__16EE5E27] FOREIGN KEY ([employee_id]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_midmonth_payroll_processing] ADD CONSTRAINT [FK__hrms_d_mi__compo__0D64F3ED] FOREIGN KEY ([component_id]) REFERENCES [dbo].[hrms_m_pay_component]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_midmonth_payroll_processing] ADD CONSTRAINT [hrms_d_midmonth_payroll_processing_cost_center1_id_fkey] FOREIGN KEY ([cost_center1_id]) REFERENCES [dbo].[hrms_m_costcenters]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_midmonth_payroll_processing] ADD CONSTRAINT [hrms_d_midmonth_payroll_processing_cost_center2_id_fkey] FOREIGN KEY ([cost_center2_id]) REFERENCES [dbo].[hrms_m_costcenters]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_midmonth_payroll_processing] ADD CONSTRAINT [hrms_d_midmonth_payroll_processing_cost_center3_id_fkey] FOREIGN KEY ([cost_center3_id]) REFERENCES [dbo].[hrms_m_costcenters]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_midmonth_payroll_processing] ADD CONSTRAINT [hrms_d_midmonth_payroll_processing_cost_center4_id_fkey] FOREIGN KEY ([cost_center4_id]) REFERENCES [dbo].[hrms_m_costcenters]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_midmonth_payroll_processing] ADD CONSTRAINT [hrms_d_midmonth_payroll_processing_cost_center5_id_fkey] FOREIGN KEY ([cost_center5_id]) REFERENCES [dbo].[hrms_m_costcenters]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_midmonth_payroll_processing] ADD CONSTRAINT [hrms_d_midmonth_payroll_processing_employee_id_fkey] FOREIGN KEY ([employee_id]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_midmonth_payroll_processing] ADD CONSTRAINT [hrms_d_midmonth_payroll_processing_hrms_m_currency_masterId_fkey] FOREIGN KEY ([hrms_m_currency_masterId]) REFERENCES [dbo].[hrms_m_currency_master]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_midmonth_payroll_processing] ADD CONSTRAINT [hrms_d_midmonth_payroll_processing_pay_currency_fkey] FOREIGN KEY ([pay_currency]) REFERENCES [dbo].[hrms_m_currency_master]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_midmonth_payroll_processing] ADD CONSTRAINT [hrms_d_midmonth_payroll_processing_project_id_fkey] FOREIGN KEY ([project_id]) REFERENCES [dbo].[hrms_m_projects]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_overtime_payroll_processing] ADD CONSTRAINT [FK__hrms_d_ov__emplo__2724C5F0] FOREIGN KEY ([employee_id]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_overtime_payroll_processing] ADD CONSTRAINT [hrms_d_overtime_payroll_processing_component_id_fkey] FOREIGN KEY ([component_id]) REFERENCES [dbo].[hrms_m_pay_component]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_overtime_payroll_processing] ADD CONSTRAINT [hrms_d_overtime_payroll_processing_pay_currency_fkey] FOREIGN KEY ([pay_currency]) REFERENCES [dbo].[hrms_m_currency_master]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_m_pay_component_formula] ADD CONSTRAINT [FK__hrms_m_pa__compo__3296789C] FOREIGN KEY ([component_id]) REFERENCES [dbo].[hrms_m_pay_component]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_candidate_master] ADD CONSTRAINT [hrms_d_candidate_master_application_source_fkey] FOREIGN KEY ([application_source]) REFERENCES [dbo].[hrms_m_application_source]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_candidate_master] ADD CONSTRAINT [hrms_d_candidate_master_applied_position_id_fkey] FOREIGN KEY ([applied_position_id]) REFERENCES [dbo].[hrms_m_designation_master]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_candidate_master] ADD CONSTRAINT [hrms_d_candidate_master_interview_stage_fkey] FOREIGN KEY ([interview_stage]) REFERENCES [dbo].[hrms_m_interview_stage]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_candidate_master] ADD CONSTRAINT [hrms_d_candidate_master_job_posting_fkey] FOREIGN KEY ([job_posting]) REFERENCES [dbo].[hrms_d_job_posting]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_candidate_master] ADD CONSTRAINT [hrms_d_candidate_master_department_id_fkey] FOREIGN KEY ([department_id]) REFERENCES [dbo].[hrms_m_department_master]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_candidate_documents] ADD CONSTRAINT [hrms_d_candidate_documents_candidate_id_fkey] FOREIGN KEY ([candidate_id]) REFERENCES [dbo].[hrms_d_candidate_master]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_candidate_documents] ADD CONSTRAINT [hrms_d_candidate_documents_type_id_fkey] FOREIGN KEY ([type_id]) REFERENCES [dbo].[hrms_m_document_type]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_m_interview_stage_remark] ADD CONSTRAINT [hrms_m_interview_stage_remark_candidate_id_fkey] FOREIGN KEY ([candidate_id]) REFERENCES [dbo].[hrms_d_candidate_master]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_m_interview_stage_remark] ADD CONSTRAINT [hrms_m_interview_stage_remark_employee_id_fkey] FOREIGN KEY ([employee_id]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_m_interview_stage_remark] ADD CONSTRAINT [hrms_m_interview_stage_remark_stage_id_fkey] FOREIGN KEY ([stage_id]) REFERENCES [dbo].[hrms_d_hiring_stage]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_m_projects] ADD CONSTRAINT [hrms_m_projects_employee_id_fkey] FOREIGN KEY ([employee_id]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_activity_log] ADD CONSTRAINT [hrms_d_activity_log_employee_id_fkey] FOREIGN KEY ([employee_id]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_m_loan_master] ADD CONSTRAINT [hrms_m_loan_master_amount_currency_fkey] FOREIGN KEY ([amount_currency]) REFERENCES [dbo].[hrms_m_currency_master]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_m_loan_master] ADD CONSTRAINT [hrms_m_loan_master_loan_type_id_fkey] FOREIGN KEY ([loan_type_id]) REFERENCES [dbo].[hrms_m_loan_type]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_m_tax_slab_rule1] ADD CONSTRAINT [FK__hrms_m_tax_slab_rule__2EFAF1E2] FOREIGN KEY ([parent_id]) REFERENCES [dbo].[hrms_m_tax_slab_rule]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_loan_cash_payment] ADD CONSTRAINT [hrms_d_loan_cash_payment_id_fkey] FOREIGN KEY ([loan_request_id]) REFERENCES [dbo].[hrms_d_loan_request]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_exit_clearance1] ADD CONSTRAINT [FK__hrms_d_exit_clearance1__2EFAF1E2] FOREIGN KEY ([parent_id]) REFERENCES [dbo].[hrms_d_exit_clearance]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_exit_clearance1] ADD CONSTRAINT [hrms_d_exit_clearance1_pay_component_id_fkey] FOREIGN KEY ([pay_component_id]) REFERENCES [dbo].[hrms_m_pay_component]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_default_configurations] ADD CONSTRAINT [hrms_d_default_configurations_country_fkey] FOREIGN KEY ([country]) REFERENCES [dbo].[hrms_m_country_master]([id]) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_default_configurations] ADD CONSTRAINT [hrms_d_default_configurations_state_fkey] FOREIGN KEY ([state]) REFERENCES [dbo].[crms_m_states]([id]) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_requests] ADD CONSTRAINT [hrms_d_requests_requester_id_fkey] FOREIGN KEY ([requester_id]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_approval_work_flow] ADD CONSTRAINT [hrms_d_approval_work_flow_approver_id_fkey] FOREIGN KEY ([approver_id]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_approval_work_flow] ADD CONSTRAINT [hrms_d_approval_work_flow_department_id_fkey] FOREIGN KEY ([department_id]) REFERENCES [dbo].[hrms_m_department_master]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_approval_work_flow] ADD CONSTRAINT [hrms_d_approval_work_flow_designation_id_fkey] FOREIGN KEY ([designation_id]) REFERENCES [dbo].[hrms_m_designation_master]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_requests_approval] ADD CONSTRAINT [hrms_d_requests_approval_request_id_fkey] FOREIGN KEY ([request_id]) REFERENCES [dbo].[hrms_d_requests]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_requests_approval] ADD CONSTRAINT [hrms_d_requests_approval_approver_id_fkey] FOREIGN KEY ([approver_id]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_employee_kpi] ADD CONSTRAINT [hrms_d_employee_kpi_employee_id_fkey] FOREIGN KEY ([employee_id]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_employee_kpi] ADD CONSTRAINT [hrms_d_employee_kpi_reviewer_id_fkey] FOREIGN KEY ([reviewer_id]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_employee_kpi] ADD CONSTRAINT [hrms_d_employee_kpi_last_kpi_id_fkey] FOREIGN KEY ([last_kpi_id]) REFERENCES [dbo].[hrms_d_employee_kpi]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_employee_kpi_contents] ADD CONSTRAINT [hrms_d_employee_kpi_contents_employee_kpi_id_fkey] FOREIGN KEY ([employee_kpi_id]) REFERENCES [dbo].[hrms_d_employee_kpi]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_employee_kpi_component_assignment] ADD CONSTRAINT [hrms_d_employee_kpi_component_assignment_employee_kpi_id_fkey] FOREIGN KEY ([employee_kpi_id]) REFERENCES [dbo].[hrms_d_employee_kpi]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_employee_kpi_component_assignment] ADD CONSTRAINT [hrms_d_employee_kpi_component_assignment_department_id_fkey] FOREIGN KEY ([department_id]) REFERENCES [dbo].[hrms_m_department_master]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_employee_kpi_component_assignment] ADD CONSTRAINT [hrms_d_employee_kpi_component_assignment_designation_id_fkey] FOREIGN KEY ([designation_id]) REFERENCES [dbo].[hrms_m_designation_master]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_employee_kpi_component_assignment] ADD CONSTRAINT [hrms_d_employee_kpi_component_assignment_successor_id_fkey] FOREIGN KEY ([successor_id]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_employee_kpi_component_lines] ADD CONSTRAINT [hrms_d_employee_kpi_component_lines_component_assignment_id_fkey] FOREIGN KEY ([component_assignment_id]) REFERENCES [dbo].[hrms_d_employee_kpi_component_assignment]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_employee_kpi_component_lines] ADD CONSTRAINT [hrms_d_employee_kpi_component_lines_pay_component_id_fkey] FOREIGN KEY ([pay_component_id]) REFERENCES [dbo].[hrms_m_pay_component]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_employee_kpi_attachments] ADD CONSTRAINT [hrms_d_employee_kpi_attachments_employee_kpi_id_fkey] FOREIGN KEY ([employee_kpi_id]) REFERENCES [dbo].[hrms_d_employee_kpi]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_employee_kpi_attachments] ADD CONSTRAINT [hrms_d_employee_kpi_attachments_document_type_id_fkey] FOREIGN KEY ([document_type_id]) REFERENCES [dbo].[hrms_m_document_type]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_notification_setup] ADD CONSTRAINT [hrms_d_notification_setup_template_id_fkey] FOREIGN KEY ([template_id]) REFERENCES [dbo].[hrms_d_templates]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_notification_assigned_user] ADD CONSTRAINT [hrms_d_notification_assigned_user_notification_setup_id_fkey] FOREIGN KEY ([notification_setup_id]) REFERENCES [dbo].[hrms_d_notification_setup]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_notification_assigned_user] ADD CONSTRAINT [hrms_d_notification_assigned_user_employee_id_fkey] FOREIGN KEY ([employee_id]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_alert_workflow_action] ADD CONSTRAINT [hrms_d_alert_workflow_action_workflow_id_fkey] FOREIGN KEY ([workflow_id]) REFERENCES [dbo].[hrms_d_alert_workflow]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_alert_workflow_action] ADD CONSTRAINT [hrms_d_alert_workflow_action_template_id_fkey] FOREIGN KEY ([template_id]) REFERENCES [dbo].[hrms_d_templates]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_alert_log] ADD CONSTRAINT [hrms_d_alert_log_workflow_id_fkey] FOREIGN KEY ([workflow_id]) REFERENCES [dbo].[hrms_d_alert_workflow]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_pay_component_contract] ADD CONSTRAINT [hrms_d_pay_component_contract_contract_id_fkey] FOREIGN KEY ([contract_id]) REFERENCES [dbo].[hrms_d_employment_contract]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_pay_component_contract] ADD CONSTRAINT [hrms_d_pay_component_contract_pay_component_id_fkey] FOREIGN KEY ([pay_component_id]) REFERENCES [dbo].[hrms_m_pay_component]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_announcement_log] ADD CONSTRAINT [hrms_d_announcement_log_announcement_id_fkey] FOREIGN KEY ([announcement_id]) REFERENCES [dbo].[hrms_d_announcement]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_early_leave] ADD CONSTRAINT [FK_hrms_d_early_leave_employee] FOREIGN KEY ([employee_id]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_early_leave] ADD CONSTRAINT [FK_hrms_d_early_leave_approved_by] FOREIGN KEY ([approved_by]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_payment_recovery] ADD CONSTRAINT [hrms_d_payment_recovery_employee_id_fkey] FOREIGN KEY ([employee_id]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_hiring_stage] ADD CONSTRAINT [hrms_d_hiring_stage_stage_id_fkey] FOREIGN KEY ([stage_id]) REFERENCES [dbo].[hrms_d_hiring_stage_value]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_candidate_hiring_stage] ADD CONSTRAINT [hrms_d_candidate_hiring_stage_job_posting_id_fkey] FOREIGN KEY ([job_posting_id]) REFERENCES [dbo].[hrms_d_job_posting]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_candidate_hiring_stage] ADD CONSTRAINT [hrms_d_candidate_hiring_stage_stage_id_fkey] FOREIGN KEY ([stage_id]) REFERENCES [dbo].[hrms_d_hiring_stage]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hrms_d_candidate_hiring_stage] ADD CONSTRAINT [hrms_d_candidate_hiring_stage_candidate_id_fkey] FOREIGN KEY ([candidate_id]) REFERENCES [dbo].[hrms_d_candidate_master]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[_AlertActionRecipients] ADD CONSTRAINT [_AlertActionRecipients_A_fkey] FOREIGN KEY ([A]) REFERENCES [dbo].[hrms_d_alert_workflow_action]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[_AlertActionRecipients] ADD CONSTRAINT [_AlertActionRecipients_B_fkey] FOREIGN KEY ([B]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[_AlertActionAlertRecipients] ADD CONSTRAINT [_AlertActionAlertRecipients_A_fkey] FOREIGN KEY ([A]) REFERENCES [dbo].[hrms_d_alert_workflow_action]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[_AlertActionAlertRecipients] ADD CONSTRAINT [_AlertActionAlertRecipients_B_fkey] FOREIGN KEY ([B]) REFERENCES [dbo].[hrms_d_employee]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
