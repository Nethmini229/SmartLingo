
document.addEventListener('DOMContentLoaded', () => {

  const emailInput    = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const emailError    = document.getElementById('emailError');
  const passwordError = document.getElementById('passwordError');
  const submitBtn     = document.getElementById('submitBtn');
  const loginForm     = document.getElementById('loginForm');
  const pwToggle      = document.getElementById('pwToggle');
  const pwIcon        = document.getElementById('pwIcon');
  const googleBtn     = document.getElementById('googleBtn');
  const formState     = document.getElementById('formState');
  const successState  = document.getElementById('successState');

  /* --- VALIDATORS --- */
  const isValidEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const isValidPass  = v => v.length >= 8;

  function setField(input, errorEl, valid, msg) {
    const hasVal = input.value.length > 0;
    input.classList.toggle('error', !valid && hasVal);
    input.classList.toggle('valid', valid && hasVal);
    if (errorEl) { errorEl.textContent = msg; errorEl.classList.toggle('show', !valid && hasVal); }
  }

  /* --- REAL-TIME VALIDATION --- */
  emailInput?.addEventListener('input', () =>
    setField(emailInput, emailError, isValidEmail(emailInput.value), 'Please enter a valid email address.'));

  passwordInput?.addEventListener('input', () =>
    setField(passwordInput, passwordError, isValidPass(passwordInput.value), 'Password must be at least 8 characters.'));

  /* --- PASSWORD TOGGLE --- */
  pwToggle?.addEventListener('click', () => {
    const show = passwordInput.type === 'password';
    passwordInput.type = show ? 'text' : 'password';
    if (pwIcon) pwIcon.textContent = show ? 'visibility' : 'visibility_off';
  });

  /* --- SIGN IN SUCCESS FLOW --- */
  function doSignIn() {
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    setTimeout(() => {
      formState.style.display = 'none';
      successState.style.display = 'block';
      setTimeout(() => { location.href = 'meeting.html'; }, 1600);
    }, 1800);
  }

  /* --- FORM SUBMIT --- */
  loginForm?.addEventListener('submit', e => {
    e.preventDefault();
    const emailOk = isValidEmail(emailInput.value);
    const passOk  = isValidPass(passwordInput.value);
    if (!emailOk) setField(emailInput, emailError, false, 'Please enter a valid email address.');
    if (!passOk)  setField(passwordInput, passwordError, false, 'Password must be at least 8 characters.');
    if (emailOk && passOk) doSignIn();
  });

  /* --- GOOGLE SIGN IN --- */
  googleBtn?.addEventListener('click', () => {
    formState.style.display = 'none';
    successState.style.display = 'block';
    setTimeout(() => { location.href = 'meeting.html'; }, 1600);
  });

  /* --- FORGOT PASSWORD --- */
  document.querySelector('.forgot-link')?.addEventListener('click', e => {
    e.preventDefault();
    showToast('📧 Password reset link sent to your email');
  });
});