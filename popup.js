document.addEventListener('DOMContentLoaded', function() {
  // Remove any hardcoded API key
  chrome.storage.local.get(['apiKey'], function(result) {
    if (result.apiKey) {
      document.getElementById('apiKey').value = result.apiKey;
    }
  });
  
  document.getElementById('summarize').addEventListener('click', async function() {
    const apiKey = document.getElementById('apiKey').value;
    const loader = document.getElementById('loader');
    const summaryDiv = document.getElementById('summary');
    const summarizeButton = document.getElementById('summarize');
    
    // Show loading state
    loader.style.display = 'block';
    summaryDiv.textContent = '';
    summarizeButton.disabled = true;
    
    // Save API key
    chrome.storage.local.set({ apiKey: apiKey });

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Get page content
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: getPageContent,
    }, async function(results) {
      const content = results[0].result;
      
      try {
        const summary = await summarizeText(content, apiKey);
        summaryDiv.textContent = summary;
      } catch (error) {
        summaryDiv.textContent = 'Error: ' + error.message;
      } finally {
        // Hide loading state
        loader.style.display = 'none';
        summarizeButton.disabled = false;
      }
    });
  });
});

async function summarizeText(text, apiKey) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that summarizes text concisely."
        },
        {
          role: "user",
          content: `Please summarize the following text in a few sentences: ${text}`
        }
      ],
      max_tokens: 150
    })
  });

  const data = await response.json();
  if (data.error) {
    throw new Error(data.error.message);
  }
  return data.choices[0].message.content;
}

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