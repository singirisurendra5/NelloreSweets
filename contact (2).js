document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contactForm");
  if (!form) return;

  const validators = {
    name: v => v.trim().length >= 2,
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
    message: v => v.trim().length >= 5
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    let valid = true;
    Object.keys(validators).forEach(name => {
      const input = form.elements[name];
      const fieldEl = form.querySelector(`[data-field="${name}"]`);
      const ok = validators[name](input.value);
      fieldEl.classList.toggle("invalid", !ok);
      if (!ok) valid = false;
    });
    if (!valid){ showToast("Please fill in all required fields", "⚠️"); return; }

    const btn = document.getElementById("contactBtn");
    const btnText = document.getElementById("contactBtnText");
    btn.disabled = true;
    btnText.innerHTML = `<span class="spinner"></span> Sending…`;

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.value.trim(),
          email: form.email.value.trim(),
          phone: form.phone.value.trim(),
          message: form.message.value.trim()
        })
      });
      if (!res.ok) throw new Error("send-failed");
      showToast("Message sent! We'll get back to you soon.", "✅");
      form.reset();
    } catch (err){
      console.error(err);
      showToast("Couldn't send message — please try WhatsApp instead.", "❌");
    } finally {
      btn.disabled = false;
      btnText.textContent = "Send Message →";
    }
  });
});
