function getPageContent() {
    // Get main content and remove unnecessary elements
    const article = document.querySelector('article') || document.body;
    const clone = article.cloneNode(true);
    
    // Remove scripts, styles, and other unnecessary elements
    const elementsToRemove = clone.querySelectorAll('script, style, nav, header, footer, aside');
    elementsToRemove.forEach(element => element.remove());
    
    // Get text content
    return clone.textContent.trim().replace(/\s+/g, ' ').slice(0, 5000);
  }