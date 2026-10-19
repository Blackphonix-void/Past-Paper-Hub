
import { supabase } from "./supabase.js";

const uploadForm = document.querySelector("#uploadForm");
const uploadStatus = document.querySelector("#uploadStatus");

uploadForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const file = document.querySelector("#paperFile").files[0];
  const school = document.querySelector("#schoolName").value.trim();
  const subject = document.querySelector("#subject").value.trim();
  const grade = Number(document.querySelector("#grade").value);
  const year = Number(document.querySelector("#year").value);

  if (!file) {
    uploadStatus.textContent = "Choose a PDF file.";
    return;
  }

  if (
    file.type !== "application/pdf" ||
    file.size === 0 ||
    file.size > 10 * 1024 * 1024
  ) {
    uploadStatus.textContent =
      "Choose a PDF smaller than 10 MB.";
    return;
  }

  if (
    !school ||
    !subject ||
    !Number.isInteger(grade) ||
    grade < 8 ||
    grade > 12 ||
    !Number.isInteger(year) ||
    year < 2000 ||
    year > 2100
  ) {
    uploadStatus.textContent =
      "Check the school, subject, grade and year.";
    return;
  }

  const submitButton = uploadForm.querySelector(
    'button[type="submit"]'
  );

  submitButton.disabled = true;
  uploadStatus.textContent = "Uploading...";

  const filePath =
    `pending/${crypto.randomUUID()}.pdf`;

  try {
    // Upload PDF to private Supabase Storage
    const { error: uploadError } = await supabase
      .storage
      .from("past-papers")
      .upload(filePath, file, {
        contentType: "application/pdf",
        upsert: false
      });

    if (uploadError) throw uploadError;

    // Save its information for administrator review
    const { error: databaseError } = await supabase
      .from("papers")
      .insert({
        school_name: school,
        subject: subject,
        grade: grade,
        exam_year: year,
        file_path: filePath,
        original_filename: file.name,
        status: "pending"
      });

    if (databaseError) {
      // Remove the file if its database record fails
      await supabase.storage
        .from("past-papers")
        .remove([filePath]);

      throw databaseError;
    }

    uploadStatus.textContent =
      "Paper submitted! It must be approved before publication.";

    uploadForm.reset();
  } catch (error) {
    console.error("Upload failed:", error);
    uploadStatus.textContent =
      "Upload failed. Please try again later.";
  } finally {
    submitButton.disabled = false;
  }
});
