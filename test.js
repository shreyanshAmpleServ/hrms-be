// Add to offerLatterController.js
const path = require("path");
const fs = require("fs");
const { generateOfferLetterPDF } = require("../../utils/offerLetterPDF");

const downloadOfferLetterPDF = async (req, res, next) => {
  try {
    const offerId = req.params.id;

    // Fetch offer letter data with pay components
    const offerData = await offerLatterService.getOfferLetterForPDF(offerId);

    // Generate unique filename
    const fileName = `offer_letter_${offerId}_${Date.now()}.pdf`;
    const filePath = path.join(
      process.cwd(),
      "uploads",
      "offer-letters",
      fileName
    );

    // Generate PDF
    await generateOfferLetterPDF(offerData, filePath);

    // Send file as download
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error("Error sending file:", err);
        next(err);
      }

      // Optional: Delete file after sending
      setTimeout(() => {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }, 5000);
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  // ... existing exports
  downloadOfferLetterPDF,
};
