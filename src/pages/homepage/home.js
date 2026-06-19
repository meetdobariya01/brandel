import React, { useState, useEffect } from "react";
import "./home.css";

const Home = () => {
  // Countdown state
  const [timeLeft, setTimeLeft] = useState({
    days: 44,
    hours: 23,
    minutes: 59,
    seconds: 57,
  });

  // Modal open/close state
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Email input state on main page
  const [mainEmail, setMainEmail] = useState("");

  // Form fields state
  const [formData, setFormData] = useState({
    brandName: "",
    yourName: "",
    email: "",
    mobile: "",
    website: "",
    category: "",
    aboutBrand: "",
  });

  // Form errors and control states
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedBrand, setSubmittedBrand] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");

  // Floating particles array
  const [particles, setParticles] = useState([]);

  // Generate background particles on mount
  useEffect(() => {
    const generated = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 4 + 2,
      delay: `${Math.random() * 8}s`,
      duration: `${Math.random() * 12 + 10}s`,
      opacity: Math.random() * 0.6 + 0.2,
    }));
    setParticles(generated);
  }, []);

  // Timer logic: target date August 1, 2026
  useEffect(() => {
    const targetDate = new Date("2026-08-01T00:00:00").getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  // Open modal with optional prefilled email from main page
  const handleOpenModal = (emailVal = "") => {
    setFormData((prev) => ({
      ...prev,
      email: emailVal || prev.email || mainEmail,
    }));
    setIsModalOpen(true);
    setErrors({});
  };

  // Close modal and reset state
  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Keep success state for a moment or reset after closing animation
    setTimeout(() => {
      setIsSuccess(false);
      setErrors({});
    }, 400);
  };

  // Handle outside click to close modal
  const handleBackdropClick = (e) => {
    if (e.target.classList.contains("modal-overlay")) {
      handleCloseModal();
    }
  };

  // Handle ESC key press to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isModalOpen) {
        handleCloseModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);

  // Input change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field-specific error as user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Main page notify button click handler
  const handleMainSubmit = (e) => {
    e.preventDefault();
    if (mainEmail.trim()) {
      handleOpenModal(mainEmail);
    } else {
      handleOpenModal();
    }
  };

  // Validate form fields
  const validateForm = () => {
    const tempErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.brandName.trim()) {
      tempErrors.brandName = "Brand Name is required";
    }

    if (!formData.yourName.trim()) {
      tempErrors.yourName = "Your Name is required";
    }

    if (!formData.email.trim()) {
      tempErrors.email = "Email Address is required";
    } else if (!emailRegex.test(formData.email)) {
      tempErrors.email = "Please enter a valid email address";
    }

    if (!formData.mobile.trim()) {
      tempErrors.mobile = "Mobile Number is required";
    } else {
      // Basic check for valid phone characters: digits, spaces, dashes, parentheses, optional leading plus
      const phoneRegex = /^(\+?\d{1,3}[- ]?)?\d{8,14}$/;
      if (!phoneRegex.test(formData.mobile.replace(/\s+/g, ""))) {
        tempErrors.mobile =
          "Please enter a valid mobile number (e.g. +1234567890)";
      }
    }

    if (!formData.category) {
      tempErrors.category = "Please select a brand category";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // Handle Waitlist Form submission
  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      // Trigger a shake effect on the modal
      const modal = document.querySelector(".modal-content");
      if (modal) {
        modal.classList.add("shake");
        setTimeout(() => modal.classList.remove("shake"), 500);
      }
      return;
    }

    setIsSubmitting(true);

    // Simulate API network request (1.5 seconds)
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setSubmittedBrand(formData.brandName);
      setSubmittedEmail(formData.email);

      // Save submission locally
      const existingLeads = JSON.parse(
        localStorage.getItem("brandel_waitlist") || "[]",
      );
      const newLead = {
        ...formData,
        submittedAt: new Date().toISOString(),
      };
      localStorage.setItem(
        "brandel_waitlist",
        JSON.stringify([...existingLeads, newLead]),
      );

      // Reset form fields
      setFormData({
        brandName: "",
        yourName: "",
        email: "",
        mobile: "",
        website: "",
        category: "",
        aboutBrand: "",
      });
      setMainEmail("");
    }, 1500);
  };

  // Helper for displaying double digits in countdown
  const formatTime = (num) => {
    return String(num).padStart(2, "0");
  };

  return (
    <div className="landing-container">
      {/* Sparkles / Floating Particles Background */}
      <div className="particles-container" aria-hidden="true">
        {particles.map((p) => (
          <div
            key={p.id}
            className="particle"
            style={{
              left: p.left,
              top: p.top,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDelay: p.delay,
              animationDuration: p.duration,
              opacity: p.opacity,
            }}
          />
        ))}
      </div>

      {/* Decorative background glows */}
      <div className="glow-effect glow-top-left" aria-hidden="true" />
      <div className="glow-effect glow-bottom-right" aria-hidden="true" />

      {/* Header Area */}
      <header className="page-header animate-fade-in-down">
        <div className="logo-wrapper">
          <img
            src="./images/brandel.png"
            alt="Brandel Logo"
            className="brand-logo w-50"
          />
          {/* <h1 className="brand-name">Brandel</h1> */}
          {/* <span className="brand-tagline">WHERE BRANDS DWELL</span> */}
        </div>
      </header>

      {/* Main Hero Card Container */}
      <main className="main-content-area">
        <section className="coming-soon-card animate-fade-in-up">
          {/* Badge */}
          <div className="badge-pill">
            <span className="badge-dot" />
            <span className="badge-text">CURATING HOMEGROWN EXCELLENCE</span>
          </div>

          {/* Heading */}
          <h2 className="hero-title">
            Something Extraordinary is
            <span className="under-construction-text">Under Construction</span>
          </h2>

          {/* Subtitle */}
          <p className="hero-subtitle">
            We are busy creating a premium marketplace for the finest Brandel
            experiences. Leave your email to receive an exclusive invitation to
            our private launch event.
          </p>

          {/* Countdown Clock Grid */}
          <div className="countdown-grid">
            <div className="countdown-item-box">
              <span className="countdown-number">
                {formatTime(timeLeft.days)}
              </span>
              <span className="countdown-label">DAYS</span>
            </div>

            <div className="countdown-colon">:</div>

            <div className="countdown-item-box">
              <span className="countdown-number">
                {formatTime(timeLeft.hours)}
              </span>
              <span className="countdown-label">HOURS</span>
            </div>

            <div className="countdown-colon">:</div>

            <div className="countdown-item-box">
              <span className="countdown-number">
                {formatTime(timeLeft.minutes)}
              </span>
              <span className="countdown-label">MINS</span>
            </div>

            <div className="countdown-colon">:</div>

            <div className="countdown-item-box">
              <span className="countdown-number">
                {formatTime(timeLeft.seconds)}
              </span>
              <span className="countdown-label">SECS</span>
            </div>
          </div>

          {/* Email notify form */}
          <form className="email-notify-row" onSubmit={handleMainSubmit}>
            <input
              type="email"
              placeholder="Enter your email address"
              className="main-email-input"
              value={mainEmail}
              onChange={(e) => setMainEmail(e.target.value)}
              aria-label="Email address for waiting list"
            />
            <button type="submit" className="main-notify-button">
              <span>Notify Me</span>
              <svg
                className="arrow-icon"
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </form>

          <div className="direct-cta-wrapper">
            <button
              type="button"
              className="text-cta-button"
              onClick={() => handleOpenModal()}
            >
              Or apply directly:{" "}
              <span className="cta-highlight">
                Join the Brandel Waiting List
              </span>
            </button>
          </div>
        </section>

        {/* Why Join Brandel Highlight Section (Bottom of Page) */}
        <section className="why-join-section animate-fade-in-up-delay">
          <div className="why-join-header">
            <h3 className="section-title">Why Join Brandel?</h3>
            <div className="section-divider" />
          </div>

          <div className="benefits-grid">
            <div className="benefit-card">
              <span className="check-icon-wrapper">
                <svg
                  className="check-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <span className="benefit-text">Invite-only marketplace</span>
            </div>

            <div className="benefit-card">
              <span className="check-icon-wrapper">
                <svg
                  className="check-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <span className="benefit-text">Curated to maintain quality</span>
            </div>

            <div className="benefit-card">
              <span className="check-icon-wrapper">
                <svg
                  className="check-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <span className="benefit-text">
                Better visibility for selected brands
              </span>
            </div>

            <div className="benefit-card">
              <span className="check-icon-wrapper">
                <svg
                  className="check-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <span className="benefit-text">
                Founding Seller benefits available
              </span>
            </div>

            <div className="benefit-card">
              <span className="check-icon-wrapper">
                <svg
                  className="check-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <span className="benefit-text">Limited onboarding slots</span>
            </div>
          </div>

          <div className="invitation-footer-card">
            <h4 className="invitation-title">Apply for Invitation</h4>
            <p className="invitation-description">
              Applications are reviewed manually. Selected brands will receive
              an invitation link to complete onboarding before August 2026.
            </p>
            <button
              type="button"
              className="apply-invitation-btn"
              onClick={() => handleOpenModal()}
            >
              <span>Apply for Invitation</span>
              <svg
                className="btn-sparkle"
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="currentColor"
              >
                <path d="M12 2l2.4 5.2 5.6 1.8-4.2 4 1.2 5.7-5-3.2-5 3.2 1.2-5.7-4.2-4 5.6-1.8z" />
              </svg>
            </button>
          </div>
        </section>
      </main>

      {/* Footer Area */}
      <footer className="page-footer-nav animate-fade-in">
        <p className="footer-copyright">
          &copy; {new Date().getFullYear()} Brandel. All rights reserved.
          Crafted for fine taste.
        </p>
      </footer>

      {/* Modal Popup Waitlist Form */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleBackdropClick}>
          <div
            className="modal-content animate-zoom-in"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            {/* Close Button */}
            <button
              type="button"
              className="modal-close-btn"
              onClick={handleCloseModal}
              aria-label="Close modal"
            >
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {!isSuccess ? (
              <>
                {/* Form Header */}
                <div className="modal-header">
                  <span className="modal-gold-tag">JOIN WAITLIST</span>
                  <h3 id="modal-title" className="modal-main-title">
                    Join the Brandel Waiting List
                  </h3>
                  <h4 className="modal-subtitle">
                    An Invite-Only Marketplace for Homegrown Brands
                  </h4>
                  <p className="modal-description">
                    Brandel is a curated marketplace built for exceptional
                    handmade, organic, artisanal, and sustainable brands. Every
                    application is reviewed to ensure quality, uniqueness, and a
                    premium shopping experience.
                  </p>
                </div>

                {/* Registration Form */}
                <form
                  className="waitlist-form"
                  onSubmit={handleFormSubmit}
                  noValidate
                >
                  <div className="form-grid">
                    {/* Brand Name */}
                    <div
                      className={`form-group ${errors.brandName ? "has-error" : ""}`}
                    >
                      <label htmlFor="brandName">Brand Name *</label>
                      <input
                        type="text"
                        id="brandName"
                        name="brandName"
                        placeholder="Enter your brand's legal or trade name"
                        value={formData.brandName}
                        onChange={handleInputChange}
                        required
                      />
                      {errors.brandName && (
                        <span className="error-message">
                          {errors.brandName}
                        </span>
                      )}
                    </div>

                    {/* Your Name */}
                    <div
                      className={`form-group ${errors.yourName ? "has-error" : ""}`}
                    >
                      <label htmlFor="yourName">Your Name *</label>
                      <input
                        type="text"
                        id="yourName"
                        name="yourName"
                        placeholder="Enter your full name"
                        value={formData.yourName}
                        onChange={handleInputChange}
                        required
                      />
                      {errors.yourName && (
                        <span className="error-message">{errors.yourName}</span>
                      )}
                    </div>

                    {/* Email Address */}
                    <div
                      className={`form-group ${errors.email ? "has-error" : ""}`}
                    >
                      <label htmlFor="email">Email Address *</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="e.g. name@brandname.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                      {errors.email && (
                        <span className="error-message">{errors.email}</span>
                      )}
                    </div>

                    {/* Mobile Number */}
                    <div
                      className={`form-group ${errors.mobile ? "has-error" : ""}`}
                    >
                      <label htmlFor="mobile">Mobile Number *</label>
                      <input
                        type="tel"
                        id="mobile"
                        name="mobile"
                        placeholder="e.g. +1 555-019-2834"
                        value={formData.mobile}
                        onChange={handleInputChange}
                        required
                      />
                      {errors.mobile && (
                        <span className="error-message">{errors.mobile}</span>
                      )}
                    </div>

                    {/* Website / Instagram */}
                    <div className="form-group full-width">
                      <label htmlFor="website">Website / Instagram Page</label>
                      <input
                        type="text"
                        id="website"
                        name="website"
                        placeholder="e.g. www.instagram.com/yourbrand or yourbrand.com"
                        value={formData.website}
                        onChange={handleInputChange}
                      />
                    </div>

                    {/* Category Drop-down */}
                    <div
                      className={`form-group full-width ${errors.category ? "has-error" : ""}`}
                    >
                      <label htmlFor="category">Category *</label>
                      <div className="select-wrapper">
                        <select
                          id="category"
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="" disabled>
                            Select the category that matches best
                          </option>
                          <option value="Handmade & Crafts">
                            Handmade & Crafts
                          </option>
                          <option value="Organic & Wellness">
                            Organic & Wellness
                          </option>
                          <option value="Artisanal Foods">
                            Artisanal Foods
                          </option>
                          <option value="Sustainable Fashion">
                            Sustainable Fashion
                          </option>
                          <option value="Home & Living">Home & Living</option>
                          <option value="Other">Other</option>
                        </select>
                        <span className="select-arrow" />
                      </div>
                      {errors.category && (
                        <span className="error-message">{errors.category}</span>
                      )}
                    </div>

                    {/* Tell Us About Your Brand (Optional) */}
                    <div className="form-group full-width">
                      <label htmlFor="aboutBrand">
                        Tell Us About Your Brand (Optional)
                      </label>
                      <textarea
                        id="aboutBrand"
                        name="aboutBrand"
                        placeholder="Describe your unique manufacturing process, sustainable materials, or story."
                        rows="3"
                        value={formData.aboutBrand}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="form-footer">
                    <button
                      type="submit"
                      className="submit-form-btn"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="loading-spinner-wrapper">
                          <span className="spinner" />
                          <span>Verifying Application...</span>
                        </span>
                      ) : (
                        <span>Submit Application</span>
                      )}
                    </button>
                    <span className="secure-badge">
                      <svg
                        viewBox="0 0 24 24"
                        width="12"
                        height="12"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect
                          x="3"
                          y="11"
                          width="18"
                          height="11"
                          rx="2"
                          ry="2"
                        />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                      Manual Quality Verification Apply
                    </span>
                  </div>
                </form>
              </>
            ) : (
              /* Success / Confirmation State */
              <div className="success-state animate-fade-in">
                <div className="success-icon-wrapper">
                  <div className="success-glow" />
                  <svg className="success-checkmark-svg" viewBox="0 0 52 52">
                    <circle
                      className="checkmark-circle"
                      cx="26"
                      cy="26"
                      r="25"
                      fill="none"
                    />
                    <path
                      className="checkmark-check"
                      fill="none"
                      d="M14.1 27.2l7.1 7.2 16.7-16.8"
                    />
                  </svg>
                </div>

                <h3 className="success-title">Application Received!</h3>
                <div className="success-divider" />

                <p className="success-message">
                  Thank you, <strong>{formData.yourName || "partner"}</strong>.
                  Your waitlist application for{" "}
                  <strong>{submittedBrand || "your brand"}</strong> has been
                  successfully registered.
                </p>

                <div className="success-detail-box">
                  <p>
                    <strong>Next Steps:</strong>
                  </p>
                  <ul>
                    <li>
                      Our curators will manually review your brand details.
                    </li>
                    <li>
                      If selected, you'll receive a founding invitation link
                      sent to <strong>{submittedEmail}</strong>.
                    </li>
                    <li>
                      Onboarding slots are filled on a rolling basis prior to{" "}
                      <strong>August 2026</strong>.
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  className="success-close-btn"
                  onClick={handleCloseModal}
                >
                  Close & Return
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
