(function () {
  // Process post images: [wide] class and alt-text captions.
  document.querySelectorAll('.post-body img').forEach(function (img) {
    var isWide = img.alt && img.alt.includes('[wide]');
    if (isWide) {
      img.alt = img.alt.replace('[wide]', '').trim();
    }

    // Wrap in figure with caption if alt text exists
    if (img.alt && img.parentNode.tagName !== 'FIGURE') {
      var figure = document.createElement('figure');
      if (isWide) figure.classList.add('image-wide');
      var caption = document.createElement('figcaption');
      caption.className = 'caption';
      caption.textContent = img.alt;
      img.parentNode.insertBefore(figure, img);
      figure.appendChild(img);
      figure.appendChild(caption);
    } else if (isWide) {
      img.classList.add('image-wide');
    }
  });

  // Heading anchor links
  document.querySelectorAll('.post-body h1, .post-body h2, .post-body h3, .post-body h4, .post-body h5, .post-body h6').forEach(function (el) {
    el.addEventListener('click', function () {
      if (el.id) {
        window.location.hash = el.id;
      }
    });
  });
})();
