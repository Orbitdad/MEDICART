import React from "react";
import { ShieldCheck } from "lucide-react";
import "./PublicPages.css";

export default function PrivacyPolicy() {
    return (
        <div className="public-page">
            <div className="public-hero">
                <div className="public-hero-icon"><ShieldCheck size={32} /></div>
                <h1>Privacy Policy</h1>
                <p>Last updated: March 2026</p>
            </div>

            <div className="public-content legal-content card">
                <section>
                    <h2>1. Introduction</h2>
                    <p>MediCart ("we", "us", "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.</p>
                </section>

                <section>
                    <h2>2. Information We Collect</h2>
                    <h3>Personal Information</h3>
                    <ul>
                        <li>Name, email address, and phone number</li>
                        <li>Medical practice details (hospital, specialization)</li>
                        <li>Billing and shipping addresses</li>
                        <li>Payment information (processed securely via Razorpay)</li>
                    </ul>
                    <h3>Usage Data</h3>
                    <ul>
                        <li>Browser type and version</li>
                        <li>Pages visited and time spent on site</li>
                        <li>Order history and browsing preferences</li>
                    </ul>
                </section>

                <section>
                    <h2>3. How We Use Your Information</h2>
                    <ul>
                        <li>To process and fulfil your orders</li>
                        <li>To manage your account and provide customer support</li>
                        <li>To send order confirmations, invoices, and delivery updates</li>
                        <li>To improve our platform and user experience</li>
                        <li>To comply with legal obligations</li>
                    </ul>
                </section>

                <section>
                    <h2>4. Data Sharing</h2>
                    <p>We do not sell your personal data. We may share information with:</p>
                    <ul>
                        <li><strong>Service Providers:</strong> Payment gateways (Razorpay), cloud hosting services, and logistics partners solely for order fulfilment.</li>
                        <li><strong>Legal Requirements:</strong> When required by law, regulation, or legal proceedings.</li>
                    </ul>
                </section>

                <section>
                    <h2>5. Data Security</h2>
                    <p>We use industry-standard encryption (TLS/SSL) and secure authentication methods to protect your data. Payment information is handled by PCI-DSS compliant processors and is never stored on our servers.</p>
                </section>

                <section>
                    <h2>6. Your Rights</h2>
                    <p>You may request access to, correction of, or deletion of your personal data at any time by contacting us at <a href="mailto:shreesaisurgical16@yahoo.in">shreesaisurgical16@yahoo.in</a>.</p>
                </section>

                <section>
                    <h2>7. Contact Us</h2>
                    <p>If you have questions about this policy, please contact us at <a href="mailto:shreesaisurgical16@yahoo.in">shreesaisurgical16@yahoo.in</a>.</p>
                </section>
            </div>
        </div>
    );
}
