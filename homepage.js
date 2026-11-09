/**
 * FunTools - Homepage Controller
 */
$(document).ready(function() {
  // =========================================================================
  // Live Preview Box Dynamic Updates
  // =========================================================================
  const $previewBox = $("#previewBox");
  const $cardImg = $("#cardimg");
  const $previewTitle = $("#previewTitle");
  const $previewDesc = $("#previewDesc");
  const $previewTags = $("#previewTags");
  const $previewLaunchBtn = $("#previewLaunchBtn");
  const $cards = $(".card");

  function updatePreview($card) {
    if (!$card || $card.length === 0) return;

    const title = $card.data("title") || $card.find("h3").text();
    const info = $card.data("info") || $card.find("p").text();
    const img = $card.data("img");
    const link = $card.data("link") || $card.attr("href");
    const tags = ($card.data("tags") || "").split(",").filter(Boolean);

    // Apply smooth fade
    $cardImg.css("opacity", "0.6");
    $previewTitle.css("opacity", "0.6");

    setTimeout(() => {
      if (img) {
        $cardImg.css("background-image", `url('${img}')`);
      }
      $previewTitle.text(title);
      $previewDesc.text(info);
      $previewLaunchBtn.attr("href", link);

      $previewTags.empty();
      tags.forEach(tag => {
        $previewTags.append(`<span class="tag">${tag.trim()}</span>`);
      });

      $cardImg.css("opacity", "1");
      $previewTitle.css("opacity", "1");
    }, 120);
  }

  // Set default initial preview to the first card
  if ($cards.length > 0) {
    updatePreview($cards.first());
  }

  // Hover and focus listener for cards
  $cards.on("mouseenter focusin", function() {
    updatePreview($(this));
  });

  // =========================================================================
  // About Modal Panel
  // =========================================================================
  const $aboutPanel = $("#aboutpanel");

  function openAboutModal(e) {
    if (e) e.preventDefault();
    $aboutPanel.addClass("show");
    $("body").css("overflow", "hidden");
  }

  function closeAboutModal() {
    $aboutPanel.removeClass("show");
    $("body").css("overflow", "");
  }

  $("#about").on("click", openAboutModal);
  $("#closebtn, #closebtn-action").on("click", closeAboutModal);

  // Close when clicking outside content
  $aboutPanel.on("click", function(e) {
    if ($(e.target).is("#aboutpanel")) {
      closeAboutModal();
    }
  });

  // Close on Escape key
  $(document).on("keydown", function(e) {
    if (e.key === "Escape" && $aboutPanel.hasClass("show")) {
      closeAboutModal();
    }
  });
});
