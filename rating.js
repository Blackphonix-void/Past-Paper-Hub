
const ratingPopup = document.querySelector("#ratingPopup");
const closeRating = document.querySelector("#closeRating");
const stars = document.querySelectorAll(".star");
const ratingText = document.querySelector("#ratingText");
const ratingComment = document.querySelector("#ratingComment");
const submitRating = document.querySelector("#submitRating");
const ratingMessage = document.querySelector("#ratingMessage");

let selectedRating = 0;

const ratingLabels = {
    1: "Poor",
    2: "Fair",
    3: "Good",
    4: "Very good",
    5: "Excellent!"
};

function showRatingPopup() {
    ratingPopup.style.display = "flex";
}

function hideRatingPopup() {
    ratingPopup.style.display = "none";
}

// Select a star rating
stars.forEach((star) => {
    star.addEventListener("click", () => {
        selectedRating = Number(star.dataset.rating);

        stars.forEach((item) => {
            const isSelected =
                Number(item.dataset.rating) <= selectedRating;

            item.classList.toggle("active", isSelected);
            item.setAttribute("aria-pressed", String(isSelected));
        });

        ratingText.textContent = ratingLabels[selectedRating];
        ratingMessage.textContent = "";
    });
});

// Close the popup
closeRating.addEventListener("click", hideRatingPopup);

ratingPopup.addEventListener("click", (event) => {
    if (event.target === ratingPopup) {
        hideRatingPopup();
    }
});

// Submit the rating
submitRating.addEventListener("click", () => {
    if (selectedRating === 0) {
        ratingMessage.textContent = "Please select a star rating first.";
        return;
    }

    const feedback = {
        rating: selectedRating,
        comment: ratingComment.value.trim(),
        date: new Date().toISOString()
    };

    // Demo only: saves on this browser, not to a shared database.
    const savedRatings = JSON.parse(
        localStorage.getItem("websiteRatings") || "[]"
    );

    savedRatings.push(feedback);
    localStorage.setItem("websiteRatings", JSON.stringify(savedRatings));

    ratingMessage.textContent =
        "Thank you for rating PastPaper Hub!";

    submitRating.disabled = true;

    setTimeout(() => {
        hideRatingPopup();
        submitRating.disabled = false;
    }, 1500);
});

// Show the popup after 8 seconds
window.addEventListener("load", () => {
    setTimeout(showRatingPopup, 8000);
});
