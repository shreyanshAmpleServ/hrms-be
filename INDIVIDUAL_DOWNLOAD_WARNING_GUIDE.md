# Individual Payslip Download Warning System

## Overview

The download warning system has been extended to individual payslip downloads. When users try to download a payslip that has already been downloaded, they receive a warning with options to proceed or cancel.

## How It Works

### 1. Individual Download Tracking

- Uses the same `is_printed` field in `hrms_d_monthly_payroll_processing` table
- Marks individual payslip records as `'Y'` when successfully downloaded
- Tracks download date and user in `updatedate` and `updatedby` fields

### 2. Warning System for Individual Downloads

- Checks if the specific payslip has already been downloaded
- Shows detailed information about when and by whom it was downloaded
- Provides force download option to bypass warning

## API Usage

### Normal Individual Download Request

```javascript
GET /api/monthly-payroll-download/download?employee_id=59&payroll_month=1&payroll_year=2026
```

### Response When Payslip Already Downloaded

```json
{
  "success": true,
  "message": "This payslip has already been downloaded",
  "data": {
    "warning": true,
    "needsConfirmation": true,
    "alreadyDownloaded": {
      "employee_id": 59,
      "payroll_month": 1,
      "payroll_year": 2026,
      "full_name": "John Doe",
      "employee_code": "EMP059",
      "download_date": "2026-01-21 10:08:12",
      "downloaded_by": 5
    },
    "downloadInfo": {
      "employee_id": "59",
      "payroll_month": "1",
      "payroll_year": "2026"
    }
  }
}
```

### Force Download (Bypass Warning)

```javascript
GET /api/monthly-payroll-download/download?employee_id=59&payroll_month=1&payroll_year=2026&force_download=true
```

### Response for Force Download

```json
{
  "url": "https://your-backblaze-url.com/payslip_59_1_2026.pdf?token=..."
}
```

## Database Operations

### Check Individual Download Status

```sql
SELECT
  mp.employee_id,
  mp.payroll_month,
  mp.payroll_year,
  mp.is_printed,
  e.full_name,
  e.employee_code,
  FORMAT(mp.updatedate, 'yyyy-MM-dd HH:mm:ss') as download_date,
  mp.updatedby as downloaded_by
FROM hrms_d_monthly_payroll_processing mp
LEFT JOIN hrms_d_employee e ON mp.employee_id = e.id
WHERE mp.employee_id = 59
  AND mp.payroll_month = 1
  AND mp.payroll_year = 2026
  AND mp.is_printed = 'Y'
```

### Mark Individual Payslip as Downloaded

```sql
UPDATE hrms_d_monthly_payroll_processing
SET is_printed = 'Y',
    updatedate = GETDATE(),
    updatedby = 5
WHERE employee_id = 59
  AND payroll_month = 1
  AND payroll_year = 2026
  AND (is_printed IS NULL OR is_printed = 'N')
```

## Frontend Integration

### Step 1: Check for Warning

```javascript
async function downloadPayslip(employeeId, payrollMonth, payrollYear) {
  const response = await fetch(
    `/api/monthly-payroll-download/download?employee_id=${employeeId}&payroll_month=${payrollMonth}&payroll_year=${payrollYear}`,
    {
      method: "GET",
      headers: {
        Authorization: "Bearer YOUR_TOKEN",
      },
    },
  );

  const result = await response.json();

  if (result.data?.warning) {
    // Show warning dialog
    showIndividualDownloadWarning(result.data);
    return false; // Don't proceed yet
  }

  // No warning, proceed with download
  window.open(result.url, "_blank");
  return true;
}
```

### Step 2: Show Warning Dialog

```javascript
function showIndividualDownloadWarning(warningData) {
  const { alreadyDownloaded, downloadInfo } = warningData;

  const message = `
    This payslip has already been downloaded:
    
    Employee: ${alreadyDownloaded.full_name} (${alreadyDownloaded.employee_code})
    Period: ${alreadyDownloaded.payroll_month}/${alreadyDownloaded.payroll_year}
    Downloaded on: ${alreadyDownloaded.download_date}
    
    Do you want to download it again?
  `;

  if (confirm(message)) {
    // User confirmed, proceed with force download
    forceDownloadPayslip(downloadInfo);
  }
}
```

### Step 3: Force Download

```javascript
async function forceDownloadPayslip(downloadInfo) {
  const { employee_id, payroll_month, payroll_year } = downloadInfo;

  const response = await fetch(
    `/api/monthly-payroll-download/download?employee_id=${employee_id}&payroll_month=${payroll_month}&payroll_year=${payroll_year}&force_download=true`,
    {
      method: "GET",
      headers: {
        Authorization: "Bearer YOUR_TOKEN",
      },
    },
  );

  const result = await response.json();

  // Open the PDF in new tab
  window.open(result.url, "_blank");
}
```

## Comparison: Bulk vs Individual Downloads

| Feature          | Bulk Download                          | Individual Download                 |
| ---------------- | -------------------------------------- | ----------------------------------- |
| Warning Trigger  | Any record in batch already downloaded | Specific payslip already downloaded |
| Warning Response | Shows count and sample records         | Shows specific payslip details      |
| Force Parameter  | `force_download=true`                  | `force_download=true`               |
| Tracking         | Updates multiple records               | Updates single record               |
| Response Format  | Job-based (async)                      | Direct URL (sync)                   |

## Complete API Endpoints

### Individual Download with Warning

```javascript
// Check and get warning if needed
GET /api/monthly-payroll-download/download?employee_id=59&payroll_month=1&payroll_year=2026

// Force download (bypass warning)
GET /api/monthly-payroll-download/download?employee_id=59&payroll_month=1&payroll_year=2026&force_download=true
```

### Bulk Download with Warning

```javascript
// Check and get warning if needed
POST /api/monthly-payroll/bulk-download
{
  "employee_ids": [59, 62, 65],
  "payroll_month_from": "1",
  "payroll_year_from": "2026"
}

// Force download (bypass warning)
POST /api/monthly-payroll/bulk-download?force_download=true
{
  "employee_ids": [59, 62, 65],
  "payroll_month_from": "1",
  "payroll_year_from": "2026"
}
```

## Benefits

✅ **Consistent Experience**: Same warning behavior for both individual and bulk downloads
✅ **Precise Tracking**: Tracks each individual payslip download separately
✅ **User Control**: Gives users choice while informing them
✅ **Audit Trail**: Complete download history for compliance
✅ **Flexible**: Force download option available when needed
✅ **Efficient**: Uses existing database structure

## Error Handling

- **Database Errors**: Gracefully handled, won't prevent downloads
- **Missing Records**: Proper validation before checking download status
- **Invalid Parameters**: Clear error messages for required fields
- **Force Download**: Always works regardless of warning system state

## Use Cases

- **Re-issuing Payslips**: When employees need duplicate copies
- **Corrections**: Re-downloading after payroll corrections
- **Audits**: Providing payslips for audit purposes
- **System Testing**: Testing download functionality
- **Employee Requests**: Honoring employee requests for additional copies
