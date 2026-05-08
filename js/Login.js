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

  /* --- SIGN IN SUCCESS FLOW (with backend) --- */
  async function doSignIn() {
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    try {
      const resp = await fetch('http://localhost:3000/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput.value, password: passwordInput.value })
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'login failed');
      // TODO: store user/session info as needed (e.g. in localStorage)
      formState.style.display = 'none';
      successState.style.display = 'block';
      setTimeout(() => { location.href = 'meeting.html'; }, 1600);
    } catch (err) {
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
      alert('Login error: ' + err.message);
    }
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
  /* --- TOGGLE REGISTER / LOGIN --- */
  const registerState  = document.getElementById('registerState');
  const showRegisterBtn = document.getElementById('showRegister');
  const showLoginBtn    = document.getElementById('showLogin');
  const registerForm    = document.getElementById('registerForm');
  const registerBtn     = document.getElementById('registerBtn');
  const regName         = document.getElementById('regName');
  const regEmail        = document.getElementById('regEmail');
  const regPassword     = document.getElementById('regPassword');
  const regConfirm      = document.getElementById('regConfirm');
  const regNameError    = document.getElementById('regNameError');
  const regEmailError   = document.getElementById('regEmailError');
  const regPasswordError= document.getElementById('regPasswordError');
  const regConfirmError = document.getElementById('regConfirmError');

  // show register form
  showRegisterBtn?.addEventListener('click', e => {
    e.preventDefault();
    formState.style.display = 'none';
    registerState.style.display = 'block';
  });

  // show login form
  showLoginBtn?.addEventListener('click', e => {
    e.preventDefault();
    registerState.style.display = 'none';
    formState.style.display = 'block';
  });

  /* --- REGISTER SUBMIT --- */
  async function doRegister() {
    registerBtn.classList.add('loading');
    registerBtn.disabled = true;

    try {
      const resp = await fetch('http://localhost:3000/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName.value,
          email: regEmail.value,
          password: regPassword.value
        })
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Registration failed');

      // registration successful — switch to login
      registerState.style.display = 'none';
      formState.style.display = 'block';
      showToast('✅ Account created! Please sign in.');
    } catch (err) {
      registerBtn.classList.remove('loading');
      registerBtn.disabled = false;
      alert('Register error: ' + err.message);
    }
  }

  registerForm?.addEventListener('submit', e => {
    e.preventDefault();
    const nameOk  = regName.value.length >= 2;
    const emailOk = isValidEmail(regEmail.value);
    const passOk  = isValidPass(regPassword.value);
    const matchOk = regPassword.value === regConfirm.value;

    if (!nameOk)  { regNameError.classList.add('show'); }
    if (!emailOk) { regEmailError.classList.add('show'); }
    if (!passOk)  { regPasswordError.classList.add('show'); }
    if (!matchOk) { regConfirmError.classList.add('show'); }

    if (nameOk && emailOk && passOk && matchOk) doRegister();
  });
  function showToast(msg) {
    const toast = document.getElementById('globalToast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }
});