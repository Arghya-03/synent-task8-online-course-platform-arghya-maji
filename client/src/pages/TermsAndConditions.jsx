
import { Link } from "react-router-dom";

function TermsAndConditions() {
    return (
        <div className="password-recovery-page">
            <div className="password-recovery-card terms-card">

                <Link to="/register" className="register-home-link">
                    ← Back to Registration
                </Link>


                <h2>Terms & Conditions</h2>

                <p className="password-recovery-description">
                    Welcome to SkillNest. Please read these terms before
                    creating your account.
                </p>

                <p className="terms-updated">
                    Last Updated: November 4, 2026
                </p>

                <div className="terms-content">

                    <section>
                        <h3>1. Acceptance of Terms</h3>
                        <p>
                            By creating an account on SkillNest, you agree
                            to follow these Terms & Conditions and use the
                            platform responsibly.
                        </p>
                    </section>

                    <section>
                        <h3>2. User Accounts</h3>
                        <p>
                            Users must provide accurate information during
                            registration and keep their login credentials
                            confidential. You are responsible for activities
                            performed through your account.
                        </p>
                    </section>

                    <section>
                        <h3>3. Course Access</h3>
                        <p>
                            Course materials are provided for personal
                            educational purposes. Users must not copy,
                            distribute, resell or misuse course content
                            without permission.
                        </p>
                    </section>

                    <section>
                        <h3>4. Payments and Enrollments</h3>
                        <p>
                            Course purchases and enrollments are subject
                            to the payment terms displayed during checkout.
                            Users should review course details before
                            completing a purchase.
                        </p>
                    </section>

                    <section>
                        <h3>5. Responsible Use</h3>
                        <p>
                            Users must not attempt unauthorized access,
                            disrupt platform services, upload harmful
                            content or misuse other users' information.
                        </p>
                    </section>

                    <section>
                        <h3>6. Privacy and Security</h3>
                        <p>
                            SkillNest uses account information to provide
                            its learning services. Users should protect
                            their passwords and contact the platform
                            administrator if they notice suspicious activity.
                        </p>
                    </section>

                    <section>
                        <h3>7. Changes to These Terms</h3>
                        <p>
                            SkillNest may update these terms when platform
                            features or policies change. Updated terms
                            should be reviewed before continued use.
                        </p>
                    </section>

                    <section>
                        <h3>8. Contact and Support</h3>
                        <p>
                            If you experience issues with your account, course
                            access or payments, please contact the SkillNest
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

export default TermsAndConditions;
