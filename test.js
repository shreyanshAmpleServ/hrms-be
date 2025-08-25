// Handle file uploads
if (req.files?.profile_pic) {
  data.profile_pic = req.files.profile_pic[0].path;
}
if (req.files?.nssf_file) {
  data.nssf_file = req.files.nssf_file[0].path;
}
if (req.files?.nida_file) {
  data.nida_file = req.files.nida_file[0].path;
}
