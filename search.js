
import { supabase } from "./supabase.js";

const searchInput = document.querySelector("#searchInput");
const gradeFilter = document.querySelector("#gradeFilter");
const yearFilter = document.querySelector("#yearFilter");
const resultsContainer = document.querySelector("#paperResults");
const statusMessage = document.querySelector("#searchStatus");
const schoolSuggestions = document.querySelector("#schoolSuggestions");

let searchTimer;
let suggestionTimer;
let searchRequest = 0;
let suggestionRequest = 0;

// Stop if the required HTML elements are missing.
if (
  !searchInput ||
  !gradeFilter ||
  !yearFilter ||
  !resultsContainer ||
  !statusMessage ||
  !schoolSuggestions
) {
  console.error("Check your search HTML element IDs.");
} else {
  // Search and autocomplete as the visitor types.
  searchInput.addEventListener("input", () => {
    clearTimeout(searchTimer);
    clearTimeout(suggestionTimer);

    suggestionTimer = setTimeout(() => {
      loadSchoolSuggestions(searchInput.value.trim());
    }, 250);

    searchTimer = setTimeout(searchPapers, 350);
  });

  gradeFilter.addEventListener("change", searchPapers);
  yearFilter.addEventListener("change", searchPapers);

  searchPapers();
}

// =====================================
// SCHOOL AUTOCOMPLETE
// =====================================
async function loadSchoolSuggestions(term) {
  const requestId = ++suggestionRequest;
  schoolSuggestions.replaceChildren();

  if (term.length < 2) return;

  try {
    const { data, error } = await supabase
      .from("schools")
      .select("school_name")
      .ilike("school_name", `%${term}%`)
      .order("school_name", { ascending: true })
      .limit(10);

    if (error) throw error;
    if (requestId !== suggestionRequest) return;

    for (const school of data || []) {
      const option = document.createElement("option");
      option.value = school.school_name;
      schoolSuggestions.appendChild(option);
    }
  } catch (error) {
    console.error("School suggestions failed:", error);
  }
}

// =====================================
// SEARCH APPROVED PAST PAPERS
// =====================================
async function searchPapers() {
  const requestId = ++searchRequest;
  const term = searchInput.value.trim();
  const grade = gradeFilter.value;
  const year = yearFilter.value;

  resultsContainer.replaceChildren();
  statusMessage.textContent = "Searching...";

  try {
    let query = supabase
      .from("papers")
      .select(
        "id, school_name, subject, grade, exam_year, file_path"
      )
      .eq("status", "approved")
      .order("school_name", { ascending: true })
      .order("exam_year", { ascending: false })
      .limit(50);

    if (term) {
      // Escape characters that can affect the OR filter.
      const safeTerm = term.replace(
        /[%_,().]/g,
        ""
      ).trim();

      if (!safeTerm) {
        statusMessage.textContent = "Enter a valid search.";
        return;
      }

      query = query.or(
        `school_name.ilike.%${safeTerm}%,subject.ilike.%${safeTerm}%`
      );
    }

    if (grade) {
      query = query.eq("grade", Number(grade));
    }

    if (year) {
      query = query.eq("exam_year", Number(year));
    }

    const { data, error } = await query;

    if (error) throw error;
    if (requestId !== searchRequest) return;

    displayPapers(data || []);
    statusMessage.textContent =
      `${data.length} paper(s) found.`;
  } catch (error) {
    if (requestId !== searchRequest) return;

    console.error("Search failed:", error);
    statusMessage.textContent =
      "Could not search. Please try again.";
  }
}

// =====================================
// DISPLAY SEARCH RESULTS
// =====================================
function displayPapers(papers) {
  resultsContainer.replaceChildren();

  if (papers.length === 0) {
    resultsContainer.textContent =
      "No approved papers found. Try another search.";
    return;
  }

  for (const paper of papers) {
    const card = document.createElement("article");
    card.className = "paper-card";

    const title = document.createElement("h3");
    title.textContent =
      `${paper.school_name} — ${paper.subject}`;

    const details = document.createElement("p");
    details.textContent =
      `Grade ${paper.grade} | ${paper.exam_year}`;

    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "Open paper";

    button.addEventListener("click", () => {
      openPaper(paper.id, button);
    });

    card.append(title, details, button);
    resultsContainer.appendChild(card);
  }
}

// =====================================
// OPEN APPROVED PDF
// =====================================
async function openPaper(paperId, button) {
  button.disabled = true;
  button.textContent = "Opening...";

  try {
    const { data: paper, error } = await supabase
      .from("papers")
      .select("file_path")
      .eq("id", paperId)
      .eq("status", "approved")
      .single();

    if (error || !paper) {
      throw new Error("Paper is unavailable.");
    }

    const { data, error: urlError } = await supabase
      .storage
      .from("past-papers")
      .createSignedUrl(paper.file_path, 300);

    if (urlError || !data?.signedUrl) {
      throw new Error("Could not create a viewing link.");
    }

    window.location.assign(data.signedUrl);
  } catch (error) {
    console.error("Opening paper failed:", error);
    statusMessage.textContent =
      "Unable to open this paper. Please try again.";
  } finally {
    button.disabled = false;
    button.textContent = "Open paper";
  }
}
