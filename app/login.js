(function () {
  'use strict';

  const VALID_USER = { email: 'user@example.com', password: 'Secret123!' };
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const MIN_PASSWORD_LENGTH = 8;
  const MAX_ATTEMPTS = 3;
  const LOCKOUT_MS = 15000;

  const form = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const rememberInput = document.getElementById('remember');
  const submitBtn = document.getElementById('submitBtn');
  const togglePasswordBtn = document.getElementById('togglePassword');
  const emailError = document.getElementById('emailError');
  const passwordError = document.getElementById('passwordError');
  const formError = document.getElementById('formError');
  const formSuccess = document.getElementById('formSuccess');

  let attempts = 0;
  let lockedUntil = 0;

  function setText(el, text) {
    el.textContent = text;
  }

  function clearMessages() {
    setText(emailError, '');
    setText(passwordError, '');
    setText(formError, '');
    setText(formSuccess, '');
  }

  function validate(email, password) {
    let ok = true;
    if (!email) {
      setText(emailError, 'Email is required.');
      ok = false;
    } else if (!EMAIL_REGEX.test(email)) {
      setText(emailError, 'Please enter a valid email.');
      ok = false;
    }
    if (!password) {
      setText(passwordError, 'Password is required.');
      ok = false;
    } else if (password.length < MIN_PASSWORD_LENGTH) {
      setText(
        passwordError,
        'Password must be at least ' + MIN_PASSWORD_LENGTH + ' characters.'
      );
      ok = false;
    }
    return ok;
  }

  function lockedRemaining() {
    return Math.max(0, lockedUntil - Date.now());
  }

  togglePasswordBtn.addEventListener('click', function () {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    togglePasswordBtn.textContent = isPassword ? 'Hide' : 'Show';
    togglePasswordBtn.setAttribute(
      'aria-label',
      isPassword ? 'Hide password' : 'Show password'
    );
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    clearMessages();

    if (lockedRemaining() > 0) {
      const seconds = Math.ceil(lockedRemaining() / 1000);
      setText(
        formError,
        'Too many failed attempts. Try again in ' + seconds + 's.'
      );
      return;
    }

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!validate(email, password)) {
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing in...';

    setTimeout(function () {
      const matches =
        email.toLowerCase() === VALID_USER.email &&
        password === VALID_USER.password;

      if (matches) {
        attempts = 0;
        setText(formSuccess, 'Welcome back!');
        submitBtn.textContent = 'Signed in';
        if (rememberInput.checked) {
          try {
            localStorage.setItem('rememberedEmail', email);
          } catch (e) {
            /* ignore storage errors */
          }
        } else {
          try {
            localStorage.removeItem('rememberedEmail');
          } catch (e) {
            /* ignore storage errors */
          }
        }
      } else {
        attempts += 1;
        const remaining = MAX_ATTEMPTS - attempts;
        if (remaining <= 0) {
          lockedUntil = Date.now() + LOCKOUT_MS;
          setText(
            formError,
            'Account temporarily locked. Try again in ' +
              Math.ceil(LOCKOUT_MS / 1000) +
              's.'
          );
          attempts = 0;
        } else {
          setText(
            formError,
            'Invalid email or password. ' +
              remaining +
              ' attempt' +
              (remaining === 1 ? '' : 's') +
              ' remaining.'
          );
        }
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign in';
      }
    }, 200);
  });

  try {
    const remembered = localStorage.getItem('rememberedEmail');
    if (remembered) {
      emailInput.value = remembered;
      rememberInput.checked = true;
    }
  } catch (e) {
    /* ignore storage errors */
  }
})();
