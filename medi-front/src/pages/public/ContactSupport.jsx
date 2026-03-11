import React, { useState } from "react";
import { Mail, Phone, Clock, Send, MapPin, MessageSquare } from "lucide-react";
import "./PublicPages.css";

export default function ContactSupport() {
    const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
    const [submitted, setSubmitted] = useState(false);

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    function handleSubmit(e) {
        e.preventDefault();
        setSubmitted(true);
    }

    return (
        <div className="public-page">
            <div className="public-hero">
                <div className="public-hero-icon"><MessageSquare size={32} /></div>
                <h1>Contact Support</h1>
                <p>Have a question or need help? We're here to assist you.</p>
            </div>

            <div className="public-content contact-grid">
                {/* Contact Info Cards */}
                <div className="contact-info-stack">
                    <div className="info-card">
                        <div className="info-card-icon" style={{ background: "rgba(37,99,235,0.1)", color: "#2563eb" }}>
                            <Mail size={20} />
                        </div>
                        <div>
                            <h4>Email Us</h4>
                            <a href="mailto:shreesaisurgical16@yahoo.in">shreesaisurgical16@yahoo.in</a>
                        </div>
                    </div>

                    <div className="info-card">
                        <div className="info-card-icon" style={{ background: "rgba(22,163,74,0.1)", color: "#16a34a" }}>
                            <Phone size={20} />
                        </div>
                        <div>
                            <h4>Call Us</h4>
                            <p>+91 98765 43210</p>
                        </div>
                    </div>

                    <div className="info-card">
                        <div className="info-card-icon" style={{ background: "rgba(234,88,12,0.1)", color: "#ea580c" }}>
                            <Clock size={20} />
                        </div>
                        <div>
                            <h4>Business Hours</h4>
                            <p>Mon – Sat: 9:00 AM – 7:00 PM</p>
                        </div>
                    </div>

                    <div className="info-card">
                        <div className="info-card-icon" style={{ background: "rgba(124,58,237,0.1)", color: "#7c3aed" }}>
                            <MapPin size={20} />
                        </div>
                        <div>
                            <h4>Office</h4>
                            <p>Mumbai, Maharashtra, India</p>
                        </div>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="contact-form-card card">
                    {submitted ? (
                        <div className="form-success">
                            <div className="success-icon">✓</div>
                            <h3>Message Sent!</h3>
                            <p>We'll get back to you within 24 hours.</p>
                        </div>
                    ) : (
                        <>
                            <h3 className="form-title">Send us a message</h3>
                            <form onSubmit={handleSubmit} className="contact-form">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Your Name</label>
                                        <input className="input" name="name" value={form.name} onChange={handleChange} required placeholder="John Doe" />
                                    </div>
                                    <div className="form-group">
                                        <label>Email Address</label>
                                        <input className="input" name="email" type="email" value={form.email} onChange={handleChange} required placeholder="you@example.com" />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Subject</label>
                                    <input className="input" name="subject" value={form.subject} onChange={handleChange} required placeholder="How can we help?" />
                                </div>
                                <div className="form-group">
                                    <label>Message</label>
                                    <textarea name="message" rows="5" value={form.message} onChange={handleChange} required placeholder="Describe your issue or question..." />
                                </div>
                                <button type="submit" className="button button-primary submit-btn">
                                    <Send size={16} /> Send Message
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
