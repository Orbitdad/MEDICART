import React from "react";
import { FileText } from "lucide-react";
import "./PublicPages.css";

export default function TermsAndConditions() {
    return (
        <div className="public-page">
            <div className="public-hero">
                <div className="public-hero-icon"><FileText size={32} /></div>
                <h1>Terms &amp; Conditions</h1>
                <p>Last updated: March 2026</p>
            </div>

            <div className="public-content legal-content card">
                <section>
                    <h2>1. Acceptance of Terms</h2>
                    <p>By accessing or using the MediCart platform, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our services.</p>
                </section>

                <section>
                    <h2>2. Eligibility</h2>
                    <p>MediCart is intended for licensed medical practitioners and healthcare institutions. By registering, you confirm that you are a qualified healthcare professional or an authorized representative of a healthcare institution.</p>
                </section>

                <section>
                    <h2>3. Account Responsibilities</h2>
                    <ul>
                        <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
                        <li>You must provide accurate and up-to-date information during registration.</li>
                        <li>You must notify us immediately of any unauthorized use of your account.</li>
                    </ul>
                </section>

                <section>
                    <h2>4. Orders &amp; Payments</h2>
                    <ul>
                        <li>All orders placed through MediCart are subject to availability and confirmation.</li>
                        <li>Prices displayed are inclusive of applicable GST unless stated otherwise.</li>
                        <li>Credit-based ordering is available for approved doctors; outstanding dues must be cleared as per agreed terms.</li>
                        <li>Online payments are processed securely through Razorpay.</li>
                    </ul>
                </section>

                <section>
                    <h2>5. Delivery</h2>
                    <p>We aim to deliver orders within the estimated time frame. However, delivery times may vary based on location, availability, and logistics. MediCart is not liable for delays caused by circumstances beyond our control.</p>
                </section>

                <section>
                    <h2>6. Product Information</h2>
                    <p>We strive to accurately display product information including pricing, descriptions, and expiry dates. In case of any discrepancy, MediCart reserves the right to cancel or modify orders with appropriate notification.</p>
                </section>

                <section>
                    <h2>7. Intellectual Property</h2>
                    <p>All content on the MediCart platform — including text, graphics, logos, and software — is the property of MediCart and is protected by intellectual property laws. Unauthorized reproduction or use is prohibited.</p>
                </section>

                <section>
                    <h2>8. Limitation of Liability</h2>
                    <p>MediCart shall not be liable for any indirect, incidental, or consequential damages arising from the use of our platform. Our maximum liability is limited to the value of the specific order in question.</p>
                </section>

                <section>
                    <h2>9. Changes to Terms</h2>
                    <p>We reserve the right to update these Terms at any time. Continued use of the platform after changes are posted constitutes acceptance of the revised terms.</p>
                </section>

                <section>
                    <h2>10. Contact</h2>
                    <p>For questions regarding these Terms, please contact <a href="mailto:shreesaisurgical16@yahoo.in">shreesaisurgical16@yahoo.in</a>.</p>
                </section>
            </div>
        </div>
    );
}
