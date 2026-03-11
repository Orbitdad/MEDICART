import React from "react";
import { RotateCcw } from "lucide-react";
import "./PublicPages.css";

export default function RefundPolicy() {
    return (
        <div className="public-page">
            <div className="public-hero">
                <div className="public-hero-icon"><RotateCcw size={32} /></div>
                <h1>Refund Policy</h1>
                <p>Last updated: March 2026</p>
            </div>

            <div className="public-content legal-content card">
                <section>
                    <h2>1. Overview</h2>
                    <p>MediCart strives to ensure complete satisfaction with every order. If you are not satisfied with your purchase, you may request a refund or replacement in accordance with this policy.</p>
                </section>

                <section>
                    <h2>2. Eligibility for Refund</h2>
                    <p>Refund or replacement requests are accepted under the following conditions:</p>
                    <ul>
                        <li><strong>Damaged Products:</strong> Items that arrive damaged or broken during transit.</li>
                        <li><strong>Wrong Items:</strong> Products received that differ from what was ordered.</li>
                        <li><strong>Expired Products:</strong> Items received past their expiry date at the time of delivery.</li>
                        <li><strong>Short Shipment:</strong> Orders where the quantity received is less than the quantity ordered.</li>
                    </ul>
                </section>

                <section>
                    <h2>3. Non-Refundable Items</h2>
                    <ul>
                        <li>Products that have been opened, used, or altered after delivery.</li>
                        <li>Items returned without prior approval from MediCart support.</li>
                        <li>Orders cancelled after dispatch (unless the product is defective).</li>
                    </ul>
                </section>

                <section>
                    <h2>4. How to Request a Refund</h2>
                    <ol>
                        <li>Contact our support team at <a href="mailto:shreesaisurgical16@yahoo.in">shreesaisurgical16@yahoo.in</a> within <strong>48 hours</strong> of delivery.</li>
                        <li>Provide your order number, a description of the issue, and photographs if applicable.</li>
                        <li>Our team will review your request and respond within <strong>2 business days</strong>.</li>
                    </ol>
                </section>

                <section>
                    <h2>5. Refund Processing</h2>
                    <ul>
                        <li><strong>Online Payments:</strong> Refunds will be processed to the original payment method within 5–7 business days after approval.</li>
                        <li><strong>Credit Orders:</strong> The outstanding balance on your account will be adjusted accordingly.</li>
                        <li><strong>Replacements:</strong> If a replacement is approved, the item will be dispatched within 3 business days.</li>
                    </ul>
                </section>

                <section>
                    <h2>6. Contact Us</h2>
                    <p>For refund-related queries, email <a href="mailto:shreesaisurgical16@yahoo.in">shreesaisurgical16@yahoo.in</a> or call us at <strong>+91 98765 43210</strong> during business hours (Mon–Sat, 9 AM – 7 PM).</p>
                </section>
            </div>
        </div>
    );
}
