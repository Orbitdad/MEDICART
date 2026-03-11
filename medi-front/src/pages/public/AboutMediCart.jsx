import React from "react";
import { Heart, ShieldCheck, Truck, Users, Zap, Globe } from "lucide-react";
import "./PublicPages.css";

const features = [
    { icon: <ShieldCheck size={22} />, title: "Trusted Suppliers", desc: "We partner with verified pharmaceutical distributors to ensure genuine, quality-assured medicines." },
    { icon: <Truck size={22} />, title: "Fast Delivery", desc: "Orders are processed swiftly with reliable dispatch and real-time tracking for every shipment." },
    { icon: <Zap size={22} />, title: "Easy Ordering", desc: "Our intuitive platform lets doctors browse, compare, and order supplies in just a few clicks." },
    { icon: <Users size={22} />, title: "Doctor-First Design", desc: "Built with healthcare professionals in mind — from prescription-aware catalogues to credit-based payments." },
    { icon: <Globe size={22} />, title: "Pan-India Reach", desc: "Serving hospitals and clinics across India with a growing network of distribution centres." },
    { icon: <Heart size={22} />, title: "Patient Impact", desc: "By streamlining medical supply chains, we help doctors focus on what matters most — patient care." },
];

export default function AboutMediCart() {
    return (
        <div className="public-page">
            <div className="public-hero">
                <div className="public-hero-icon"><Heart size={32} /></div>
                <h1>About MediCart</h1>
                <p>A centralized medical supply ordering platform built for doctors and healthcare providers.</p>
            </div>

            <div className="public-content">
                {/* Mission */}
                <section className="about-section">
                    <h2>Our Mission</h2>
                    <p className="about-lead">
                        MediCart was founded with a single goal — to eliminate the friction in medical supply procurement.
                        We believe that doctors should spend their time caring for patients, not chasing supply orders or
                        managing inventory paperwork. Our platform connects healthcare professionals directly with trusted
                        distributors, enabling seamless ordering, transparent pricing, and reliable delivery.
                    </p>
                </section>

                {/* Features Grid */}
                <section className="about-section">
                    <h2>Why MediCart?</h2>
                    <div className="features-grid">
                        {features.map((f, i) => (
                            <div key={i} className="feature-card card">
                                <div className="feature-icon">{f.icon}</div>
                                <h4>{f.title}</h4>
                                <p>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Numbers */}
                <section className="about-section about-stats-section">
                    <div className="about-stat">
                        <span className="stat-number">500+</span>
                        <span className="stat-caption">Doctors Onboard</span>
                    </div>
                    <div className="about-stat">
                        <span className="stat-number">10,000+</span>
                        <span className="stat-caption">Orders Delivered</span>
                    </div>
                    <div className="about-stat">
                        <span className="stat-number">50+</span>
                        <span className="stat-caption">Cities Covered</span>
                    </div>
                    <div className="about-stat">
                        <span className="stat-number">99%</span>
                        <span className="stat-caption">Satisfaction Rate</span>
                    </div>
                </section>
            </div>
        </div>
    );
}
