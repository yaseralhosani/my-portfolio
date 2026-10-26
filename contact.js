(() => {
  'use strict';

  const form = document.querySelector('#contact-form');
  if (!form) return;

  const config = window.PORTFOLIO || {};
  const nameField = document.querySelector('#contact-name');
  const emailField = document.querySelector('#contact-email');
  const messageField = document.querySelector('#contact-message');
  const honeyField = document.querySelector('#contact-website');
  const submitButton = document.querySelector('#contact-submit');
  const submitLabel = submitButton.querySelector('.submit-label');
  const status = document.querySelector('#form-status');
  const deliveryNote = document.querySelector('#form-delivery-note');
  const liveContactUrl = 'https://yaseralhosani.github.io/my-portfolio/#contact';
  const recipient = String(config.email || '').trim();
  const override = String(config.contactFormEndpoint || '').trim();
  const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient);
  const originalLabel = submitLabel.textContent;
  const visibleFields = [nameField, emailField, messageField];
  let endpoint;
  let configurationError = '';
  let submitting = false;

  status.tabIndex = -1;

  function setStatus(message, state, focus = false) {
    status.textContent = message;
    status.dataset.state = state;
    if (focus) status.focus({ preventScroll: true });
  }

  function showLiveSiteMessage(focus = false) {
    setStatus('To send a message, open ', 'error');
    const link = document.createElement('a');
    link.href = liveContactUrl;
    link.textContent = 'the live portfolio';
    status.append(link, '. Forms cannot send from a directly opened HTML file.');
    if (focus) status.focus({ preventScroll: true });
  }

  try {
    if (override) {
      endpoint = new URL(override);
      if (endpoint.protocol !== 'https:' || endpoint.username || endpoint.password) throw new Error();
    } else if (emailIsValid) {
      endpoint = new URL(`https://formsubmit.co/ajax/${encodeURIComponent(recipient)}`);
    } else {
      configurationError = 'Message delivery is not configured yet. Please use one of the contact links.';
    }
  } catch {
    configurationError = 'The contact form endpoint is invalid. Please use one of the contact links.';
  }

  const isFormSubmit = endpoint && ['formsubmit.co', 'www.formsubmit.co'].includes(endpoint.hostname);
  const isFormspree = endpoint && endpoint.hostname === 'formspree.io';
  if (isFormSubmit) {
    // Accept either FormSubmit's regular action URL or its AJAX endpoint.
    if (!endpoint.pathname.startsWith('/ajax/')) endpoint.pathname = `/ajax${endpoint.pathname}`;
    if (!endpoint.pathname.slice('/ajax/'.length)) configurationError = 'The contact form endpoint is incomplete. Please use one of the contact links.';
  }

  if (endpoint && !configurationError) {
    const nativeEndpoint = new URL(endpoint.href);
    if (isFormSubmit) nativeEndpoint.pathname = nativeEndpoint.pathname.replace(/^\/ajax\//, '/');
    form.action = nativeEndpoint.href;
    const providerLink = document.createElement('a');
    providerLink.href = isFormSubmit ? 'https://formsubmit.co/' : isFormspree ? 'https://formspree.io/' : endpoint.origin;
    providerLink.textContent = isFormSubmit ? 'FormSubmit' : isFormspree ? 'Formspree' : endpoint.hostname;
    providerLink.target = '_blank';
    providerLink.rel = 'noopener noreferrer';
    deliveryNote.replaceChildren('Messages are sent via ', providerLink, '.');
  }

  const isLocalFile = location.protocol === 'file:';
  const blocked = isLocalFile || Boolean(configurationError);
  submitButton.disabled = blocked;
  if (isLocalFile) showLiveSiteMessage();
  else if (configurationError) setStatus(configurationError, 'error');

  [nameField, messageField].forEach(field => field.addEventListener('input', () => field.setCustomValidity('')));

  function submissionError(message) {
    const error = new Error(message);
    error.userFacing = true;
    return error;
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (submitting) return;
    if (blocked) {
      if (isLocalFile) showLiveSiteMessage(true);
      else setStatus(configurationError, 'error', true);
      return;
    }
    if (honeyField.value.trim()) {
      setStatus('Your message could not be submitted. Please refresh and try again.', 'error', true);
      return;
    }

    nameField.value = nameField.value.trim();
    emailField.value = emailField.value.trim();
    messageField.value = messageField.value.trim();
    nameField.setCustomValidity(nameField.value ? '' : 'Please enter your name.');
    messageField.setCustomValidity(messageField.value.length >= 10 ? '' : 'Please write a message of at least 10 characters.');
    if (!form.reportValidity()) return;

    submitting = true;
    submitButton.disabled = true;
    submitButton.setAttribute('aria-busy', 'true');
    form.setAttribute('aria-busy', 'true');
    submitLabel.textContent = 'Sending…';
    setStatus('Sending your message…', 'pending');
    const previousReadOnly = visibleFields.map(field => field.readOnly);
    visibleFields.forEach(field => { field.readOnly = true; });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      const fields = new FormData(form);
      fields.set('name', nameField.value);
      fields.set('email', emailField.value);
      fields.set('message', messageField.value);
      fields.set('_url', location.origin + location.pathname);
      const headers = { Accept: 'application/json' };
      let body = fields;
      if (isFormSubmit) {
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify(Object.fromEntries(fields));
      }

      const response = await fetch(endpoint.href, { method: 'POST', headers, body, signal: controller.signal });
      let result;
      try { result = await response.json(); }
      catch (error) {
        if (error.name === 'AbortError') throw error;
        throw submissionError('The form service returned an unexpected response. Your message has been kept; please try again.');
      }

      const providerMessage = [result?.message, result?.error, ...(Array.isArray(result?.errors) ? result.errors.map(error => error?.message) : [])].filter(value => typeof value === 'string').join(' ');
      const needsActivation = /activat(?:e|ion|ed)|confirm(?:ation)?.{0,30}(?:e-?mail)|(?:e-?mail).{0,30}(?:confirm|verif)|not\s+active/i.test(providerMessage);
      if (needsActivation) {
        throw submissionError('This form is awaiting email confirmation. Your message could not be confirmed; please use the email link instead.');
      }
      if (!response.ok) {
        throw submissionError(response.status === 429 ? 'Too many messages were submitted. Please wait a few minutes and try again.' : 'The form service could not accept your message. Please try again, or use the email link.');
      }
      if (!result || typeof result !== 'object' || Array.isArray(result) || result.success === false || result.success === 'false' || result.ok === false || result.error || (Array.isArray(result.errors) && result.errors.length)) {
        throw submissionError('Your message was not accepted. Please try again, or use the email link.');
      }
      if (isFormSubmit && result.success !== true && result.success !== 'true') {
        throw submissionError('The form service did not confirm your submission. Your message has been kept; please try again or use the email link.');
      }

      form.reset();
      setStatus('Thanks — your message was submitted. I’ll get back to you soon.', 'success', true);
    } catch (error) {
      const message = error.name === 'AbortError'
        ? 'The request timed out, so submission could not be confirmed. Your message has been kept; please try again or use the email link.'
        : error.userFacing ? error.message : 'Could not connect to the form service. Your message has been kept; please check your connection and try again.';
      setStatus(message, 'error', true);
    } finally {
      clearTimeout(timeout);
      submitting = false;
      submitButton.disabled = false;
      submitButton.setAttribute('aria-busy', 'false');
      form.setAttribute('aria-busy', 'false');
      submitLabel.textContent = originalLabel;
      visibleFields.forEach((field, index) => { field.readOnly = previousReadOnly[index]; });
    }
  });
})();
