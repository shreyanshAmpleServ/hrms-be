const bulkDownloadOfferLetters = async (req, res, next) => {
  try {
    const {
      candidate_ids, // "1,2,3" or ["1","2","3"]
      department_ids, // "5,6" or ["5","6"]
      designation_ids, // "10,11" or ["10","11"]
      startDate,
      endDate,
      status,
    } = req.query;

    const filters = {};

    // Filter by multiple candidates
    if (candidate_ids) {
      const candidateArray = Array.isArray(candidate_ids)
        ? candidate_ids.map(Number)
        : candidate_ids.split(",").map((id) => Number(id.trim()));

      filters.candidate_id = { in: candidateArray };
    }

    // Filter by status
    if (status) {
      filters.status = status;
    }

    // Filter by date range
    if (startDate && endDate) {
      filters.offer_date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    // Build advanced filters for department and designation
    const advancedFilters = {};

    // Filter by multiple departments
    if (department_ids) {
      const deptArray = Array.isArray(department_ids)
        ? department_ids.map(Number)
        : department_ids.split(",").map((id) => Number(id.trim()));

      advancedFilters.department_id = { in: deptArray };
    }

    // Filter by multiple designations
    if (designation_ids) {
      const desigArray = Array.isArray(designation_ids)
        ? designation_ids.map(Number)
        : designation_ids.split(",").map((id) => Number(id.trim()));

      advancedFilters.designation_id = { in: desigArray };
    }

    const jobId = uuidv4();

    const job = await offerLetterQueue.add({
      userId: req.user.id,
      filters: filters,
      advancedFilters: advancedFilters, // Pass department/designation filters
      jobId: jobId,
    });

    console.log(`Bulk download job created: ${job.id}`);
    console.log(`Filters:`, filters);
    console.log(`Advanced filters:`, advancedFilters);

    res
      .status(202)
      .success("Bulk download started. Use job ID to check progress.", {
        jobId: job.id,
        statusUrl: `/api/offer-letter/bulk-download/status/${job.id}`,
        appliedFilters: {
          candidates: candidate_ids || "All",
          departments: department_ids || "All",
          designations: designation_ids || "All",
          status: status || "All",
          dateRange:
            startDate && endDate ? `${startDate} to ${endDate}` : "All",
        },
      });
  } catch (error) {
    next(error);
  }
};
