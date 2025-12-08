# HRMS Application - Issues List

## Component Assignment (Header)

### Issue #1: Payroll Rule Field

- **Description**: Add "Payroll Rule" field same as Employee KPI (Component Assignment)
- **Requirement**: User can enter from this form, as well as if the Data is entered through another form, it should also appear here
- **Status**: ⏳ Pending

### Issue #2: Effective From Field

- **Description**: Add "Effective From" field same as Employee KPI (Component Assignment)
- **Requirement**: User can enter from this form, as well as if the Data is entered through another form, it should also appear here
- **Status**: ⏳ Pending

### Issue #3: Effective To Field

- **Description**: Add "Effective To" field same as Employee KPI (Component Assignment)
- **Requirement**: User can enter from this form, as well as if the Data is entered through another form, it should also appear here
- **Status**: ⏳ Pending

## Candidate Module

### Issue #4: Date Display Issue

- **Description**: Dates are coming -1 day from the entered date
- **Status**: ⏳ Pending
- **Priority**: 🔴 High

## Hiring Stages Interview Status Update

### Issue #5: Rating Field

- **Description**: The Rating should give option to choose whole numbers only
- **Status**: ⏳ Pending

### Issue #6: Date Value Prefix

- **Description**: Date value is having prefix of some number
- **Status**: ⏳ Pending
- **Priority**: 🔴 High

## Employee KPI (Content)

### Issue #7: Delete Button Functionality

- **Description**: When the delete button is clicked, it removes the last record instead of the real record
- **Status**: ⏳ Pending
- **Priority**: 🔴 High

### Issue #8: KPI Drawing Type Change

- **Description**: When changing the KPI drawing Type, the rows are getting deleted from the bottom
- **Status**: ⏳ Pending
- **Priority**: 🔴 High

### Issue #11: Weightage Validation

- **Description**: Total Sum of Weightage% should be equal to 100
- **Status**: ⏳ Pending
- **Priority**: 🟡 Medium

## Employee KPI (Component Assignment)

### Issue #9: Auto-populate Component Assignment

- **Description**: The active Component Assignment info should populate automatically when user enables the checkbox "revise Component Assignment"
- **Status**: ⏳ Pending

## Employee KPI (General)

### Issue #10: Update Permission

- **Description**: Provide option to update if the Document did not go through the approval, or if it is not approved yet. If the document went through the approval, it should not be editable
- **Status**: ⏳ Pending
- **Priority**: 🟡 Medium

## Leave Balance

### Issue #12: Leave Type Changes Not Saving

- **Description**: While selecting different Leave Type and updating the form, the change is not getting saved
- **Status**: 🔄 In Progress
- **Priority**: 🔴 High
- **File**: `src/pages/crm-settings/leaveAndAttendance/LeaveBalance/modal/AddEditModal.js`

## Leave Application

### Issue #13: Testing Dependency

- **Description**: Its dependency is the Leave balance for testing
- **Status**: ⏳ Pending
- **Note**: Blocked by Issue #12

---

## Summary

- **Total Issues**: 13
- **Pending**: 12
- **In Progress**: 1
- **High Priority**: 6
- **Medium Priority**: 2

## Notes

- Issue #12 is currently being worked on
- Issue #13 is blocked until Issue #12 is resolved
- Multiple issues in Employee KPI module need attention
