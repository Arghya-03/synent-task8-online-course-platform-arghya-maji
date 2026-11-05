
import { Link } from "react-router-dom";

function PrivacyPolicy() {
  return (
    <div className="password-recovery-page">
      <div className="password-recovery-card terms-card">

        <Link to="/register" className="register-home-link">
          ← Back to Registration
        </Link>

       

        <h2>Privacy Policy</h2>

        <p className="password-recovery-description">
          Your privacy matters to us. This policy explains how
          SkillNest handles information when you use our platform.
        </p>

        <p className="terms-updated">
          Last Updated: November 4, 2026
        </p>

        <div className="terms-content">

          <section>
            <h3>1. Information We Collect</h3>
            <p>
              When you register, SkillNest collects information
              such as your name and email address. Information
              related to course enrollment and learning progress
              may also be associated with your account.
            </p>
          </section>

          <section>
            <h3>2. How We Use Your Information</h3>
            <p>
              Your information is used to create and manage
              your account, provide course access, maintain
              enrollment records and support your learning
              experience.
            </p>
          </section>

          <section>
            <h3>3. Password and Account Security</h3>
            <p>
              Account passwords are stored using password
              hashing. Users should keep their login credentials
              confidential and avoid sharing them with others.
            </p>
          </section>

          <section>
            <h3>4. Payments</h3>
            <p>
              SkillNest uses a payment integration for course
              purchases. Payment information is handled according
              to the applicable payment provider's policies.
              Please review the provider's privacy information
              before completing a transaction.
            </p>
          </section>

          <section>
            <h3>5. Email Communication</h3>
            <p>
              Your registered email address may be used for
              account-related communication, including password
              reset messages and important account notifications.
            </p>
          </section>

          <section>
            <h3>6. Data Protection</h3>
            <p>
              SkillNest takes reasonable steps to protect
              account information. However, no online platform
              can guarantee absolute security of information
              transmitted over the internet.
            </p>
          </section>

          <section>
            <h3>7. Cookies and Technical Information</h3>
            <p>
              Technical information may be processed to support
              the operation of the platform. Any use of cookies
              or similar technologies should be disclosed
              according to the platform's actual configuration.
            </p>
          </section>

          <section>
            <h3>8. User Rights</h3>
            <p>
              Users may contact the SkillNest administrator
              regarding questions about their account
              information or requests concerning their data.
            </p>
          </section>

          <section>
            <h3>9. Changes to This Policy</h3>
            <p>
              This Privacy Policy may be updated when platform
              features or data-handling practices change.
              Users should review the latest version periodically.
            </p>
          </section>

          <section>
            <h3>10. Contact and Support</h3>
            <p>
              For privacy-related questions or account
              information requests, contact the SkillNest
              administrator through the available support channel.
            </p>
          </section>

        </div>

        <div className="terms-footer">
          <p>© 2026 SkillNest. All rights reserved.</p>
          <Link to="/">Back to SkillNest Home</Link>
        </div>

      </div>
    </div>
  );
}

export default PrivacyPolicy;
