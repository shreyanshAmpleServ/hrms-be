     include: {
        hrms_time_sheets_submitted: {
          select: { full_name: true, id: true },
        },
        hrms_time_sheets_approved: {
          select: { full_name: true, id: true },
        },
        time_sheet_project: true,
        time_sheet_task: true,
      },